import { useState, useCallback, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import { useLanguage } from '../../context/LanguageContext';
import { tpeApi, structuresApi } from '../../lib/api';
import { useApiData } from '../../hooks/useApiData';
import { DatePicker } from '../../components/ui/date-picker';

const inputClass = "w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20";
const readonlyClass = "w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-100 dark:bg-gray-600 text-sm text-gray-900 dark:text-white cursor-not-allowed";

const TPEMaintenance = () => {
  const { language } = useLanguage();
  const fetchMaintenance = useCallback(() => tpeApi.getMaintenance({ per_page: 1000 }), []);
  const { data: maintenanceData, refetch } = useApiData<any>({ fetchFn: fetchMaintenance });
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

  // New station lookup (for Reconfiguration / Restitution transfers)
  const [newStationName, setNewStationName] = useState('');
  const [newStationLookupStatus, setNewStationLookupStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');

  // TPEs available in the selected structure
  const [availableTpes, setAvailableTpes] = useState<{ id: number; serial: string; model: string; status: string; station?: { id: number; code: string; name: string } }[]>([]);

  const emptyForm = {
    serial: '', model: '', structure_code: '', station_code: '',
    operation_mode: '', breakdown_date: '',
    problem_type: '', custom_problem: '', diagnostic: '', status: 'en_panne',
    // Mode-specific extras (serialized into `diagnostic` on submit)
    new_business_name: '', previous_business_name: '',
    return_condition: '', return_reason: '',
    reconfiguration_type: '',
    // Old TPE Returns fields (operator, SIM, transfer target, TRS tracking)
    operator: '', sim_serial: '', sim_ip: '', sim_phone: '',
    new_station_code: '',
    trs_st1_str: '', trs_str_dpe: '', trs_dpe_dcsi: '',
    trs_dcsi_dpe: '', trs_dpe_str: '', trs_str_st2: '',
  };
  const [formData, setFormData] = useState(emptyForm);

  // Problem types from backend (user-created ones)
  const [savedProblemTypes, setSavedProblemTypes] = useState<string[]>([]);
  useEffect(() => {
    tpeApi.getProblemTypes().then(res => setSavedProblemTypes(res.data?.data || [])).catch(() => {});
  }, []);

  const defaultProblemTypes = [
    { value: 'tpe_endommage', label: language === 'fr' ? 'TPE endommagé' : 'Damaged TPE' },
    { value: 'alerte_interruption', label: language === 'fr' ? 'Alerte interruption' : 'Interruption Alert' },
    { value: 'fonction_tactile', label: language === 'fr' ? 'Fonction tactile défaillante' : 'Defective Touch Function' },
    { value: 'boutons', label: language === 'fr' ? 'Boutons non fonctionnels' : 'Non-functional Buttons' },
    { value: 'lecteur_cartes', label: language === 'fr' ? 'Lecteur de cartes' : 'Card Reader' },
    { value: 'reseau', label: language === 'fr' ? 'Réseau' : 'Network' },
    { value: 'imprimante', label: language === 'fr' ? 'Problème d\'imprimante' : 'Printer Issue' },
    { value: 'batterie', label: language === 'fr' ? 'Problème de batterie' : 'Battery Issue' },
  ];
  const defaultValues = new Set(defaultProblemTypes.map(d => d.value));
  const customTypes = savedProblemTypes.filter(t => !defaultValues.has(t));

  // Structure code lookup with debounce
  const structureTimerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    const code = formData.structure_code.trim();
    if (code.length < 3) {
      setStructureName(''); setStructureDistrict(''); setAvailableStations([]); setAvailableTpes([]); setStructureLookupStatus('idle');
      return;
    }
    setStructureLookupStatus('loading');
    clearTimeout(structureTimerRef.current);
    structureTimerRef.current = setTimeout(async () => {
      try {
        const [structRes, tpeRes] = await Promise.all([
          structuresApi.lookupStructureByCode(code),
          tpeApi.getStockByStructure(code),
        ]);
        const data = structRes.data?.data;
        if (data) {
          setStructureName(data.name); setStructureDistrict(data.district?.name || '');
          setAvailableStations(data.stations || []); setStructureLookupStatus('found');
        } else {
          setStructureName(''); setStructureDistrict(''); setAvailableStations([]); setStructureLookupStatus('not-found');
        }
        setAvailableTpes(tpeRes.data?.data || []);
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

  // New station code lookup (for transfer-target station in Reconfiguration / Restitution)
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
    setStructureName(''); setStructureDistrict(''); setAvailableStations([]); setAvailableTpes([]);
    setStructureLookupStatus('idle'); setStationName(''); setStationLookupStatus('idle');
    setNewStationName(''); setNewStationLookupStatus('idle');
    setFormError('');
  };

  const openAddModal = () => {
    setIsEditing(false); setSelectedRow(null); setFormData(emptyForm); resetFormState(); setShowModal(true);
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
      serial: row.serial || '', model: row.model || '', structure_code: stCode, station_code: staCode,
      operation_mode: row.operation_mode || '', breakdown_date: row.breakdown_date || '',
      problem_type: row.problem_type || '', custom_problem: '', diagnostic: row.diagnostic || '', status: row.status || 'en_panne',
      new_business_name: '', previous_business_name: '',
      return_condition: '', return_reason: '',
      reconfiguration_type: '',
      operator: '', sim_serial: '', sim_ip: '', sim_phone: '',
      new_station_code: '',
      trs_st1_str: '', trs_str_dpe: '', trs_dpe_dcsi: '',
      trs_dcsi_dpe: '', trs_dpe_str: '', trs_str_st2: '',
    });
    // If the problem_type is a custom one (not in defaults), set it as "autre" + custom
    const existingType = row.problem_type || '';
    if (existingType && !defaultValues.has(existingType)) {
      setFormData(prev => ({ ...prev, problem_type: '__autre__', custom_problem: existingType }));
    }
    setShowModal(true);
  };

  const isRepairMode = formData.operation_mode === 'Reparation';
  const isBusinessNameMode = formData.operation_mode === 'Changement raison sociale';
  const isRestitutionMode = formData.operation_mode === 'Restitution';
  const isReconfigMode = formData.operation_mode === 'Reconfiguration';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    // Resolve the actual problem_type: if "autre", use the custom text
    const resolvedProblemType = formData.problem_type === '__autre__' ? formData.custom_problem.trim() : formData.problem_type;
    if (isRepairMode && !resolvedProblemType) { setFormError(language === 'fr' ? 'Veuillez specifier le type de panne' : 'Please specify the problem type'); return; }
    if (!formData.operation_mode) { setFormError(language === 'fr' ? 'Veuillez selectionner le mode d\'operation' : 'Please select the operation mode'); return; }
    if (isBusinessNameMode && !formData.new_business_name.trim()) { setFormError(language === 'fr' ? 'Nouvelle raison sociale requise' : 'New business name required'); return; }
    if (isRestitutionMode && !formData.return_reason.trim()) { setFormError(language === 'fr' ? 'Motif de restitution requis' : 'Return reason required'); return; }
    if (isRestitutionMode && !formData.return_condition) { setFormError(language === 'fr' ? 'Etat du TPE requis' : 'TPE condition required'); return; }
    if (isReconfigMode && !formData.reconfiguration_type) { setFormError(language === 'fr' ? 'Type de reconfiguration requis' : 'Reconfiguration type required'); return; }

    // Build diagnostic blob from mode-specific fields (so we don't need backend schema changes).
    let composedDiagnostic = formData.diagnostic.trim();
    const transferLines = () => {
      const lines: string[] = [];
      if (formData.operator) lines.push(`Operateur: ${formData.operator}`);
      if (formData.sim_serial) lines.push(`SIM: ${formData.sim_serial}`);
      if (formData.sim_ip) lines.push(`IP SIM: ${formData.sim_ip}`);
      if (formData.sim_phone) lines.push(`Tel SIM: ${formData.sim_phone}`);
      if (formData.new_station_code) lines.push(`Nouvelle station: ${formData.new_station_code}${newStationName ? ' (' + newStationName + ')' : ''}`);
      const trs = [
        formData.trs_st1_str && `ST1→STR: ${formData.trs_st1_str}`,
        formData.trs_str_dpe && `STR→DPE: ${formData.trs_str_dpe}`,
        formData.trs_dpe_dcsi && `DPE→DCSI: ${formData.trs_dpe_dcsi}`,
        formData.trs_dcsi_dpe && `DCSI→DPE: ${formData.trs_dcsi_dpe}`,
        formData.trs_dpe_str && `DPE→STR: ${formData.trs_dpe_str}`,
        formData.trs_str_st2 && `STR→ST2: ${formData.trs_str_st2}`,
      ].filter(Boolean);
      if (trs.length) lines.push(`TRS: ${trs.join(', ')}`);
      return lines;
    };
    if (isBusinessNameMode) {
      const lines = [
        formData.previous_business_name.trim() && `Ancienne raison sociale: ${formData.previous_business_name.trim()}`,
        `Nouvelle raison sociale: ${formData.new_business_name.trim()}`,
        composedDiagnostic && `Notes: ${composedDiagnostic}`,
      ].filter(Boolean);
      composedDiagnostic = lines.join(' | ');
    } else if (isRestitutionMode) {
      const lines = [
        `Motif: ${formData.return_reason.trim()}`,
        `Etat: ${formData.return_condition}`,
        ...transferLines(),
        composedDiagnostic && `Notes: ${composedDiagnostic}`,
      ].filter(Boolean);
      composedDiagnostic = lines.join(' | ');
    } else if (isReconfigMode) {
      const lines = [
        `Type: ${formData.reconfiguration_type}`,
        ...transferLines(),
        composedDiagnostic && `Notes: ${composedDiagnostic}`,
      ].filter(Boolean);
      composedDiagnostic = lines.join(' | ');
    }

    const payload = {
      serial: formData.serial,
      model: formData.model,
      structure_code: formData.structure_code,
      station_code: formData.station_code,
      operation_mode: formData.operation_mode,
      breakdown_date: formData.breakdown_date,
      problem_type: isRepairMode ? resolvedProblemType : '',
      diagnostic: composedDiagnostic,
      status: formData.status,
    };
    try {
      if (isEditing && selectedRow) { await tpeApi.updateMaintenance(selectedRow.id, payload); }
      else { await tpeApi.createMaintenance(payload); }
      setShowModal(false); setIsEditing(false); setFormData(emptyForm); resetFormState(); refetch();
      // Refresh problem types list so the new custom type appears next time
      tpeApi.getProblemTypes().then(res => setSavedProblemTypes(res.data?.data || [])).catch(() => {});
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error';
      setFormError(msg);
    }
  };

  const columns = [
    { key: 'serial', label: language === 'fr' ? 'N° Serie TPE' : 'TPE Serial' },
    { key: 'model', label: language === 'fr' ? 'Modele' : 'Model' },
    { key: 'station_name', label: language === 'fr' ? 'Station' : 'Station' },
    { key: 'operation_mode', label: language === 'fr' ? 'Mode Operation' : 'Operation Mode' },
    { key: 'breakdown_date', label: language === 'fr' ? 'Date Panne' : 'Breakdown Date' },
    { key: 'problem_type', label: language === 'fr' ? 'Type de Panne' : 'Problem Type' },
    {
      key: 'status',
      label: language === 'fr' ? 'Etat' : 'Status',
      render: (value: string) => {
        const statusLabels: Record<string, string> = {
          'en_panne': language === 'fr' ? 'En Panne' : 'Broken Down',
          'en_traitement': language === 'fr' ? 'En Traitement' : 'Being Processed',
          'trs_envoye': language === 'fr' ? 'TRS Envoye' : 'TRS Sent',
          'trs_recu': language === 'fr' ? 'TRS Recu' : 'TRS Received',
          'envoye_fournisseur': language === 'fr' ? 'Envoye Fournisseur' : 'Sent to Supplier',
          'repare': language === 'fr' ? 'Repare' : 'Repaired',
          'changement_sim': language === 'fr' ? 'Changement SIM' : 'SIM Change',
          'reconfigure': language === 'fr' ? 'Reconfigure' : 'Reconfigured',
          'retourne': language === 'fr' ? 'Retourne' : 'Returned',
          'remplace': language === 'fr' ? 'Remplace' : 'Replaced',
          'irreparable': language === 'fr' ? 'Irreparable' : 'Irreparable',
          'reforme': language === 'fr' ? 'Reforme' : 'Reformed',
          'a_retourner': language === 'fr' ? 'A Retourner' : 'To Return',
        };
        const colors: Record<string, string> = {
          'en_panne': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          'en_traitement': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          'trs_envoye': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
          'trs_recu': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
          'envoye_fournisseur': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
          'repare': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          'changement_sim': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          'reconfigure': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          'retourne': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
          'remplace': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          'irreparable': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          'reforme': 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-gray-200',
          'a_retourner': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        };
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value] || 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-gray-200'}`}>{statusLabels[value] || value}</span>;
      }
    },
  ];

  return (
    <DashboardLayout
      title={language === 'fr' ? 'Maintenance TPE' : 'TPE Maintenance'}
      subtitle={language === 'fr' ? 'Gestion des TPE en maintenance' : 'Managing TPE under maintenance'}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 grid-stagger">
        {[
          { label: language === 'fr' ? 'En Maintenance' : 'In Maintenance', value: String(maintenanceData.length), color: 'bg-yellow-500' },
          { label: language === 'fr' ? 'En Traitement DCSI' : 'With DCSI', value: String(maintenanceData.filter((d: any) => d.status === 'en_traitement').length), color: 'bg-orange-500' },
          { label: language === 'fr' ? 'A Retourner' : 'To Return', value: String(maintenanceData.filter((d: any) => d.status === 'a_retourner').length), color: 'bg-blue-500' },
          { label: language === 'fr' ? 'Duree Moyenne' : 'Avg Duration', value: maintenanceData.length > 0 ? (maintenanceData.reduce((s: number, d: any) => s + (parseFloat(d.processing_duration) || 0), 0) / maintenanceData.length).toFixed(1) + ' j' : '0 j', color: 'bg-purple-500' },
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-800/60 stat-card">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={maintenanceData}
        title={language === 'fr' ? 'Liste des TPE en Maintenance' : 'TPE in Maintenance List'}
        section="tpe_maintenance"
        onAdd={openAddModal}
        onEdit={openEditModal}
        onView={(row) => { setSelectedRow(row); setShowViewModal(true); }}
        onDelete={async (row) => { await tpeApi.deleteMaintenance(row.id); refetch(); }}
        filters={[
          { key: 'model', label: language === 'fr' ? 'Modele' : 'Model', type: 'select', options: ['IWIL 250', 'MOVE 2500', 'NewPos'] },
          { key: 'station_name', label: language === 'fr' ? 'Station' : 'Station', type: 'text' },
          { key: 'problem_type', label: language === 'fr' ? 'Type Panne' : 'Problem Type', type: 'text' },
          { key: 'status', label: language === 'fr' ? 'Etat' : 'Status', type: 'select', options: ['en_panne', 'en_traitement', 'trs_envoye', 'trs_recu', 'envoye_fournisseur', 'repare', 'changement_sim', 'reconfigure', 'retourne', 'remplace', 'irreparable', 'reforme', 'a_retourner'] },
          { key: 'breakdown_date', label: language === 'fr' ? 'Date Panne' : 'Breakdown Date', type: 'date' },
        ]}
      />

      {showViewModal && selectedRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay-enter">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-content-enter">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800/60 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{language === 'fr' ? 'Details Maintenance' : 'Maintenance Details'}</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {Object.entries(selectedRow).filter(([k, v]) => !['id', 'tpeId', 'stationId'].includes(k) && v != null && v !== '' && typeof v !== 'object').map(([key, value]) => (
                <div key={key}><p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{key.replace(/_/g, ' ')}</p><p className="text-sm font-medium text-gray-900 dark:text-white">{String(value)}</p></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay-enter">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto modal-content-enter">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800/60 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing ? (language === 'fr' ? 'Modifier Maintenance' : 'Edit Maintenance') : (language === 'fr' ? 'Ajouter Maintenance' : 'Add Maintenance')}
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
                      list="maint-station-suggestions" placeholder="ex: 261a1" className={inputClass} />
                    {availableStations.length > 0 && (
                      <datalist id="maint-station-suggestions">
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

              {/* TPE Maintenance Info */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                  {language === 'fr' ? 'Information Maintenance' : 'Maintenance Information'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'N° Serie TPE' : 'TPE Serial'} *</label>
                    <input type="text" required value={formData.serial}
                      onChange={e => {
                        const serial = e.target.value;
                        setFormData(p => ({ ...p, serial }));
                        const tpe = availableTpes.find(t => t.serial === serial);
                        if (tpe) {
                          setFormData(p => ({
                            ...p,
                            serial,
                            model: tpe.model || '',
                            station_code: tpe.station?.code || p.station_code,
                          }));
                          if (tpe.station) {
                            setStationName(tpe.station.name);
                            setStationLookupStatus('found');
                          }
                        }
                      }}
                      list="maint-tpe-suggestions"
                      placeholder={language === 'fr' ? 'Taper le N° serie...' : 'Type serial number...'}
                      className={isEditing ? readonlyClass : inputClass} readOnly={isEditing} />
                    {!isEditing && availableTpes.length > 0 && (
                      <datalist id="maint-tpe-suggestions">
                        {availableTpes.filter(t => t.status === 'en_service').map(t => (
                          <option key={t.id} value={t.serial} />
                        ))}
                      </datalist>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Modele' : 'Model'} *</label>
                    <input type="text" aria-label="Model" required readOnly tabIndex={-1} value={formData.model} className={readonlyClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Mode Operation' : 'Operation Mode'}</label>
                    <select aria-label="Operation Mode" value={formData.operation_mode} onChange={e => { const mode = e.target.value; setFormData(p => ({ ...p, operation_mode: mode, ...(mode !== 'Reparation' ? { problem_type: '', custom_problem: '' } : {}), ...(mode !== 'Changement raison sociale' ? { new_business_name: '', previous_business_name: '' } : {}), ...(mode !== 'Restitution' ? { return_condition: '', return_reason: '' } : {}), ...(mode !== 'Reconfiguration' ? { reconfiguration_type: '' } : {}), ...(mode !== 'Reconfiguration' && mode !== 'Restitution' ? { operator: '', sim_serial: '', sim_ip: '', sim_phone: '', new_station_code: '', trs_st1_str: '', trs_str_dpe: '', trs_dpe_dcsi: '', trs_dcsi_dpe: '', trs_dpe_str: '', trs_str_st2: '' } : {}) })); setNewStationName(''); setNewStationLookupStatus('idle'); }} className={inputClass}>
                      <option value="">{language === 'fr' ? 'Selectionner...' : 'Select...'}</option>
                      <option value="Reparation">{language === 'fr' ? 'Réparation' : 'Repair'}</option>
                      <option value="Changement raison sociale">{language === 'fr' ? 'Changement raison sociale' : 'Business name change'}</option>
                      <option value="Restitution">{language === 'fr' ? 'Restitution' : 'Return'}</option>
                      <option value="Reconfiguration">{language === 'fr' ? 'Reconfiguration' : 'Reconfiguration'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRepairMode ? (language === 'fr' ? 'Date Panne' : 'Breakdown Date') : (language === 'fr' ? 'Date Operation' : 'Operation Date')} *</label>
                    <DatePicker value={formData.breakdown_date} onChange={v => setFormData(p => ({ ...p, breakdown_date: v }))} placeholder={language === 'fr' ? 'Selectionner' : 'Select date'} required />
                  </div>
                  {isRepairMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Type de Panne' : 'Problem Type'} *</label>
                    <select aria-label="Problem Type" required={formData.problem_type !== '__autre__'} value={formData.problem_type} onChange={e => setFormData(p => ({ ...p, problem_type: e.target.value, custom_problem: e.target.value === '__autre__' ? p.custom_problem : '' }))} className={inputClass}>
                      <option value="">{language === 'fr' ? 'Selectionner le probleme...' : 'Select problem...'}</option>
                      {defaultProblemTypes.map(pt => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
                      {customTypes.length > 0 && <option disabled>{'─'.repeat(20)}</option>}
                      {customTypes.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                      <option disabled>{'─'.repeat(20)}</option>
                      <option value="__autre__">{language === 'fr' ? '+ Ajouter nouveau type...' : '+ Add new type...'}</option>
                    </select>
                  </div>
                  )}
                  {isRepairMode && formData.problem_type === '__autre__' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Nom de la panne' : 'Problem name'} *</label>
                    <input type="text" required value={formData.custom_problem} onChange={e => setFormData(p => ({ ...p, custom_problem: e.target.value }))} placeholder={language === 'fr' ? 'Ex: Probleme antenne NFC' : 'Ex: NFC antenna issue'} className={inputClass} />
                  </div>
                  )}
                  {isBusinessNameMode && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Ancienne raison sociale' : 'Previous business name'}</label>
                        <input type="text" value={formData.previous_business_name} onChange={e => setFormData(p => ({ ...p, previous_business_name: e.target.value }))} placeholder={language === 'fr' ? 'Optionnel' : 'Optional'} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Nouvelle raison sociale' : 'New business name'} *</label>
                        <input type="text" required value={formData.new_business_name} onChange={e => setFormData(p => ({ ...p, new_business_name: e.target.value }))} placeholder={language === 'fr' ? 'Ex: NAFTAL SPA' : 'Ex: NAFTAL SPA'} className={inputClass} />
                      </div>
                    </>
                  )}
                  {isRestitutionMode && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Etat du TPE' : 'TPE Condition'} *</label>
                        <select aria-label="TPE Condition" required value={formData.return_condition} onChange={e => setFormData(p => ({ ...p, return_condition: e.target.value }))} className={inputClass}>
                          <option value="">{language === 'fr' ? 'Selectionner...' : 'Select...'}</option>
                          <option value="bon_etat">{language === 'fr' ? 'Bon etat' : 'Good condition'}</option>
                          <option value="endommage">{language === 'fr' ? 'Endommage' : 'Damaged'}</option>
                          <option value="accessoires_manquants">{language === 'fr' ? 'Accessoires manquants' : 'Missing accessories'}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Motif de restitution' : 'Return reason'} *</label>
                        <input type="text" required value={formData.return_reason} onChange={e => setFormData(p => ({ ...p, return_reason: e.target.value }))} placeholder={language === 'fr' ? 'Ex: Fermeture station' : 'Ex: Station closure'} className={inputClass} />
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                          {language === 'fr' ? 'A la confirmation, ce TPE sera transfere automatiquement vers le stock.' : 'On confirmation, this TPE will be moved back to stock automatically.'}
                        </p>
                      </div>
                    </>
                  )}
                  {isReconfigMode && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Type de reconfiguration' : 'Reconfiguration type'} *</label>
                      <select aria-label="Reconfiguration Type" required value={formData.reconfiguration_type} onChange={e => setFormData(p => ({ ...p, reconfiguration_type: e.target.value }))} className={inputClass}>
                        <option value="">{language === 'fr' ? 'Selectionner...' : 'Select...'}</option>
                        <option value="changement_sim">{language === 'fr' ? 'Changement SIM' : 'SIM Change'}</option>
                        <option value="mise_a_jour_logiciel">{language === 'fr' ? 'Mise a jour logiciel' : 'Software update'}</option>
                        <option value="parametrage_reseau">{language === 'fr' ? 'Parametrage reseau' : 'Network configuration'}</option>
                        <option value="changement_parametres">{language === 'fr' ? 'Changement de parametres' : 'Parameter change'}</option>
                        <option value="autre">{language === 'fr' ? 'Autre' : 'Other'}</option>
                      </select>
                    </div>
                  )}
                  {(isReconfigMode || isRestitutionMode) && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Operateur' : 'Operator'}</label>
                        <select aria-label="Operator" value={formData.operator} onChange={e => setFormData(p => ({ ...p, operator: e.target.value }))} className={inputClass}>
                          <option value="">{language === 'fr' ? 'Selectionner...' : 'Select...'}</option>
                          {['Djezzy', 'Mobilis', 'Ooredoo'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'N° Serie SIM' : 'SIM Serial'}</label>
                        <input type="text" value={formData.sim_serial} onChange={e => setFormData(p => ({ ...p, sim_serial: e.target.value }))} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Adresse IP SIM' : 'SIM IP'}</label>
                        <input type="text" value={formData.sim_ip} onChange={e => setFormData(p => ({ ...p, sim_ip: e.target.value }))} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'N° Téléphone SIM' : 'SIM Phone'}</label>
                        <input type="text" value={formData.sim_phone} onChange={e => setFormData(p => ({ ...p, sim_phone: e.target.value }))} className={inputClass} />
                      </div>
                      {isReconfigMode && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Code Nouvelle Station' : 'New Station Code'}</label>
                            <input type="text" maxLength={5} value={formData.new_station_code}
                              onChange={e => { const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5); setFormData(p => ({ ...p, new_station_code: val })); }}
                              placeholder="ex: 261a2" className={inputClass} />
                            {newStationLookupStatus === 'loading' && <p className="text-xs text-blue-500 mt-1">{language === 'fr' ? 'Recherche...' : 'Searching...'}</p>}
                            {newStationLookupStatus === 'not-found' && formData.new_station_code.length >= 3 && <p className="text-xs text-orange-500 mt-1">{language === 'fr' ? 'Station non trouvee' : 'Station not found'}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Nom Nouvelle Station' : 'New Station Name'}</label>
                            <input type="text" aria-label="New Station Name" readOnly tabIndex={-1} value={newStationName} className={readonlyClass} />
                          </div>
                        </>
                      )}
                      <div className="md:col-span-2">
                        <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 mt-2">{language === 'fr' ? 'Tracabilite TRS (optionnel)' : 'TRS Tracking (optional)'}</h5>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TRS ST1 → STR</label>
                        <input type="date" value={formData.trs_st1_str} onChange={e => setFormData(p => ({ ...p, trs_st1_str: e.target.value }))} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TRS STR → DPE</label>
                        <input type="date" value={formData.trs_str_dpe} onChange={e => setFormData(p => ({ ...p, trs_str_dpe: e.target.value }))} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TRS DPE → DCSI</label>
                        <input type="date" value={formData.trs_dpe_dcsi} onChange={e => setFormData(p => ({ ...p, trs_dpe_dcsi: e.target.value }))} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TRS DCSI → DPE</label>
                        <input type="date" value={formData.trs_dcsi_dpe} onChange={e => setFormData(p => ({ ...p, trs_dcsi_dpe: e.target.value }))} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TRS DPE → STR</label>
                        <input type="date" value={formData.trs_dpe_str} onChange={e => setFormData(p => ({ ...p, trs_dpe_str: e.target.value }))} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TRS STR → ST2</label>
                        <input type="date" value={formData.trs_str_st2} onChange={e => setFormData(p => ({ ...p, trs_str_st2: e.target.value }))} className={inputClass} />
                      </div>
                    </>
                  )}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRepairMode ? (language === 'fr' ? 'Diagnostic / Details' : 'Diagnostic / Details') : (language === 'fr' ? 'Motif / Details' : 'Reason / Details')}</label>
                    <textarea value={formData.diagnostic} onChange={e => setFormData(p => ({ ...p, diagnostic: e.target.value }))} rows={2} placeholder={isRepairMode ? (language === 'fr' ? 'Decrire le probleme en detail...' : 'Describe the problem in detail...') : (language === 'fr' ? 'Decrire le motif...' : 'Describe the reason...')} className={inputClass} />
                  </div>
                  {isEditing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Resolution' : 'Resolution'} *</label>
                    <select aria-label="Resolution" required value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))} className={inputClass}>
                      <option value="en_panne">{language === 'fr' ? 'En Panne' : 'Broken Down'}</option>
                      <option value="en_traitement">{language === 'fr' ? 'En Traitement' : 'Being Processed'}</option>
                      <option value="trs_envoye">{language === 'fr' ? 'TRS Envoye' : 'TRS Sent'}</option>
                      <option value="trs_recu">{language === 'fr' ? 'TRS Recu' : 'TRS Received'}</option>
                      <option value="envoye_fournisseur">{language === 'fr' ? 'Envoye Fournisseur' : 'Sent to Supplier'}</option>
                      <option value="repare">{language === 'fr' ? 'Repare' : 'Repaired'}</option>
                      <option value="changement_sim">{language === 'fr' ? 'Changement SIM' : 'SIM Change'}</option>
                      <option value="reconfigure">{language === 'fr' ? 'Reconfigure' : 'Reconfigured'}</option>
                      <option value="retourne">{language === 'fr' ? 'Retourne' : 'Returned'}</option>
                      <option value="remplace">{language === 'fr' ? 'Remplace' : 'Replaced'}</option>
                      <option value="irreparable">{language === 'fr' ? 'Irreparable' : 'Irreparable'}</option>
                      <option value="reforme">{language === 'fr' ? 'Reforme' : 'Reformed'}</option>
                      <option value="a_retourner">{language === 'fr' ? 'A Retourner' : 'To Be Returned'}</option>
                    </select>
                  </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-800/60">
                {formError && <p className="flex-1 text-sm text-red-600 dark:text-red-400 self-center">{formError}</p>}
                <button type="button" onClick={() => { setShowModal(false); setIsEditing(false); }} className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
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
    </DashboardLayout>
  );
};

export default TPEMaintenance;
