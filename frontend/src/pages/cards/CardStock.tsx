import { useState, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import { useLanguage } from '../../context/LanguageContext';
import { cardsApi } from '../../lib/api';
import { useApiData } from '../../hooks/useApiData';

const CardStock = () => {
  const { language } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const emptyForm = {
    district: '', structure_code: '', station_code: '', station_name: '',
    address: '', card_serial: '', tpe_serial: '', reception_date: '', delivery_date: '', expiration_date: '',
  };
  const [formData, setFormData] = useState(emptyForm);

  const fetchStock = useCallback((params?: Record<string, unknown>) => cardsApi.getStock({ ...params, per_page: 1000 }), []);
  const { data: stockData, refetch } = useApiData<any>({ fetchFn: fetchStock });

  const columns = [
    { key: 'card_serial', label: language === 'fr' ? 'N° Serie CG' : 'Card Serial' },
    { key: 'tpe_serial', label: language === 'fr' ? 'N° Serie TPE' : 'TPE Serial' },
    { key: 'district', label: language === 'fr' ? 'District' : 'District' },
    { key: 'station_name', label: language === 'fr' ? 'Station' : 'Station' },
    { key: 'reception_date', label: language === 'fr' ? 'Date Reception' : 'Reception Date' },
    { 
      key: 'delivery_date', 
      label: language === 'fr' ? 'Date Attribution' : 'Assignment Date',
      render: (value: string | null) => value || <span className="text-yellow-600">{language === 'fr' ? 'En attente' : 'Pending'}</span>
    },
    { key: 'expiration_date', label: language === 'fr' ? 'Date Expiration' : 'Expiration Date' },
    { key: 'depreciation', label: language === 'fr' ? 'Amortissement' : 'Depreciation' },
  ];

  return (
    <DashboardLayout
      title={language === 'fr' ? 'Stock Cartes Gestion' : 'Management Card Stock'}
      subtitle={language === 'fr' ? 'Gestion du stock des cartes de gestion' : 'Management card stock management'}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 grid-stagger">
        {[
          { label: language === 'fr' ? 'Total Stock' : 'Total Stock', value: String(stockData.length), color: 'bg-pink-500' },
          { label: language === 'fr' ? 'En Attente' : 'Pending', value: String(stockData.filter((d: any) => !d.delivery_date).length), color: 'bg-yellow-500' },
          { label: language === 'fr' ? 'Attribuees' : 'Assigned', value: String(stockData.filter((d: any) => d.delivery_date).length), color: 'bg-green-500' },
          { label: language === 'fr' ? 'Expirees' : 'Expired', value: String(stockData.filter((d: any) => d.expiration_date && new Date(d.expiration_date) < new Date()).length), color: 'bg-red-500' },
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
        data={stockData}
        title={language === 'fr' ? 'Liste des Cartes en Stock' : 'Cards in Stock List'}
        onAdd={() => { setIsEditing(false); setSelectedRow(null); setFormData(emptyForm); setShowAddModal(true); }}
        onEdit={(row) => { setIsEditing(true); setSelectedRow(row); setFormData({ district: row.district||'', structure_code: row.structure_code||'', station_code: row.station_code||'', station_name: row.station_name||'', address: row.address||'', card_serial: row.card_serial||'', tpe_serial: row.tpe_serial||'', reception_date: row.reception_date||'', delivery_date: row.delivery_date||'', expiration_date: row.expiration_date||'' }); setShowAddModal(true); }}
        onView={(row) => { setSelectedRow(row); setShowViewModal(true); }}
        onDelete={async (row) => { await cardsApi.deleteStock(row.id); refetch(); }}
        filters={[
          { key: 'district', label: 'District', type: 'select', options: ['Alger', 'Oran', 'Constantine', 'Annaba', 'Setif'] },
          { key: 'station_name', label: language === 'fr' ? 'Station' : 'Station', type: 'text' },
          { key: 'reception_date', label: language === 'fr' ? 'Date Reception' : 'Reception Date', type: 'date' },
          { key: 'card_serial', label: language === 'fr' ? 'N° Carte' : 'Card #', type: 'text' },
        ]}
      />

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay-enter">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto modal-content-enter">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing ? (language === 'fr' ? 'Modifier la Carte' : 'Edit Card') : (language === 'fr' ? 'Ajouter une Carte de Gestion' : 'Add Management Card')}
              </h3>
              <button onClick={() => { setShowAddModal(false); setIsEditing(false); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <form onSubmit={async(e) => { e.preventDefault(); if(isEditing&&selectedRow){await cardsApi.updateStock(selectedRow.id,formData);}else{await cardsApi.createStock(formData);} setShowAddModal(false); setIsEditing(false); setFormData(emptyForm); refetch(); }} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'card_serial', label: language === 'fr' ? 'N° Serie Carte' : 'Card Serial #', type: 'text' },
                  { key: 'tpe_serial', label: language === 'fr' ? 'N° Serie TPE' : 'TPE Serial #', type: 'text' },
                  { key: 'district', label: 'District', type: 'select', options: ['Alger', 'Oran', 'Constantine', 'Annaba', 'Setif'] },
                  { key: 'structure_code', label: language === 'fr' ? 'Code Structure' : 'Structure Code', type: 'text' },
                  { key: 'station_code', label: language === 'fr' ? 'Code Station' : 'Station Code', type: 'text' },
                  { key: 'station_name', label: language === 'fr' ? 'Nom Station' : 'Station Name', type: 'text' },
                  { key: 'address', label: language === 'fr' ? 'Adresse' : 'Address', type: 'text' },
                  { key: 'reception_date', label: language === 'fr' ? 'Date Reception' : 'Reception Date', type: 'date' },
                  { key: 'delivery_date', label: language === 'fr' ? 'Date Attribution' : 'Assignment Date', type: 'date' },
                  { key: 'expiration_date', label: language === 'fr' ? 'Date Expiration' : 'Expiration Date', type: 'date' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                    {field.type === 'select' ? (
                      <select value={(formData as any)[field.key]} onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--naftal-blue)]">
                        <option value="">{language === 'fr' ? 'Selectionner...' : 'Select...'}</option>
                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input type={field.type} value={(formData as any)[field.key]} onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--naftal-blue)]" />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
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

export default CardStock;
