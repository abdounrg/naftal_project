import { useState, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import { useLanguage } from '../../context/LanguageContext';
import { tpeApi } from '../../lib/api';
import { useApiData } from '../../hooks/useApiData';

// Enum values exactly as defined in Prisma/backend
const TPE_MODELS: { value: string; label: string }[] = [
  { value: 'IWIL_250',  label: 'IWIL 250' },
  { value: 'MOVE_2500', label: 'MOVE 2500' },
  { value: 'NewPos',    label: 'NewPos' },
];

const TPE_OPERATORS = ['Djezzy', 'Mobilis', 'Ooredoo'];
const ASSIGNMENT_TYPES = ['Initial', 'Supplementaire'];

const TPEStock = () => {
  const { language } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState('');
  const emptyForm = {
    district: '', structure_code: '', structure_name: '', stationCode: '', station_name: '',
    address: '', serial: '', model: '', purchase_price: '', operator: '', sim_serial: '',
    sim_ip: '', sim_phone: '', reception_date: '', delivery_date: '', expiration_date: '',
    assignment_type: 'Initial', card_numbers: '',
  };
  const [formData, setFormData] = useState(emptyForm);

  const fetchStock = useCallback((params?: Record<string, unknown>) => tpeApi.getStock({ ...params, per_page: 1000 }), []);
  const { data: stockData, refetch } = useApiData<any>({ fetchFn: fetchStock });

  const columns = [
    { key: 'serial', label: language === 'fr' ? 'N° Serie TPE' : 'TPE Serial' },
    { key: 'model', label: language === 'fr' ? 'Modele' : 'Model' },
    { key: 'district', label: language === 'fr' ? 'District' : 'District' },
    { key: 'structure_name', label: language === 'fr' ? 'Structure' : 'Structure' },
    { key: 'station_name', label: language === 'fr' ? 'Station' : 'Station' },
    { key: 'operator', label: language === 'fr' ? 'Operateur' : 'Operator' },
    { 
      key: 'delivery_date', 
      label: language === 'fr' ? 'Date Livraison' : 'Delivery Date',
      render: (value: string | null) => value || <span className="text-yellow-600">{language === 'fr' ? 'En attente' : 'Pending'}</span>
    },
    { key: 'assignment_type', label: language === 'fr' ? 'Type Affectation' : 'Assignment Type' },
  ];

  return (
    <DashboardLayout
      title={language === 'fr' ? 'Stock TPE' : 'TPE Stock'}
      subtitle={language === 'fr' ? 'Gestion du stock des terminaux de paiement' : 'Payment terminal stock management'}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 grid-stagger">
        {[
          { label: language === 'fr' ? 'Total Stock' : 'Total Stock', value: stockData.length.toLocaleString(), color: 'bg-blue-500' },
          { label: language === 'fr' ? 'En Attente Livraison' : 'Pending Delivery', value: stockData.filter((d: any) => !d.delivery_date).length.toLocaleString(), color: 'bg-yellow-500' },
          { label: language === 'fr' ? 'Livres' : 'Delivered', value: stockData.filter((d: any) => d.delivery_date).length.toLocaleString(), color: 'bg-green-500' },
          { label: language === 'fr' ? 'Valeur Totale' : 'Total Value', value: `${stockData.reduce((sum: number, d: any) => sum + (Number(d.purchase_price) || 0), 0).toLocaleString()} DZD`, color: 'bg-purple-500' },
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 stat-card">
            <div className={`w-10 h-10 rounded-lg ${stat.color} bg-opacity-10 flex items-center justify-center mb-2`}>
              <span className={`text-lg font-bold ${stat.color.replace('bg-', 'text-')}`}>{stat.value.charAt(0)}</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={stockData}
        title={language === 'fr' ? 'Liste des TPE en Stock' : 'TPE Stock List'}
        onAdd={() => { setIsEditing(false); setSelectedRow(null); setFormData(emptyForm); setShowAddModal(true); }}
        onEdit={(row) => {
          setIsEditing(true);
          setSelectedRow(row);
          setFormError('');
          setFormData({
            district: row.district || '', structure_code: row.structure_code || '', structure_name: row.structure_name || '',
            stationCode: row.station?.code || row.stationCode || row.station_code || '', station_name: row.station?.name || row.station_name || '', address: row.address || '',
            serial: row.serial || '', model: row.model || '', purchase_price: row.purchase_price || '',
            operator: row.operator || '', sim_serial: row.sim_serial || row.simSerial || '', sim_ip: row.sim_ip || row.simIp || '',
            sim_phone: row.sim_phone || row.simPhone || '', reception_date: row.reception_date || row.receptionDate?.split('T')[0] || '', delivery_date: row.delivery_date || row.deliveryDate?.split('T')[0] || '',
            expiration_date: row.expiration_date || row.expirationDate?.split('T')[0] || '', assignment_type: row.assignment_type || row.assignmentType || 'Initial', card_numbers: row.card_numbers || '',
          });
          setShowAddModal(true);
        }}
        onDelete={async (row) => { await tpeApi.deleteStock(row.id); refetch(); }}
        onView={(row) => { setSelectedRow(row); setShowViewModal(true); }}
        onImport={(imported) => console.log('Imported:', imported)}
        filters={[
          { key: 'district', label: 'District', type: 'select', options: ['Alger', 'Oran', 'Constantine', 'Annaba', 'Setif'] },
          { key: 'model', label: language === 'fr' ? 'Modele' : 'Model', type: 'select', options: TPE_MODELS.map(m => m.value) },
          { key: 'operator', label: language === 'fr' ? 'Operateur' : 'Operator', type: 'select', options: TPE_OPERATORS },
          { key: 'assignment_type', label: language === 'fr' ? 'Type Affectation' : 'Assignment Type', type: 'select', options: ['Initial', 'Supplementaire'] },
          { key: 'reception_date', label: language === 'fr' ? 'Date Reception' : 'Reception Date', type: 'date' },
          { key: 'serial', label: language === 'fr' ? 'N° Serie' : 'Serial #', type: 'text' },
        ]}
      />

      {/* View Modal */}
      {showViewModal && selectedRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay-enter">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-content-enter">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Details TPE' : 'TPE Details'} - {selectedRow.serial}
              </h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {Object.entries(selectedRow).filter(([k]) => k !== 'id').map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{key.replace(/_/g, ' ')}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{String(value ?? '-')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay-enter">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-content-enter">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing ? (language === 'fr' ? 'Modifier TPE' : 'Edit TPE') : (language === 'fr' ? 'Ajouter un TPE' : 'Add TPE')}
              </h3>
              <button onClick={() => { setShowAddModal(false); setIsEditing(false); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setFormError('');
              try {
                if (isEditing && selectedRow) {
                  await tpeApi.updateStock(selectedRow.id, formData as any);
                } else {
                  await tpeApi.createStock(formData as any);
                }
                setShowAddModal(false);
                setIsEditing(false);
                setFormData(emptyForm);
                refetch();
              } catch (err: any) {
                const msg = err?.response?.data?.message || err?.response?.data?.errors?.map((e: any) => e.message).join(', ') || err?.message || 'Error';
                setFormError(msg);
              }
            }} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'district', label: language === 'fr' ? 'District' : 'District', type: 'select', options: ['Alger', 'Oran', 'Constantine', 'Annaba', 'Setif'] },
                  { key: 'structure_code', label: language === 'fr' ? 'Code Structure' : 'Structure Code', type: 'text' },
                  { key: 'structure_name', label: language === 'fr' ? 'Nom Structure' : 'Structure Name', type: 'text' },
                  { key: 'stationCode', label: language === 'fr' ? 'Code Station' : 'Station Code', type: 'text' },
                  { key: 'station_name', label: language === 'fr' ? 'Nom Station' : 'Station Name', type: 'text' },
                  { key: 'address', label: language === 'fr' ? 'Adresse' : 'Address', type: 'text' },
                  { key: 'serial', label: language === 'fr' ? 'N° Serie TPE' : 'TPE Serial #', type: 'text' },
                  { key: 'model', label: language === 'fr' ? 'Modele' : 'Model', type: 'model-select' },
                  { key: 'purchase_price', label: language === 'fr' ? 'Prix Achat' : 'Purchase Price', type: 'text' },
                  { key: 'operator', label: language === 'fr' ? 'Operateur' : 'Operator', type: 'select', options: TPE_OPERATORS },
                  { key: 'sim_serial', label: language === 'fr' ? 'N° Serie SIM' : 'SIM Serial #', type: 'text' },
                  { key: 'sim_ip', label: language === 'fr' ? 'Adresse IP SIM' : 'SIM IP Address', type: 'text' },
                  { key: 'sim_phone', label: language === 'fr' ? 'N° Telephone SIM' : 'SIM Phone #', type: 'text' },
                  { key: 'reception_date', label: language === 'fr' ? 'Date Reception' : 'Reception Date', type: 'date' },
                  { key: 'delivery_date', label: language === 'fr' ? 'Date Livraison' : 'Delivery Date', type: 'date' },
                  { key: 'expiration_date', label: language === 'fr' ? 'Date Expiration' : 'Expiration Date', type: 'date' },
                  { key: 'assignment_type', label: language === 'fr' ? 'Type Affectation' : 'Assignment Type', type: 'select', options: ASSIGNMENT_TYPES },
                  { key: 'card_numbers', label: language === 'fr' ? 'N° Cartes Gestion' : 'Management Card #', type: 'text' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                    {field.type === 'model-select' ? (
                      <select
                        value={(formData as any)[field.key]}
                        onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--naftal-blue)]"
                      >
                        <option value="">{language === 'fr' ? 'Selectionner...' : 'Select...'}</option>
                        {TPE_MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                    ) : field.type === 'select' ? (
                      <select
                        value={(formData as any)[field.key]}
                        onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--naftal-blue)]"
                      >
                        <option value="">{language === 'fr' ? 'Selectionner...' : 'Select...'}</option>
                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={(formData as any)[field.key]}
                        onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--naftal-blue)]"
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                {formError && (
                  <p className="flex-1 text-sm text-red-600 dark:text-red-400 self-center">{formError}</p>
                )}
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
    </DashboardLayout>
  );
};

export default TPEStock;
