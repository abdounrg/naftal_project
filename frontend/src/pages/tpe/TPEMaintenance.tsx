
import { useState, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import { useLanguage } from '../../context/LanguageContext';
import { tpeApi } from '../../lib/api';
import { useApiData } from '../../hooks/useApiData';

const TPEMaintenance = () => {
  const { language } = useLanguage();
  const fetchMaintenance = useCallback(() => tpeApi.getMaintenance({ per_page: 1000 }), []);
  const { data: maintenanceData, refetch } = useApiData<any>({ fetchFn: fetchMaintenance });
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const emptyForm = { serial: '', model: '', station_name: '', operation_mode: '', breakdown_date: '', diagnostic: '', status: 'en_traitement' };
  const [formData, setFormData] = useState(emptyForm);

  const columns = [
    { key: 'serial', label: language === 'fr' ? 'N° Serie TPE' : 'TPE Serial' },
    { key: 'model', label: language === 'fr' ? 'Modele' : 'Model' },
    { key: 'station_name', label: language === 'fr' ? 'Station' : 'Station' },
    { key: 'operation_mode', label: language === 'fr' ? 'Mode Operation' : 'Operation Mode' },
    { key: 'breakdown_date', label: language === 'fr' ? 'Date Panne' : 'Breakdown Date' },
    { key: 'diagnostic', label: language === 'fr' ? '1er Diagnostic' : '1st Diagnostic' },
    { 
      key: 'status', 
      label: language === 'fr' ? 'Etat' : 'Status',
      render: (value: string) => {
        const statusLabels: Record<string, string> = {
          'repare': language === 'fr' ? 'Repare' : 'Repaired',
          'changement_sim': language === 'fr' ? 'Changement SIM' : 'SIM Change',
          'changement_raison_sociale': language === 'fr' ? 'Changement RS' : 'Company Name Change',
          'reconfigure': language === 'fr' ? 'Reconfigure' : 'Reconfigured',
          'retourne': language === 'fr' ? 'Retourne' : 'Returned',
          'remplace': language === 'fr' ? 'Remplace' : 'Replaced',
          'irreparable': language === 'fr' ? 'Irreparable' : 'Irreparable',
          'en_traitement': language === 'fr' ? 'En Traitement' : 'Being Processed',
          'a_retourner': language === 'fr' ? 'A Retourner' : 'To Be Returned',
        };
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {statusLabels[value] || value}
        </span>;
      }
    },
    { key: 'processing_duration', label: language === 'fr' ? 'Duree Traitement' : 'Processing Duration' },
    { key: 'immobilization_duration', label: language === 'fr' ? 'Duree Immobilisation' : 'Immobilization Duration' },
  ];

  return (
    <DashboardLayout
      title={language === 'fr' ? 'Maintenance TPE' : 'TPE Maintenance'}
      subtitle={language === 'fr' ? 'Gestion des TPE en maintenance' : 'Managing TPE under maintenance'}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 grid-stagger">
        {[
          { label: language === 'fr' ? 'En Maintenance' : 'In Maintenance', value: String(maintenanceData.length), color: 'bg-yellow-500' },
          { label: language === 'fr' ? 'En Traitement DCSI' : 'With DCSI', value: String(maintenanceData.filter((d: any) => d.status === 'en_traitement').length), color: 'bg-orange-500' },
          { label: language === 'fr' ? 'A Retourner' : 'To Return', value: String(maintenanceData.filter((d: any) => d.status === 'a_retourner').length), color: 'bg-blue-500' },
          { label: language === 'fr' ? 'Duree Moyenne' : 'Avg Duration', value: maintenanceData.length > 0 ? (maintenanceData.reduce((s: number, d: any) => s + (parseFloat(d.processing_duration) || 0), 0) / maintenanceData.length).toFixed(1) + ' j' : '0 j', color: 'bg-purple-500' },
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
        data={maintenanceData}
        title={language === 'fr' ? 'Liste des TPE en Maintenance' : 'TPE in Maintenance List'}
        onAdd={() => { setIsEditing(false); setSelectedRow(null); setFormData(emptyForm); setShowModal(true); }}
        onEdit={(row) => { setIsEditing(true); setSelectedRow(row); setFormData({ serial: row.serial||'', model: row.model||'', station_name: row.station_name||'', operation_mode: row.operation_mode||'', breakdown_date: row.breakdown_date||'', diagnostic: row.diagnostic||'', status: row.status||'en_traitement' }); setShowModal(true); }}
        onDelete={async (row) => { await tpeApi.updateMaintenance(row.id, { status: 'supprime' }); refetch(); }}
        onView={(row) => { setSelectedRow(row); setShowViewModal(true); }}
        filters={[
          { key: 'model', label: language === 'fr' ? 'Modele' : 'Model', type: 'select', options: ['IWIL 250', 'MOVE 2500', 'NewPos'] },
          { key: 'station_name', label: language === 'fr' ? 'Station' : 'Station', type: 'text' },
          { key: 'status', label: language === 'fr' ? 'Etat' : 'Status', type: 'select', options: ['en_traitement', 'a_retourner', 'repare', 'irreparable'] },
          { key: 'breakdown_date', label: language === 'fr' ? 'Date Panne' : 'Breakdown Date', type: 'date' },
        ]}
      />
      {/* View Modal */}
      {showViewModal && selectedRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay-enter">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-content-enter">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{language==='fr'?'Details Maintenance':'Maintenance Details'}</h3>
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay-enter">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-content-enter">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isEditing?(language==='fr'?'Modifier Maintenance':'Edit Maintenance'):(language==='fr'?'Ajouter Maintenance':'Add Maintenance')}</h3>
              <button onClick={()=>{setShowModal(false);setIsEditing(false);}} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <form onSubmit={async(e)=>{e.preventDefault();if(isEditing&&selectedRow){await tpeApi.updateMaintenance(selectedRow.id,formData);}else{await tpeApi.createMaintenance(formData);}setShowModal(false);setIsEditing(false);setFormData(emptyForm);refetch();}} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {key:'serial',label:language==='fr'?'N° Serie TPE':'TPE Serial',type:'text'},
                  {key:'model',label:language==='fr'?'Modele':'Model',type:'select',options:['IWIL 250','MOVE 2500','NewPos']},
                  {key:'station_name',label:language==='fr'?'Station':'Station',type:'text'},
                  {key:'operation_mode',label:language==='fr'?'Mode Operation':'Operation Mode',type:'text'},
                  {key:'breakdown_date',label:language==='fr'?'Date Panne':'Breakdown Date',type:'date'},
                  {key:'diagnostic',label:language==='fr'?'Diagnostic':'Diagnostic',type:'text'},
                  {key:'status',label:language==='fr'?'Etat':'Status',type:'select',options:['en_traitement','a_retourner','repare','irreparable','remplace','changement_sim','reconfigure','retourne']},
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

export default TPEMaintenance;
