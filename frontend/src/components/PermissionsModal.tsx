import { useState, useEffect } from 'react';
import { X, Shield, Loader2, RotateCcw, Eye, Plus, Pencil, Trash2, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../lib/api';

interface SectionPermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

type Action = 'view' | 'create' | 'edit' | 'delete';
type PermissionsMap = Record<string, SectionPermissions>;

interface PermissionsModalProps {
  user: { id: number; name: string; role: string };
  onClose: () => void;
}

/**
 * Which actions are meaningful per section — mirrors the backend ALLOWED_ACTIONS.
 * Dashboard / Audit Logs are read-only. TPE returns/transfers/reform support full CRUD.
 * Stock pages and admin sections support full CRUD.
 */
const ALLOWED_ACTIONS: Record<string, Action[]> = {
  dashboard:          ['view'],
  tpe_stock:          ['view', 'create', 'edit', 'delete'],
  tpe_maintenance:    ['view', 'create', 'edit', 'delete'],
  tpe_returns:        ['view', 'create', 'edit', 'delete'],
  tpe_transfers:      ['view', 'create', 'edit', 'delete'],
  tpe_reform:         ['view', 'create', 'edit', 'delete'],
  charger_stock:      ['view', 'create', 'edit', 'delete'],
  charger_transfers:  ['view', 'create', 'edit', 'delete'],
  card_stock:         ['view', 'create', 'edit', 'delete'],
  card_circulation:   ['view', 'edit'],
  card_monitoring:    ['view', 'edit'],
  card_transfers:     ['view', 'create', 'edit', 'delete'],
  structures:         ['view', 'create', 'edit', 'delete'],
  stations:           ['view', 'create', 'edit', 'delete'],
  users:              ['view', 'create', 'edit', 'delete'],
  audit_logs:         ['view'],
};

const SECTION_META: { key: string; labelFr: string; labelEn: string; group: string }[] = [
  { key: 'dashboard', labelFr: 'Tableau de Bord', labelEn: 'Dashboard', group: 'general' },
  { key: 'tpe_stock', labelFr: 'Stock TPE', labelEn: 'TPE Stock', group: 'tpe' },
  { key: 'tpe_maintenance', labelFr: 'Maintenance TPE', labelEn: 'TPE Maintenance', group: 'tpe' },
  { key: 'tpe_returns', labelFr: 'Retours TPE', labelEn: 'TPE Returns', group: 'tpe' },
  { key: 'tpe_transfers', labelFr: 'Transferts TPE', labelEn: 'TPE Transfers', group: 'tpe' },
  { key: 'tpe_reform', labelFr: 'Reforme TPE', labelEn: 'TPE Reform', group: 'tpe' },
  { key: 'charger_stock', labelFr: 'Stock Chargeurs', labelEn: 'Charger Stock', group: 'chargers' },
  { key: 'charger_transfers', labelFr: 'Transferts Chargeurs', labelEn: 'Charger Transfers', group: 'chargers' },
  { key: 'card_stock', labelFr: 'Stock Cartes', labelEn: 'Card Stock', group: 'cards' },
  { key: 'card_circulation', labelFr: 'Circulation Cartes', labelEn: 'Card Circulation', group: 'cards' },
  { key: 'card_monitoring', labelFr: 'Suivi Cartes', labelEn: 'Card Monitoring', group: 'cards' },
  { key: 'card_transfers', labelFr: 'Transferts Cartes', labelEn: 'Card Transfers', group: 'cards' },
  { key: 'structures', labelFr: 'Structures', labelEn: 'Structures', group: 'admin' },
  { key: 'stations', labelFr: 'Stations', labelEn: 'Stations', group: 'admin' },
  { key: 'users', labelFr: 'Utilisateurs', labelEn: 'Users', group: 'admin' },
  // audit_logs intentionally omitted: hard-locked to administrator role only.
];

const GROUPS = [
  { key: 'general', labelFr: 'General', labelEn: 'General', color: 'text-blue-500' },
  { key: 'tpe', labelFr: 'Module TPE', labelEn: 'TPE Module', color: 'text-emerald-500' },
  { key: 'chargers', labelFr: 'Module Chargeurs', labelEn: 'Chargers Module', color: 'text-orange-500' },
  { key: 'cards', labelFr: 'Module Cartes', labelEn: 'Cards Module', color: 'text-purple-500' },
  { key: 'admin', labelFr: 'Administration', labelEn: 'Administration', color: 'text-red-500' },
];

const ACTION_CONFIG: Record<Action, { fr: string; en: string; icon: typeof Eye; activeColor: string }> = {
  view:   { fr: 'Voir',      en: 'View',   icon: Eye,    activeColor: 'bg-blue-500 text-white' },
  create: { fr: 'Creer',     en: 'Create', icon: Plus,   activeColor: 'bg-emerald-500 text-white' },
  edit:   { fr: 'Modifier',  en: 'Edit',   icon: Pencil, activeColor: 'bg-amber-500 text-white' },
  delete: { fr: 'Supprimer', en: 'Delete', icon: Trash2, activeColor: 'bg-red-500 text-white' },
};

const PermissionsModal = ({ user, onClose }: PermissionsModalProps) => {
  const { language } = useLanguage();
  const { user: currentUser, refreshPermissions } = useAuth();
  const [permissions, setPermissions] = useState<PermissionsMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await usersApi.getPermissions(user.id);
        setPermissions(res.data.data);
      } catch {
        setError(language === 'fr' ? 'Erreur de chargement' : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.id, language]);

  const togglePermission = (section: string, action: Action) => {
    if (!permissions) return;
    const allowed = ALLOWED_ACTIONS[section] || [];
    if (!allowed.includes(action)) return;

    const updated = {
      ...permissions,
      [section]: {
        ...permissions[section],
        [action]: !permissions[section]?.[action],
      },
    };
    setPermissions(updated);
    setDirty(true);
    setSaved(false);
  };

  const toggleSectionAll = (section: string) => {
    if (!permissions) return;
    const allowed = ALLOWED_ACTIONS[section] || [];
    const current = permissions[section];
    const allOn = allowed.every((a) => current?.[a]);
    const updated = { ...permissions[section] };
    for (const a of allowed) {
      updated[a] = !allOn;
    }
    setPermissions({ ...permissions, [section]: updated as SectionPermissions });
    setDirty(true);
    setSaved(false);
  };

  const isSectionAllOn = (section: string) => {
    if (!permissions) return false;
    const allowed = ALLOWED_ACTIONS[section] || [];
    return allowed.every((a) => permissions[section]?.[a]);
  };

  const handleSave = async () => {
    if (!permissions) return;
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await usersApi.updatePermissions(user.id, permissions);
      setPermissions(res.data.data);
      setDirty(false);
      setSaved(true);
      // If editing own permissions, refresh so sidebar/routes update immediately
      if (currentUser && currentUser.id === user.id) {
        await refreshPermissions();
      }
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError(language === 'fr' ? 'Erreur de sauvegarde' : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-elevated max-w-3xl w-full max-h-[85vh] flex flex-col border border-gray-100 dark:border-slate-800/60" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Permissions' : 'Permissions'} — {user.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'fr' ? 'Activer ou desactiver l\'acces par section' : 'Enable or disable access per section'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            title={language === 'fr' ? 'Fermer' : 'Close'}
            aria-label={language === 'fr' ? 'Fermer' : 'Close'}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : error && !permissions ? (
            <div className="text-center py-10 text-red-500 text-sm">{error}</div>
          ) : permissions ? (
            <div className="space-y-6">
              {GROUPS.map((group) => {
                const sections = SECTION_META.filter((s) => s.group === group.key);
                if (sections.length === 0) return null;
                return (
                  <div key={group.key}>
                    <h4 className={`text-[11px] font-semibold uppercase tracking-wider mb-3 ${group.color}`}>
                      {language === 'fr' ? group.labelFr : group.labelEn}
                    </h4>
                    <div className="space-y-1">
                      {sections.map((section) => {
                        const allowed = ALLOWED_ACTIONS[section.key] || [];
                        return (
                          <div
                            key={section.key}
                            className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <span className="text-[13px] font-medium text-gray-800 dark:text-gray-200 min-w-[140px]">
                              {language === 'fr' ? section.labelFr : section.labelEn}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {(['view', 'create', 'edit', 'delete'] as Action[]).map((action) => {
                                const isAllowed = allowed.includes(action);
                                const isOn = isAllowed && (permissions[section.key]?.[action] ?? false);
                                const cfg = ACTION_CONFIG[action];
                                const Icon = cfg.icon;

                                if (!isAllowed) {
                                  return (
                                    <div
                                      key={action}
                                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-gray-50 dark:bg-slate-800/30 text-gray-300 dark:text-gray-700 cursor-not-allowed select-none flex items-center gap-1 opacity-40"
                                      title={language === 'fr' ? 'Non applicable' : 'Not applicable'}
                                    >
                                      <Icon className="w-3 h-3" />
                                      <span className="hidden sm:inline">{language === 'fr' ? cfg.fr : cfg.en}</span>
                                    </div>
                                  );
                                }

                                return (
                                  <button
                                    key={action}
                                    type="button"
                                    onClick={() => togglePermission(section.key, action)}
                                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 flex items-center gap-1 ${
                                      isOn
                                        ? `${cfg.activeColor} shadow-sm`
                                        : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700'
                                    }`}
                                    title={language === 'fr' ? cfg.fr : cfg.en}
                                  >
                                    <Icon className="w-3 h-3" />
                                    <span className="hidden sm:inline">{language === 'fr' ? cfg.fr : cfg.en}</span>
                                  </button>
                                );
                              })}
                              {allowed.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => toggleSectionAll(section.key)}
                                  className={`ml-1 p-1.5 rounded-lg transition-colors ${
                                    isSectionAllOn(section.key)
                                      ? 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10'
                                      : 'text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800'
                                  }`}
                                  title={language === 'fr' ? 'Tout basculer' : 'Toggle all'}
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {permissions && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800/60 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              {error && <p className="text-[13px] text-red-500">{error}</p>}
              {saved && (
                <p className="text-[13px] text-emerald-500 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  {language === 'fr' ? 'Enregistre' : 'Saved'}
                </p>
              )}
              {dirty && !saved && (
                <p className="text-[13px] text-amber-500">
                  {language === 'fr' ? 'Modifications non enregistrees' : 'Unsaved changes'}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all text-[13px] font-medium"
              >
                {language === 'fr' ? 'Fermer' : 'Close'}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !dirty}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all text-[13px] font-medium flex items-center gap-2"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {language === 'fr' ? 'Enregistrer' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionsModal;
