import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor — attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 with token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (token) prom.resolve(token);
    else prom.reject(error);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';
    const isAuthFlowRequest =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/refresh');

    // Login/refresh failures should be returned to the caller directly.
    // They are not session-expiry cases and must not trigger a forced reload.
    if (isAuthFlowRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const newAccessToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;

        const storage = localStorage.getItem('rememberMe') === 'true' ? localStorage : sessionStorage;
        storage.setItem('accessToken', newAccessToken);
        storage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');

        // Avoid reloading the login page itself.
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ---- Auth API ----
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  createLoginSupportRequest: (data: Record<string, unknown>) => api.post('/auth/login-support-request', data),
  updateAvatar: (avatarUrl: string) => api.put('/auth/avatar', { avatarUrl }),
  removeAvatar: () => api.delete('/auth/avatar'),
};

// ---- Dashboard API ----
export const dashboardApi = {
  getPublicStats: () => api.get('/dashboard/public-stats'),
  getStats: () => api.get('/dashboard/stats'),
  getDistribution: () => api.get('/dashboard/distribution'),
  getStationsWithoutTpe: () => api.get('/dashboard/stations-without-tpe'),
};

// ---- TPE API ----
export const tpeApi = {
  // Stock
  getStock: (params?: Record<string, unknown>) => api.get('/tpe/stock', { params }),
  getStockById: (id: number) => api.get(`/tpe/stock/${id}`),
  createStock: (data: Record<string, unknown>) => api.post('/tpe/stock', data),
  updateStock: (id: number, data: Record<string, unknown>) => api.put(`/tpe/stock/${id}`, data),
  deleteStock: (id: number) => api.delete(`/tpe/stock/${id}`),
  getStockByStructure: (code: string) => api.get(`/tpe/stock/by-structure/${encodeURIComponent(code)}`),
  // Maintenance
  getMaintenance: (params?: Record<string, unknown>) => api.get('/tpe/maintenance', { params }),
  getProblemTypes: () => api.get('/tpe/maintenance/problem-types'),
  createMaintenance: (data: Record<string, unknown>) => api.post('/tpe/maintenance', data),
  updateMaintenance: (id: number, data: Record<string, unknown>) => api.put(`/tpe/maintenance/${id}`, data),
  deleteMaintenance: (id: number) => api.delete(`/tpe/maintenance/${id}`),
  // Returns
  getReturns: (params?: Record<string, unknown>) => api.get('/tpe/returns', { params }),
  createReturn: (data: Record<string, unknown>) => api.post('/tpe/returns', data),
  updateReturn: (id: number, data: Record<string, unknown>) => api.put(`/tpe/returns/${id}`, data),
  deleteReturn: (id: number) => api.delete(`/tpe/returns/${id}`),
  // Transfers
  getTransfers: (params?: Record<string, unknown>) => api.get('/tpe/transfers', { params }),
  createTransfer: (data: Record<string, unknown>) => api.post('/tpe/transfers', data),
  updateTransfer: (id: number, data: Record<string, unknown>) => api.put(`/tpe/transfers/${id}`, data),
  deleteTransfer: (id: number) => api.delete(`/tpe/transfers/${id}`),
  // Reform
  getReforms: (params?: Record<string, unknown>) => api.get('/tpe/reforms', { params }),
  createReform: (data: Record<string, unknown>) => api.post('/tpe/reforms', data),
  updateReform: (id: number, data: Record<string, unknown>) => api.put(`/tpe/reforms/${id}`, data),
  deleteReform: (id: number) => api.delete(`/tpe/reforms/${id}`),
};

// ---- Chargers API ----
export const chargersApi = {
  getStock: (params?: Record<string, unknown>) => api.get('/chargers/stock', { params }),
  createStock: (data: Record<string, unknown>) => api.post('/chargers/stock', data),
  updateStock: (id: number, data: Record<string, unknown>) => api.put(`/chargers/stock/${id}`, data),
  deleteStock: (id: number) => api.delete(`/chargers/stock/${id}`),
  getBases: (params?: Record<string, unknown>) => api.get('/chargers/bases', { params }),
  createBase: (data: Record<string, unknown>) => api.post('/chargers/bases', data),
  updateBase: (id: number, data: Record<string, unknown>) => api.put(`/chargers/bases/${id}`, data),
  getTransfers: (params?: Record<string, unknown>) => api.get('/chargers/transfers', { params }),
  createTransfer: (data: Record<string, unknown>) => api.post('/chargers/transfers', data),
  updateTransfer: (id: number, data: Record<string, unknown>) => api.put(`/chargers/transfers/${id}`, data),
  deleteTransfer: (id: number) => api.delete(`/chargers/transfers/${id}`),
  deleteBase: (id: number) => api.delete(`/chargers/bases/${id}`),
};

// ---- Cards API ----
export const cardsApi = {
  getStock: (params?: Record<string, unknown>) => api.get('/cards/stock', { params }),
  getStockById: (id: number) => api.get(`/cards/stock/${id}`),
  createStock: (data: Record<string, unknown>) => api.post('/cards/stock', data),
  updateStock: (id: number, data: Record<string, unknown>) => api.put(`/cards/stock/${id}`, data),
  deleteStock: (id: number) => api.delete(`/cards/stock/${id}`),
  getCirculation: (params?: Record<string, unknown>) => api.get('/cards/circulation', { params }),
  getMonitoring: (params?: Record<string, unknown>) => api.get('/cards/monitoring', { params }),
  createMonitoring: (data: Record<string, unknown>) => api.post('/cards/monitoring', data),
  updateMonitoring: (id: number, data: Record<string, unknown>) => api.put(`/cards/monitoring/${id}`, data),
  deleteMonitoring: (id: number) => api.delete(`/cards/monitoring/${id}`),
  getTransfers: (params?: Record<string, unknown>) => api.get('/cards/transfers', { params }),
  createTransfer: (data: Record<string, unknown>) => api.post('/cards/transfers', data),
  updateTransfer: (id: number, data: Record<string, unknown>) => api.put(`/cards/transfers/${id}`, data),
  deleteTransfer: (id: number) => api.delete(`/cards/transfers/${id}`),
};

// ---- Users API ----
export const usersApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/users', { params }),
  getById: (id: number) => api.get(`/users/${id}`),
  create: (data: Record<string, unknown>) => api.post('/users', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
  getPermissions: (id: number) => api.get(`/users/${id}/permissions`),
  updatePermissions: (id: number, data: Record<string, unknown>) => api.put(`/users/${id}/permissions`, data),
  getPending: (params?: Record<string, unknown>) => api.get('/users/pending/list', { params }),
  approveUser: (id: number) => api.post(`/users/${id}/approve`),
  rejectUser: (id: number) => api.post(`/users/${id}/reject`),
};

// ---- Structures API ----
export const structuresApi = {
  getDistricts: (params?: Record<string, unknown>) => api.get('/org/districts', { params }),
  getDistrictById: (id: number) => api.get(`/org/districts/${id}`),
  getStructures: (params?: Record<string, unknown>) => api.get('/org/structures', { params }),
  getStructureById: (id: number) => api.get(`/org/structures/${id}`),
  lookupStructureByCode: (code: string) => api.get(`/org/structures/lookup/${encodeURIComponent(code)}`),
  lookupStationByCode: (code: string) => api.get(`/org/stations/lookup/${encodeURIComponent(code)}`),
  createStructure: (data: Record<string, unknown>) => api.post('/org/structures', data),
  updateStructure: (id: number, data: Record<string, unknown>) => api.put(`/org/structures/${id}`, data),
  deleteStructure: (id: number) => api.delete(`/org/structures/${id}`),
  getStations: (params?: Record<string, unknown>) => api.get('/org/stations', { params }),
  getStationById: (id: number) => api.get(`/org/stations/${id}`),
  createStation: (data: Record<string, unknown>) => api.post('/org/stations', data),
  updateStation: (id: number, data: Record<string, unknown>) => api.put(`/org/stations/${id}`, data),
  deleteStation: (id: number) => api.delete(`/org/stations/${id}`),
};

// ---- Audit Logs API ----
export const auditLogsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/audit-logs', { params }),
  getById: (id: number) => api.get(`/audit-logs/${id}`),
  getStats: () => api.get('/audit-logs/stats'),
  getRecentLogins: () => api.get('/audit-logs/recent-logins'),
};

// ---- Notifications API ----
export const notificationsApi = {
  getMine: (params?: Record<string, unknown>) => api.get('/notifications', { params }),
  markRead: (id: number) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
  getSupportRequests: (params?: Record<string, unknown>) => api.get('/notifications/support-requests/list', { params }),
  updateSupportRequest: (id: number, data: Record<string, unknown>) => api.patch(`/notifications/support-requests/${id}`, data),
};

export default api;
