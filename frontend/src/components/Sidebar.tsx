import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
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
  ChevronRight,
  LogOut,
  Settings,
  Users,
  Building2,
  ShieldCheck,
  FileText
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['tpe']);

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => 
      prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isMenuActive = (paths: string[]) => paths.some(path => location.pathname.startsWith(path));

  const menuItems = [
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
        { label: language === 'fr' ? 'Retours' : 'Returns', path: '/tpe/returns', icon: RotateCcw },
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
    {
      id: 'admin',
      label: language === 'fr' ? 'Administration' : 'Administration',
      icon: ShieldCheck,
      roles: ['administrator', 'dpe_member'],
      children: [
        { label: language === 'fr' ? 'Utilisateurs' : 'Users', path: '/admin/users', icon: Users },
        { label: language === 'fr' ? 'Structures' : 'Structures', path: '/admin/structures', icon: Building2 },
        { label: language === 'fr' ? 'Journal d\'Audit' : 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
      ],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if ('roles' in item && item.roles) {
      return user?.role && item.roles.includes(user.role);
    }
    return true;
  });

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
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden ring-2 ring-[var(--naftal-yellow)]">
              <img src="/naftal-logo.png" alt="NAFTAL Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight text-gray-900 dark:text-white">NAFTAL</span>
              <span className="text-xs leading-tight text-[var(--naftal-yellow)]">GAP</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {filteredMenuItems.map((item, itemIndex) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: itemIndex * 0.05, duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="mb-1"
            >
              {item.children ? (
                <>
                  <motion.button
                    onClick={() => toggleMenu(item.id)}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isMenuActive(item.children.map(c => c.path))
                        ? 'bg-[var(--naftal-blue)]/10 text-[var(--naftal-blue)] dark:bg-[var(--naftal-blue)]/20'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    {expandedMenus.includes(item.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </motion.button>
                  
                  <AnimatePresence initial={false}>
                    {expandedMenus.includes(item.id) && (
                      <motion.div
                        key="submenu"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                        className="ml-4 mt-1 space-y-1 overflow-hidden"
                      >
                        {item.children.map((child) => (
                          <motion.div key={child.path} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                            <Link
                              to={child.path}
                              onClick={onClose}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                isActive(child.path)
                                  ? 'bg-[var(--naftal-yellow)]/20 text-[var(--naftal-blue)] dark:text-[var(--naftal-yellow)] border-l-2 border-[var(--naftal-yellow)]'
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                              }`}
                            >
                              <child.icon className="w-4 h-4" />
                              <span>{child.label}</span>
                            </Link>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-[var(--naftal-blue)]/10 text-[var(--naftal-blue)] dark:bg-[var(--naftal-blue)]/20 border-l-2 border-[var(--naftal-yellow)]'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              )}
            </motion.div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-3">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Settings className="w-5 h-5" />
            <span>{language === 'fr' ? 'Parametres' : 'Settings'}</span>
          </button>
          <button
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-1"
          >
            <LogOut className="w-5 h-5" />
            <span>{language === 'fr' ? 'Deconnexion' : 'Logout'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
