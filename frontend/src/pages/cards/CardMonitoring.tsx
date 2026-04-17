import { useState, useCallback, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import { useLanguage } from '../../context/LanguageContext';
import { cardsApi, structuresApi } from '../../lib/api';
import { useApiData } from '../../hooks/useApiData';

const inputClass = "w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--naftal-blue)]";
const readonlyClass = "w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-sm text-gray-900 dark:text-white cursor-not-allowed";

const CardMonitoring = () => {
  const { language } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState('');

  // Structure lookup state
  const [structureName, setStructureName] = useState('');
  const [structureDistrict, setStructureDistrict] = useState('');
  const [structureLookupStatus, setStructureLookupStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');
  const [availableStations, setAvailableStations] = useState<{ id: number; code: string; name: string }[]>([]);

  // Station lookup state
  const [stationName, setStationName] = useState('');
  const [stationLookupStatus, setStationLookupStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');

  const emptyForm = { card_number: '', structure_code: '', station_code: '', operation_mode: '', anomaly_date: '', diagnostic: '', status: '', substitution_card: '' };
  const [formData, setFormData] = useState(emptyForm);

  const fetchMonitoring = useCallback(() => cardsApi.getMonitoring({ per_page: 1000 }), []);
  const { data: monitoringData, refetch } = useApiData<any>({ fetchFn: fetchMonitoring });

  // Structure code lookup with debounce
  const structureTimerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    const code = formData.structure_code.trim();
    if (code.length < 3) {
      setStructureName(''); setStructureDistrict(''); setAvailableStations([]); setStructureLookupStatus('idle');
      return;
    }
    setStructureLookupStatus('loading');
    clearTimeout(structureTimerRef.current);
    structureTimerRef.current = setTimeout(async () => {
      try {
        const res = await structuresApi.lookupStructureByCode(code);
        const data = res.data?.data;
        if (data) {
          setStructureName(data.name); setStructureDistrict(data.district?.name || '');
          setAvailableStations(data.stations || []); setStructureLookupStatus('found');
        } else {
          setStructureName(''); setStructureDistrict(''); setAvailableStations([]); setStructureLookupStatus('not-found');
        }
      } catch {
        setStructureName(''); setStructureDistrict(''); setAvailableStations([]); setStructureLookupStatus('not-found');
      }
    }, 400);
    return () => clearTimeout(structureTimerRef.current);
  }, [formData.structure_code]);

  // Station code lookup with debounce
  const stationTimerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    const code = formData.station_code.trim();
    if (code.length < 3) { setStationName(''); setStationLookupStatus('idle'); return; }
    const match = availableStations.find(s => s.code === code);
    if (match) { setStationName(match.name); setStationLookupStatus('found'); return; }
    setStationLookupStatus('loading');
    clearTimeout(stationTimerRef.current);
    stationTimerRef.current = setTimeout(async () => {
      try {
        const res = await structuresApi.lookupStationByCode(code);
        const data = res.data?.data;
        if (data) { setStationName(data.name); setStationLookupStatus('found'); }
        else { setStationName(''); setStationLookupStatus('not-found'); }
      } catch { setStationName(''); setStationLookupStatus('not-found'); }
    }, 400);
    return () => clearTimeout(stationTimerRef.current);
  }, [formData.station_code, availableStations]);

  const resetFormState = () => {
    setStructureName(''); setStructureDistrict(''); setAvailableStations([]);
    setStructureLookupStatus('idle'); setStationName(''); setStationLookupStatus('idle');
    setFormError('');
  };

  const openAddModal = () => {
    setIsEditing(false); setSelectedRow(null); setFormData(emptyForm); resetFormState(); setShowModal(true);
  };

  const openEditModal = (row: any) => {
    setIsEditing(true); setSelectedRow(row); resetFormState();
    const stCode = row.station?.structure?.code || row.structure_code || '';
    const staCode = row.station?.code || row.station_code || '';
    setStructureName(row.station?.structure?.name || row.structure_name || '');
    setStructureDistrict(row.station?.structure?.district?.name || row.district || '');
    setStationName(row.station?.name || row.station_name || '');
    if (stCode) setStructureLookupStatus('found');
    if (staCode) setStationLookupStatus('found');
    setFormData({
      card_number: row.card_number || '', structure_code: stCode, station_code: staCode,
      operation_mode: row.operation_mode || '', anomaly_date: row.anomaly_date || '',
      diagnostic: row.diagnostic || '', status: row.status || '', substitution_card: row.substitution_card || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    try {
      if (isEditing && selectedRow) { await cardsApi.updateMonitoring(selectedRow.id, formData); }
      else { await cardsApi.createMonitoring(formData); }
      setShowModal(false); setIsEditing(false); setFormData(emptyForm); resetFormState(); refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error';
      setFormError(msg);
    }
  };

  const columns = [
    { key: 'card_number', label: language === 'fr' ? 'N° Carte' : 'Card Number' },
    { key: 'station_name', label: language === 'fr' ? 'Station' : 'Station' },
    { key: 'operation_mode', label: language === 'fr' ? 'Mode Operation' : 'Operation Mode' },
    { key: 'anomaly_date', label: language === 'fr' ? 'Date Anomalie' : 'Anomaly Date' },
    { key: 'diagnostic', label: language === 'fr' ? '1er Diagnostic' : '1st Diagnostic' },
    {
      key: 'status',
      label: language === 'fr' ? 'Etat' : 'Status',
      render: (value: string) => {
        const statusLabels: Record<string, string> = {
          'defectueux': language === 'fr' ? 'Defectueux' : 'Defective',
          'expire': language === 'fr' ? 'Expire' : 'Expired',
          'perdu': language === 'fr' ? 'Perdu' : 'Lost',
          'vole': language === 'fr' ? 'Vole' : 'Stolen',
          'sim_endommage': language === 'fr' ? 'SIM Endommage' : 'Damaged SIM',
          'physiquement_endommage': language === 'fr' ? 'Physiquement Endommage' : 'Physically Damaged',
          'debloquee': language === 'fr' ? 'Debloquee' : 'Unblocked',
          'en_traitement': language === 'fr' ? 'En Traitement' : 'Being Processed',
          'n_a': language === 'fr' ? 'N/A' : 'N/A',
          'remplace': language === 'fr' ? 'Remplace' : 'Replaced',
        };
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{statusLabels[value] || value}</span>;
      }
    },
    {
      key: 'substitution_card',
      label: language === 'fr' ? 'Carte Substitution' : 'Substitution Card',
      render: (value: string | null) => value || <span className="text-gray-400">-</span>
    },
    { key: 'processing_duration', label: language === 'fr' ? 'Duree Traitement' : 'Processing Duration' },
    { key: 'immobilization_duration', label: language === 'fr' ? 'Duree Immobilisation' : 'Immobilization Duration' },
  ];

  return (
    <DashboardLayout
      title={language === 'fr' ? 'Suivi des Cartes' : 'Card Monitoring'}
      subtitle={language === 'fr' ? 'Suivi des anomalies des cartes de gestion' : 'Tracking management card anomalies'}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 grid-stagger">
        {[
          { label: language === 'fr' ? 'En Suivi' : 'In Monitoring', value: String(monitoringData.length), color: 'bg-pink-500' },
          { label: language === 'fr' ? 'Defectueuses' : 'Defective', value: String(monitoringData.filter((d: any) => d.status === 'defectueux').length), color: 'bg-red-500' },
          { label: language === 'fr' ? 'En Traitement' : 'Being Processed', value: String(monitoringData.filter((d: any) => d.status === 'en_traitement').length), color: 'bg-orange-500' },
          { label: language === 'fr' ? 'Traitees' : 'Processed', value: String(monitoringData.filter((d: any) => ['debloquee', 'remplace'].includes(d.status)).length), color: 'bg-green-500' },
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 stat-card">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={monitoringData}
        title={language === 'fr' ? 'Liste des Cartes en Suivi' : 'Cards in Monitoring List'}
        onAdd={openAddModal}
        onEdit={openEditModal}
        onView={(row) => { setSelectedRow(row); setShowViewModal(true); }}
        onDelete={async (row) => { await cardsApi.updateMonitoring(row.id, { _delete: true }); refetch(); }}
      />

      {showViewModal && selectedRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{language === 'fr' ? 'Details Suivi' : 'Monitoring Details'}</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {Object.entries(selectedRow).filter(([k]) => k !== 'id').map(([key, value]) => (
                <div key={key}><p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{key.replace(/_/g, ' ')}</p><p className="text-sm font-medium text-gray-900 dark:text-white">{String(value ?? '-')}</p></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay-enter">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto modal-content-enter">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing ? (language === 'fr' ? 'Modifier Suivi' : 'Edit Monitoring') : (language === 'fr' ? 'Ajouter Suivi' : 'Add Monitoring')}
              </h3>
              <button onClick={() => { setShowModal(false); setIsEditing(false); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              {/* Location Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                  {language === 'fr' ? 'Localisation' : 'Location'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'fr' ? 'Code Structure' : 'Structure Code'} *
                    </label>
                    <input type="text" required maxLength={4} value={formData.structure_code}
                      onChange={e => { const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4); setFormData(prev => ({ ...prev, structure_code: val })); }}
                      placeholder="ex: 2616" className={inputClass} />
                    {structureLookupStatus === 'loading' && <p className="text-xs text-blue-500 mt-1">{language === 'fr' ? 'Recherche...' : 'Searching...'}</p>}
                    {structureLookupStatus === 'not-found' && <p className="text-xs text-red-500 mt-1">{language === 'fr' ? 'Structure non trouvee' : 'Structure not found'}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Nom Structure' : 'Structure Name'}</label>
                    <input type="text" readOnly tabIndex={-1} value={structureName} className={readonlyClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District</label>
                    <input type="text" readOnly tabIndex={-1} value={structureDistrict} className={readonlyClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'fr' ? 'Code Station' : 'Station Code'} *
                    </label>
                    <input type="text" required maxLength={5} value={formData.station_code}
                      onChange={e => { const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5); setFormData(prev => ({ ...prev, station_code: val })); }}
                      list="monitoring-station-suggestions" placeholder="ex: 261a1" className={inputClass} />
                    {availableStations.length > 0 && (
                      <datalist id="monitoring-station-suggestions">
                        {availableStations.map(s => <option key={s.id} value={s.code}>{s.name}</option>)}
                      </datalist>
                    )}
                    {stationLookupStatus === 'loading' && <p className="text-xs text-blue-500 mt-1">{language === 'fr' ? 'Recherche...' : 'Searching...'}</p>}
                    {stationLookupStatus === 'not-found' && formData.station_code.length >= 3 && <p className="text-xs text-orange-500 mt-1">{language === 'fr' ? 'Station non trouvee' : 'Station not found'}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Nom Station' : 'Station Name'}</label>
                    <input type="text" readOnly tabIndex={-1} value={stationName} className={readonlyClass} />
                  </div>
                </div>
              </div>

              {/* Monitoring Info Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                  {language === 'fr' ? 'Information Suivi' : 'Monitoring Information'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'N° Carte' : 'Card Number'} *</label>
                    <input type="text" required value={formData.card_number} onChange={e => setFormData(p => ({ ...p, card_number: e.target.value }))} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Mode Operation' : 'Operation Mode'}</label>
                    <input type="text" value={formData.operation_mode} onChange={e => setFormData(p => ({ ...p, operation_mode: e.target.value }))} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Date Anomalie' : 'Anomaly Date'}</label>
                    <input type="date" value={formData.anomaly_date} onChange={e => setFormData(p => ({ ...p, anomaly_date: e.target.value }))} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? '1er Diagnostic' : '1st Diagnostic'}</label>
                    <input type="text" value={formData.diagnostic} onChange={e => setFormData(p => ({ ...p, diagnostic: e.target.value }))} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Etat' : 'Status'} *</label>
                    <select required value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))} className={inputClass}>
                      <option value="">{language === 'fr' ? 'Selectionner...' : 'Select...'}</option>
                      {['defectueux', 'expire', 'perdu', 'vole', 'sim_endommage', 'physiquement_endommage', 'debloquee', 'en_traitement', 'n_a', 'remplace'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Carte Substitution' : 'Substitution Card'}</label>
                    <input type="text" value={formData.substitution_card} onChange={e => setFormData(p => ({ ...p, substitution_card: e.target.value }))} className={inputClass} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {formError && <p className="flex-1 text-sm text-red-600 dark:text-red-400 self-center">{formError}</p>}
                <button type="button" onClick={() => { setShowModal(false); setIsEditing(false); }} className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button type="submit" className="px-6 py-2 bg-[var(--naftal-blue)] text-white rounded-lg text-sm font-medium hover:bg-[var(--naftal-dark-blue)]">
                  {language === 'fr' ? 'Enregistrer' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CardMonitoring;
