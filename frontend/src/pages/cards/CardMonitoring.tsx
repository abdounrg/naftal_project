import { useState, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import { useLanguage } from '../../context/LanguageContext';
import { cardsApi } from '../../lib/api';
import { useApiData } from '../../hooks/useApiData';

const CardMonitoring = () => {
  const { language } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const emptyForm = { card_number: '', station_name: '', operation_mode: '', anomaly_date: '', diagnostic: '', status: '', substitution_card: '' };
  const [formData, setFormData] = useState(emptyForm);

  const fetchMonitoring = useCallback(() => cardsApi.getMonitoring({ per_page: 1000 }), []);
  const { data: monitoringData, refetch } = useApiData<any>({ fetchFn: fetchMonitoring });

  const columns = [
    { key: 'card_number', label: language === 'fr' ? 'N° Carte' : 'Card Number' },
    { key: 'station_name', label: language === 'fr' ? 'Station' : 'Station' },
    { key: 'operation_mode', label: language === 'fr' ? 'Mode Operation' : 'Operation Mode' },
    { key: 'anomaly_date', label: language === 'fr' ? 'Date Anomalie' : 'Anomaly Date' },
    { key: 'diagnostic', label: language === 'fr' ? '1er Diagnostic' : '1st Diagnostic' },
    { 
      key: 'status', 
      label: language === 'fr' ? 'Etat' : 'Status',
      render: (value: string) => {
        const statusLabels: Record<string, string> = {
          'defectueux': language === 'fr' ? 'Defectueux' : 'Defective',
          'expire': language === 'fr' ? 'Expire' : 'Expired',
          'perdu': language === 'fr' ? 'Perdu' : 'Lost',
          'vole': language === 'fr' ? 'Vole' : 'Stolen',
          'sim_endommage': language === 'fr' ? 'SIM Endommage' : 'Damaged SIM',
          'physiquement_endommage': language === 'fr' ? 'Physiquement Endommage' : 'Physically Damaged',
          'debloquee': language === 'fr' ? 'Debloquee' : 'Unblocked',
          'en_traitement': language === 'fr' ? 'En Traitement' : 'Being Processed',
          'n_a': language === 'fr' ? 'N/A' : 'N/A',
          'remplace': language === 'fr' ? 'Remplace' : 'Replaced',
        };
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {statusLabels[value] || value}
        </span>;
      }
    },
    { 
      key: 'substitution_card', 
      label: language === 'fr' ? 'Carte Substitution' : 'Substitution Card',
      render: (value: string | null) => value || <span className="text-gray-400">-</span>
    },
    { key: 'processing_duration', label: language === 'fr' ? 'Duree Traitement' : 'Processing Duration' },
    { key: 'immobilization_duration', label: language === 'fr' ? 'Duree Immobilisation' : 'Immobilization Duration' },
  ];

  return (
    <DashboardLayout
      title={language === 'fr' ? 'Suivi des Cartes' : 'Card Monitoring'}
      subtitle={language === 'fr' ? 'Suivi des anomalies des cartes de gestion' : 'Tracking management card anomalies'}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 grid-stagger">
        {[
          { label: language === 'fr' ? 'En Suivi' : 'In Monitoring', value: String(monitoringData.length), color: 'bg-pink-500' },
          { label: language === 'fr' ? 'Defectueuses' : 'Defective', value: String(monitoringData.filter((d: any) => d.status === 'defectueux').length), color: 'bg-red-500' },
          { label: language === 'fr' ? 'En Traitement' : 'Being Processed', value: String(monitoringData.filter((d: any) => d.status === 'en_traitement').length), color: 'bg-orange-500' },
          { label: language === 'fr' ? 'Traitees' : 'Processed', value: String(monitoringData.filter((d: any) => ['debloquee', 'remplace'].includes(d.status)).length), color: 'bg-green-500' },
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
        data={monitoringData}
        title={language === 'fr' ? 'Liste des Cartes en Suivi' : 'Cards in Monitoring List'}
        onAdd={() => { setIsEditing(false); setSelectedRow(null); setFormData(emptyForm); setShowModal(true); }}
        onEdit={(row) => { setIsEditing(true); setSelectedRow(row); setFormData({ card_number: row.card_number||'', station_name: row.station_name||'', operation_mode: row.operation_mode||'', anomaly_date: row.anomaly_date||'', diagnostic: row.diagnostic||'', status: row.status||'', substitution_card: row.substitution_card||'' }); setShowModal(true); }}
        onView={(row) => { setSelectedRow(row); setShowViewModal(true); }}
        onDelete={async (row) => { await cardsApi.updateMonitoring(row.id, {_delete: true}); refetch(); }}
      />
      {showViewModal && selectedRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{language==='fr'?'Details Suivi':'Monitoring Details'}</h3>
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isEditing?(language==='fr'?'Modifier Suivi':'Edit Monitoring'):(language==='fr'?'Ajouter Suivi':'Add Monitoring')}</h3>
              <button onClick={()=>{setShowModal(false);setIsEditing(false);}} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <form onSubmit={async(e)=>{e.preventDefault();if(isEditing&&selectedRow){await cardsApi.updateMonitoring(selectedRow.id,formData);}else{await cardsApi.createMonitoring(formData);}setShowModal(false);setIsEditing(false);setFormData(emptyForm);refetch();}} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {key:'card_number',label:language==='fr'?'N° Carte':'Card Number',type:'text'},
                  {key:'station_name',label:'Station',type:'text'},
                  {key:'operation_mode',label:language==='fr'?'Mode Operation':'Operation Mode',type:'text'},
                  {key:'anomaly_date',label:language==='fr'?'Date Anomalie':'Anomaly Date',type:'date'},
                  {key:'diagnostic',label:language==='fr'?'1er Diagnostic':'1st Diagnostic',type:'text'},
                  {key:'status',label:language==='fr'?'Etat':'Status',type:'select',options:['defectueux','expire','perdu','vole','sim_endommage','physiquement_endommage','debloquee','en_traitement','n_a','remplace']},
                  {key:'substitution_card',label:language==='fr'?'Carte Substitution':'Substitution Card',type:'text'},
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

export default CardMonitoring;
