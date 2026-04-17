import { useState, useCallback, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import { useLanguage } from '../../context/LanguageContext';
import { tpeApi, structuresApi } from '../../lib/api';
import { useApiData } from '../../hooks/useApiData';

const TPE_MODELS: { value: string; label: string }[] = [
  { value: 'IWIL_250',  label: 'IWIL 250' },
  { value: 'MOVE_2500', label: 'MOVE 2500' },
  { value: 'NewPos',    label: 'NewPos' },
];

const TPE_OPERATORS = ['Djezzy', 'Mobilis', 'Ooredoo'];
const ASSIGNMENT_TYPES = ['Initial', 'Supplementaire'];

const inputClass = "w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--naftal-blue)]";
const readonlyClass = "w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-sm text-gray-900 dark:text-white cursor-not-allowed";
const ipInputClass = "w-16 px-2 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-[var(--naftal-blue)]";

const TPEStock = () => {
  const { language } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
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

  // IP address parts
  const [ipParts, setIpParts] = useState(['', '', '', '']);
  const ipRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const emptyForm = {
    structure_code: '', stationCode: '',
    serial: '', model: '', purchase_price: '', operator: '', sim_serial: '',
    sim_phone: '', reception_date: '', delivery_date: '', expiration_date: '',
    assignment_type: 'Initial', card_numbers: '', inventoryNumber: '',
  };
  const [formData, setFormData] = useState(emptyForm);

  const fetchStock = useCallback((params?: Record<string, unknown>) => tpeApi.getStock({ ...params, per_page: 1000 }), []);
  const { data: stockData, refetch } = useApiData<any>({ fetchFn: fetchStock });

  // Structure code lookup with debounce
  const structureTimerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    const code = formData.structure_code.trim();
    if (code.length < 3) {
      setStructureName('');
      setStructureDistrict('');
      setAvailableStations([]);
      setStructureLookupStatus('idle');
      return;
    }
    setStructureLookupStatus('loading');
    clearTimeout(structureTimerRef.current);
    structureTimerRef.current = setTimeout(async () => {
      try {
        const res = await structuresApi.lookupStructureByCode(code);
        const data = res.data?.data;
        if (data) {
          setStructureName(data.name);
          setStructureDistrict(data.district?.name || '');
          setAvailableStations(data.stations || []);
          setStructureLookupStatus('found');
        } else {
          setStructureName('');
          setStructureDistrict('');
          setAvailableStations([]);
          setStructureLookupStatus('not-found');
        }
      } catch {
        setStructureName('');
        setStructureDistrict('');
        setAvailableStations([]);
        setStructureLookupStatus('not-found');
      }
    }, 400);
    return () => clearTimeout(structureTimerRef.current);
  }, [formData.structure_code]);

  // Station code lookup with debounce
  const stationTimerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    const code = formData.stationCode.trim();
    if (code.length < 3) {
      setStationName('');
      setStationLookupStatus('idle');
      return;
    }
    // Check if code matches an available station from the structure
    const match = availableStations.find(s => s.code === code);
    if (match) {
      setStationName(match.name);
      setStationLookupStatus('found');
      return;
    }
    setStationLookupStatus('loading');
    clearTimeout(stationTimerRef.current);
    stationTimerRef.current = setTimeout(async () => {
      try {
        const res = await structuresApi.lookupStationByCode(code);
        const data = res.data?.data;
        if (data) {
          setStationName(data.name);
          setStationLookupStatus('found');
        } else {
          setStationName('');
          setStationLookupStatus('not-found');
        }
      } catch {
        setStationName('');
        setStationLookupStatus('not-found');
      }
    }, 400);
    return () => clearTimeout(stationTimerRef.current);
  }, [formData.stationCode, availableStations]);

  // IP address input handler
  const handleIpChange = (index: number, value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '').slice(0, 3);
    const num = parseInt(cleaned, 10);
    const clamped = cleaned === '' ? '' : String(Math.min(num, 255));
    const newParts = [...ipParts];
    newParts[index] = clamped;
    setIpParts(newParts);
    // Auto-advance to next field
    if (clamped.length === 3 && index < 3) {
      ipRefs[index + 1].current?.focus();
    }
  };

  const handleIpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '.' && index < 3) {
      e.preventDefault();
      ipRefs[index + 1].current?.focus();
    }
    if (e.key === 'Backspace' && ipParts[index] === '' && index > 0) {
      ipRefs[index - 1].current?.focus();
    }
  };

  const getFullIp = () => {
    if (ipParts.every(p => p === '')) return '';
    return ipParts.join('.');
  };

  const resetFormState = () => {
    setStructureName('');
    setStructureDistrict('');
    setAvailableStations([]);
    setStructureLookupStatus('idle');
    setStationName('');
    setStationLookupStatus('idle');
    setIpParts(['', '', '', '']);
    setFormError('');
  };

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedRow(null);
    setFormData(emptyForm);
    resetFormState();
    setShowAddModal(true);
  };

  const openEditModal = (row: any) => {
    setIsEditing(true);
    setSelectedRow(row);
    resetFormState();
    const stCode = row.station?.structure?.code || row.structure_code || '';
    const staCode = row.station?.code || row.stationCode || row.station_code || '';
    const ip = row.sim_ip || row.simIp || '';
    const parts = ip.split('.');
    setIpParts([parts[0] || '', parts[1] || '', parts[2] || '', parts[3] || '']);
    setStructureName(row.station?.structure?.name || row.structure_name || '');
    setStructureDistrict(row.station?.structure?.district?.name || row.district || '');
    setStationName(row.station?.name || row.station_name || '');
    if (stCode) setStructureLookupStatus('found');
    if (staCode) setStationLookupStatus('found');
    setFormData({
      structure_code: stCode, stationCode: staCode,
      serial: row.serial || '', model: row.model || '', purchase_price: row.purchase_price || row.purchasePrice || '',
      operator: row.operator || '', sim_serial: row.sim_serial || row.simSerial || '',
      sim_phone: row.sim_phone || row.simPhone || '',
      reception_date: row.reception_date || row.receptionDate?.split('T')[0] || '',
      delivery_date: row.delivery_date || row.deliveryDate?.split('T')[0] || '',
      expiration_date: row.expiration_date || row.expirationDate?.split('T')[0] || '',
      assignment_type: row.assignment_type || row.assignmentType || 'Initial',
      card_numbers: row.card_numbers || '', inventoryNumber: row.inventoryNumber || row.inventory_number || '',
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const simIp = getFullIp();
    const payload: any = {
      serial: formData.serial,
      model: formData.model,
      operator: formData.operator,
      stationCode: formData.stationCode,
      assignmentType: formData.assignment_type || undefined,
      inventoryNumber: formData.inventoryNumber || undefined,
      simIp: simIp || undefined,
      purchasePrice: formData.purchase_price ? Number(formData.purchase_price) : undefined,
      receptionDate: formData.reception_date || undefined,
      deliveryDate: formData.delivery_date || undefined,
      expirationDate: formData.expiration_date || undefined,
      simSerial: formData.sim_serial || undefined,
      simPhone: formData.sim_phone || undefined,
    };
    try {
      if (isEditing && selectedRow) {
        await tpeApi.updateStock(selectedRow.id, payload);
      } else {
        await tpeApi.createStock(payload);
      }
      setShowAddModal(false);
      setIsEditing(false);
      setFormData(emptyForm);
      resetFormState();
      refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.map((e: any) => e.message).join(', ') || err?.message || 'Error';
      setFormError(msg);
    }
  };

  const columns = [
    { key: 'serial', label: language === 'fr' ? 'N° Serie TPE' : 'TPE Serial' },
    { key: 'model', label: language === 'fr' ? 'Modele' : 'Model' },
    { key: 'district', label: language === 'fr' ? 'District' : 'District' },
    { key: 'structure_name', label: language === 'fr' ? 'Structure' : 'Structure' },
    { key: 'station_name', label: language === 'fr' ? 'Station' : 'Station' },
    { key: 'operator', label: language === 'fr' ? 'Operateur' : 'Operator' },
    {
      key: 'delivery_date',
      label: language === 'fr' ? 'Date Livraison' : 'Delivery Date',
      render: (value: string | null) => value || <span className="text-yellow-600">{language === 'fr' ? 'En attente' : 'Pending'}</span>
    },
    { key: 'assignment_type', label: language === 'fr' ? 'Type Affectation' : 'Assignment Type' },
  ];

  return (
    <DashboardLayout
      title={language === 'fr' ? 'Stock TPE' : 'TPE Stock'}
      subtitle={language === 'fr' ? 'Gestion du stock des terminaux de paiement' : 'Payment terminal stock management'}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 grid-stagger">
        {[
          { label: language === 'fr' ? 'Total Stock' : 'Total Stock', value: stockData.length.toLocaleString(), color: 'bg-blue-500' },
          { label: language === 'fr' ? 'En Attente Livraison' : 'Pending Delivery', value: stockData.filter((d: any) => !d.delivery_date).length.toLocaleString(), color: 'bg-yellow-500' },
          { label: language === 'fr' ? 'Livres' : 'Delivered', value: stockData.filter((d: any) => d.delivery_date).length.toLocaleString(), color: 'bg-green-500' },
          { label: language === 'fr' ? 'Valeur Totale' : 'Total Value', value: `${stockData.reduce((sum: number, d: any) => sum + (Number(d.purchase_price) || 0), 0).toLocaleString()} DZD`, color: 'bg-purple-500' },
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 stat-card">
            <div className={`w-10 h-10 rounded-lg ${stat.color} bg-opacity-10 flex items-center justify-center mb-2`}>
              <span className={`text-lg font-bold ${stat.color.replace('bg-', 'text-')}`}>{stat.value.charAt(0)}</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={stockData}
        title={language === 'fr' ? 'Liste des TPE en Stock' : 'TPE Stock List'}
        onAdd={openAddModal}
        onEdit={openEditModal}
        onDelete={async (row) => { await tpeApi.deleteStock(row.id); refetch(); }}
        onView={(row) => { setSelectedRow(row); setShowViewModal(true); }}
        onImport={(imported) => console.log('Imported:', imported)}
        filters={[
          { key: 'model', label: language === 'fr' ? 'Modele' : 'Model', type: 'select', options: TPE_MODELS.map(m => m.value) },
          { key: 'operator', label: language === 'fr' ? 'Operateur' : 'Operator', type: 'select', options: TPE_OPERATORS },
          { key: 'assignment_type', label: language === 'fr' ? 'Type Affectation' : 'Assignment Type', type: 'select', options: ['Initial', 'Supplementaire'] },
          { key: 'reception_date', label: language === 'fr' ? 'Date Reception' : 'Reception Date', type: 'date' },
          { key: 'serial', label: language === 'fr' ? 'N° Serie' : 'Serial #', type: 'text' },
        ]}
      />

      {/* View Modal */}
      {showViewModal && selectedRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay-enter">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-content-enter">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Details TPE' : 'TPE Details'} - {selectedRow.serial}
              </h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {Object.entries(selectedRow).filter(([k]) => k !== 'id').map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{key.replace(/_/g, ' ')}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{typeof value === 'object' ? JSON.stringify(value) : String(value ?? '-')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay-enter">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-content-enter">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing ? (language === 'fr' ? 'Modifier TPE' : 'Edit TPE') : (language === 'fr' ? 'Ajouter un TPE' : 'Add TPE')}
              </h3>
              <button onClick={() => { setShowAddModal(false); setIsEditing(false); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              {/* Structure & Station Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                  {language === 'fr' ? 'Localisation' : 'Location'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Structure Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'fr' ? 'Code Structure' : 'Structure Code'} *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={formData.structure_code}
                      onChange={e => {
                        const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4);
                        setFormData(prev => ({ ...prev, structure_code: val }));
                      }}
                      placeholder="ex: 2616"
                      className={inputClass}
                    />
                    {structureLookupStatus === 'loading' && (
                      <p className="text-xs text-blue-500 mt-1">{language === 'fr' ? 'Recherche...' : 'Searching...'}</p>
                    )}
                    {structureLookupStatus === 'not-found' && (
                      <p className="text-xs text-red-500 mt-1">{language === 'fr' ? 'Structure non trouvee' : 'Structure not found'}</p>
                    )}
                  </div>

                  {/* Structure Name (auto-filled, read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'fr' ? 'Nom Structure' : 'Structure Name'}
                    </label>
                    <input
                      type="text"
                      readOnly
                      tabIndex={-1}
                      value={structureName}
                      className={readonlyClass}
                    />
                  </div>

                  {/* District (auto-filled, read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District</label>
                    <input
                      type="text"
                      readOnly
                      tabIndex={-1}
                      value={structureDistrict}
                      className={readonlyClass}
                    />
                  </div>

                  {/* Station Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'fr' ? 'Code Station' : 'Station Code'} *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={5}
                        value={formData.stationCode}
                        onChange={e => {
                          const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5);
                          setFormData(prev => ({ ...prev, stationCode: val }));
                        }}
                        list="station-suggestions"
                        placeholder="ex: 261a1"
                        className={inputClass}
                      />
                      {availableStations.length > 0 && (
                        <datalist id="station-suggestions">
                          {availableStations.map(s => (
                            <option key={s.id} value={s.code}>{s.name}</option>
                          ))}
                        </datalist>
                      )}
                    </div>
                    {stationLookupStatus === 'loading' && (
                      <p className="text-xs text-blue-500 mt-1">{language === 'fr' ? 'Recherche...' : 'Searching...'}</p>
                    )}
                    {stationLookupStatus === 'not-found' && formData.stationCode.length >= 3 && (
                      <p className="text-xs text-orange-500 mt-1">{language === 'fr' ? 'Station non trouvee' : 'Station not found'}</p>
                    )}
                  </div>

                  {/* Station Name (auto-filled, read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'fr' ? 'Nom Station' : 'Station Name'}
                    </label>
                    <input
                      type="text"
                      readOnly
                      tabIndex={-1}
                      value={stationName}
                      className={readonlyClass}
                    />
                  </div>
                </div>
              </div>

              {/* TPE Info Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                  {language === 'fr' ? 'Information TPE' : 'TPE Information'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'fr' ? 'N° Serie TPE' : 'TPE Serial #'} *
                    </label>
                    <input type="text" required value={formData.serial} onChange={e => setFormData(prev => ({ ...prev, serial: e.target.value }))} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'fr' ? 'Modele' : 'Model'} *
                    </label>
                    <select required value={formData.model} onChange={e => setFormData(prev => ({ ...prev, model: e.target.value }))} className={inputClass}>
                      <option value="">{language === 'fr' ? 'Selectionner...' : 'Select...'}</option>
                      {TPE_MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'fr' ? 'Prix Achat' : 'Purchase Price'}
                    </label>
                    <input type="number" value={formData.purchase_price} onChange={e => setFormData(prev => ({ ...prev, purchase_price: e.target.value }))} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'fr' ? 'N° Inventaire' : 'Inventory #'}
                    </label>
                    <input type="text" value={formData.inventoryNumber} onChange={e => setFormData(prev => ({ ...prev, inventoryNumber: e.target.value }))} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'fr' ? 'Type Affectation' : 'Assignment Type'}
                    </label>
                    <select value={formData.assignment_type} onChange={e => setFormData(prev => ({ ...prev, assignment_type: e.target.value }))} className={inputClass}>
                      {ASSIGNMENT_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* SIM / Network Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                  {language === 'fr' ? 'SIM / Reseau' : 'SIM / Network'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'fr' ? 'Operateur' : 'Operator'} *
                    </label>
                    <select required value={formData.operator} onChange={e => setFormData(prev => ({ ...prev, operator: e.target.value }))} className={inputClass}>
                      <option value="">{language === 'fr' ? 'Selectionner...' : 'Select...'}</option>
                      {TPE_OPERATORS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'fr' ? 'N° Serie SIM' : 'SIM Serial #'}
                    </label>
                    <input type="text" value={formData.sim_serial} onChange={e => setFormData(prev => ({ ...prev, sim_serial: e.target.value }))} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'fr' ? 'Adresse IP SIM' : 'SIM IP Address'}
                    </label>
                    <div className="flex items-center gap-1">
                      {ipParts.map((part, i) => (
                        <div key={i} className="flex items-center">
                          <input
                            ref={ipRefs[i]}
                            type="text"
                            inputMode="numeric"
                            maxLength={3}
                            value={part}
                            onChange={e => handleIpChange(i, e.target.value)}
                            onKeyDown={e => handleIpKeyDown(i, e)}
                            className={ipInputClass}
                          />
                          {i < 3 && <span className="text-gray-400 dark:text-gray-500 mx-0.5 font-bold">.</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'fr' ? 'N° Telephone SIM' : 'SIM Phone #'}
                    </label>
                    <input type="text" value={formData.sim_phone} onChange={e => setFormData(prev => ({ ...prev, sim_phone: e.target.value }))} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Dates Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Dates</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'fr' ? 'Date Reception' : 'Reception Date'}
                    </label>
                    <input type="date" value={formData.reception_date} onChange={e => setFormData(prev => ({ ...prev, reception_date: e.target.value }))} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'fr' ? 'Date Livraison' : 'Delivery Date'}
                    </label>
                    <input type="date" value={formData.delivery_date} onChange={e => setFormData(prev => ({ ...prev, delivery_date: e.target.value }))} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'fr' ? 'Date Expiration' : 'Expiration Date'}
                    </label>
                    <input type="date" value={formData.expiration_date} onChange={e => setFormData(prev => ({ ...prev, expiration_date: e.target.value }))} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {formError && (
                  <p className="flex-1 text-sm text-red-600 dark:text-red-400 self-center">{formError}</p>
                )}
                <button type="button" onClick={() => { setShowAddModal(false); setIsEditing(false); }} className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
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

export default TPEStock;
