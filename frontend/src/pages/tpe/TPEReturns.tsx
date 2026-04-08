import { useState, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import { useLanguage } from '../../context/LanguageContext';
import { tpeApi } from '../../lib/api';
import { useApiData } from '../../hooks/useApiData';

const TPEReturns = () => {
  const { language } = useLanguage();
  const fetchReturns = useCallback(() => tpeApi.getReturns({ per_page: 1000 }), []);
  const { data: returnsData, refetch } = useApiData<any>({ fetchFn: fetchReturns });
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const emptyForm = { serial: '', model: '', return_reason: '', oldStation_name: '', newStation_name: '', operator: '' };
  const [formData, setFormData] = useState(emptyForm);

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
      {/* Stats Cards */}
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

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={returnsData}
        title={language === 'fr' ? 'Liste des TPE Retournes' : 'Returned TPE List'}
        onAdd={() => { setIsEditing(false); setSelectedRow(null); setFormData(emptyForm); setShowModal(true); }}
        onEdit={(row) => { setIsEditing(true); setSelectedRow(row); setFormData({ serial: row.serial||'', model: row.model||'', return_reason: row.return_reason||row.returnReason||'', oldStation_name: row.oldStation_name||row.oldStation||'', newStation_name: row.newStation_name||row.newStation||'', operator: row.operator||'' }); setShowModal(true); }}
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{language==='fr'?'Details Retour':'Return Details'}</h3>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay-enter">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-content-enter">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isEditing?(language==='fr'?'Modifier Retour':'Edit Return'):(language==='fr'?'Ajouter Retour':'Add Return')}</h3>
              <button onClick={()=>{setShowModal(false);setIsEditing(false);}} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <form onSubmit={async(e)=>{e.preventDefault();if(isEditing&&selectedRow){await tpeApi.createReturn({...formData,id:selectedRow.id});}else{await tpeApi.createReturn(formData);}setShowModal(false);setIsEditing(false);setFormData(emptyForm);refetch();}} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {key:'serial',label:language==='fr'?'N° Serie TPE':'TPE Serial',type:'text'},
                  {key:'model',label:language==='fr'?'Modele':'Model',type:'select',options:['IWIL 250','MOVE 2500','NewPos']},
                  {key:'return_reason',label:language==='fr'?'Motif Retour':'Return Reason',type:'select',options:['Reconfiguration','Retour stock']},
                  {key:'oldStation_name',label:language==='fr'?'Ancienne Station':'Old Station',type:'text'},
                  {key:'newStation_name',label:language==='fr'?'Nouvelle Station':'New Station',type:'text'},
                  {key:'operator',label:language==='fr'?'Operateur':'Operator',type:'select',options:['Djezzy','Mobilis','Ooredoo']},
                ].map(field=>(
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                    {field.type==='select'?(
                      <select value={(formData as any)[field.key]} onChange={e=>setFormData(p=>({...p,[field.key]:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--naftal-blue)]">
                        <option value="">{language==='fr'?'Selectionner...':'Select...'}</option>
                        {field.options?.map(opt=><option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ):(
                      <input type={field.type} value={(formData as any)[field.key]} onChange={e=>setFormData(p=>({...p,[field.key]:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--naftal-blue)]" />
                    )}
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

export default TPEReturns;
