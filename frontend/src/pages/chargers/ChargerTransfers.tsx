import { useState, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import { useLanguage } from '../../context/LanguageContext';
import { chargersApi } from '../../lib/api';
import { useApiData } from '../../hooks/useApiData';

const ChargerTransfers = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'chargers' | 'bases'>('chargers');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const emptyForm = { discharge: '', source: '', destination: '', beneficiary_name: '', beneficiary_function: '', exit_date: '', nbr_items: '', bts_number: '', base_serial: '', base_model: '', reception_date: '' };
  const [formData, setFormData] = useState(emptyForm);

  const fetchTransfers = useCallback(() => chargersApi.getTransfers({ per_page: 1000 }), []);
  const { data: allTransfers, refetch } = useApiData<any>({ fetchFn: fetchTransfers });
  const chargerTransfersData = allTransfers.filter((t: any) => t.type === 'charger');
  const baseTransfersData = allTransfers.filter((t: any) => t.type === 'base');

  const chargerColumns = [
    { key: 'source', label: 'Source' },
    { key: 'destination', label: 'Destination' },
    { key: 'beneficiary_name', label: language === 'fr' ? 'Nom Bénéficiaire' : 'Beneficiary' },
    { key: 'beneficiary_function', label: language === 'fr' ? 'Fonction Bénéficiaire' : 'Beneficiary Function' },
    { key: 'exit_date', label: language === 'fr' ? 'Date Sortie' : 'Exit Date' },
    { key: 'nbr_items', label: language === 'fr' ? 'NBR Chargeurs' : 'Charger Count' },
    { key: 'discharge', label: language === 'fr' ? 'Décharge' : 'Discharge' },
    { key: 'bts_number', label: language === 'fr' ? 'N° BTS' : 'BTS #' },
    { 
      key: 'reception_date', 
      label: language === 'fr' ? 'Date Réception' : 'Reception Date',
      render: (value: string | null) => value ? value : <span className="text-yellow-600 text-xs">{language === 'fr' ? 'En attente' : 'Pending'}</span>
    },
  ];

  const baseColumns = [
    { key: 'source', label: 'Source' },
    { key: 'destination', label: 'Destination' },
    { key: 'beneficiary_name', label: language === 'fr' ? 'Nom Bénéficiaire' : 'Beneficiary' },
    { key: 'beneficiary_function', label: language === 'fr' ? 'Fonction Bénéficiaire' : 'Beneficiary Function' },
    { key: 'exit_date', label: language === 'fr' ? 'Date Sortie' : 'Exit Date' },
    { key: 'base_serial', label: language === 'fr' ? 'N° Série' : 'Serial #' },
    { key: 'base_model', label: language === 'fr' ? 'Modèle' : 'Model' },
    { key: 'discharge', label: language === 'fr' ? 'Décharge' : 'Discharge' },
    { key: 'bts_number', label: language === 'fr' ? 'N° BTS' : 'BTS #' },
    { 
      key: 'reception_date', 
      label: language === 'fr' ? 'Date Réception' : 'Reception Date',
      render: (value: string | null) => value ? value : <span className="text-yellow-600 text-xs">{language === 'fr' ? 'En attente' : 'Pending'}</span>
    },
  ];

  return (
    <DashboardLayout
      title={language === 'fr' ? 'Transferts Chargeurs/Bases' : 'Charger/Base Transfers'}
      subtitle={language === 'fr' ? 'Gestion des transferts de chargeurs et bases' : 'Charger and base transfer management'}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 grid-stagger">
        {[
          { label: language === 'fr' ? 'Transferts Chargeurs' : 'Charger Transfers', value: String(chargerTransfersData.length), color: 'bg-orange-500' },
          { label: language === 'fr' ? 'Transferts Bases' : 'Base Transfers', value: String(baseTransfersData.length), color: 'bg-cyan-500' },
          { label: language === 'fr' ? 'DPE -> Structure' : 'DPE -> Structure', value: String(allTransfers.filter((t: any) => t.source?.toLowerCase().includes('dpe')).length), color: 'bg-green-500' },
          { label: language === 'fr' ? 'En Attente' : 'Pending', value: String(allTransfers.filter((t: any) => !t.reception_date).length), color: 'bg-yellow-500' },
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-800/60 stat-card">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('chargers')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'chargers'
              ? 'bg-blue-500 text-white'
              : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          {language === 'fr' ? 'Transferts Chargeurs' : 'Charger Transfers'}
        </button>
        <button
          onClick={() => setActiveTab('bases')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'bases'
              ? 'bg-blue-500 text-white'
              : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          {language === 'fr' ? 'Transferts Bases' : 'Base Transfers'}
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={activeTab === 'chargers' ? chargerColumns : baseColumns}
        data={activeTab === 'chargers' ? chargerTransfersData : baseTransfersData}
        title={activeTab === 'chargers' 
          ? (language === 'fr' ? 'Liste des Transferts Chargeurs' : 'Charger Transfers List')
          : (language === 'fr' ? 'Liste des Transferts Bases' : 'Base Transfers List')
        }
        section="charger_transfers"
        onAdd={() => { setIsEditing(false); setSelectedRow(null); setFormData(emptyForm); setShowModal(true); }}
        onEdit={(row) => { setIsEditing(true); setSelectedRow(row); setFormData({ discharge: row.discharge||'', source: row.source||'', destination: row.destination||'', beneficiary_name: row.beneficiary_name||'', beneficiary_function: row.beneficiary_function||'', exit_date: row.exit_date||'', nbr_items: String(row.nbr_items||''), bts_number: row.bts_number||'', base_serial: row.base_serial||'', base_model: row.base_model||'', reception_date: row.reception_date||'' }); setShowModal(true); }}
        onView={(row) => { setSelectedRow(row); setShowViewModal(true); }}
        onDelete={async (row) => { await chargersApi.deleteTransfer(row.id); refetch(); }}
      />
      {showViewModal && selectedRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800/60 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{language==='fr'?'Détails Transfert':'Transfer Details'}</h3>
              <button onClick={()=>setShowViewModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { label: 'Source', value: selectedRow.source },
                { label: 'Destination', value: selectedRow.destination },
                { label: language === 'fr' ? 'Nom Bénéficiaire' : 'Beneficiary', value: selectedRow.beneficiary_name },
                { label: language === 'fr' ? 'Fonction Bénéficiaire' : 'Function', value: selectedRow.beneficiary_function },
                { label: language === 'fr' ? 'Date Sortie' : 'Exit Date', value: selectedRow.exit_date },
                ...(selectedRow.type === 'charger' ? [
                  { label: language === 'fr' ? 'NBR Chargeurs' : 'Charger Count', value: selectedRow.nbr_items },
                ] : [
                  { label: language === 'fr' ? 'N° Série Base' : 'Base Serial', value: selectedRow.base_serial },
                  { label: language === 'fr' ? 'Modèle Base' : 'Base Model', value: selectedRow.base_model },
                ]),
                { label: language === 'fr' ? 'Décharge' : 'Discharge', value: selectedRow.discharge },
                { label: language === 'fr' ? 'N° BTS' : 'BTS #', value: selectedRow.bts_number },
                { label: language === 'fr' ? 'Date Réception' : 'Reception Date', value: selectedRow.reception_date || (language === 'fr' ? 'En attente' : 'Pending') },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{item.label}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{String(item.value ?? '-')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800/60 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isEditing?(language==='fr'?'Modifier Transfert':'Edit Transfer'):(language==='fr'?'Ajouter Transfert':'Add Transfer')}</h3>
              <button onClick={()=>{setShowModal(false);setIsEditing(false);}} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const payload = { ...formData, type: activeTab === 'chargers' ? 'charger' : 'base' };
                if (isEditing && selectedRow) {
                  await chargersApi.updateTransfer(selectedRow.id, payload);
                } else {
                  await chargersApi.createTransfer(payload);
                }
                setShowModal(false);
                setIsEditing(false);
                setSelectedRow(null);
                setFormData(emptyForm);
                refetch();
              }}
              className="p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {key:'source',label:'Source',type:'text'},
                  {key:'destination',label:'Destination',type:'text'},
                  {key:'beneficiary_name',label:language==='fr'?'Nom Bénéficiaire':'Beneficiary Name',type:'text'},
                  {key:'beneficiary_function',label:language==='fr'?'Fonction Bénéficiaire':'Beneficiary Function',type:'text'},
                  {key:'exit_date',label:language==='fr'?'Date Sortie':'Exit Date',type:'date'},
                  ...(activeTab==='chargers'?[{key:'nbr_items',label:language==='fr'?'NBR Chargeurs':'Charger Count',type:'number'}]:[{key:'base_serial',label:language==='fr'?'N° Série Base':'Base Serial',type:'text'},{key:'base_model',label:language==='fr'?'Modèle Base':'Base Model',type:'text'}]),
                  {key:'discharge',label:language==='fr'?'Décharge':'Discharge',type:'text'},
                  {key:'bts_number',label:language==='fr'?'N° BTS':'BTS #',type:'text'},
                  {key:'reception_date',label:language==='fr'?'Date Réception':'Reception Date',type:'date'},
                ].map(field=>(
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                    <input type={field.type} aria-label={field.label} value={(formData as any)[field.key]} onChange={e=>setFormData(p=>({...p,[field.key]:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-slate-800/60">
                <button type="button" onClick={()=>{setShowModal(false);setIsEditing(false);}} className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{language==='fr'?'Annuler':'Cancel'}</button>
                <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600">{language==='fr'?'Enregistrer':'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ChargerTransfers;
