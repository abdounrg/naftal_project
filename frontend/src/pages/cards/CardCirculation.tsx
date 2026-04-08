import { useState, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import { useLanguage } from '../../context/LanguageContext';
import { cardsApi } from '../../lib/api';
import { useApiData } from '../../hooks/useApiData';

const CardCirculation = () => {
  const { language } = useLanguage();
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const fetchCirculation = useCallback(() => cardsApi.getCirculation({ per_page: 1000 }), []);
  const { data: circulationData } = useApiData<any>({ fetchFn: fetchCirculation });

  const columns = [
    { key: 'card_serial', label: language === 'fr' ? 'N° Serie CG' : 'Card Serial' },
    { key: 'tpe_serial', label: language === 'fr' ? 'N° Serie TPE' : 'TPE Serial' },
    { 
      key: 'status', 
      label: language === 'fr' ? 'Etat' : 'Status',
      render: (value: string) => {
        const statusLabels: Record<string, string> = {
          'en_circulation': language === 'fr' ? 'En Circulation' : 'In Circulation',
          'defectueux': language === 'fr' ? 'Defectueux' : 'Defective',
          'expire': language === 'fr' ? 'Expire' : 'Expired',
          'perdu': language === 'fr' ? 'Perdu' : 'Lost',
          'vole': language === 'fr' ? 'Vole' : 'Stolen',
          'en_traitement': language === 'fr' ? 'En Traitement' : 'Being Processed',
        };
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'en_circulation' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          value === 'defectueux' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
          value === 'expire' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
          'bg-gray-100 text-gray-800'
        }`}>{statusLabels[value] || value}</span>;
      }
    },
    { key: 'district', label: language === 'fr' ? 'District' : 'District' },
    { key: 'structure_name', label: language === 'fr' ? 'Structure' : 'Structure' },
    { key: 'station_name', label: language === 'fr' ? 'Station' : 'Station' },
    { key: 'assignment_date', label: language === 'fr' ? 'Date Attribution' : 'Assignment Date' },
  ];

  return (
    <DashboardLayout
      title={language === 'fr' ? 'Cartes en Circulation' : 'Cards in Circulation'}
      subtitle={language === 'fr' ? 'Suivi des cartes de gestion en circulation' : 'Tracking management cards in circulation'}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 grid-stagger">
        {[
          { label: language === 'fr' ? 'Total Circulation' : 'Total Circulation', value: String(circulationData.length), color: 'bg-pink-500' },
          { label: language === 'fr' ? 'En Circulation' : 'In Circulation', value: String(circulationData.filter((d: any) => d.status === 'en_circulation').length), color: 'bg-green-500' },
          { label: language === 'fr' ? 'Defectueuses' : 'Defective', value: String(circulationData.filter((d: any) => d.status === 'defectueux').length), color: 'bg-red-500' },
          { label: language === 'fr' ? 'Expirees' : 'Expired', value: String(circulationData.filter((d: any) => d.status === 'expire').length), color: 'bg-orange-500' },
          { label: language === 'fr' ? 'Perdues' : 'Lost', value: String(circulationData.filter((d: any) => d.status === 'perdu').length), color: 'bg-gray-500' },
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
        data={circulationData}
        title={language === 'fr' ? 'Liste des Cartes en Circulation' : 'Cards in Circulation List'}
        onView={(row) => { setSelectedRow(row); setShowViewModal(true); }}
        filters={[
          { key: 'district', label: 'District', type: 'select', options: ['Alger', 'Oran', 'Constantine', 'Annaba', 'Setif'] },
          { key: 'status', label: language === 'fr' ? 'Etat' : 'Status', type: 'select', options: ['en_circulation', 'defectueux', 'expire', 'perdu', 'vole'] },
          { key: 'structure_name', label: language === 'fr' ? 'Structure' : 'Structure', type: 'text' },
          { key: 'assignment_date', label: language === 'fr' ? 'Date Attribution' : 'Assignment Date', type: 'date' },
        ]}
      />
      {showViewModal && selectedRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{language==='fr'?'Details Carte':'Card Details'}</h3>
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

export default CardCirculation;
