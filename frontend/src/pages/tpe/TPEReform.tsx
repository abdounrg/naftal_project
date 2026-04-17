import { useState, useCallback, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import { useLanguage } from '../../context/LanguageContext';
import { tpeApi, structuresApi } from '../../lib/api';
import { useApiData } from '../../hooks/useApiData';

const inputClass = "w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--naftal-blue)]";
const readonlyClass = "w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-sm text-gray-900 dark:text-white cursor-not-allowed";

const TPEReform = () => {
  const { language } = useLanguage();
  const fetchReforms = useCallback(() => tpeApi.getReforms({ per_page: 1000 }), []);
  const { data: reformData, refetch } = useApiData<any>({ fetchFn: fetchReforms });
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [formError, setFormError] = useState('');

  // Structure lookup state
  const [structureName, setStructureName] = useState('');
  const [structureDistrict, setStructureDistrict] = useState('');
  const [structureLookupStatus, setStructureLookupStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');
  const [availableStations, setAvailableStations] = useState<{ id: number; code: string; name: string }[]>([]);

  // Station lookup state
  const [stationName, setStationName] = useState('');
  const [stationLookupStatus, setStationLookupStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');

  const emptyForm = { serial: '', model: '', structure_code: '', station_code: '', reform_pv: '', reform_date: '', reason: '' };
  const [formData, setFormData] = useState(emptyForm);

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
    setSelectedRow(null); setFormData(emptyForm); resetFormState(); setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    try {
      await tpeApi.createReform(formData);
      setShowModal(false); setFormData(emptyForm); resetFormState(); refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error';
      setFormError(msg);
    }
  };

  const columns = [
    { key: 'serial', label: language === 'fr' ? 'N° Serie TPE' : 'TPE Serial' },
    { key: 'model', label: language === 'fr' ? 'Modele' : 'Model' },
    { key: 'district', label: 'District' },
    { key: 'structure_name', label: language === 'fr' ? 'Structure' : 'Structure' },
    { key: 'station_name', label: language === 'fr' ? 'Station' : 'Station' },
    { key: 'reform_pv', label: language === 'fr' ? 'N° PV Reforme' : 'Reform PV #' },
    { key: 'reform_date', label: language === 'fr' ? 'Date Reforme' : 'Reform Date' },
    {
      key: 'reason',
      label: language === 'fr' ? 'Motif' : 'Reason',
      render: (value: string) => (
        <span className="text-xs text-gray-600 dark:text-gray-400 max-w-xs truncate block">{value}</span>
      )
    },
  ];

  return (
    <DashboardLayout
      title={language === 'fr' ? 'TPE a Reforme' : 'TPE for Reform'}
      subtitle={language === 'fr' ? 'Suivi des TPE irreparables' : 'Tracking irreparable TPE'}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 grid-stagger">
        {[
          { label: language === 'fr' ? 'Total Reforme' : 'Total Reform', value: String(reformData.length), color: 'bg-red-500' },
          { label: language === 'fr' ? '2024' : '2024', value: String(reformData.filter((d: any) => d.reform_date?.startsWith('2024')).length), color: 'bg-blue-500' },
          { label: language === 'fr' ? '2023' : '2023', value: String(reformData.filter((d: any) => d.reform_date?.startsWith('2023')).length), color: 'bg-purple-500' },
          { label: language === 'fr' ? 'Autres Annees' : 'Other Years', value: String(reformData.filter((d: any) => d.reform_date && !d.reform_date.startsWith('2024') && !d.reform_date.startsWith('2023')).length), color: 'bg-orange-500' },
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 stat-card">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={reformData}
        title={language === 'fr' ? 'Liste des TPE Reformes' : 'Reformed TPE List'}
        onAdd={openAddModal}
        onView={(row) => { setSelectedRow(row); setShowViewModal(true); }}
      />

      {showViewModal && selectedRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{language === 'fr' ? 'Details Reforme' : 'Reform Details'}</h3>
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{language === 'fr' ? 'Ajouter Reforme' : 'Add Reform'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
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
                      list="reform-station-suggestions" placeholder="ex: 261a1" className={inputClass} />
                    {availableStations.length > 0 && (
                      <datalist id="reform-station-suggestions">
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

              {/* Reform Info */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                  {language === 'fr' ? 'Information Reforme' : 'Reform Information'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'N° Serie TPE' : 'TPE Serial'} *</label>
                    <input type="text" required value={formData.serial} onChange={e => setFormData(p => ({ ...p, serial: e.target.value }))} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Modele' : 'Model'} *</label>
                    <select required value={formData.model} onChange={e => setFormData(p => ({ ...p, model: e.target.value }))} className={inputClass}>
                      <option value="">{language === 'fr' ? 'Selectionner...' : 'Select...'}</option>
                      {['IWIL 250', 'MOVE 2500', 'NewPos'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'N° PV Reforme' : 'Reform PV #'}</label>
                    <input type="text" value={formData.reform_pv} onChange={e => setFormData(p => ({ ...p, reform_pv: e.target.value }))} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Date Reforme' : 'Reform Date'}</label>
                    <input type="date" value={formData.reform_date} onChange={e => setFormData(p => ({ ...p, reform_date: e.target.value }))} className={inputClass} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Motif' : 'Reason'}</label>
                    <input type="text" value={formData.reason} onChange={e => setFormData(p => ({ ...p, reason: e.target.value }))} className={inputClass} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {formError && <p className="flex-1 text-sm text-red-600 dark:text-red-400 self-center">{formError}</p>}
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
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

export default TPEReform;
