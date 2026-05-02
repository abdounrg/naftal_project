import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi } from '../lib/api';

interface SectionPermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export type PermissionsMap = Record<string, SectionPermissions>;

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
  districtId: number | null;
  structureId: number | null;
  status: string;
  lastLoginAt: string | null;
  district?: { id: number; name: string; code: string } | null;
  structure?: { id: number; name: string; code: string } | null;
  permissions?: PermissionsMap;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
  updateAvatar: (dataUrl: string) => Promise<void>;
  removeAvatar: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check for stored tokens and validate session
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const { data } = await authApi.me();
        setUser(data.data);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    const { data } = await authApi.login(email, password);
    const { user: userData, accessToken, refreshToken } = data.data;
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('accessToken', accessToken);
    storage.setItem('refreshToken', refreshToken);
    storage.setItem('user', JSON.stringify(userData));
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('rememberedEmail');
    }
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // proceed even if server logout fails
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    setUser(null);
  }, []);

  const refreshPermissions = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await authApi.me();
      setUser(data.data);
    } catch {
      // silently fail
    }
  }, [user]);

  const updateAvatar = useCallback(async (dataUrl: string) => {
    const { data } = await authApi.updateAvatar(dataUrl);
    setUser((prev) => (prev ? { ...prev, avatarUrl: data.data?.avatarUrl ?? dataUrl } : prev));
  }, []);

  const removeAvatar = useCallback(async () => {
    await authApi.removeAvatar();
    setUser((prev) => (prev ? { ...prev, avatarUrl: null } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshPermissions,
        updateAvatar,
        removeAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
