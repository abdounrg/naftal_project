import { useState, useCallback, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import { useLanguage } from '../../context/LanguageContext';
import { cardsApi, structuresApi, tpeApi } from '../../lib/api';
import { useApiData } from '../../hooks/useApiData';
import { DatePicker } from '../../components/ui/date-picker';

const inputClass = "w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20";
const readonlyClass = "w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-100 dark:bg-gray-600 text-sm text-gray-900 dark:text-white cursor-not-allowed";

const CardStock = () => {
  const { language } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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

  // Available TPEs for selected structure
  const [availableTpes, setAvailableTpes] = useState<{ id: number; serial: string; model: string; status: string; station?: { id: number; code: string; name: string } }[]>([]);

  const emptyForm = {
    structure_code: '', station_code: '',
    card_serial: '', tpe_serial: '', reception_date: '', delivery_date: '', expiration_date: '',
  };
  const [formData, setFormData] = useState(emptyForm);

  const fetchStock = useCallback((params?: Record<string, unknown>) => cardsApi.getStock({ ...params, per_page: 1000 }), []);
  const { data: stockData, refetch } = useApiData<any>({ fetchFn: fetchStock });
  const fetchDistricts = useCallback(() => structuresApi.getDistricts(), []);
  const { data: districts } = useApiData<any>({ fetchFn: fetchDistricts });
  const districtNames = districts.map((d: any) => d.name);

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
          // Fetch available TPEs for this structure
          try {
            const tpeRes = await tpeApi.getStockByStructure(code);
            setAvailableTpes(tpeRes.data?.data || []);
          } catch { setAvailableTpes([]); }
        } else {
          setStructureName(''); setStructureDistrict(''); setAvailableStations([]); setAvailableTpes([]); setStructureLookupStatus('not-found');
        }
      } catch {
        setStructureName(''); setStructureDistrict(''); setAvailableStations([]); setAvailableTpes([]); setStructureLookupStatus('not-found');
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
    setStructureName(''); setStructureDistrict(''); setAvailableStations([]); setAvailableTpes([]);
    setStructureLookupStatus('idle'); setStationName(''); setStationLookupStatus('idle');
    setFormError('');
  };

  const openAddModal = () => {
    setIsEditing(false); setSelectedRow(null); setFormData(emptyForm); resetFormState(); setShowAddModal(true);
  };

  const openEditModal = (row: any) => {
    setIsEditing(true); setSelectedRow(row); resetFormState();
    const stCode = row.structure_code || '';
    const staCode = row.station_code || '';
    setStructureName(row.structure_name || '');
    setStructureDistrict(row.district || '');
    setStationName(row.station_name || '');
    if (stCode) setStructureLookupStatus('found');
    if (staCode) setStationLookupStatus('found');
    setFormData({
      structure_code: stCode, station_code: staCode,
      card_serial: row.card_serial || '', tpe_serial: row.tpe_serial || '',
      reception_date: row.reception_date || '', delivery_date: row.delivery_date || '',
      expiration_date: row.expiration_date || '',
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    try {
      if (isEditing && selectedRow) { await cardsApi.updateStock(selectedRow.id, formData); }
      else { await cardsApi.createStock(formData); }
      setShowAddModal(false); setIsEditing(false); setFormData(emptyForm); resetFormState(); refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error';
      setFormError(msg);
    }
  };

  const columns = [
    { key: 'card_serial', label: language === 'fr' ? 'N° Serie CG' : 'Card Serial' },
    { key: 'tpe_serial', label: language === 'fr' ? 'N° Serie TPE' : 'TPE Serial' },
    { key: 'district', label: 'District' },
    { key: 'structure_name', label: language === 'fr' ? 'Structure' : 'Structure' },
    { key: 'station_name', label: language === 'fr' ? 'Station' : 'Station' },
    { key: 'reception_date', label: language === 'fr' ? 'Date Reception' : 'Reception Date' },
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
  ];

  return (
    <DashboardLayout
      title={language === 'fr' ? 'Stock Cartes Gestion' : 'Management Card Stock'}
      subtitle={language === 'fr' ? 'Gestion du stock des cartes de gestion' : 'Management card stock management'}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 grid-stagger">
        {[
          { label: language === 'fr' ? 'Total Stock' : 'Total Stock', value: String(stockData.length), color: 'bg-pink-500' },
          { label: language === 'fr' ? 'Avec TPE' : 'With TPE', value: String(stockData.filter((d: any) => d.tpe_serial).length), color: 'bg-blue-500' },
          { label: language === 'fr' ? 'Sans TPE' : 'Without TPE', value: String(stockData.filter((d: any) => !d.tpe_serial).length), color: 'bg-yellow-500' },
          { label: language === 'fr' ? 'Bientôt Expiré' : 'Expiring Soon', value: String(stockData.filter((d: any) => { if (!d.expiration_date) return false; const diff = (new Date(d.expiration_date).getTime() - Date.now()) / (1000*60*60*24); return diff > 0 && diff <= 90; }).length), color: 'bg-orange-500' },
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-800/60 stat-card">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={stockData}
        title={language === 'fr' ? 'Liste des Cartes en Stock' : 'Cards in Stock List'}
        section="card_stock"
        onAdd={openAddModal}
        onEdit={openEditModal}
        onView={(row) => { setSelectedRow(row); setShowViewModal(true); }}
        onDelete={async (row) => { await cardsApi.deleteStock(row.id); refetch(); }}
        filters={[
          { key: 'district', label: 'District', type: 'select', options: districtNames },
          { key: 'station_name', label: language === 'fr' ? 'Station' : 'Station', type: 'text' },
          { key: 'reception_date', label: language === 'fr' ? 'Date Reception' : 'Reception Date', type: 'date' },
          { key: 'card_serial', label: language === 'fr' ? 'N° Carte' : 'Card #', type: 'text' },
        ]}
      />

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay-enter">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto modal-content-enter">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800/60 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing ? (language === 'fr' ? 'Modifier la Carte' : 'Edit Card') : (language === 'fr' ? 'Ajouter une Carte de Gestion' : 'Add Management Card')}
              </h3>
              <button onClick={() => { setShowAddModal(false); setIsEditing(false); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
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
                    <input type="text" aria-label="Structure Name" readOnly tabIndex={-1} value={structureName} className={readonlyClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District</label>
                    <input type="text" aria-label="District" readOnly tabIndex={-1} value={structureDistrict} className={readonlyClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'fr' ? 'Code Station' : 'Station Code'} *
                    </label>
                    <input type="text" required maxLength={5} value={formData.station_code}
                      onChange={e => { const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5); setFormData(prev => ({ ...prev, station_code: val })); }}
                      list="card-station-suggestions" placeholder="ex: 261a1" className={inputClass} />
                    {availableStations.length > 0 && (
                      <datalist id="card-station-suggestions">
                        {availableStations.map(s => <option key={s.id} value={s.code}>{s.name}</option>)}
                      </datalist>
                    )}
                    {stationLookupStatus === 'loading' && <p className="text-xs text-blue-500 mt-1">{language === 'fr' ? 'Recherche...' : 'Searching...'}</p>}
                    {stationLookupStatus === 'not-found' && formData.station_code.length >= 3 && <p className="text-xs text-orange-500 mt-1">{language === 'fr' ? 'Station non trouvee' : 'Station not found'}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Nom Station' : 'Station Name'}</label>
                    <input type="text" aria-label="Station Name" readOnly tabIndex={-1} value={stationName} className={readonlyClass} />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                  {language === 'fr' ? 'Information Carte' : 'Card Information'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'N° Serie Carte' : 'Card Serial #'} *</label>
                    <input type="text" aria-label="Card Serial" required value={formData.card_serial} onChange={e => setFormData(prev => ({ ...prev, card_serial: e.target.value }))} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'N° Serie TPE' : 'TPE Serial #'}</label>
                    {availableTpes.length > 0 ? (
                      <select aria-label="TPE Serial" value={formData.tpe_serial} onChange={e => setFormData(prev => ({ ...prev, tpe_serial: e.target.value }))} className={inputClass}>
                        <option value="">{language === 'fr' ? 'Selectionner un TPE...' : 'Select a TPE...'}</option>
                        {availableTpes.filter(t => t.status === 'en_service').map(t => (
                          <option key={t.id} value={t.serial}>{t.serial} ({t.model}{t.station ? ` - ${t.station.name}` : ''})</option>
                        ))}
                      </select>
                    ) : (
                      <input type="text" aria-label="TPE Serial" value={formData.tpe_serial} onChange={e => setFormData(prev => ({ ...prev, tpe_serial: e.target.value }))} placeholder={language === 'fr' ? 'Entrer N° serie TPE' : 'Enter TPE serial'} className={inputClass} />
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Dates</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Date Reception' : 'Reception Date'}</label>
                    <DatePicker value={formData.reception_date} onChange={v => setFormData(prev => ({ ...prev, reception_date: v }))} placeholder={language === 'fr' ? 'Selectionner' : 'Select date'} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Date Attribution' : 'Assignment Date'}</label>
                    <DatePicker value={formData.delivery_date} onChange={v => setFormData(prev => ({ ...prev, delivery_date: v }))} placeholder={language === 'fr' ? 'Selectionner' : 'Select date'} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Date Expiration' : 'Expiration Date'}</label>
                    <DatePicker value={formData.expiration_date} onChange={v => setFormData(prev => ({ ...prev, expiration_date: v }))} placeholder={language === 'fr' ? 'Selectionner' : 'Select date'} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-800/60">
                {formError && <p className="flex-1 text-sm text-red-600 dark:text-red-400 self-center">{formError}</p>}
                <button type="button" onClick={() => { setShowAddModal(false); setIsEditing(false); }} className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600">
                  {language === 'fr' ? 'Enregistrer' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800/60 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{language === 'fr' ? 'Details Carte' : 'Card Details'}</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { label: language === 'fr' ? 'N° Serie Carte' : 'Card Serial', value: selectedRow.card_serial },
                { label: language === 'fr' ? 'N° Serie TPE' : 'TPE Serial', value: selectedRow.tpe_serial },
                { label: 'District', value: selectedRow.district },
                { label: language === 'fr' ? 'Structure' : 'Structure', value: selectedRow.structure_name },
                { label: language === 'fr' ? 'Code Station' : 'Station Code', value: selectedRow.station_code },
                { label: language === 'fr' ? 'Station' : 'Station', value: selectedRow.station_name },
                { label: language === 'fr' ? 'Date Reception' : 'Reception Date', value: selectedRow.reception_date },
                { label: language === 'fr' ? 'Date Expiration' : 'Expiration Date', value: selectedRow.expiration_date },
                { label: language === 'fr' ? 'Amortissement' : 'Depreciation', value: selectedRow.amortissement },
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
    </DashboardLayout>
  );
};

export default CardStock;
