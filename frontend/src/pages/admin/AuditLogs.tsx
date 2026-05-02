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
    login:    { fr: 'Connexion',    en: 'Login',     icon: LogIn,           color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    logout:   { fr: 'Deconnexion',  en: 'Logout',    icon: LogOut,          color: 'bg-gray-500/10 text-gray-500 dark:text-gray-400' },
    create:   { fr: 'Creation',     en: 'Create',    icon: UserPlus,        color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    update:   { fr: 'Modification', en: 'Update',    icon: Edit,            color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    delete:   { fr: 'Suppression',  en: 'Delete',    icon: Trash2,          color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
    view:     { fr: 'Consultation', en: 'View',      icon: Eye,             color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
    export_data:   { fr: 'Export',       en: 'Export',     icon: Download,        color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
    import_data:   { fr: 'Import',       en: 'Import',     icon: Upload,          color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400' },
    transfer: { fr: 'Transfert',    en: 'Transfer',  icon: ArrowLeftRight,  color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
    settings: { fr: 'Parametres',   en: 'Settings',  icon: Settings,        color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' },
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
    info:     { fr: 'Info',      en: 'Info',     color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    warning:  { fr: 'Attention', en: 'Warning',  color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    critical: { fr: 'Critique',  en: 'Critical', color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
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
          administrator:   'bg-red-500/10 text-red-600 dark:text-red-400',
          dpe_member:      'bg-blue-500/10 text-blue-600 dark:text-blue-400',
          district_member: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
          agency_member:   'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
          antenna_member:  'bg-orange-500/10 text-orange-600 dark:text-orange-400',
        };
        const roleNames: Record<string, { fr: string; en: string }> = {
          administrator:   { fr: 'Admin',    en: 'Admin' },
          dpe_member:      { fr: 'DPE',      en: 'DPE' },
          district_member: { fr: 'District', en: 'District' },
          agency_member:   { fr: 'Agence',   en: 'Agency' },
          antenna_member:  { fr: 'Antenne',  en: 'Antenna' },
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${roleColors[value] || ''}`}>
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
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${label?.color || ''}`}>
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
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${severityLabels[value]?.color || ''}`}>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: language === 'fr' ? 'Total Evenements' : 'Total Events', value: String(auditLogs.length), icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: language === 'fr' ? 'Aujourd\'hui' : 'Today', value: String(todayLogs.length), icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: language === 'fr' ? 'Evenements Critiques' : 'Critical Events', value: String(criticalLogs.length), icon: Shield, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: language === 'fr' ? 'Modifications' : 'Modifications', value: String(modificationLogs.length), icon: Edit, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800/60 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Critical / Warning Activity */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Logins */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800/60 p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <LogIn className="w-4 h-4 text-emerald-500" />
            </div>
            {language === 'fr' ? 'Connexions Recentes' : 'Recent Logins'}
          </h3>
          <div className="space-y-2">
            {loginLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-800/60/40 hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800/60 p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-red-500" />
            </div>
            {language === 'fr' ? 'Evenements Critiques' : 'Critical Events'}
          </h3>
          <div className="space-y-2">
            {criticalLogs.length > 0 ? criticalLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/40">
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
        section="audit_logs"
        onView={(row) => { setSelectedLog(row); setShowViewModal(true); }}
        filters={filters}
      />

      {/* View Log Detail Modal */}
      {showViewModal && selectedLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-800/60/50 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {language === 'fr' ? 'Detail de l\'Evenement' : 'Event Detail'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">#{selectedLog.id}</p>
                </div>
              </div>
              <button aria-label="Close" onClick={() => { setShowViewModal(false); setSelectedLog(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {[
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
                <div key={index} className="flex items-start justify-between py-2.5 border-b border-gray-50 dark:border-slate-800/60/40 last:border-0">
                  <span className="text-sm font-medium text-gray-400 dark:text-gray-500 shrink-0">{row.label}</span>
                  <span className="text-sm text-gray-900 dark:text-white text-right max-w-[60%] truncate">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-slate-800/60 flex justify-end">
              <button
                onClick={() => { setShowViewModal(false); setSelectedLog(null); }}
                className="px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
