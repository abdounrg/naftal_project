import { useState, useCallback, useMemo } from 'react';
import { Activity, Package, Wrench, Truck, Trash2, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import { useLanguage } from '../../context/LanguageContext';
import { tpeApi } from '../../lib/api';
import { useApiData } from '../../hooks/useApiData';

const STATUS_CONFIG: Record<string, { fr: string; en: string; color: string; icon: any }> = {
  en_stock:        { fr: 'En Stock',        en: 'In Stock',        color: 'bg-blue-500',   icon: Package },
  en_service:      { fr: 'En Service',      en: 'In Service',      color: 'bg-emerald-500', icon: Activity },
  en_maintenance:  { fr: 'Maintenance',     en: 'Maintenance',     color: 'bg-amber-500',  icon: Wrench },
  en_panne:        { fr: 'En Panne',        en: 'Broken Down',     color: 'bg-red-500',    icon: AlertCircle },
  en_transfert:    { fr: 'En Transfert',    en: 'In Transfer',     color: 'bg-indigo-500', icon: Truck },
  en_traitement:   { fr: 'En Traitement',   en: 'Being Processed', color: 'bg-yellow-500', icon: Wrench },
  a_retourner:     { fr: 'A Retourner',     en: 'To Return',       color: 'bg-orange-500', icon: Truck },
  reforme:         { fr: 'Reformé',         en: 'Reformed',        color: 'bg-rose-500',   icon: Trash2 },
  vole:            { fr: 'Volé',            en: 'Stolen',          color: 'bg-slate-700',  icon: AlertCircle },
};

const statusBadge = (value: string, language: string) => {
  const cfg = STATUS_CONFIG[value];
  const label = cfg ? (language === 'fr' ? cfg.fr : cfg.en) : value;
  const color = cfg?.color || 'bg-slate-400';
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold text-white">
      <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
      <span className="text-slate-700 dark:text-slate-200">{label}</span>
    </span>
  );
};

const TPETracking = () => {
  const { language } = useLanguage();
  const fetchAll = useCallback(() => tpeApi.getStock({ per_page: 5000 }), []);
  const { data: tpes } = useApiData<any>({ fetchFn: fetchAll });

  const [selected, setSelected] = useState<any>(null);
  const [detail, setDetail] = useState<{ maintenance: any[]; reforms: any[] } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const t of tpes) c[t.status] = (c[t.status] || 0) + 1;
    return c;
  }, [tpes]);

  const summaryCards = [
    { key: 'en_service',     label: language === 'fr' ? 'En Service' : 'In Service',     color: 'bg-emerald-500' },
    { key: 'en_stock',       label: language === 'fr' ? 'En Stock' : 'In Stock',         color: 'bg-blue-500' },
    { key: 'en_maintenance', label: language === 'fr' ? 'Maintenance' : 'Maintenance',   color: 'bg-amber-500' },
    { key: 'reforme',        label: language === 'fr' ? 'Reformés' : 'Reformed',         color: 'bg-rose-500' },
  ];

  const openDetail = async (row: any) => {
    setSelected(row);
    setDetail(null);
    setLoadingDetail(true);
    try {
      const [m, r] = await Promise.all([
        tpeApi.getMaintenance({ per_page: 1000 }),
        tpeApi.getReforms({ per_page: 1000 }),
      ]);
      const maintenance = (m.data?.data || []).filter((x: any) => x.serial === row.serial);
      const reforms = (r.data?.data || []).filter((x: any) => x.serial === row.serial);
      setDetail({ maintenance, reforms });
    } catch {
      setDetail({ maintenance: [], reforms: [] });
    } finally {
      setLoadingDetail(false);
    }
  };

  const columns = [
    { key: 'serial', label: language === 'fr' ? 'N° Serie' : 'Serial' },
    { key: 'model', label: language === 'fr' ? 'Modele' : 'Model' },
    { key: 'station_name', label: language === 'fr' ? 'Station' : 'Station' },
    { key: 'structure_name', label: language === 'fr' ? 'Structure' : 'Structure' },
    { key: 'district', label: 'District' },
    {
      key: 'status',
      label: language === 'fr' ? 'Statut Actuel' : 'Current Status',
      render: (v: string) => statusBadge(v, language),
    },
    { key: 'updated_at', label: language === 'fr' ? 'Derniere MAJ' : 'Last Update' },
  ];

  return (
    <DashboardLayout
      title={language === 'fr' ? 'Suivi des TPE' : 'TPE Tracking'}
      subtitle={language === 'fr' ? "Vue d'ensemble du cycle de vie de chaque TPE" : 'Overview of every TPE lifecycle'}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 grid-stagger">
        {summaryCards.map((c) => (
          <div key={c.key} className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-800/60 stat-card">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">{c.label}</p>
              <span className={`w-2 h-2 rounded-full ${c.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{counts[c.key] || 0}</p>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={tpes}
        title={language === 'fr' ? 'Tous les TPE' : 'All TPEs'}
        section="tpe_stock"
        onView={openDetail}
        filters={[
          { key: 'serial', label: language === 'fr' ? 'N° Serie' : 'Serial', type: 'text' },
          { key: 'model', label: language === 'fr' ? 'Modele' : 'Model', type: 'select', options: ['IWIL 250', 'MOVE 2500', 'NewPos'] },
          { key: 'station_name', label: language === 'fr' ? 'Station' : 'Station', type: 'text' },
          { key: 'structure_name', label: language === 'fr' ? 'Structure' : 'Structure', type: 'text' },
          {
            key: 'status',
            label: language === 'fr' ? 'Statut' : 'Status',
            type: 'select',
            options: Object.keys(STATUS_CONFIG),
          },
        ]}
      />

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800/60 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === 'fr' ? 'Historique TPE' : 'TPE History'} — <span className="text-blue-600 dark:text-blue-400">{selected.serial}</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {selected.model} · {selected.station_name || '—'} · {selected.structure_name || '—'}
                </p>
              </div>
              <button onClick={() => { setSelected(null); setDetail(null); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <div className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">{language === 'fr' ? 'Statut actuel' : 'Current status'}</div>
                {statusBadge(selected.status, language)}
              </div>

              {/* Maintenance history */}
              <section>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-500" />
                  {language === 'fr' ? 'Historique Maintenance' : 'Maintenance History'}
                </h4>
                {loadingDetail ? (
                  <p className="text-xs text-gray-400">{language === 'fr' ? 'Chargement...' : 'Loading...'}</p>
                ) : detail?.maintenance.length ? (
                  <div className="space-y-2">
                    {detail.maintenance.map((m) => (
                      <div key={m.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 text-[12.5px]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-800 dark:text-slate-100">{m.operation_mode || (language === 'fr' ? 'Operation' : 'Operation')}</span>
                          <span className="text-[10.5px] text-slate-500 dark:text-slate-400">{m.breakdown_date}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-600 dark:text-slate-300">
                          {m.problem_type && <span><b>{language === 'fr' ? 'Panne :' : 'Issue:'}</b> {m.problem_type}</span>}
                          {m.diagnostic && <span className="truncate max-w-md"><b>{language === 'fr' ? 'Detail :' : 'Detail:'}</b> {m.diagnostic}</span>}
                          {m.status && <span className="text-blue-600 dark:text-blue-400">· {m.status}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">{language === 'fr' ? 'Aucun enregistrement' : 'No records'}</p>
                )}
              </section>

              {/* Reform */}
              <section>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  {language === 'fr' ? 'Reforme' : 'Reform'}
                </h4>
                {detail?.reforms.length ? (
                  detail.reforms.map((r) => (
                    <div key={r.id} className="p-3 rounded-lg border border-rose-200 dark:border-rose-500/20 bg-rose-50/60 dark:bg-rose-500/10 text-[12.5px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-rose-700 dark:text-rose-300">{r.reform_pv || (language === 'fr' ? 'PV Reforme' : 'Reform PV')}</span>
                        <span className="text-[10.5px] text-rose-600/80 dark:text-rose-300/80">{r.reform_date}</span>
                      </div>
                      {r.reason && <p className="text-rose-700/80 dark:text-rose-200/80">{r.reason}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">{language === 'fr' ? 'Non reformé' : 'Not reformed'}</p>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TPETracking;
