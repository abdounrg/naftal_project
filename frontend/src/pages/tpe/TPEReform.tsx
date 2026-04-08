import { useState, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import { useLanguage } from '../../context/LanguageContext';
import { tpeApi } from '../../lib/api';
import { useApiData } from '../../hooks/useApiData';

const TPEReform = () => {
  const fetchReforms = useCallback(() => tpeApi.getReforms({ per_page: 1000 }), []);
  const { data: reformData, refetch } = useApiData<any>({ fetchFn: fetchReforms });
  const { language } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const emptyForm = { serial: '', model: '', district: '', structure_name: '', station_name: '', reform_pv: '', reform_date: '', reason: '' };
  const [formData, setFormData] = useState(emptyForm);

  const columns = [
    { key: 'serial', label: language === 'fr' ? 'N° Serie TPE' : 'TPE Serial' },
    { key: 'model', label: language === 'fr' ? 'Modele' : 'Model' },
    { key: 'district', label: language === 'fr' ? 'District' : 'District' },
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
      {/* Stats Cards */}
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

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={reformData}
        title={language === 'fr' ? 'Liste des TPE Reformes' : 'Reformed TPE List'}
        onAdd={() => { setSelectedRow(null); setFormData(emptyForm); setShowModal(true); }}
        onView={(row) => { setSelectedRow(row); setShowViewModal(true); }}
      />
      {showViewModal && selectedRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{language==='fr'?'Details Reforme':'Reform Details'}</h3>
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{language==='fr'?'Ajouter Reforme':'Add Reform'}</h3>
              <button onClick={()=>setShowModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <form onSubmit={async(e)=>{e.preventDefault();await tpeApi.createReform(formData);setShowModal(false);setFormData(emptyForm);refetch();}} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {key:'serial',label:language==='fr'?'N° Serie TPE':'TPE Serial',type:'text'},
                  {key:'model',label:language==='fr'?'Modele':'Model',type:'select',options:['IWIL 250','MOVE 2500','NewPos']},
                  {key:'district',label:'District',type:'text'},
                  {key:'structure_name',label:'Structure',type:'text'},
                  {key:'station_name',label:'Station',type:'text'},
                  {key:'reform_pv',label:language==='fr'?'N° PV Reforme':'Reform PV #',type:'text'},
                  {key:'reform_date',label:language==='fr'?'Date Reforme':'Reform Date',type:'date'},
                  {key:'reason',label:language==='fr'?'Motif':'Reason',type:'text'},
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
                <button type="button" onClick={()=>setShowModal(false)} className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{language==='fr'?'Annuler':'Cancel'}</button>
                <button type="submit" className="px-6 py-2 bg-[var(--naftal-blue)] text-white rounded-lg text-sm font-medium hover:bg-[var(--naftal-dark-blue)]">{language==='fr'?'Enregistrer':'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TPEReform;
