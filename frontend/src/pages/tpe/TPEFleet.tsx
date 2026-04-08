
import { useState, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import { useLanguage } from '../../context/LanguageContext';
import { tpeApi } from '../../lib/api';
import { useApiData } from '../../hooks/useApiData';

const TPEFleet = () => {
  const fetchFleet = useCallback(() => tpeApi.getFleet({ per_page: 1000 }), []);
  const { data: fleetData } = useApiData<any>({ fetchFn: fetchFleet });
  const { language } = useLanguage();
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const columns = [
    { key: 'serial', label: language === 'fr' ? 'N° Serie TPE' : 'TPE Serial' },
    { key: 'model', label: language === 'fr' ? 'Modele' : 'Model' },
    { 
      key: 'status', 
      label: language === 'fr' ? 'Etat' : 'Status',
      render: (value: string) => {
        const statusLabels: Record<string, string> = {
          'en_service': language === 'fr' ? 'En Service' : 'In Service',
          'en_maintenance': language === 'fr' ? 'En Maintenance' : 'In Maintenance',
          'en_panne': language === 'fr' ? 'En Panne' : 'Breakdown',
          'volé': language === 'fr' ? 'Vole' : 'Stolen',
          'en_traitement': language === 'fr' ? 'En Traitement' : 'Being Processed',
          'a_retourner': language === 'fr' ? 'A Retourner' : 'To Be Returned',
        };
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'en_service' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          value === 'en_maintenance' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
          value === 'en_panne' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
          'bg-gray-100 text-gray-800'
        }`}>{statusLabels[value] || value}</span>;
      }
    },
    { key: 'district', label: language === 'fr' ? 'District' : 'District' },
    { key: 'structure_name', label: language === 'fr' ? 'Structure' : 'Structure' },
    { key: 'station_name', label: language === 'fr' ? 'Station' : 'Station' },
    { key: 'card_numbers', label: language === 'fr' ? 'Cartes' : 'Cards' },
    { 
      key: 'charger_available', 
      label: language === 'fr' ? 'Chargeur' : 'Charger',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Oui' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'inventory_number', label: language === 'fr' ? 'N° Inventaire' : 'Inventory #' },
  ];

  return (
    <DashboardLayout
      title={language === 'fr' ? 'Parc TPE' : 'TPE Fleet'}
      subtitle={language === 'fr' ? 'Suivi des TPE en circulation' : 'Tracking TPE in circulation'}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 grid-stagger">
        {[
          { label: language === 'fr' ? 'Total Parc' : 'Total Fleet', value: fleetData.length.toLocaleString(), color: 'bg-blue-500' },
          { label: language === 'fr' ? 'En Service' : 'In Service', value: fleetData.filter((d: any) => d.status === 'en_service').length.toLocaleString(), color: 'bg-green-500' },
          { label: language === 'fr' ? 'En Maintenance' : 'In Maintenance', value: fleetData.filter((d: any) => d.status === 'en_maintenance').length.toLocaleString(), color: 'bg-yellow-500' },
          { label: language === 'fr' ? 'En Panne' : 'Breakdown', value: fleetData.filter((d: any) => d.status === 'en_panne').length.toLocaleString(), color: 'bg-red-500' },
          { label: language === 'fr' ? 'Disponibilite' : 'Availability', value: fleetData.length > 0 ? `${((fleetData.filter((d: any) => d.status === 'en_service').length / fleetData.length) * 100).toFixed(1)}%` : '0%', color: 'bg-purple-500' },
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
        data={fleetData}
        title={language === 'fr' ? 'Liste des TPE en Circulation' : 'TPE in Circulation List'}
        onView={(row) => { setSelectedRow(row); setShowViewModal(true); }}
        filters={[
          { key: 'district', label: 'District', type: 'select', options: ['Alger', 'Oran', 'Constantine', 'Annaba', 'Setif'] },
          { key: 'model', label: language === 'fr' ? 'Modele' : 'Model', type: 'select', options: ['IWIL 250', 'MOVE 2500', 'NewPos'] },
          { key: 'status', label: language === 'fr' ? 'Etat' : 'Status', type: 'select', options: ['en_service', 'en_maintenance', 'en_panne', 'volé'] },
          { key: 'structure_name', label: language === 'fr' ? 'Structure' : 'Structure', type: 'text' },
        ]}
      />
      {showViewModal && selectedRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{language==='fr'?'Details TPE':'TPE Details'}</h3>
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
    </DashboardLayout>
  );
};

export default TPEFleet;
