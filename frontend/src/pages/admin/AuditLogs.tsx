import { useState, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import { useLanguage } from '../../context/LanguageContext';
import { auditLogsApi } from '../../lib/api';
import { useApiData } from '../../hooks/useApiData';
import { X, Activity, Shield, UserPlus, Settings, Trash2, Eye, Edit, LogIn, LogOut, Download, Upload, ArrowLeftRight } from 'lucide-react';

type ActionType = 'login' | 'logout' | 'create' | 'update' | 'delete' | 'view' | 'export_data' | 'import_data' | 'transfer' | 'settings';
type ModuleType = 'auth' | 'tpe' | 'chargers' | 'cards' | 'users' | 'structures' | 'system';
type SeverityType = 'info' | 'warning' | 'critical';

interface AuditLog {
  id: number;
  createdAt: string;
  userName: string;
  userRole: string;
  action: ActionType;
  module: ModuleType;
  target: string;
  details: string;
  ipAddress: string;
  severity: SeverityType;
}

const AuditLogs = () => {
  const { language } = useLanguage();
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const actionLabels: Record<ActionType, { fr: string; en: string; icon: typeof Activity; color: string }> = {
    login:    { fr: 'Connexion',    en: 'Login',     icon: LogIn,           color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    logout:   { fr: 'Deconnexion',  en: 'Logout',    icon: LogOut,          color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
    create:   { fr: 'Creation',     en: 'Create',    icon: UserPlus,        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    update:   { fr: 'Modification', en: 'Update',    icon: Edit,            color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    delete:   { fr: 'Suppression',  en: 'Delete',    icon: Trash2,          color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    view:     { fr: 'Consultation', en: 'View',      icon: Eye,             color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
    export_data:   { fr: 'Export',       en: 'Export',     icon: Download,        color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
    import_data:   { fr: 'Import',       en: 'Import',     icon: Upload,          color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' },
    transfer: { fr: 'Transfert',    en: 'Transfer',  icon: ArrowLeftRight,  color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
    settings: { fr: 'Parametres',   en: 'Settings',  icon: Settings,        color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' },
  };

  const moduleLabels: Record<ModuleType, { fr: string; en: string }> = {
    auth:       { fr: 'Authentification', en: 'Authentication' },
    tpe:        { fr: 'Gestion TPE',      en: 'TPE Management' },
    chargers:   { fr: 'Chargeurs/Bases',  en: 'Chargers/Bases' },
    cards:      { fr: 'Cartes Gestion',   en: 'Management Cards' },
    users:      { fr: 'Utilisateurs',     en: 'Users' },
    structures: { fr: 'Structures',       en: 'Structures' },
    system:     { fr: 'Systeme',          en: 'System' },
  };

  const severityLabels: Record<SeverityType, { fr: string; en: string; color: string }> = {
    info:     { fr: 'Info',      en: 'Info',     color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    warning:  { fr: 'Attention', en: 'Warning',  color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    critical: { fr: 'Critique',  en: 'Critical', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  };

  const fetchAuditLogs = useCallback(() => auditLogsApi.getAll({ per_page: 1000 }), []);
  const { data: auditLogs } = useApiData<AuditLog>({ fetchFn: fetchAuditLogs });

  const columns = [
    {
      key: 'createdAt',
      label: language === 'fr' ? 'Date & Heure' : 'Date & Time',
      render: (value: string) => (
        <span className="text-xs font-mono text-gray-700 dark:text-gray-300">
          {value ? new Date(value).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-GB', { dateStyle: 'short', timeStyle: 'medium' }) : '-'}
        </span>
      ),
    },
    { key: 'userName', label: language === 'fr' ? 'Utilisateur' : 'User' },
    {
      key: 'userRole',
      label: language === 'fr' ? 'Role' : 'Role',
      render: (value: string) => {
        const roleColors: Record<string, string> = {
          administrator:   'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          dpe_member:      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
          district_member: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
          agency_member:   'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          antenna_member:  'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        };
        const roleNames: Record<string, { fr: string; en: string }> = {
          administrator:   { fr: 'Admin',    en: 'Admin' },
          dpe_member:      { fr: 'DPE',      en: 'DPE' },
          district_member: { fr: 'District', en: 'District' },
          agency_member:   { fr: 'Agence',   en: 'Agency' },
          antenna_member:  { fr: 'Antenne',  en: 'Antenna' },
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[value] || ''}`}>
            {language === 'fr' ? roleNames[value]?.fr : roleNames[value]?.en}
          </span>
        );
      },
    },
    {
      key: 'action',
      label: language === 'fr' ? 'Action' : 'Action',
      render: (value: ActionType) => {
        const label = actionLabels[value];
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${label?.color || ''}`}>
            {label?.icon && <label.icon className="w-3 h-3" />}
            {language === 'fr' ? label?.fr : label?.en}
          </span>
        );
      },
    },
    {
      key: 'module',
      label: language === 'fr' ? 'Module' : 'Module',
      render: (value: ModuleType) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {language === 'fr' ? moduleLabels[value]?.fr : moduleLabels[value]?.en}
        </span>
      ),
    },
    { key: 'target', label: language === 'fr' ? 'Cible' : 'Target' },
    {
      key: 'severity',
      label: language === 'fr' ? 'Severite' : 'Severity',
      render: (value: SeverityType) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityLabels[value]?.color || ''}`}>
          {language === 'fr' ? severityLabels[value]?.fr : severityLabels[value]?.en}
        </span>
      ),
    },
  ];

  const filters = [
    {
      key: 'action',
      label: language === 'fr' ? 'Action' : 'Action',
      type: 'select' as const,
      options: Object.keys(actionLabels),
    },
    {
      key: 'module',
      label: language === 'fr' ? 'Module' : 'Module',
      type: 'select' as const,
      options: Object.keys(moduleLabels),
    },
    {
      key: 'severity',
      label: language === 'fr' ? 'Severite' : 'Severity',
      type: 'select' as const,
      options: Object.keys(severityLabels),
    },
    {
      key: 'userRole',
      label: language === 'fr' ? 'Role' : 'Role',
      type: 'select' as const,
      options: ['administrator', 'dpe_member', 'district_member', 'agency_member', 'antenna_member'],
    },
  ];

  // Stats computed from logs
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = auditLogs.filter(l => l.createdAt?.startsWith(today));
  const criticalLogs = auditLogs.filter(l => l.severity === 'critical');
  const loginLogs = auditLogs.filter(l => l.action === 'login');
  const modificationLogs = auditLogs.filter(l => ['create', 'update', 'delete'].includes(l.action));

  return (
    <DashboardLayout
      title={language === 'fr' ? 'Journal d\'Audit' : 'Audit Logs'}
      subtitle={language === 'fr' ? 'Historique des activites utilisateur' : 'User activity history'}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 grid-stagger">
        {[
          { label: language === 'fr' ? 'Total Evenements' : 'Total Events', value: String(auditLogs.length), color: 'bg-blue-500', icon: Activity },
          { label: language === 'fr' ? 'Aujourd\'hui' : 'Today', value: String(todayLogs.length), color: 'bg-green-500', icon: Activity },
          { label: language === 'fr' ? 'Evenements Critiques' : 'Critical Events', value: String(criticalLogs.length), color: 'bg-red-500', icon: Shield },
          { label: language === 'fr' ? 'Modifications' : 'Modifications', value: String(modificationLogs.length), color: 'bg-yellow-500', icon: Edit },
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 stat-card">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Critical / Warning Activity */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Logins */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <LogIn className="w-5 h-5 text-green-500" />
            {language === 'fr' ? 'Connexions Recentes' : 'Recent Logins'}
          </h3>
          <div className="space-y-3">
            {loginLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{log.userName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{log.ipAddress}</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                  {log.createdAt ? new Date(log.createdAt).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Events */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            {language === 'fr' ? 'Evenements Critiques' : 'Critical Events'}
          </h3>
          <div className="space-y-3">
            {criticalLogs.length > 0 ? criticalLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">{log.userName}</p>
                  <span className="text-xs text-red-600 dark:text-red-400 font-mono">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                  </span>
                </div>
                <p className="text-xs text-red-700 dark:text-red-300">{log.details}</p>
              </div>
            )) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                {language === 'fr' ? 'Aucun evenement critique' : 'No critical events'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={auditLogs}
        title={language === 'fr' ? 'Historique Complet' : 'Full History'}
        onView={(row) => { setSelectedLog(row); setShowViewModal(true); }}
        filters={filters}
      />

      {/* View Log Detail Modal */}
      {showViewModal && selectedLog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay-enter">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto modal-content-enter">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Detail de l\'Evenement' : 'Event Detail'}
              </h3>
              <button onClick={() => { setShowViewModal(false); setSelectedLog(null); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'ID', value: `#${selectedLog.id}` },
                { label: language === 'fr' ? 'Date & Heure' : 'Date & Time', value: selectedLog.createdAt ? new Date(selectedLog.createdAt).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-GB') : '-' },
                { label: language === 'fr' ? 'Utilisateur' : 'User', value: selectedLog.userName },
                { label: language === 'fr' ? 'Role' : 'Role', value: selectedLog.userRole },
                { label: language === 'fr' ? 'Action' : 'Action', value: language === 'fr' ? actionLabels[selectedLog.action]?.fr : actionLabels[selectedLog.action]?.en },
                { label: language === 'fr' ? 'Module' : 'Module', value: language === 'fr' ? moduleLabels[selectedLog.module]?.fr : moduleLabels[selectedLog.module]?.en },
                { label: language === 'fr' ? 'Cible' : 'Target', value: selectedLog.target },
                { label: language === 'fr' ? 'Severite' : 'Severity', value: language === 'fr' ? severityLabels[selectedLog.severity]?.fr : severityLabels[selectedLog.severity]?.en },
                { label: language === 'fr' ? 'Adresse IP' : 'IP Address', value: selectedLog.ipAddress },
                { label: language === 'fr' ? 'Details' : 'Details', value: selectedLog.details },
              ].map((row, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-32 shrink-0">{row.label}</span>
                  <span className="text-sm text-gray-900 dark:text-white">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => { setShowViewModal(false); setSelectedLog(null); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {language === 'fr' ? 'Fermer' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AuditLogs;
