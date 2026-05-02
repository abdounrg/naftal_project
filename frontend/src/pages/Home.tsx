import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CreditCard,
  BatteryCharging,
  IdCard,
  ShieldCheck,
  Search,
  LogOut,
  Sun,
  Moon,
  Globe,
  ArrowUpRight,
  Sparkles,
  Users,
  MapPinOff,
  Lock,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { usePermissions } from '../hooks/usePermissions';

interface HomeSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  /** Permission route used to determine visibility. */
  permissionRoute: string;
  /** Tailwind gradient classes for the card accent. */
  gradient: string;
  /** Soft glow color (used in shadow + blob). */
  glow: string;
  /** Short tag list shown on the card. */
  tags: string[];
}

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const { canViewRoute } = usePermissions();
  const [search, setSearch] = useState('');
  const userAvatar = user?.avatarUrl ?? null;

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (language === 'fr') {
      if (hour < 12) return 'Bonjour';
      if (hour < 18) return 'Bon apres-midi';
      return 'Bonsoir';
    }
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, [language]);

  const sections: HomeSection[] = useMemo(
    () => [
      {
        id: 'dashboard',
        title: language === 'fr' ? 'Tableau de Bord' : 'Dashboard',
        description:
          language === 'fr'
            ? 'Vue d\'ensemble en temps reel de votre parc et indicateurs cles.'
            : 'Real-time overview of your fleet and key indicators.',
        icon: LayoutDashboard,
        path: '/dashboard',
        permissionRoute: '/dashboard',
        gradient: 'from-blue-500 via-blue-600 to-indigo-600',
        glow: 'shadow-blue-500/30',
        tags: language === 'fr' ? ['KPIs', 'Statistiques', 'Alertes'] : ['KPIs', 'Statistics', 'Alerts'],
      },
      {
        id: 'tpe',
        title: language === 'fr' ? 'Gestion des TPE' : 'TPE Management',
        description:
          language === 'fr'
            ? 'Stock, maintenance, retours, transferts et reforme des terminaux.'
            : 'Stock, maintenance, returns, transfers and reform of terminals.',
        icon: CreditCard,
        path: '/tpe/stock',
        permissionRoute: '/tpe/stock',
        gradient: 'from-emerald-500 via-emerald-600 to-teal-600',
        glow: 'shadow-emerald-500/30',
        tags: language === 'fr' ? ['Stock', 'Maintenance', 'Transferts'] : ['Stock', 'Maintenance', 'Transfers'],
      },
      {
        id: 'chargers',
        title: language === 'fr' ? 'Chargeurs & Bases' : 'Chargers & Bases',
        description:
          language === 'fr'
            ? 'Suivi des accessoires et equipements associes aux TPE.'
            : 'Track accessories and equipment paired with TPE devices.',
        icon: BatteryCharging,
        path: '/chargers/stock',
        permissionRoute: '/chargers/stock',
        gradient: 'from-amber-500 via-orange-500 to-rose-500',
        glow: 'shadow-amber-500/30',
        tags: language === 'fr' ? ['Stock', 'Transferts'] : ['Stock', 'Transfers'],
      },
      {
        id: 'cards',
        title: language === 'fr' ? 'Cartes de Gestion' : 'Management Cards',
        description:
          language === 'fr'
            ? 'Gestion des cartes en stock, en circulation et leur suivi.'
            : 'Manage cards in stock, in circulation and their monitoring.',
        icon: IdCard,
        path: '/cards/stock',
        permissionRoute: '/cards/stock',
        gradient: 'from-fuchsia-500 via-pink-500 to-rose-500',
        glow: 'shadow-fuchsia-500/30',
        tags: language === 'fr' ? ['Stock', 'Circulation', 'Suivi'] : ['Stock', 'Circulation', 'Monitoring'],
      },
      {
        id: 'admin',
        title: language === 'fr' ? 'Administration' : 'Administration',
        description:
          language === 'fr'
            ? 'Utilisateurs, structures et journaux d\'audit du systeme.'
            : 'Users, structures and system audit logs.',
        icon: ShieldCheck,
        path: '/admin/structures',
        permissionRoute: '/admin/structures',
        gradient: 'from-violet-500 via-purple-600 to-indigo-700',
        glow: 'shadow-violet-500/30',
        tags: language === 'fr' ? ['Utilisateurs', 'Structures', 'Audit'] : ['Users', 'Structures', 'Audit'],
      },
      {
        id: 'stations',
        title: language === 'fr' ? 'Stations sans TPE' : 'Stations without TPE',
        description:
          language === 'fr'
            ? 'Identifiez rapidement les stations qui n\'ont aucun terminal affecte.'
            : 'Quickly identify stations that have no terminal assigned.',
        icon: MapPinOff,
        path: '/dashboard/stations-without-tpe',
        permissionRoute: '/dashboard',
        gradient: 'from-slate-600 via-slate-700 to-slate-900',
        glow: 'shadow-slate-500/30',
        tags: language === 'fr' ? ['Stations', 'Couverture'] : ['Stations', 'Coverage'],
      },
    ],
    [language]
  );

  const visibleSections = sections.map((s) => ({
    ...s,
    locked: !canViewRoute(s.permissionRoute),
  }));

  const filteredSections = visibleSections.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const toggleLanguage = () => setLanguage(language === 'fr' ? 'en' : 'fr');

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100 transition-colors duration-500">
      {/* ─── Background — fully static, single GPU layer ─── */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden="true"
        style={{ transform: 'translateZ(0)', willChange: 'transform' }}
      >
        {/* Base gradient + dark overlay (single composited layer) */}
        <div className="absolute inset-0 hero-bg-base" />
        <div className="absolute inset-0 hero-overlay-gradient opacity-95" />
        {/* Single accent glow baked as a CSS radial — no blur filter, no extra layers */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 800px 600px at 15% 20%, rgba(0,71,171,0.30), transparent 60%), radial-gradient(ellipse 600px 500px at 90% 90%, rgba(255,199,44,0.10), transparent 60%)',
          }}
        />
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.04] hero-pattern" />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_55%,rgba(0,0,0,0.55)_100%)]" />
      </div>

      {/* ─── Header (single backdrop-blur, kept on top — cheap because <header> is small) ─── */}
      <header className="sticky top-0 z-30 bg-slate-950/70 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center gap-3 sm:gap-4">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-amber-400/60 shadow-md transition-transform group-hover:scale-105">
              <img src="/naftal-logo.png" alt="NAFTAL" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-bold text-[14px] tracking-tight text-white">NAFTAL</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">GAP System</span>
            </div>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-amber-400 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  language === 'fr'
                    ? 'Rechercher une section, un module...'
                    : 'Search a section, a module...'
                }
                aria-label={language === 'fr' ? 'Rechercher' : 'Search'}
                className="w-full pl-10 pr-4 py-2.5 text-[13.5px] bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 backdrop-blur-md focus:outline-none focus:bg-white/10 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 transition-all"
              />
            </div>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={toggleTheme}
              aria-label={language === 'fr' ? 'Changer de theme' : 'Toggle theme'}
              className="p-2 rounded-xl text-slate-200 hover:bg-white/10 transition-colors"
            >
              {isDarkMode ? (
                <Sun className="w-[18px] h-[18px] text-amber-400" />
              ) : (
                <Moon className="w-[18px] h-[18px] text-slate-200" />
              )}
            </button>
            <button
              onClick={toggleLanguage}
              aria-label={language === 'fr' ? 'Changer de langue' : 'Toggle language'}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[12px] font-semibold border border-white/15 text-slate-100 hover:bg-white/10 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="uppercase">{language}</span>
            </button>

            {/* User chip */}
            <Link
              to="/settings"
              className="hidden md:flex items-center gap-2.5 pl-3 ml-1 border-l border-white/10 hover:opacity-90 transition-opacity"
              title={language === 'fr' ? 'Parametres' : 'Settings'}
            >
              <div className="w-8 h-8 rounded-lg bg-white/10 text-white text-[12px] font-bold flex items-center justify-center shadow-sm shrink-0 overflow-hidden ring-1 ring-white/20 backdrop-blur">
                {userAvatar ? (
                  <img src={userAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  userInitials
                )}
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[12.5px] font-semibold text-white whitespace-nowrap">
                  {user?.name}
                </span>
                <span className="text-[11px] text-slate-300 whitespace-nowrap">
                  {user?.email}
                </span>
              </div>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              aria-label={language === 'fr' ? 'Deconnexion' : 'Logout'}
              className="group/logout ml-2 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-[12.5px] font-semibold text-white bg-red-600/90 hover:bg-red-600 active:bg-red-700 shadow-sm hover:shadow-lg hover:shadow-red-500/30 backdrop-blur transition-all duration-150 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <LogOut className="w-4 h-4 shrink-0 transition-transform group-hover/logout:translate-x-0.5" />
              <span className="hidden sm:inline leading-none">
                {language === 'fr' ? 'Deconnexion' : 'Logout'}
              </span>
            </button>
          </div>
        </div>
        {/* gradient hairline divider — signature glass edge */}
        <div className="absolute bottom-0 inset-x-0 h-px glass-hairline" />
      </header>

      {/* ─── Main ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Hero greeting */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          className="mb-10 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30 backdrop-blur mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            {language === 'fr' ? 'Bienvenue sur NAFTAL GAP' : 'Welcome to NAFTAL GAP'}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
            {greeting},{' '}
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-blue-300 bg-clip-text text-transparent">
              {user?.name?.split(' ')[0] || (language === 'fr' ? 'Utilisateur' : 'User')}
            </span>
            <span className="text-amber-400">.</span>
          </h1>
          <p className="mt-3 text-[15px] sm:text-base text-slate-300/90 max-w-2xl leading-relaxed">
            {language === 'fr'
              ? "Choisissez une section pour commencer. Toutes les ressources de la plateforme NAFTAL GAP sont reunies ici."
              : 'Pick a section to get started. All NAFTAL GAP resources are gathered here.'}
          </p>
          {/* gradient underline accent */}
          <div className="mt-6 h-px w-32 bg-gradient-to-r from-amber-400/70 via-amber-400/30 to-transparent" />
        </motion.section>

        {/* Sections grid */}
        {filteredSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-200">
              {language === 'fr' ? 'Aucune section ne correspond.' : 'No section matches.'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'fr'
                ? 'Essayez un autre mot-cle ou videz la recherche.'
                : 'Try another keyword or clear the search.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredSections.map((s, i) => {
              const cardInner = (
                <>
                  {/* gradient hover overlay */}
                  {!s.locked && (
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-[0.06] dark:group-hover:opacity-[0.12] transition-opacity duration-300`}
                    />
                  )}
                  {/* gradient blob */}
                  <div
                    className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${s.gradient} ${s.locked ? 'opacity-10 grayscale' : 'opacity-20 group-hover:opacity-40'} blur-2xl transition-opacity duration-500`}
                  />

                  {/* Locked badge (top-right) */}
                  {s.locked && (
                    <div className="absolute top-3 right-3 z-20 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] font-semibold bg-slate-900/85 dark:bg-slate-100/90 text-white dark:text-slate-900 shadow-md backdrop-blur">
                      <Lock className="w-3 h-3" />
                      {language === 'fr' ? 'Verrouille' : 'Locked'}
                    </div>
                  )}

                  <div className={`relative z-10 ${s.locked ? 'opacity-70' : ''}`}>
                    <div className="flex items-start justify-between mb-5">
                      <div
                        className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          s.locked
                            ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-slate-400 shadow-inner ring-1 ring-white/5'
                            : `bg-gradient-to-br ${s.gradient} text-white shadow-xl ${s.glow} ring-1 ring-white/25 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl`
                        }`}
                      >
                        {/* inner top highlight on icon */}
                        {!s.locked && (
                          <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/30 to-transparent opacity-60" />
                        )}
                        <s.icon className="relative w-6 h-6 drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]" />
                      </div>
                      {!s.locked && (
                        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 ring-1 ring-white/10 group-hover:bg-white/15 group-hover:ring-white/30 transition-all">
                          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </div>
                      )}
                    </div>

                    <h3 className={`text-lg font-bold tracking-tight mb-1.5 ${s.locked ? 'text-slate-400' : 'text-white'}`}>
                      {s.title}
                    </h3>
                    <p className={`text-[13.5px] leading-relaxed mb-5 ${s.locked ? 'text-slate-500' : 'text-slate-300'}`}>
                      {s.locked
                        ? (language === 'fr'
                            ? "Acces restreint. Contactez un administrateur pour obtenir l'autorisation."
                            : 'Access restricted. Contact an administrator to request permission.')
                        : s.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {s.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                            s.locked
                              ? 'bg-white/5 text-slate-500 line-through decoration-slate-600'
                              : 'bg-white/10 text-slate-200 ring-1 ring-white/10 group-hover:bg-white/15'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              );

              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  {s.locked ? (
                    <div
                      role="button"
                      aria-disabled="true"
                      tabIndex={-1}
                      title={language === 'fr' ? 'Acces restreint - Contactez un administrateur' : 'Access restricted - Contact an administrator'}
                      className="group relative block h-full p-7 rounded-3xl bg-slate-900/55 border border-dashed border-white/15 cursor-not-allowed select-none overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
                    >
                      {cardInner}
                    </div>
                  ) : (
                    <Link
                      to={s.path}
                      className={`group relative block h-full p-7 rounded-3xl bg-slate-900/55 hover:bg-slate-900/65 border border-white/10 hover:border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.55)] ${s.glow} transition-colors duration-200 overflow-hidden hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60`}
                    >
                      {cardInner}
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Footer hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-12 flex flex-wrap items-center justify-between gap-3 text-[12px] text-slate-400"
        >
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5" />
            <span>
              {language === 'fr' ? 'Connecte en tant que' : 'Signed in as'}{' '}
              <span className="font-semibold text-slate-200">{user?.email}</span>
            </span>
          </div>
          <span>© {new Date().getFullYear()} NAFTAL — GAP System</span>
        </motion.div>
      </main>
    </div>
  );
};

export default Home;
