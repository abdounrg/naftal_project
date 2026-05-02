import { useState, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import { useLanguage } from '../../context/LanguageContext';
import { cardsApi, structuresApi } from '../../lib/api';
import { useApiData } from '../../hooks/useApiData';

const STATUS_OPTIONS = ['en_circulation', 'defectueux', 'expire', 'perdu', 'vole', 'en_traitement'] as const;

const CardCirculation = () => {
  const { language } = useLanguage();
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusError, setStatusError] = useState('');

  const fetchCirculation = useCallback(() => cardsApi.getCirculation({ per_page: 1000 }), []);
  const { data: circulationData, refetch } = useApiData<any>({ fetchFn: fetchCirculation });
  const fetchDistricts = useCallback(() => structuresApi.getDistricts(), []);
  const { data: districts } = useApiData<any>({ fetchFn: fetchDistricts });
  const districtNames = districts.map((d: any) => d.name);

  const statusMap: Record<string, { label: string; color: string }> = {
    en_circulation: { label: language === 'fr' ? 'En Circulation' : 'In Circulation', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    defectueux: { label: language === 'fr' ? 'Défectueuse' : 'Defective', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
    expire: { label: language === 'fr' ? 'Expirée' : 'Expired', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
    perdu: { label: language === 'fr' ? 'Perdue' : 'Lost', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300' },
    vole: { label: language === 'fr' ? 'Volée' : 'Stolen', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
    en_traitement: { label: language === 'fr' ? 'En Cours de Traitement' : 'Being Processed', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400' },
    en_transfert: { label: language === 'fr' ? 'En Transfert' : 'In Transfer', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
    en_maintenance: { label: language === 'fr' ? 'En Maintenance' : 'In Maintenance', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  };

  const handleStatusChange = async () => {
    if (!selectedRow || !newStatus) return;
    setStatusError('');
    try {
      await cardsApi.updateStock(selectedRow.id, { status: newStatus });
      setShowStatusModal(false);
      setSelectedRow(null);
      setNewStatus('');
      refetch();
    } catch (err: any) {
      setStatusError(err?.response?.data?.message || err?.message || 'Error');
    }
  };

  const columns = [
    { key: 'card_serial', label: language === 'fr' ? 'N° CG' : 'Card #' },
    { key: 'tpe_serial', label: language === 'fr' ? 'N° Serie TPE' : 'TPE Serial' },
    { key: 'district', label: 'District' },
    { key: 'structure_name', label: language === 'fr' ? 'Structure' : 'Structure' },
    { key: 'station_name', label: language === 'fr' ? 'Station' : 'Station' },
    { key: 'delivery_date', label: language === 'fr' ? 'Date Remise' : 'Assignment Date' },
    { key: 'expiration_date', label: language === 'fr' ? 'Date Expiration' : 'Expiration Date' },
    {
      key: 'amortissement',
      label: language === 'fr' ? 'Amortissement' : 'Depreciation',
      render: (value: string) => {
        if (!value) return <span className="text-gray-400">-</span>;
        if (value === 'Expiré') return <span className="text-red-600 font-medium">{language === 'fr' ? 'Expiré' : 'Expired'}</span>;
        return <span className="text-green-600 font-medium">{value}</span>;
      }
    },
    {
      key: 'status',
      label: language === 'fr' ? 'État' : 'Status',
      render: (value: string) => {
        const s = statusMap[value] || { label: value || '-', color: 'bg-gray-100 text-gray-800' };
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>;
      }
    },
  ];

  return (
    <DashboardLayout
      title={language === 'fr' ? 'Cartes de Gestion en Circulation' : 'Management Cards in Circulation'}
      subtitle={language === 'fr' ? 'Visibilité des cartes de gestion en circulation' : 'Management cards in circulation visibility'}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 grid-stagger">
        {[
          { label: language === 'fr' ? 'Total' : 'Total', value: String(circulationData.length), color: 'bg-pink-500' },
          { label: language === 'fr' ? 'En Circulation' : 'In Circulation', value: String(circulationData.filter((d: any) => d.status === 'en_circulation').length), color: 'bg-green-500' },
          { label: language === 'fr' ? 'Défectueuses' : 'Defective', value: String(circulationData.filter((d: any) => d.status === 'defectueux').length), color: 'bg-red-500' },
          { label: language === 'fr' ? 'Expirées' : 'Expired', value: String(circulationData.filter((d: any) => d.status === 'expire').length), color: 'bg-orange-500' },
          { label: language === 'fr' ? 'En Traitement' : 'Processing', value: String(circulationData.filter((d: any) => d.status === 'en_traitement').length), color: 'bg-cyan-500' },
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-800/60 stat-card">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={circulationData}
        title={language === 'fr' ? 'Liste des Cartes en Circulation' : 'Cards in Circulation List'}
        section="card_circulation"
        onView={(row) => { setSelectedRow(row); setShowViewModal(true); }}
        onEdit={(row) => {
          if (row.status === 'en_traitement' || row.status === 'en_transfert') return;
          setSelectedRow(row); setNewStatus(''); setStatusError(''); setShowStatusModal(true);
        }}
        filters={[
          { key: 'district', label: 'District', type: 'select', options: districtNames },
          { key: 'status', label: language === 'fr' ? 'État' : 'Status', type: 'select', options: STATUS_OPTIONS.map(String) },
          { key: 'structure_name', label: language === 'fr' ? 'Structure' : 'Structure', type: 'text' },
          { key: 'card_serial', label: language === 'fr' ? 'N° CG' : 'Card #', type: 'text' },
        ]}
      />

      {/* View Modal */}
      {showViewModal && selectedRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800/60 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{language === 'fr' ? 'Details Carte' : 'Card Details'}</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { label: language === 'fr' ? 'N° Serie CG' : 'Card Serial', value: selectedRow.card_serial },
                { label: language === 'fr' ? 'N° Serie TPE' : 'TPE Serial', value: selectedRow.tpe_serial },
                { label: 'District', value: selectedRow.district },
                { label: language === 'fr' ? 'Structure' : 'Structure', value: selectedRow.structure_name },
                { label: language === 'fr' ? 'Code Station' : 'Station Code', value: selectedRow.station_code },
                { label: language === 'fr' ? 'Station' : 'Station', value: selectedRow.station_name },
                { label: language === 'fr' ? 'Date Reception' : 'Reception Date', value: selectedRow.reception_date },
                { label: language === 'fr' ? 'Date Remise' : 'Assignment Date', value: selectedRow.delivery_date },
                { label: language === 'fr' ? 'Date Expiration' : 'Expiration Date', value: selectedRow.expiration_date },
                { label: language === 'fr' ? 'Amortissement' : 'Depreciation', value: selectedRow.amortissement },
                { label: language === 'fr' ? 'État' : 'Status', value: statusMap[selectedRow.status]?.label || selectedRow.status },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{item.label}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.value || '-'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800/60">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Changer État de la Carte' : 'Change Card Status'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {language === 'fr' ? 'Carte' : 'Card'}: <span className="font-medium text-gray-900 dark:text-white">{selectedRow.card_serial}</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'fr' ? 'État actuel' : 'Current status'}: <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusMap[selectedRow.status]?.color || ''}`}>{statusMap[selectedRow.status]?.label || selectedRow.status}</span>
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{language === 'fr' ? 'Nouvel État' : 'New Status'}</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { value: 'defectueux', label: language === 'fr' ? 'Défectueuse' : 'Defective', desc: language === 'fr' ? '→ Crée un suivi automatiquement' : '→ Auto-creates monitoring', color: 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20' },
                    { value: 'expire', label: language === 'fr' ? 'Expirée' : 'Expired', desc: language === 'fr' ? '→ Crée un suivi automatiquement' : '→ Auto-creates monitoring', color: 'border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20' },
                    { value: 'perdu', label: language === 'fr' ? 'Perdue' : 'Lost', desc: language === 'fr' ? '→ Crée un suivi automatiquement' : '→ Auto-creates monitoring', color: 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50' },
                    { value: 'vole', label: language === 'fr' ? 'Volée' : 'Stolen', desc: language === 'fr' ? '→ Crée un suivi automatiquement' : '→ Auto-creates monitoring', color: 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20' },
                  ].filter(opt => opt.value !== selectedRow.status).map(opt => (
                    <button key={opt.value} type="button"
                      onClick={() => setNewStatus(opt.value)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${newStatus === opt.value ? 'ring-2 ring-blue-500 ' + opt.color : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'}`}
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{opt.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              {statusError && <p className="text-sm text-red-600 dark:text-red-400">{statusError}</p>}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-800/60">
                <button type="button" onClick={() => { setShowStatusModal(false); setSelectedRow(null); }} className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button type="button" disabled={!newStatus} onClick={handleStatusChange}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
                  {language === 'fr' ? 'Confirmer' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CardCirculation;
