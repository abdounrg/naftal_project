import { useState, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import { useLanguage } from '../../context/LanguageContext';
import { chargersApi } from '../../lib/api';
import { useApiData } from '../../hooks/useApiData';
import { Zap, Power, Package, Hash, X, Eye, Trash2 } from 'lucide-react';

const ChargerStock = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'chargers' | 'bases'>('chargers');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [formData, setFormData] = useState({ model: '', tpeModel: '', quantity: '', serial: '' });

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
      {/* Total Items Pill */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2.5 px-6 py-3 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/25">
          <Package className="w-5 h-5 text-white/80" />
          <span className="text-sm font-bold text-white tracking-wide uppercase">
            {language === 'fr' ? 'Total Articles' : 'Total Items'}:{' '}
            {chargersData.reduce((s: number, d: any) => s + (Number(d.quantity) || 0), 0) + basesData.reduce((s: number, d: any) => s + (Number(d.quantity) || 0), 0)}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: language === 'fr' ? 'Total Chargeurs' : 'Total Chargers', value: String(chargersData.reduce((s: number, d: any) => s + (Number(d.quantity) || 0), 0)), icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: language === 'fr' ? 'Total Bases' : 'Total Bases', value: String(basesData.reduce((s: number, d: any) => s + (Number(d.quantity) || 0), 0)), icon: Power, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
          { label: language === 'fr' ? 'Modèles Chargeurs' : 'Charger Models', value: String(chargersData.length), icon: Hash, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: language === 'fr' ? 'Modèles Bases' : 'Base Models', value: String(basesData.length), icon: Hash, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800/60 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-slate-900 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('chargers')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'chargers'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          {language === 'fr' ? 'Chargeurs' : 'Chargers'}
        </button>
        <button
          onClick={() => setActiveTab('bases')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'bases'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <Power className="w-4 h-4" />
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
        section="charger_stock"
        onAdd={() => { setIsEditing(false); setSelectedRow(null); setFormData({ model: '', tpeModel: '', quantity: '', serial: '' }); setShowAddModal(true); }}
        onEdit={(row) => { setIsEditing(true); setSelectedRow(row); setFormData({ model: row.model||'', tpeModel: row.tpe_model||row.tpeModel||'', quantity: String(row.quantity||''), serial: row.serial||'' }); setShowAddModal(true); }}
        onView={(row) => { setSelectedRow(row); setShowViewModal(true); }}
        onDelete={async (row) => { if(activeTab==='chargers'){await chargersApi.deleteStock(row.id);refetchChargers();}else{await chargersApi.deleteBase(row.id);refetchBases();} }}
        filters={activeTab === 'chargers' ? [
          { key: 'model', label: language === 'fr' ? 'Modele' : 'Model', type: 'text' },
          { key: 'tpe_model', label: language === 'fr' ? 'Modele TPE' : 'TPE Model', type: 'select', options: ['IWIL 250', 'MOVE 2500', 'NewPos'] },
        ] : [
          { key: 'model', label: language === 'fr' ? 'Modele' : 'Model', type: 'text' },
        ]}
      />

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-800/60/50 max-w-lg w-full">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEditing ? 'bg-amber-500/10' : 'bg-blue-500/10'}`}>
                  {activeTab === 'chargers'
                    ? <Zap className={`w-5 h-5 ${isEditing ? 'text-amber-500' : 'text-blue-500'}`} />
                    : <Power className={`w-5 h-5 ${isEditing ? 'text-amber-500' : 'text-cyan-500'}`} />
                  }
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isEditing 
                      ? (activeTab === 'chargers' ? (language === 'fr' ? 'Modifier le Chargeur' : 'Edit Charger') : (language === 'fr' ? 'Modifier la Base' : 'Edit Base'))
                      : (activeTab === 'chargers' ? (language === 'fr' ? 'Ajouter un Chargeur' : 'Add Charger') : (language === 'fr' ? 'Ajouter une Base' : 'Add Base'))
                    }
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isEditing
                      ? (language === 'fr' ? 'Mettre à jour les informations' : 'Update information')
                      : (language === 'fr' ? 'Remplir les informations' : 'Fill in the details')}
                  </p>
                </div>
              </div>
              <button aria-label="Close" onClick={() => { setShowAddModal(false); setIsEditing(false); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={async (e) => { e.preventDefault(); if (isEditing && selectedRow) { if (activeTab === 'chargers') { await chargersApi.updateStock(selectedRow.id, formData); refetchChargers(); } else { await chargersApi.updateBase(selectedRow.id, formData); refetchBases(); } } else { if (activeTab === 'chargers') { await chargersApi.createStock(formData); refetchChargers(); } else { await chargersApi.createBase(formData); refetchBases(); } } setShowAddModal(false); setIsEditing(false); }} className="p-6 space-y-4">
              {activeTab === 'chargers' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Modèle Chargeur' : 'Charger Model'} <span className="text-red-400">*</span></label>
                    <input type="text" aria-label="Charger Model" value={formData.model} onChange={e => setFormData(p => ({ ...p, model: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Modèle TPE' : 'TPE Model'}</label>
                    <select aria-label="TPE Model" value={formData.tpeModel} onChange={e => setFormData(p => ({ ...p, tpeModel: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow">
                      <option value="">{language === 'fr' ? 'Sélectionner...' : 'Select...'}</option>
                      <option value="IWIL 250">IWIL 250</option>
                      <option value="MOVE 2500">MOVE 2500</option>
                      <option value="NewPos">NewPos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Quantité' : 'Quantity'} <span className="text-red-400">*</span></label>
                    <input type="number" aria-label="Quantity" min="0" value={formData.quantity} onChange={e => setFormData(p => ({ ...p, quantity: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'N° Série' : 'Serial #'}</label>
                    <input type="text" aria-label="Serial" value={formData.serial} onChange={e => setFormData(p => ({ ...p, serial: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Modèle' : 'Model'} <span className="text-red-400">*</span></label>
                    <input type="text" aria-label="Model" value={formData.model} onChange={e => setFormData(p => ({ ...p, model: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'fr' ? 'Quantité' : 'Quantity'} <span className="text-red-400">*</span></label>
                    <input type="number" aria-label="Quantity" min="0" value={formData.quantity} onChange={e => setFormData(p => ({ ...p, quantity: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow" />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800/60">
                <button type="button" onClick={() => { setShowAddModal(false); setIsEditing(false); }} className="px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button type="submit" className="px-5 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-all shadow-md shadow-blue-500/20 active:scale-[0.98]">
                  {isEditing ? (language === 'fr' ? 'Mettre à jour' : 'Update') : (language === 'fr' ? 'Enregistrer' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showViewModal && selectedRow && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-800/60/50 max-w-md w-full">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{language === 'fr' ? 'Détails' : 'Details'}</h3>
              </div>
              <button aria-label="Close" onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {(activeTab === 'chargers' ? [
                { label: language === 'fr' ? 'Modele Chargeur' : 'Charger Model', value: selectedRow.model },
                { label: language === 'fr' ? 'Modele TPE' : 'TPE Model', value: selectedRow.tpe_model },
                { label: language === 'fr' ? 'Quantite' : 'Quantity', value: selectedRow.quantity },
              ] : [
                { label: language === 'fr' ? 'N° Serie' : 'Serial', value: selectedRow.serial },
                { label: language === 'fr' ? 'Modele' : 'Model', value: selectedRow.model },
                { label: language === 'fr' ? 'Quantite' : 'Quantity', value: selectedRow.quantity },
              ]).map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-slate-800/60/40 last:border-0">
                  <span className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase">{item.label}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value || '-'}</span>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-slate-800/60 flex justify-end">
              <button onClick={() => setShowViewModal(false)}
                className="px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                {language === 'fr' ? 'Fermer' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ChargerStock;
