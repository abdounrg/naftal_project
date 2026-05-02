import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard,
  BatteryCharging,
  IdCard,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  Wrench,
  Package,
  MapPinOff,
  Zap,
  ArrowRightLeft,
  Users,
  Building2,
  TrendingUp,
  Shield,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import { useLanguage } from '../context/LanguageContext';
import { dashboardApi } from '../lib/api';

interface DashboardStats {
  tpe: { total: number; en_service: number; en_stock: number; en_maintenance: number; en_panne: number; en_transfert: number; reforme: number };
  cards: { total: number };
  chargers: { total: number };
  stations: { total: number; withoutTpe: number };
  users: { total: number };
  maintenance: { active: number };
  transfers: { pending: number };
}

interface DashboardDistribution {
  byModel: { model: string; count: number }[];
  byOperator: { operator: string; count: number }[];
}

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
});

const Dashboard = () => {
  const { language } = useLanguage();
  const [apiStats, setApiStats] = useState<DashboardStats | null>(null);
  const [distribution, setDistribution] = useState<DashboardDistribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const [statsRes, distRes] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getDistribution(),
        ]);
        setApiStats(statsRes.data.data);
        setDistribution(distRes.data.data);
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        const msg = err?.response?.data?.message
          || err?.message
          || (language === 'fr' ? 'Impossible de charger les données du tableau de bord.' : 'Failed to load dashboard data.');
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [language]);

  // Computed data
  const tpeTotal = apiStats?.tpe.total || 0;
  const serviceRate = tpeTotal > 0 ? Math.round((apiStats!.tpe.en_service / tpeTotal) * 100) : 0;

  const statusDistribution = apiStats ? [
    { name: language === 'fr' ? 'En Service' : 'In Service', value: apiStats.tpe.en_service, colorClass: 'bg-green-500' },
    { name: language === 'fr' ? 'En Stock' : 'In Stock', value: apiStats.tpe.en_stock, colorClass: 'bg-gray-500' },
    { name: language === 'fr' ? 'Maintenance' : 'Maintenance', value: apiStats.tpe.en_maintenance, colorClass: 'bg-amber-500' },
    { name: language === 'fr' ? 'En Panne' : 'Breakdown', value: apiStats.tpe.en_panne, colorClass: 'bg-red-500' },
    { name: language === 'fr' ? 'Transfert' : 'Transfer', value: apiStats.tpe.en_transfert, colorClass: 'bg-blue-500' },
    { name: language === 'fr' ? 'Reforme' : 'Reformed', value: apiStats.tpe.reforme, colorClass: 'bg-violet-500' },
  ].filter(s => s.value > 0) : [];

  const STATUS_COLORS = ['#22c55e', '#6b7280', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

  const breakdownByModel = distribution?.byModel?.map(m => ({ model: m.model.replace('_', ' '), count: m.count })) || [];
  const breakdownByOperator = distribution?.byOperator?.map(o => ({ operator: o.operator, count: o.count })) || [];

  const operatorColors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <DashboardLayout
        title={language === 'fr' ? 'Tableau de Bord' : 'Dashboard'}
        subtitle={language === 'fr' ? "Vue d'ensemble de votre parc" : 'Overview of your fleet'}
      >
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{language === 'fr' ? 'Chargement...' : 'Loading...'}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={language === 'fr' ? 'Tableau de Bord' : 'Dashboard'}
      subtitle={language === 'fr' ? "Vue d'ensemble de votre parc" : 'Overview of your fleet'}
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      {/* ── Hero KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        {[
          {
            label: language === 'fr' ? 'Stock TPE Total' : 'Total TPE Stock',
            value: apiStats?.tpe.total ?? 0,
            icon: CreditCard,
            gradient: 'from-blue-600 to-blue-400',
            iconBg: 'bg-blue-500/20',
            path: '/tpe/stock',
            sub: `${apiStats?.tpe.en_service ?? 0} ${language === 'fr' ? 'actifs' : 'active'}`,
          },
          {
            label: language === 'fr' ? 'Taux de Service' : 'Service Rate',
            value: `${serviceRate}%`,
            icon: CheckCircle,
            gradient: 'from-emerald-600 to-emerald-400',
            iconBg: 'bg-emerald-500/20',
            path: '/tpe/stock',
            sub: `${apiStats?.tpe.en_service ?? 0} / ${tpeTotal}`,
          },
          {
            label: language === 'fr' ? 'En Maintenance' : 'In Maintenance',
            value: apiStats?.maintenance.active ?? 0,
            icon: Wrench,
            gradient: 'from-amber-500 to-yellow-400',
            iconBg: 'bg-amber-500/20',
            path: '/tpe/maintenance',
            sub: `${apiStats?.tpe.en_panne ?? 0} ${language === 'fr' ? 'en panne' : 'broken'}`,
          },
          {
            label: language === 'fr' ? 'Alertes' : 'Alerts',
            value: (apiStats?.tpe.en_panne ?? 0) + (apiStats?.stations.withoutTpe ?? 0),
            icon: AlertTriangle,
            gradient: 'from-red-500 to-rose-400',
            iconBg: 'bg-red-500/20',
            path: '/tpe/stock',
            sub: `${apiStats?.stations.withoutTpe ?? 0} ${language === 'fr' ? 'stations vides' : 'empty stations'}`,
          },
        ].map((card, i) => (
          <motion.div key={i} {...fadeUp(i * 0.08)}>
            <Link to={card.path} className="group block relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-90`} />
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl ${card.iconBg} backdrop-blur-sm flex items-center justify-center`}>
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-white/50 group-hover:text-white/90 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <p className="text-3xl font-bold tracking-tight">{typeof card.value === 'number' ? card.value.toLocaleString() : card.value}</p>
                <p className="text-sm text-white/80 mt-1">{card.label}</p>
                <p className="text-xs text-white/50 mt-2">{card.sub}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ── Secondary Stats Row ── */}
      <motion.div {...fadeUp(0.35)} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: language === 'fr' ? 'Chargeurs' : 'Chargers', value: apiStats?.chargers.total ?? 0, icon: BatteryCharging, color: 'text-orange-500', bg: 'bg-orange-500/10', path: '/chargers/stock' },
          { label: language === 'fr' ? 'Cartes Gestion' : 'Management Cards', value: apiStats?.cards.total ?? 0, icon: IdCard, color: 'text-pink-500', bg: 'bg-pink-500/10', path: '/cards/stock' },
          { label: language === 'fr' ? 'TPE en Stock' : 'TPE in Stock', value: apiStats?.tpe.en_stock ?? 0, icon: Package, color: 'text-cyan-500', bg: 'bg-cyan-500/10', path: '/tpe/stock' },
          { label: language === 'fr' ? 'Stations sans TPE' : 'Stations without TPE', value: apiStats?.stations.withoutTpe ?? 0, icon: MapPinOff, color: 'text-red-400', bg: 'bg-red-400/10', path: '/dashboard/stations-without-tpe' },
        ].map((s, i) => (
          <Link key={i} to={s.path} className="group flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800/60 hover:border-blue-200 dark:hover:border-blue-500/20 hover:shadow-soft transition-all duration-200">
            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-slate-900 dark:text-white leading-none">{s.value.toLocaleString()}</p>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 truncate">{s.label}</p>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* ── Charts Row ── */}
      <div className="grid lg:grid-cols-5 gap-6 mb-6">
        {/* Donut Chart - Status Distribution */}
        <motion.div {...fadeUp(0.45)} className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {language === 'fr' ? 'Statut du Parc' : 'Fleet Status'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{language === 'fr' ? 'Repartition des terminaux' : 'Terminal distribution'}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{tpeTotal}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </div>
          {statusDistribution.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {statusDistribution.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(17,24,39,0.95)', border: 'none', borderRadius: '10px', fontSize: '13px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#d1d5db' }}
                    formatter={(value: number, name: string) => [`${value} (${tpeTotal > 0 ? Math.round((value / tpeTotal) * 100) : 0}%)`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center">
                {statusDistribution.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${s.colorClass}`} />
                    <span className="text-xs text-gray-600 dark:text-gray-300">{s.name}</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">{language === 'fr' ? 'Aucune donnee' : 'No data'}</div>
          )}
        </motion.div>

        {/* Bar Chart - by Model */}
        <motion.div {...fadeUp(0.5)} className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Repartition par Modele' : 'By Model'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{language === 'fr' ? 'Nombre de TPE par modele' : 'TPE count by model'}</p>
            </div>
          </div>
          {breakdownByModel.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={breakdownByModel} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,114,128,0.15)" vertical={false} />
                <XAxis dataKey="model" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(17,24,39,0.95)', border: 'none', borderRadius: '10px', fontSize: '13px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#d1d5db' }}
                  cursor={{ fill: 'rgba(107,114,128,0.08)' }}
                  formatter={(value: number) => [value, language === 'fr' ? 'Quantite' : 'Count']}
                />
                <Bar dataKey="count" fill="url(#blueGradient)" radius={[8, 8, 0, 0]} maxBarSize={60} />
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">{language === 'fr' ? 'Aucune donnee' : 'No data'}</div>
          )}
        </motion.div>
      </div>

      {/* ── Bottom Row: Operator + Activity Summary ── */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* By Operator */}
        <motion.div {...fadeUp(0.55)} className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
            {language === 'fr' ? 'Par Operateur' : 'By Operator'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mb-5">{language === 'fr' ? 'Repartition des cartes SIM' : 'SIM card distribution'}</p>
          {breakdownByOperator.length > 0 ? (
            <div className="space-y-4">
              {breakdownByOperator.map((op, i) => {
                const maxCount = Math.max(...breakdownByOperator.map(o => o.count));
                const pct = maxCount > 0 ? (op.count / maxCount) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-slate-700 dark:text-gray-300">{op.operator}</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{op.count}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: operatorColors[i % operatorColors.length] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.6 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">{language === 'fr' ? 'Aucune donnee' : 'No data'}</div>
          )}
        </motion.div>

        {/* Fleet Summary Grid */}
        <motion.div {...fadeUp(0.6)} className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            {language === 'fr' ? 'Resume du Parc' : 'Fleet Summary'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">{language === 'fr' ? 'Tous les indicateurs cles' : 'All key indicators'}</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {[
              { label: language === 'fr' ? 'En Service' : 'Active', value: apiStats?.tpe.en_service ?? 0, icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
              { label: language === 'fr' ? 'En Stock' : 'In Stock', value: apiStats?.tpe.en_stock ?? 0, icon: Package, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-500/10' },
              { label: language === 'fr' ? 'Maintenance' : 'Maintenance', value: apiStats?.tpe.en_maintenance ?? 0, icon: Wrench, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
              { label: language === 'fr' ? 'En Panne' : 'Broken', value: apiStats?.tpe.en_panne ?? 0, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
              { label: language === 'fr' ? 'Transfert' : 'Transfer', value: apiStats?.tpe.en_transfert ?? 0, icon: ArrowRightLeft, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
              { label: language === 'fr' ? 'Reforme' : 'Reformed', value: apiStats?.tpe.reforme ?? 0, icon: Shield, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
              { label: language === 'fr' ? 'Utilisateurs' : 'Users', value: apiStats?.users.total ?? 0, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
              { label: language === 'fr' ? 'Stations' : 'Stations', value: apiStats?.stations.total ?? 0, icon: Building2, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-500/10' },
            ].map((item, i) => (
              <div key={i} className={`${item.bg} rounded-xl p-3.5 text-center transition-transform hover:scale-[1.03]`}>
                <item.icon className={`w-4 h-4 mx-auto mb-1.5 ${item.color}`} />
                <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">{item.value.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1 uppercase tracking-wide">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Quick Actions ── */}
      <motion.div {...fadeUp(0.65)}>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3">
          {language === 'fr' ? 'Acces Rapide' : 'Quick Access'}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: language === 'fr' ? 'Stock TPE' : 'TPE Stock', path: '/tpe/stock', icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
            { label: language === 'fr' ? 'Maintenance' : 'Maintenance', path: '/tpe/maintenance', icon: Wrench, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
            { label: language === 'fr' ? 'Transferts' : 'Transfers', path: '/tpe/transfers', icon: ArrowRightLeft, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10' },
            { label: language === 'fr' ? 'Structures' : 'Structures', path: '/admin/structures', icon: Building2, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
          ].map((action, i) => (
            <Link key={i} to={action.path}
              className={`group flex items-center gap-3 p-3.5 ${action.bg} rounded-xl hover:shadow-soft border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200`}
            >
              <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center">
                <action.icon className={`w-4 h-4 ${action.color}`} />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-gray-200 group-hover:text-slate-900 dark:group-hover:text-white">{action.label}</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-auto text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
