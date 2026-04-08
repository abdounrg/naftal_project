import { useState, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import { useLanguage } from '../../context/LanguageContext';
import { chargersApi } from '../../lib/api';
import { useApiData } from '../../hooks/useApiData';

const ChargerStock = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'chargers' | 'bases'>('chargers');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [formData, setFormData] = useState({ model: '', tpe_model: '', quantity: '', serial: '' });

  const fetchChargers = useCallback(() => chargersApi.getStock({ per_page: 1000 }), []);
  const { data: chargersData, refetch: refetchChargers } = useApiData<any>({ fetchFn: fetchChargers });
  const fetchBases = useCallback(() => chargersApi.getBases({ per_page: 1000 }), []);
  const { data: basesData, refetch: refetchBases } = useApiData<any>({ fetchFn: fetchBases });

  const chargerColumns = [
    { key: 'model', label: language === 'fr' ? 'Modele Chargeur' : 'Charger Model' },
    { key: 'tpe_model', label: language === 'fr' ? 'Modele TPE' : 'TPE Model' },
    { key: 'quantity', label: language === 'fr' ? 'Quantite' : 'Quantity' },
  ];

  const baseColumns = [
    { key: 'serial', label: language === 'fr' ? 'N° Serie' : 'Serial #' },
    { key: 'model', label: language === 'fr' ? 'Modele' : 'Model' },
    { key: 'quantity', label: language === 'fr' ? 'Quantite' : 'Quantity' },
  ];

  return (
    <DashboardLayout
      title={language === 'fr' ? 'Stock Chargeurs/Bases' : 'Charger/Base Stock'}
      subtitle={language === 'fr' ? 'Gestion du stock des chargeurs et bases' : 'Charger and base stock management'}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 grid-stagger">
        {[
          { label: language === 'fr' ? 'Total Chargeurs' : 'Total Chargers', value: String(chargersData.reduce((s: number, d: any) => s + (Number(d.quantity) || 0), 0)), color: 'bg-orange-500' },
          { label: language === 'fr' ? 'Total Bases' : 'Total Bases', value: String(basesData.reduce((s: number, d: any) => s + (Number(d.quantity) || 0), 0)), color: 'bg-cyan-500' },
          { label: language === 'fr' ? 'Modeles Chargeurs' : 'Charger Models', value: String(chargersData.length), color: 'bg-green-500' },
          { label: language === 'fr' ? 'Modeles Bases' : 'Base Models', value: String(basesData.length), color: 'bg-blue-500' },
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
          {language === 'fr' ? 'Chargeurs' : 'Chargers'}
        </button>
        <button
          onClick={() => setActiveTab('bases')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'bases'
              ? 'bg-[var(--naftal-blue)] text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          {language === 'fr' ? 'Bases' : 'Bases'}
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={activeTab === 'chargers' ? chargerColumns : baseColumns}
        data={activeTab === 'chargers' ? chargersData : basesData}
        title={activeTab === 'chargers' 
          ? (language === 'fr' ? 'Liste des Chargeurs' : 'Charger List')
          : (language === 'fr' ? 'Liste des Bases' : 'Base List')
        }
        onAdd={() => { setIsEditing(false); setSelectedRow(null); setFormData({ model: '', tpe_model: '', quantity: '', serial: '' }); setShowAddModal(true); }}
        onEdit={(row) => { setIsEditing(true); setSelectedRow(row); setFormData({ model: row.model||'', tpe_model: row.tpe_model||'', quantity: String(row.quantity||''), serial: row.serial||'' }); setShowAddModal(true); }}
        onView={(row) => { setSelectedRow(row); setShowViewModal(true); }}
        onDelete={async (row) => { if(activeTab==='chargers'){await chargersApi.deleteStock(row.id);refetchChargers();}else{await chargersApi.deleteStock(row.id);refetchBases();} }}
        filters={activeTab === 'chargers' ? [
          { key: 'model', label: language === 'fr' ? 'Modele' : 'Model', type: 'text' },
          { key: 'tpe_model', label: language === 'fr' ? 'Modele TPE' : 'TPE Model', type: 'select', options: ['IWIL 250', 'MOVE 2500', 'NewPos'] },
        ] : [
          { key: 'model', label: language === 'fr' ? 'Modele' : 'Model', type: 'text' },
        ]}
      />

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay-enter">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full modal-content-enter">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing 
                  ? (activeTab === 'chargers' ? (language === 'fr' ? 'Modifier le Chargeur' : 'Edit Charger') : (language === 'fr' ? 'Modifier la Base' : 'Edit Base'))
                  : (activeTab === 'chargers' ? (language === 'fr' ? 'Ajouter un Chargeur' : 'Add Charger') : (language === 'fr' ? 'Ajouter une Base' : 'Add Base'))
                }
              </h3>
              <button onClick={() => { setShowAddModal(false); setIsEditing(false); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <form onSubmit={async (e) => { e.preventDefault(); if (isEditing && selectedRow) { if (activeTab === 'chargers') { await chargersApi.updateStock(selectedRow.id, formData); refetchChargers(); } else { await chargersApi.updateBase(selectedRow.id, formData); refetchBases(); } } else { if (activeTab === 'chargers') { await chargersApi.createStock(formData); refetchChargers(); } else { await chargersApi.createBase(formData); refetchBases(); } } setShowAddModal(false); setIsEditing(false); }} className="p-6 space-y-4">
              {activeTab === 'chargers' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Modele Chargeur' : 'Charger Model'}</label>
                    <input type="text" value={formData.model} onChange={e => setFormData(p => ({ ...p, model: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--naftal-blue)]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Modele TPE' : 'TPE Model'}</label>
                    <select value={formData.tpe_model} onChange={e => setFormData(p => ({ ...p, tpe_model: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--naftal-blue)]">
                      <option value="">{language === 'fr' ? 'Selectionner...' : 'Select...'}</option>
                      <option value="IWIL 250">IWIL 250</option>
                      <option value="MOVE 2500">MOVE 2500</option>
                      <option value="NewPos">NewPos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Quantite' : 'Quantity'}</label>
                    <input type="number" value={formData.quantity} onChange={e => setFormData(p => ({ ...p, quantity: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--naftal-blue)]" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'N° Serie' : 'Serial #'}</label>
                    <input type="text" value={formData.serial} onChange={e => setFormData(p => ({ ...p, serial: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--naftal-blue)]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Modele' : 'Model'}</label>
                    <input type="text" value={formData.model} onChange={e => setFormData(p => ({ ...p, model: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--naftal-blue)]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Quantite' : 'Quantity'}</label>
                    <input type="number" value={formData.quantity} onChange={e => setFormData(p => ({ ...p, quantity: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--naftal-blue)]" />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{language==='fr'?'Details':'Details'}</h3>
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

export default ChargerStock;
