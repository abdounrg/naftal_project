import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  CreditCard,
  BatteryCharging,
  IdCard,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Wrench,
  Package,
  Clock,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import { useLanguage } from '../context/LanguageContext';
import { dashboardApi } from '../lib/api';

interface DashboardStats {
  tpe: { total: number; en_service: number; en_stock: number; en_maintenance: number; en_panne: number; en_transfert: number; reforme: number };
  cards: { total: number };
  chargers: { total: number };
  stations: { total: number };
  users: { total: number };
  maintenance: { active: number };
  transfers: { pending: number };
}

interface DashboardDistribution {
  byModel: { model: string; count: number }[];
  byOperator: { operator: string; count: number }[];
}

const Dashboard = () => {
  const { language, t } = useLanguage();
  const [apiStats, setApiStats] = useState<DashboardStats | null>(null);
  const [distribution, setDistribution] = useState<DashboardDistribution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, distRes] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getDistribution(),
        ]);
        setApiStats(statsRes.data.data);
        setDistribution(distRes.data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusDistribution = apiStats ? [
    { name: language === 'fr' ? 'En Service' : 'In Service', value: apiStats.tpe.en_service, color: '#0047AB' },
    { name: language === 'fr' ? 'Maintenance' : 'Maintenance', value: apiStats.tpe.en_maintenance, color: '#FFD700' },
    { name: language === 'fr' ? 'En Panne' : 'Breakdown', value: apiStats.tpe.en_panne, color: '#dc3545' },
    { name: language === 'fr' ? 'En Stock' : 'In Stock', value: apiStats.tpe.en_stock, color: '#6b7280' },
    { name: language === 'fr' ? 'En Transfert' : 'In Transfer', value: apiStats.tpe.en_transfert, color: '#f59e0b' },
    { name: language === 'fr' ? 'Reforme' : 'Reformed', value: apiStats.tpe.reforme, color: '#8b5cf6' },
  ].filter(s => s.value > 0) : [];

  const breakdownByModel = distribution?.byModel?.map(m => ({ model: m.model, count: m.count })) || [];

  const stats = [
    { label: language === 'fr' ? 'TPE Total' : 'Total TPEs', value: apiStats ? apiStats.tpe.total.toLocaleString() : '...', icon: CreditCard, color: 'bg-blue-500' },
    { label: language === 'fr' ? 'Terminaux Actifs' : 'Active Terminals', value: apiStats ? apiStats.tpe.en_service.toLocaleString() : '...', icon: CheckCircle, color: 'bg-green-500' },
    { label: language === 'fr' ? 'En Maintenance' : 'In Maintenance', value: apiStats ? apiStats.maintenance.active.toLocaleString() : '...', icon: Wrench, color: 'bg-yellow-500' },
    { label: language === 'fr' ? 'En Panne' : 'Breakdown', value: apiStats ? apiStats.tpe.en_panne.toLocaleString() : '...', icon: AlertTriangle, color: 'bg-red-500' },
  ];

  const secondaryStats = [
    { label: language === 'fr' ? 'Chargeurs en Stock' : 'Chargers in Stock', value: apiStats ? apiStats.chargers.total.toLocaleString() : '...', icon: BatteryCharging, color: 'text-orange-500' },
    { label: language === 'fr' ? 'Cartes Actives' : 'Active Cards', value: apiStats ? apiStats.cards.total.toLocaleString() : '...', icon: IdCard, color: 'text-pink-500' },
    { label: language === 'fr' ? 'TPE en Stock' : 'TPE in Stock', value: apiStats ? apiStats.tpe.en_stock.toLocaleString() : '...', icon: Package, color: 'text-cyan-500' },
    { label: language === 'fr' ? 'Stations' : 'Stations', value: apiStats ? apiStats.stations.total.toLocaleString() : '...', icon: Clock, color: 'text-indigo-500' },
  ];

  const equipmentSummary = apiStats ? [
    { label: language === 'fr' ? 'En Service' : 'In Service', value: apiStats.tpe.en_service },
    { label: language === 'fr' ? 'En Stock' : 'In Stock', value: apiStats.tpe.en_stock },
    { label: language === 'fr' ? 'En Maintenance' : 'In Maintenance', value: apiStats.tpe.en_maintenance },
    { label: language === 'fr' ? 'En Panne' : 'Breakdown', value: apiStats.tpe.en_panne },
    { label: language === 'fr' ? 'En Transfert' : 'In Transfer', value: apiStats.tpe.en_transfert },
    { label: language === 'fr' ? 'Reforme' : 'Reformed', value: apiStats.tpe.reforme },
    { label: language === 'fr' ? 'Total Cartes' : 'Total Cards', value: apiStats.cards.total },
    { label: language === 'fr' ? 'Transferts en Attente' : 'Pending Transfers', value: apiStats.transfers.pending },
    { label: language === 'fr' ? 'Utilisateurs' : 'Users', value: apiStats.users.total },
  ] : [];

  if (loading) {
    return (
      <DashboardLayout
        title={language === 'fr' ? 'Tableau de Bord' : 'Dashboard'}
        subtitle={language === 'fr' ? "Vue d'ensemble de votre parc" : 'Overview of your fleet'}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">{language === 'fr' ? 'Chargement...' : 'Loading...'}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={language === 'fr' ? 'Tableau de Bord' : 'Dashboard'}
      subtitle={language === 'fr' ? "Vue d'ensemble de votre parc" : 'Overview of your fleet'}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 cursor-default"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {secondaryStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 + index * 0.07, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {language === 'fr' ? 'Distribution Statut TPE' : 'Terminal Status Distribution'}
          </h3>
          {statusDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusDistribution} cx="50%" cy="45%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">{language === 'fr' ? 'Aucune donnee' : 'No data'}</div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {language === 'fr' ? 'Distribution par Modele' : 'Distribution by Model'}
          </h3>
          {breakdownByModel.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={breakdownByModel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis type="category" dataKey="model" stroke="#6b7280" fontSize={12} width={80} />
                <Tooltip formatter={(value: number) => [value, language === 'fr' ? 'Nombre' : 'Count']} />
                <Bar dataKey="count" fill="#0047AB" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">{language === 'fr' ? 'Aucune donnee' : 'No data'}</div>
          )}
        </div>
      </div>

      {/* Equipment Summary */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {language === 'fr' ? 'Resume Equipements' : 'Equipment Summary'}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {equipmentSummary.map((item, index) => (
              <div key={index} className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xl font-bold text-gray-900 dark:text-white">{item.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {language === 'fr' ? 'Distribution par Operateur' : 'Distribution by Operator'}
          </h3>
          {distribution?.byOperator && distribution.byOperator.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={distribution.byOperator.map(o => ({ operator: o.operator, count: o.count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="operator" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip formatter={(value: number) => [value, language === 'fr' ? 'Nombre' : 'Count']} />
                <Bar dataKey="count" fill="#28a745" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-400">{language === 'fr' ? 'Aucune donnee' : 'No data'}</div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {language === 'fr' ? 'Actions Rapides' : 'Quick Actions'}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 grid-stagger">
          {[
            { label: language === 'fr' ? 'Ajouter TPE' : 'Add TPE', path: '/tpe/stock', icon: CreditCard, color: 'text-blue-500' },
            { label: language === 'fr' ? 'Nouveau Transfert' : 'New Transfer', path: '/tpe/transfers', icon: Activity, color: 'text-green-500' },
            { label: language === 'fr' ? 'Maintenance' : 'Maintenance', path: '/tpe/maintenance', icon: Wrench, color: 'text-yellow-500' },
            { label: language === 'fr' ? 'Utilisateurs' : 'Users', path: '/admin/users', icon: TrendingUp, color: 'text-purple-500' },
          ].map((action, index) => (
            <Link key={index} to={action.path}
              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-[var(--naftal-yellow)]/50 transition-all duration-300">
              <action.icon className={`w-5 h-5 ${action.color}`} />
              <span className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
