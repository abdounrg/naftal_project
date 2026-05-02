import { useEffect, useMemo, useState } from 'react';
import { Menu, Bell, Search, Sun, Moon, Globe, Check, X, AlertTriangle, UserPlus, MessageSquareWarning } from 'lucide-react';

import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { DashboardSearchContext } from '../context/DashboardSearchContext';
import { notificationsApi } from '../lib/api';

const roleLabels: Record<string, Record<string, string>> = {
  fr: {
    administrator: 'Administrateur',
    dpe_member: 'Membre DPE',
    agency_member: 'Membre Agence',
    district_member: 'Membre District',
    antenna_member: 'Membre Antenne',
  },
  en: {
    administrator: 'Administrator',
    dpe_member: 'DPE Member',
    agency_member: 'Agency Member',
    district_member: 'District Member',
    antenna_member: 'Antenna Member',
  },
};

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message?: string;
  status: 'unread' | 'read';
  createdAt: string;
}

interface SupportRequestItem {
  id: number;
  requesterName: string;
  requesterEmail: string;
  problemDescription: string;
  status: 'open' | 'in_progress' | 'resolved' | 'rejected';
  createdAt: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const DashboardLayout = ({ children, title, subtitle }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dashboardSearchTerm, setDashboardSearchTerm] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [supportRequests, setSupportRequests] = useState<SupportRequestItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const userAvatar = user?.avatarUrl ?? null;
  const isAdmin = user?.role === 'administrator';

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';
  const userName = user?.name || '...';
  const userRole = user?.role ? (roleLabels[language]?.[user.role] || user.role) : '...';

  const dashboardSearchValue = useMemo(
    () => ({ searchTerm: dashboardSearchTerm, setSearchTerm: setDashboardSearchTerm }),
    [dashboardSearchTerm]
  );

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  const loadNotifications = async () => {
    if (!user) return;
    setLoadingNotifications(true);
    try {
      const notifRes = await notificationsApi.getMine({ per_page: 20 });
      const notifData = notifRes.data?.data || [];
      const unread = (notifData as NotificationItem[]).filter((n) => n.status === 'unread').length;
      setNotifications(notifData as NotificationItem[]);
      setUnreadCount(unread);

      if (isAdmin) {
        const supportRes = await notificationsApi.getSupportRequests({ per_page: 10, status: 'open' });
        setSupportRequests((supportRes.data?.data || []) as SupportRequestItem[]);
      }
    } catch {
      // Ignore transient fetch errors
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]);

  const markNotificationRead = async (id: number) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: 'read' } : n)));
      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
    } catch {
      // Ignore transient update errors
    }
  };

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' })));
      setUnreadCount(0);
    } catch {
      // Ignore transient update errors
    }
  };

  const updateSupportRequest = async (id: number, status: 'in_progress' | 'resolved' | 'rejected') => {
    setActionLoadingId(id);
    try {
      await notificationsApi.updateSupportRequest(id, { status });
      setSupportRequests((prev) => prev.filter((r) => r.id !== id));
      await loadNotifications();
    } catch {
      // Ignore transient update errors
    } finally {
      setActionLoadingId(null);
    }
  };

  const iconByType = (type: string) => {
    if (type === 'new_pending_user') return <UserPlus className="w-4 h-4 text-blue-500" />;
    if (type === 'suspicious_activity') return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    if (type === 'login_support_request') return <MessageSquareWarning className="w-4 h-4 text-purple-500" />;
    if (type === 'user_request_approved') return <Check className="w-4 h-4 text-emerald-500" />;
    if (type === 'user_request_rejected') return <X className="w-4 h-4 text-red-500" />;
    return <Bell className="w-4 h-4 text-slate-500" />;
  };

  return (
    <DashboardSearchContext.Provider value={dashboardSearchValue}>
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-[400ms]">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:ml-[270px]">
        {/* Header */}
        <header className="h-16 bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/60 sticky top-0 z-30 transition-colors duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-none">
          <div className="h-full px-4 sm:px-6 flex items-center justify-between">
            {/* Left Side */}
            <div className="flex items-center gap-4">
              <button
                aria-label="Toggle sidebar"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h1>
                {subtitle && <p className="text-[13px] text-slate-500 dark:text-gray-500">{subtitle}</p>}
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2 relative">
              {/* Search */}
              <div className="hidden sm:flex items-center bg-slate-100/80 dark:bg-slate-800/60 rounded-xl px-3.5 py-2 group focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:shadow-soft border border-transparent focus-within:border-slate-200 dark:focus-within:border-slate-700 transition-all">
                <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
                  aria-label={language === 'fr' ? 'Recherche principale' : 'Main search'}
                  value={dashboardSearchTerm}
                  onChange={(e) => setDashboardSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-[13px] ml-2.5 w-48 text-slate-700 dark:text-gray-300 placeholder-slate-400"
                />
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
              >
                {isDarkMode ? (
                  <Sun className="w-[18px] h-[18px] text-amber-500" />
                ) : (
                  <Moon className="w-[18px] h-[18px] text-slate-400" />
                )}
              </button>

              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[13px] font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
              >
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span className="uppercase text-slate-600 dark:text-gray-400 text-[11px] font-semibold">{language}</span>
              </button>

              {/* Notifications */}
              <button
                aria-label="Notifications"
                onClick={() => setShowNotifications((prev) => !prev)}
                className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
              >
                <Bell className="w-[18px] h-[18px] text-slate-400 dark:text-gray-500" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-blue-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-950">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute top-12 right-0 w-[370px] max-h-[70vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {language === 'fr' ? 'Notifications' : 'Notifications'}
                    </h3>
                    <button
                      onClick={markAllRead}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      {language === 'fr' ? 'Tout marquer lu' : 'Mark all read'}
                    </button>
                  </div>

                  {isAdmin && supportRequests.length > 0 && (
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2">
                        {language === 'fr' ? 'Demandes support login' : 'Login support requests'}
                      </p>
                      <div className="space-y-2">
                        {supportRequests.map((req) => (
                          <div key={req.id} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">{req.requesterName}</p>
                            <p className="text-[11px] text-slate-500 dark:text-gray-400">{req.requesterEmail}</p>
                            <p className="text-[11px] text-slate-700 dark:text-gray-300 mt-1 line-clamp-2">{req.problemDescription}</p>
                            <div className="flex gap-1.5 mt-2">
                              <button
                                onClick={() => updateSupportRequest(req.id, 'in_progress')}
                                disabled={actionLoadingId === req.id}
                                className="px-2 py-1 text-[11px] rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                              >
                                {language === 'fr' ? 'Traiter' : 'Process'}
                              </button>
                              <button
                                onClick={() => updateSupportRequest(req.id, 'resolved')}
                                disabled={actionLoadingId === req.id}
                                className="px-2 py-1 text-[11px] rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                              >
                                {language === 'fr' ? 'Résolu' : 'Resolved'}
                              </button>
                              <button
                                onClick={() => updateSupportRequest(req.id, 'rejected')}
                                disabled={actionLoadingId === req.id}
                                className="px-2 py-1 text-[11px] rounded-lg bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                              >
                                {language === 'fr' ? 'Rejeter' : 'Reject'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-2">
                    {loadingNotifications ? (
                      <p className="p-3 text-xs text-slate-500 dark:text-gray-400">
                        {language === 'fr' ? 'Chargement...' : 'Loading...'}
                      </p>
                    ) : notifications.length === 0 ? (
                      <p className="p-3 text-xs text-slate-500 dark:text-gray-400">
                        {language === 'fr' ? 'Aucune notification' : 'No notifications'}
                      </p>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => markNotificationRead(notification.id)}
                          className={`w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors ${
                            notification.status === 'unread' ? 'bg-blue-50/50 dark:bg-blue-500/5' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5">{iconByType(notification.type)}</div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{notification.title}</p>
                              {notification.message && (
                                <p className="text-[11px] text-slate-600 dark:text-gray-400 mt-0.5 line-clamp-2">{notification.message}</p>
                              )}
                              <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-1">
                                {new Date(notification.createdAt).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-GB')}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="w-px h-7 bg-slate-200 dark:bg-slate-700 mx-0.5" />

              {/* User Avatar */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 font-semibold text-[11px] shadow-sm overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
                  {userAvatar ? (
                    <img src={userAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    userInitials
                  )}
                </div>
                <div className="hidden md:block">
                  <p className="text-[13px] font-medium text-slate-900 dark:text-white leading-tight">{userName}</p>
                  <p className="text-[11px] text-slate-400 dark:text-gray-500">{userRole}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
    </DashboardSearchContext.Provider>
  );
};

export default DashboardLayout;
