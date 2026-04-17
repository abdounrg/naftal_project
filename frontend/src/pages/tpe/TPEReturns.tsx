import { useState, useCallback, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import { useLanguage } from '../../context/LanguageContext';
import { tpeApi, structuresApi } from '../../lib/api';
import { useApiData } from '../../hooks/useApiData';

const inputClass = "w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--naftal-blue)]";
const readonlyClass = "w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-sm text-gray-900 dark:text-white cursor-not-allowed";

const TPEReturns = () => {
  const { language } = useLanguage();
  const fetchReturns = useCallback(() => tpeApi.getReturns({ per_page: 1000 }), []);
  const { data: returnsData, refetch } = useApiData<any>({ fetchFn: fetchReturns });
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState('');

  // Old station lookup
  const [oldStationName, setOldStationName] = useState('');
  const [oldStationLookupStatus, setOldStationLookupStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');

  // New station lookup
  const [newStationName, setNewStationName] = useState('');
  const [newStationLookupStatus, setNewStationLookupStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');

  const emptyForm = { serial: '', model: '', return_reason: '', old_station_code: '', new_station_code: '', operator: '' };
  const [formData, setFormData] = useState(emptyForm);

  // Old station code lookup with debounce
  const oldStationTimerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    const code = formData.old_station_code.trim();
    if (code.length < 3) { setOldStationName(''); setOldStationLookupStatus('idle'); return; }
    setOldStationLookupStatus('loading');
    clearTimeout(oldStationTimerRef.current);
    oldStationTimerRef.current = setTimeout(async () => {
      try {
        const res = await structuresApi.lookupStationByCode(code);
        const data = res.data?.data;
        if (data) { setOldStationName(data.name); setOldStationLookupStatus('found'); }
        else { setOldStationName(''); setOldStationLookupStatus('not-found'); }
      } catch { setOldStationName(''); setOldStationLookupStatus('not-found'); }
    }, 400);
    return () => clearTimeout(oldStationTimerRef.current);
  }, [formData.old_station_code]);

  // New station code lookup with debounce
  const newStationTimerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    const code = formData.new_station_code.trim();
    if (code.length < 3) { setNewStationName(''); setNewStationLookupStatus('idle'); return; }
    setNewStationLookupStatus('loading');
    clearTimeout(newStationTimerRef.current);
    newStationTimerRef.current = setTimeout(async () => {
      try {
        const res = await structuresApi.lookupStationByCode(code);
        const data = res.data?.data;
        if (data) { setNewStationName(data.name); setNewStationLookupStatus('found'); }
        else { setNewStationName(''); setNewStationLookupStatus('not-found'); }
      } catch { setNewStationName(''); setNewStationLookupStatus('not-found'); }
    }, 400);
    return () => clearTimeout(newStationTimerRef.current);
  }, [formData.new_station_code]);

  const resetFormState = () => {
    setOldStationName(''); setOldStationLookupStatus('idle');
    setNewStationName(''); setNewStationLookupStatus('idle');
    setFormError('');
  };

  const openAddModal = () => {
    setIsEditing(false); setSelectedRow(null); setFormData(emptyForm); resetFormState(); setShowModal(true);
  };

  const openEditModal = (row: any) => {
    setIsEditing(true); setSelectedRow(row); resetFormState();
    const oldCode = row.oldStation?.code || row.old_station_code || '';
    const newCode = row.newStation?.code || row.new_station_code || '';
    setOldStationName(row.oldStation?.name || row.oldStation_name || '');
    setNewStationName(row.newStation?.name || row.newStation_name || '');
    if (oldCode) setOldStationLookupStatus('found');
    if (newCode) setNewStationLookupStatus('found');
    setFormData({
      serial: row.serial || '', model: row.model || '',
      return_reason: row.return_reason || row.returnReason || '',
      old_station_code: oldCode, new_station_code: newCode,
      operator: row.operator || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    try {
      if (isEditing && selectedRow) { await tpeApi.createReturn({ ...formData, id: selectedRow.id }); }
      else { await tpeApi.createReturn(formData); }
      setShowModal(false); setIsEditing(false); setFormData(emptyForm); resetFormState(); refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error';
      setFormError(msg);
    }
  };

  const columns = [
    { key: 'serial', label: language === 'fr' ? 'N° Serie TPE' : 'TPE Serial' },
    { key: 'model', label: language === 'fr' ? 'Modele' : 'Model' },
    { key: 'return_reason', label: language === 'fr' ? 'Motif Retour' : 'Return Reason' },
    { key: 'oldStation_name', label: language === 'fr' ? 'Ancienne Station' : 'Old Station' },
    {
      key: 'newStation_name',
      label: language === 'fr' ? 'Nouvelle Station' : 'New Station',
      render: (value: string | null) => value || <span className="text-gray-400">-</span>
    },
    { key: 'operator', label: language === 'fr' ? 'Operateur' : 'Operator' },
    { key: 'processing_duration', label: language === 'fr' ? 'Duree Traitement' : 'Processing Duration' },
    { key: 'immobilization_duration', label: language === 'fr' ? 'Duree Immobilisation' : 'Immobilization Duration' },
  ];

  return (
    <DashboardLayout
      title={language === 'fr' ? 'Retours et Reconfiguration' : 'Returns and Reconfiguration'}
      subtitle={language === 'fr' ? 'Suivi des TPE retournes et reconfigures' : 'Tracking returned and reconfigured TPE'}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 grid-stagger">
        {[
          { label: language === 'fr' ? 'Total Retours' : 'Total Returns', value: String(returnsData.length), color: 'bg-blue-500' },
          { label: language === 'fr' ? 'Reconfigures' : 'Reconfigured', value: String(returnsData.filter((d: any) => d.return_reason?.toLowerCase().includes('reconfigur')).length), color: 'bg-green-500' },
          { label: language === 'fr' ? 'Retour Stock' : 'Stock Return', value: String(returnsData.filter((d: any) => d.return_reason?.toLowerCase().includes('retour') || d.return_reason?.toLowerCase().includes('stock')).length), color: 'bg-yellow-500' },
          { label: language === 'fr' ? 'En Cours' : 'In Progress', value: String(returnsData.filter((d: any) => !d.newStation_name).length), color: 'bg-orange-500' },
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 stat-card">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={returnsData}
        title={language === 'fr' ? 'Liste des TPE Retournes' : 'Returned TPE List'}
        onAdd={openAddModal}
        onEdit={openEditModal}
        onView={(row) => { setSelectedRow(row); setShowViewModal(true); }}
        filters={[
          { key: 'model', label: language === 'fr' ? 'Modele' : 'Model', type: 'select', options: ['IWIL 250', 'MOVE 2500', 'NewPos'] },
          { key: 'return_reason', label: language === 'fr' ? 'Motif' : 'Reason', type: 'select', options: ['Reconfiguration', 'Retour stock'] },
          { key: 'operator', label: language === 'fr' ? 'Operateur' : 'Operator', type: 'select', options: ['Djezzy', 'Mobilis', 'Ooredoo'] },
        ]}
      />

      {showViewModal && selectedRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay-enter">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-content-enter">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{language === 'fr' ? 'Details Retour' : 'Return Details'}</h3>
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
                {isEditing ? (language === 'fr' ? 'Modifier Retour' : 'Edit Return') : (language === 'fr' ? 'Ajouter Retour' : 'Add Return')}
              </h3>
              <button onClick={() => { setShowModal(false); setIsEditing(false); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              {/* TPE Info Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                  {language === 'fr' ? 'Information TPE' : 'TPE Information'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Operateur' : 'Operator'}</label>
                    <select value={formData.operator} onChange={e => setFormData(p => ({ ...p, operator: e.target.value }))} className={inputClass}>
                      <option value="">{language === 'fr' ? 'Selectionner...' : 'Select...'}</option>
                      {['Djezzy', 'Mobilis', 'Ooredoo'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Motif Retour' : 'Return Reason'} *</label>
                    <select required value={formData.return_reason} onChange={e => setFormData(p => ({ ...p, return_reason: e.target.value }))} className={inputClass}>
                      <option value="">{language === 'fr' ? 'Selectionner...' : 'Select...'}</option>
                      {['Reconfiguration', 'Retour stock'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Old Station Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                  {language === 'fr' ? 'Ancienne Station' : 'Old Station'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'fr' ? 'Code Station' : 'Station Code'} *
                    </label>
                    <input type="text" required maxLength={5} value={formData.old_station_code}
                      onChange={e => { const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5); setFormData(prev => ({ ...prev, old_station_code: val })); }}
                      placeholder="ex: 261a1" className={inputClass} />
                    {oldStationLookupStatus === 'loading' && <p className="text-xs text-blue-500 mt-1">{language === 'fr' ? 'Recherche...' : 'Searching...'}</p>}
                    {oldStationLookupStatus === 'not-found' && formData.old_station_code.length >= 3 && <p className="text-xs text-orange-500 mt-1">{language === 'fr' ? 'Station non trouvee' : 'Station not found'}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Nom Station' : 'Station Name'}</label>
                    <input type="text" readOnly tabIndex={-1} value={oldStationName} className={readonlyClass} />
                  </div>
                </div>
              </div>

              {/* New Station Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                  {language === 'fr' ? 'Nouvelle Station' : 'New Station'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'fr' ? 'Code Station' : 'Station Code'}
                    </label>
                    <input type="text" maxLength={5} value={formData.new_station_code}
                      onChange={e => { const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5); setFormData(prev => ({ ...prev, new_station_code: val })); }}
                      placeholder="ex: 261a2" className={inputClass} />
                    {newStationLookupStatus === 'loading' && <p className="text-xs text-blue-500 mt-1">{language === 'fr' ? 'Recherche...' : 'Searching...'}</p>}
                    {newStationLookupStatus === 'not-found' && formData.new_station_code.length >= 3 && <p className="text-xs text-orange-500 mt-1">{language === 'fr' ? 'Station non trouvee' : 'Station not found'}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Nom Station' : 'Station Name'}</label>
                    <input type="text" readOnly tabIndex={-1} value={newStationName} className={readonlyClass} />
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

export default TPEReturns;
