import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Home as HomeIcon,
  CreditCard, 
  Package, 
  Truck, 
  Wrench, 
  RotateCcw, 
  Trash2, 
  BatteryCharging,
  Database,
  ArrowLeftRight,
  IdCard,
  AlertCircle,
  ChevronDown,
  LogOut,
  Settings,
  Users,
  Building2,
  ShieldCheck,
  FileText,
  Lock
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const { canViewRoute } = usePermissions();

  // Auto-detect which section should be open based on current route
  const getActiveSection = () => {
    if (location.pathname.startsWith('/tpe')) return 'tpe';
    if (location.pathname.startsWith('/chargers')) return 'chargers';
    if (location.pathname.startsWith('/cards')) return 'cards';
    if (location.pathname.startsWith('/admin')) return 'admin';
    return '';
  };

  const [expandedMenu, setExpandedMenu] = useState<string>(getActiveSection());

  // Keep expanded menu in sync with route changes
  useEffect(() => {
    setExpandedMenu(getActiveSection());
  }, [location.pathname]);

  const toggleMenu = (menu: string) => {
    setExpandedMenu(prev => prev === menu ? '' : menu);
  };

  const isActive = (path: string) => location.pathname === path;
  const isMenuActive = (paths: string[]) => paths.some(path => location.pathname.startsWith(path));

  const menuItems = [
    {
      id: 'home',
      label: language === 'fr' ? 'Accueil' : 'Home',
      icon: HomeIcon,
      path: '/home',
    },
    {
      id: 'dashboard',
      label: language === 'fr' ? 'Tableau de Bord' : 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
    },
    {
      id: 'tpe',
      label: language === 'fr' ? 'Gestion TPE' : 'TPE Management',
      icon: CreditCard,
      children: [
        { label: language === 'fr' ? 'Stock TPE' : 'TPE Stock', path: '/tpe/stock', icon: Package },
        { label: language === 'fr' ? 'Maintenance' : 'Maintenance', path: '/tpe/maintenance', icon: Wrench },
        { label: language === 'fr' ? 'Suivi TPE' : 'Track TPE', path: '/tpe/track', icon: RotateCcw },
        { label: language === 'fr' ? 'Transferts' : 'Transfers', path: '/tpe/transfers', icon: Truck },
        { label: language === 'fr' ? 'Reforme' : 'Reform', path: '/tpe/reform', icon: Trash2 },
      ],
    },
    {
      id: 'chargers',
      label: language === 'fr' ? 'Chargeurs/Bases' : 'Chargers/Bases',
      icon: BatteryCharging,
      children: [
        { label: language === 'fr' ? 'Stock' : 'Stock', path: '/chargers/stock', icon: Package },
        { label: language === 'fr' ? 'Transferts' : 'Transfers', path: '/chargers/transfers', icon: ArrowLeftRight },
      ],
    },
    {
      id: 'cards',
      label: language === 'fr' ? 'Cartes Gestion' : 'Management Cards',
      icon: IdCard,
      children: [
        { label: language === 'fr' ? 'Stock' : 'Stock', path: '/cards/stock', icon: Package },
        { label: language === 'fr' ? 'Circulation' : 'Circulation', path: '/cards/circulation', icon: Database },
        { label: language === 'fr' ? 'Suivi' : 'Monitoring', path: '/cards/monitoring', icon: AlertCircle },
        { label: language === 'fr' ? 'Transferts' : 'Transfers', path: '/cards/transfers', icon: ArrowLeftRight },
      ],
    },
    ...(user?.role !== 'administrator' ? [{
      id: 'users',
      label: language === 'fr' ? 'Demander un Utilisateur' : 'Request User',
      icon: Users,
      path: '/users/request',
    }] : []),
    {
      id: 'admin',
      label: language === 'fr' ? 'Administration' : 'Administration',
      icon: ShieldCheck,
      children: [
        { label: language === 'fr' ? 'Utilisateurs' : 'Users', path: '/admin/users', icon: Users },
        { label: language === 'fr' ? 'Structures' : 'Structures', path: '/admin/structures', icon: Building2 },
        { label: language === 'fr' ? 'Journal d\'Audit' : 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
      ],
    },
  ];

  // Annotate items with lock status (instead of hiding) so users see what they don't have access to.
  const filteredMenuItems = menuItems.filter((item) => {
    // Role-based filter still hides items not meant for this role at all.
    if ('roles' in item && item.roles) {
      if (!user?.role || !item.roles.includes(user.role)) return false;
    }
    return true;
  }).map((item) => {
    if (item.children) {
      const annotatedChildren = item.children.map((child) => ({
        ...child,
        locked: !canViewRoute(child.path),
      }));
      return {
        ...item,
        children: annotatedChildren,
        locked: annotatedChildren.every((c) => c.locked),
      };
    }
    return {
      ...item,
      locked: 'path' in item && item.path ? !canViewRoute(item.path) : false,
    };
  }) as Array<typeof menuItems[number] & {
    locked: boolean;
    children?: Array<{ label: string; path: string; icon: typeof Package; locked: boolean }>;
  }>;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-50 h-full w-[270px] bg-white/95 dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-800/60 lg:translate-x-0 transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col shadow-[1px_0_3px_rgba(0,0,0,0.03)] dark:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-slate-200/80 dark:border-slate-800/60">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 shadow-soft">
              <img src="/naftal-logo.png" alt="NAFTAL Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[13px] leading-tight tracking-tight text-gray-900 dark:text-white">NAFTAL</span>
              <span className="text-[10px] leading-tight font-semibold text-[var(--naftal-yellow)] uppercase tracking-widest">GAP System</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {filteredMenuItems.map((item, itemIndex) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: itemIndex * 0.04, duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              {item.children ? (
                <>
                  <button
                    onClick={() => !item.locked && toggleMenu(item.id)}
                    aria-disabled={item.locked}
                    title={item.locked ? (language === 'fr' ? 'Acces restreint - Contactez un administrateur' : 'Access restricted - Contact an administrator') : undefined}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 group ${
                      item.locked
                        ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                        : isMenuActive(item.children.map(c => c.path))
                          ? 'bg-blue-50/80 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                          : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        item.locked
                          ? 'bg-slate-100 dark:bg-slate-800/60'
                          : isMenuActive(item.children.map(c => c.path))
                            ? 'bg-blue-100/80 dark:bg-blue-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200/80 dark:group-hover:bg-slate-700'
                      }`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    {item.locked
                      ? <Lock className="w-3.5 h-3.5" />
                      : <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedMenu === item.id ? 'rotate-0' : '-rotate-90'}`} />
                    }
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {!item.locked && expandedMenu === item.id && (
                      <motion.div
                        key="submenu"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="ml-[18px] mt-0.5 space-y-0.5 overflow-hidden border-l border-slate-200/60 dark:border-slate-800 pl-3"
                      >
                        {item.children.map((child) => (
                          child.locked ? (
                            <div
                              key={child.path}
                              aria-disabled="true"
                              title={language === 'fr' ? 'Acces restreint - Contactez un administrateur' : 'Access restricted - Contact an administrator'}
                              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] text-slate-400 dark:text-slate-600 cursor-not-allowed select-none"
                            >
                              <child.icon className="w-3.5 h-3.5" />
                              <span>{child.label}</span>
                              <Lock className="ml-auto w-3 h-3" />
                            </div>
                          ) : (
                            <Link
                              key={child.path}
                              to={child.path}
                              onClick={onClose}
                              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] transition-all duration-200 ${
                                isActive(child.path)
                                  ? 'bg-blue-50/80 text-blue-700 font-medium dark:bg-blue-500/10 dark:text-blue-400'
                                  : 'text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-gray-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                              }`}
                            >
                              <child.icon className="w-3.5 h-3.5" />
                              <span>{child.label}</span>
                              {isActive(child.path) && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
                              )}
                            </Link>
                          )
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : item.locked ? (
                <div
                  aria-disabled="true"
                  title={language === 'fr' ? 'Acces restreint - Contactez un administrateur' : 'Access restricted - Contact an administrator'}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-slate-400 dark:text-slate-600 cursor-not-allowed select-none"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800/60">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                  <Lock className="ml-auto w-3.5 h-3.5" />
                </div>
              ) : (
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 group ${
                    isActive(item.path)
                      ? 'bg-blue-50/80 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                      : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-gray-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-100/80 dark:bg-blue-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200/80 dark:group-hover:bg-slate-700'
                  }`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                  {isActive(item.path) && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
                  )}
                </Link>
              )}
            </motion.div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-slate-200/80 dark:border-slate-800/60 p-3 space-y-0.5">
          <button
            onClick={() => { onClose(); navigate('/settings'); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-slate-500 dark:text-gray-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-gray-200 transition-all"
          >
            <Settings className="w-4 h-4" />
            <span>{language === 'fr' ? 'Parametres' : 'Settings'}</span>
          </button>
          <button
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>{language === 'fr' ? 'Deconnexion' : 'Logout'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
