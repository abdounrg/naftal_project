import { useState, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import { useLanguage } from '../../context/LanguageContext';
import { cardsApi } from '../../lib/api';
import { useApiData } from '../../hooks/useApiData';

const CardTransfers = () => {
  const { language } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const emptyForm = { discharge: '', source: '', destination: '', beneficiary_name: '', beneficiary_function: '', exit_date: '', nbr_cards: '', cards: '', bts_number: '', reception_date: '' };
  const [formData, setFormData] = useState(emptyForm);

  const fetchTransfers = useCallback(() => cardsApi.getTransfers({ per_page: 1000 }), []);
  const { data: transfersData, refetch } = useApiData<any>({ fetchFn: fetchTransfers });

  const columns = [
    { key: 'discharge', label: language === 'fr' ? 'N° Decharge' : 'Discharge #' },
    { key: 'source', label: language === 'fr' ? 'Source' : 'Source' },
    { key: 'destination', label: language === 'fr' ? 'Destination' : 'Destination' },
    { key: 'beneficiary_name', label: language === 'fr' ? 'Beneficiaire' : 'Beneficiary' },
    { key: 'exit_date', label: language === 'fr' ? 'Date Sortie' : 'Exit Date' },
    { key: 'nbr_cards', label: language === 'fr' ? 'Nbr Cartes' : 'Card Count' },
    { 
      key: 'cards', 
      label: language === 'fr' ? 'N° Cartes' : 'Card Numbers',
      render: (value: string) => (
        <span className="text-xs text-gray-600 dark:text-gray-400 max-w-xs truncate block">{value}</span>
      )
    },
    { 
      key: 'reception_date', 
      label: language === 'fr' ? 'Date Reception' : 'Reception Date',
      render: (value: string | null) => value ? value : <span className="text-yellow-600 text-xs">{language === 'fr' ? 'En attente' : 'Pending'}</span>
    },
  ];

  return (
    <DashboardLayout
      title={language === 'fr' ? 'Transferts Cartes' : 'Card Transfers'}
      subtitle={language === 'fr' ? 'Gestion des transferts de cartes de gestion' : 'Management card transfer management'}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 grid-stagger">
        {[
          { label: language === 'fr' ? 'Total Transferts' : 'Total Transfers', value: String(transfersData.length), color: 'bg-pink-500' },
          { label: language === 'fr' ? 'DPE -> Structure' : 'DPE -> Structure', value: String(transfersData.filter((d: any) => d.source?.toLowerCase().includes('dpe')).length), color: 'bg-green-500' },
          { label: language === 'fr' ? 'Structure -> DPE' : 'Structure -> DPE', value: String(transfersData.filter((d: any) => d.destination?.toLowerCase().includes('dpe')).length), color: 'bg-blue-500' },
          { label: language === 'fr' ? 'En Attente' : 'Pending', value: String(transfersData.filter((d: any) => !d.reception_date).length), color: 'bg-yellow-500' },
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-800/60 stat-card">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={transfersData}
        title={language === 'fr' ? 'Liste des Transferts de Cartes' : 'Card Transfers List'}
        section="card_transfers"
        onAdd={() => { setIsEditing(false); setSelectedRow(null); setFormData(emptyForm); setShowModal(true); }}
        onEdit={(row) => { setIsEditing(true); setSelectedRow(row); setFormData({ discharge: row.discharge||'', source: row.source||'', destination: row.destination||'', beneficiary_name: row.beneficiary_name||'', beneficiary_function: row.beneficiary_function||'', exit_date: row.exit_date||'', nbr_cards: row.nbr_cards||'', cards: row.cards||'', bts_number: row.bts_number||'', reception_date: row.reception_date||'' }); setShowModal(true); }}
        onView={(row) => { setSelectedRow(row); setShowViewModal(true); }}
        onDelete={async (row) => { await cardsApi.deleteTransfer(row.id); refetch(); }}
        filters={[
          { key: 'source', label: 'Source', type: 'text' },
          { key: 'destination', label: 'Destination', type: 'text' },
          { key: 'exit_date', label: language === 'fr' ? 'Date Sortie' : 'Exit Date', type: 'date' },
          { key: 'discharge', label: language === 'fr' ? 'N° Decharge' : 'Discharge #', type: 'text' },
        ]}
      />
      {showViewModal && selectedRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800/60 flex items-center justify-between">
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
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800/60 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isEditing?(language==='fr'?'Modifier Transfert':'Edit Transfer'):(language==='fr'?'Ajouter Transfert':'Add Transfer')}</h3>
              <button onClick={()=>{setShowModal(false);setIsEditing(false);}} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <form onSubmit={async(e)=>{e.preventDefault();if(isEditing&&selectedRow){await cardsApi.updateTransfer(selectedRow.id,formData);}else{await cardsApi.createTransfer(formData);}setShowModal(false);setIsEditing(false);setFormData(emptyForm);refetch();}} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {key:'discharge',label:language==='fr'?'N° Decharge':'Discharge #',type:'text'},
                  {key:'source',label:'Source',type:'text'},
                  {key:'destination',label:'Destination',type:'text'},
                  {key:'beneficiary_name',label:language==='fr'?'Beneficiaire':'Beneficiary',type:'text'},
                  {key:'beneficiary_function',label:language==='fr'?'Fonction':'Function',type:'text'},
                  {key:'exit_date',label:language==='fr'?'Date Sortie':'Exit Date',type:'date'},
                  {key:'nbr_cards',label:language==='fr'?'Nbr Cartes':'Card Count',type:'number'},
                  {key:'cards',label:language==='fr'?'N° Cartes':'Card Numbers',type:'text'},
                  {key:'bts_number',label:language==='fr'?'N° BTS':'BTS Number',type:'text'},
                  {key:'reception_date',label:language==='fr'?'Date Reception':'Reception Date',type:'date'},
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

export default CardTransfers;
