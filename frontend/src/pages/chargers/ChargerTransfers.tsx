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
  const emptyForm = { discharge: '', source: '', destination: '', beneficiary_name: '', exit_date: '', nbr_chargers: '', serial: '', model: '', reception_date: '' };
  const [formData, setFormData] = useState(emptyForm);

  const fetchTransfers = useCallback(() => chargersApi.getTransfers({ per_page: 1000 }), []);
  const { data: allTransfers, refetch } = useApiData<any>({ fetchFn: fetchTransfers });
  const chargerTransfersData = allTransfers.filter((t: any) => !t.serial);
  const baseTransfersData = allTransfers.filter((t: any) => !!t.serial);

  const chargerColumns = [
    { key: 'discharge', label: language === 'fr' ? 'N° Decharge' : 'Discharge #' },
    { key: 'source', label: language === 'fr' ? 'Source' : 'Source' },
    { key: 'destination', label: language === 'fr' ? 'Destination' : 'Destination' },
    { key: 'beneficiary_name', label: language === 'fr' ? 'Beneficiaire' : 'Beneficiary' },
    { key: 'exit_date', label: language === 'fr' ? 'Date Sortie' : 'Exit Date' },
    { key: 'nbr_chargers', label: language === 'fr' ? 'Nbr Chargeurs' : 'Charger Count' },
    { 
      key: 'reception_date', 
      label: language === 'fr' ? 'Date Reception' : 'Reception Date',
      render: (value: string | null) => value ? value : <span className="text-yellow-600 text-xs">{language === 'fr' ? 'En attente' : 'Pending'}</span>
    },
  ];

  const baseColumns = [
    { key: 'discharge', label: language === 'fr' ? 'N° Decharge' : 'Discharge #' },
    { key: 'source', label: language === 'fr' ? 'Source' : 'Source' },
    { key: 'destination', label: language === 'fr' ? 'Destination' : 'Destination' },
    { key: 'beneficiary_name', label: language === 'fr' ? 'Beneficiaire' : 'Beneficiary' },
    { key: 'serial', label: language === 'fr' ? 'N° Serie' : 'Serial #' },
    { key: 'model', label: language === 'fr' ? 'Modele' : 'Model' },
    { key: 'exit_date', label: language === 'fr' ? 'Date Sortie' : 'Exit Date' },
    { 
      key: 'reception_date', 
      label: language === 'fr' ? 'Date Reception' : 'Reception Date',
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
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 stat-card">
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
              ? 'bg-[var(--naftal-blue)] text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          {language === 'fr' ? 'Transferts Chargeurs' : 'Charger Transfers'}
        </button>
        <button
          onClick={() => setActiveTab('bases')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'bases'
              ? 'bg-[var(--naftal-blue)] text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
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
        onAdd={() => { setIsEditing(false); setSelectedRow(null); setFormData(emptyForm); setShowModal(true); }}
        onEdit={(row) => { setIsEditing(true); setSelectedRow(row); setFormData({ discharge: row.discharge||'', source: row.source||'', destination: row.destination||'', beneficiary_name: row.beneficiary_name||'', exit_date: row.exit_date||'', nbr_chargers: row.nbr_chargers||'', serial: row.serial||'', model: row.model||'', reception_date: row.reception_date||'' }); setShowModal(true); }}
        onView={(row) => { setSelectedRow(row); setShowViewModal(true); }}
        onDelete={async (row) => { await chargersApi.createTransfer({...row, _delete: true}); refetch(); }}
      />
      {showViewModal && selectedRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{language==='fr'?'Details Transfert':'Transfer Details'}</h3>
              <button onClick={()=>setShowViewModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {Object.entries(selectedRow).filter(([k])=>k!=='id').map(([key,value])=>(
                <div key={key}><p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{key.replace(/_/g,' ')}</p><p className="text-sm font-medium text-gray-900 dark:text-white">{String(value??'-')}</p></div>
              ))}
            </div>
          </div>
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isEditing?(language==='fr'?'Modifier Transfert':'Edit Transfer'):(language==='fr'?'Ajouter Transfert':'Add Transfer')}</h3>
              <button onClick={()=>{setShowModal(false);setIsEditing(false);}} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <form onSubmit={async(e)=>{e.preventDefault();await chargersApi.createTransfer(formData);setShowModal(false);setIsEditing(false);setFormData(emptyForm);refetch();}} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {key:'discharge',label:language==='fr'?'N° Decharge':'Discharge #',type:'text'},
                  {key:'source',label:'Source',type:'text'},
                  {key:'destination',label:'Destination',type:'text'},
                  {key:'beneficiary_name',label:language==='fr'?'Beneficiaire':'Beneficiary',type:'text'},
                  {key:'exit_date',label:language==='fr'?'Date Sortie':'Exit Date',type:'date'},
                  ...(activeTab==='chargers'?[{key:'nbr_chargers',label:language==='fr'?'Nbr Chargeurs':'Charger Count',type:'number'}]:[{key:'serial',label:language==='fr'?'N° Serie':'Serial #',type:'text'},{key:'model',label:language==='fr'?'Modele':'Model',type:'text'}]),
                  {key:'reception_date',label:language==='fr'?'Date Reception':'Reception Date',type:'date'},
                ].map(field=>(
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                    <input type={field.type} value={(formData as any)[field.key]} onChange={e=>setFormData(p=>({...p,[field.key]:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--naftal-blue)]" />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={()=>{setShowModal(false);setIsEditing(false);}} className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{language==='fr'?'Annuler':'Cancel'}</button>
                <button type="submit" className="px-6 py-2 bg-[var(--naftal-blue)] text-white rounded-lg text-sm font-medium hover:bg-[var(--naftal-dark-blue)]">{language==='fr'?'Enregistrer':'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ChargerTransfers;
