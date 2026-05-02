import { useState, useCallback, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import { useLanguage } from '../../context/LanguageContext';
import { structuresApi } from '../../lib/api';
import { useApiData } from '../../hooks/useApiData';
import { usePermissions } from '../../hooks/usePermissions';
import { X, Building2, MapPin, Trash2, Lock } from 'lucide-react';

const StructureManagement = () => {
  const { language } = useLanguage();
  const { can } = usePermissions();

  // Granular permissions — each section gated independently.
  const canViewStructures   = can('structures', 'view');
  const canCreateStructures = can('structures', 'create');
  const canEditStructures   = can('structures', 'edit');
  const canDeleteStructures = can('structures', 'delete');

  const canViewStations   = can('stations', 'view');
  const canCreateStations = can('stations', 'create');
  const canEditStations   = can('stations', 'edit');
  const canDeleteStations = can('stations', 'delete');

  // Default to the first tab the user can actually see
  const [activeTab, setActiveTab] = useState<'structures' | 'stations'>(
    canViewStructures ? 'structures' : 'stations'
  );

  // Keep tab valid if permissions change at runtime
  useEffect(() => {
    if (activeTab === 'structures' && !canViewStructures && canViewStations) {
      setActiveTab('stations');
    } else if (activeTab === 'stations' && !canViewStations && canViewStructures) {
      setActiveTab('structures');
    }
  }, [activeTab, canViewStructures, canViewStations]);

  // ─── Modal state ───
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // ─── Data fetching ───
  const fetchStructures = useCallback(() => structuresApi.getStructures({ per_page: 1000 }), []);
  const { data: structures, refetch: refetchStructures } = useApiData<any>({ fetchFn: fetchStructures });
  const fetchStations = useCallback(() => structuresApi.getStations({ per_page: 1000 }), []);
  const { data: stations, refetch: refetchStations } = useApiData<any>({ fetchFn: fetchStations });
  const fetchDistricts = useCallback(() => structuresApi.getDistricts(), []);
  const { data: districts } = useApiData<any>({ fetchFn: fetchDistricts });

  // ─── Form state ───
  const emptyStructureForm = { districtId: '', code: '', name: '', type: 'agence', wilaya: '', address: '' };
  const emptyStationForm = { structureId: '', code: '', name: '', wilaya: '', address: '' };
  const [structureForm, setStructureForm] = useState(emptyStructureForm);
  const [stationForm, setStationForm] = useState(emptyStationForm);
  const [formError, setFormError] = useState('');

  // ─── Columns ───
  const structureColumns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: language === 'fr' ? 'Raison Sociale' : 'Company Name' },
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
          value === 'agence' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
          : value === 'antenne' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
          : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
        }`}>
          {value === 'agence' ? 'Agence'
            : value === 'antenne' ? 'Antenne'
            : 'Cellule'}
        </span>
      ),
    },
    {
      key: 'district',
      label: 'District',
      render: (value: any) => <span>{typeof value === 'object' && value ? value.name : (value || '-')}</span>,
    },
    { key: 'wilaya', label: language === 'fr' ? 'Wilaya' : 'Province' },
    { key: '_count_stations', label: language === 'fr' ? 'Nb Stations' : 'Stations' },
    { key: '_count_users', label: language === 'fr' ? 'Nb TPE' : 'TPE Count' },
  ];

  const stationColumns = [
    { key: 'code', label: language === 'fr' ? 'Code Station' : 'Station Code' },
    { key: 'name', label: language === 'fr' ? 'Raison Sociale' : 'Company Name' },
    {
      key: 'structure',
      label: 'Structure',
      render: (value: any) => <span>{typeof value === 'object' && value ? value.name : (value || '-')}</span>,
    },
    {
      key: 'district',
      label: 'District',
      render: (value: any) => <span>{typeof value === 'object' && value ? value.name : (value || '-')}</span>,
    },
    { key: 'wilaya', label: language === 'fr' ? 'Wilaya' : 'Province' },
    { key: 'address', label: language === 'fr' ? 'Adresse' : 'Address' },
    { key: '_count_tpes', label: language === 'fr' ? 'Nb TPE' : 'TPE Count' },
  ];

  // ─── Handlers ───
  const handleAdd = () => {
    setIsEditing(false);
    setSelectedRow(null);
    setFormError('');
    if (activeTab === 'structures') {
      setStructureForm(emptyStructureForm);
    } else {
      setStationForm(emptyStationForm);
    }
    setShowAddModal(true);
  };

  const handleEdit = (row: any) => {
    setIsEditing(true);
    setSelectedRow(row);
    setFormError('');
    if (activeTab === 'structures') {
      setStructureForm({
        districtId: String(row.districtId || (row.district && typeof row.district === 'object' ? row.district.id : '') || ''),
        code: row.code || '',
        name: row.name || '',
        type: row.type || 'agence',
        wilaya: row.wilaya || '',
        address: row.address || '',
      });
    } else {
      setStationForm({
        structureId: String(row.structureId || (row.structure && typeof row.structure === 'object' ? row.structure.id : '') || ''),
        code: row.code || '',
        name: row.name || '',
        wilaya: row.wilaya || '',
        address: row.address || '',
      });
    }
    setShowAddModal(true);
  };

  const handleView = (row: any) => {
    setSelectedRow(row);
    setShowViewModal(true);
  };

  const handleDelete = (row: any) => {
    setSelectedRow(row);
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const handleStructureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      districtId: parseInt(structureForm.districtId, 10),
      code: structureForm.code,
      name: structureForm.name,
      type: structureForm.type,
      wilaya: structureForm.wilaya || undefined,
      address: structureForm.address || undefined,
    };
    try {
      if (isEditing && selectedRow) {
        await structuresApi.updateStructure(selectedRow.id, payload);
      } else {
        await structuresApi.createStructure(payload);
      }
      setShowAddModal(false);
      setStructureForm(emptyStructureForm);
      setFormError('');
      refetchStructures();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err?.message || 'Error');
    }
  };

  const handleStationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      structureId: parseInt(stationForm.structureId, 10),
      code: stationForm.code,
      name: stationForm.name,
      wilaya: stationForm.wilaya || undefined,
      address: stationForm.address || undefined,
    };
    try {
      if (isEditing && selectedRow) {
        await structuresApi.updateStation(selectedRow.id, payload);
      } else {
        await structuresApi.createStation(payload);
      }
      setShowAddModal(false);
      setStationForm(emptyStationForm);
      setFormError('');
      refetchStations();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err?.message || 'Error');
    }
  };

  const [deleteError, setDeleteError] = useState('');

  const confirmDelete = async () => {
    if (!selectedRow) return;
    setDeleteError('');
    try {
      if (activeTab === 'structures') {
        await structuresApi.deleteStructure(selectedRow.id);
        refetchStructures();
      } else {
        await structuresApi.deleteStation(selectedRow.id);
        refetchStations();
      }
      setShowDeleteModal(false);
      setSelectedRow(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || (language === 'fr' ? 'Erreur lors de la suppression' : 'Delete failed');
      setDeleteError(msg);
    }
  };

  const getDisplayValue = (val: any): string => {
    if (val == null) return '-';
    if (typeof val === 'object') return val.name || JSON.stringify(val);
    return String(val);
  };

  return (
    <DashboardLayout
      title={language === 'fr' ? 'Structures & Stations' : 'Structures & Stations'}
      subtitle={language === 'fr' ? 'Gestion des structures commerciales et points de vente' : 'Manage commercial structures and points of sale'}
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: language === 'fr' ? 'Total Structures' : 'Total Structures', value: String(structures.length), icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: language === 'fr' ? 'Agences' : 'Agencies', value: String(structures.filter((s: any) => s.type === 'agence').length), icon: Building2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: language === 'fr' ? 'Antennes' : 'Antennas', value: String(structures.filter((s: any) => s.type === 'antenne').length), icon: Building2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: language === 'fr' ? 'Total Stations' : 'Total Stations', value: String(stations.length), icon: MapPin, color: 'text-orange-500', bg: 'bg-orange-500/10' },
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

      {/* Tab Switcher — polished pill style with sliding active indicator */}
      <div
        role="tablist"
        aria-label={language === 'fr' ? 'Vue Structures ou Stations' : 'Structures or Stations view'}
        className="inline-flex gap-1 mb-6 p-1 bg-gray-100/80 dark:bg-slate-900/70 rounded-xl border border-gray-200/60 dark:border-slate-800/60 shadow-sm"
      >
        {canViewStructures && (
          <button
            role="tab"
            aria-selected={activeTab === 'structures'}
            onClick={() => setActiveTab('structures')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
              activeTab === 'structures'
                ? 'bg-white dark:bg-slate-800 text-[var(--naftal-blue)] shadow-sm ring-1 ring-black/5 dark:ring-white/5'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-white/40 dark:hover:bg-slate-800/40'
            }`}
          >
            <Building2 className="w-4 h-4" />
            {language === 'fr' ? 'Structures' : 'Structures'}
          </button>
        )}
        {canViewStations && (
          <button
            role="tab"
            aria-selected={activeTab === 'stations'}
            onClick={() => setActiveTab('stations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
              activeTab === 'stations'
                ? 'bg-white dark:bg-slate-800 text-[var(--naftal-blue)] shadow-sm ring-1 ring-black/5 dark:ring-white/5'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-white/40 dark:hover:bg-slate-800/40'
            }`}
          >
            <MapPin className="w-4 h-4" />
            {language === 'fr' ? 'Stations' : 'Stations'}
          </button>
        )}
      </div>

      {/* Data Table */}
      {activeTab === 'structures' ? (
        <>
          {!canCreateStructures && !canEditStructures && !canDeleteStructures && (
            <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-300">
                  {language === 'fr' ? 'Accès en lecture seule' : 'Read-only access'}
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  {language === 'fr'
                    ? 'Vous pouvez consulter les structures mais pas les modifier.'
                    : 'You can view structures but not modify them.'}
                </p>
              </div>
            </div>
          )}
          <DataTable
            columns={structureColumns}
            data={structures}
            title={language === 'fr' ? 'Liste des Structures' : 'Structure List'}
            section="structures"
            onAdd={canCreateStructures ? handleAdd : undefined}
            onEdit={canEditStructures ? handleEdit : undefined}
            onDelete={canDeleteStructures ? handleDelete : undefined}
            onView={handleView}
            filters={[
              { key: 'type', label: 'Type', type: 'select' as const, options: ['agence', 'antenne', 'cellule'] },
              { key: 'district', label: 'District', type: 'select' as const, options: [...new Set(structures.map((s: any) => typeof s.district === 'object' ? s.district?.name : s.district).filter(Boolean))] as string[] },
              { key: 'wilaya', label: 'Wilaya', type: 'select' as const, options: [...new Set(structures.map((s: any) => s.wilaya).filter(Boolean))] as string[] },
              { key: 'code', label: 'Code', type: 'text' as const },
            ]}
          />
        </>
      ) : (
        <DataTable
          columns={stationColumns}
          data={stations}
          title={language === 'fr' ? 'Liste des Stations' : 'Station List'}
          section="structures"
          onAdd={canCreateStations ? handleAdd : undefined}
          onEdit={canEditStations ? handleEdit : undefined}
          onDelete={canDeleteStations ? handleDelete : undefined}
          onView={handleView}
          filters={[
            { key: 'structure', label: 'Structure', type: 'select' as const, options: [...new Set(stations.map((s: any) => typeof s.structure === 'object' ? s.structure?.name : s.structure).filter(Boolean))] as string[] },
            { key: 'district', label: 'District', type: 'select' as const, options: [...new Set(stations.map((s: any) => typeof s.district === 'object' ? s.district?.name : s.district).filter(Boolean))] as string[] },
            { key: 'code', label: language === 'fr' ? 'Code Station' : 'Station Code', type: 'text' as const },
          ]}
        />
      )}

      {/* ─── Add/Edit Modal for Structures ─── */}
      {showAddModal && activeTab === 'structures' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-800/60/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEditing ? 'bg-amber-500/10' : 'bg-blue-500/10'}`}>
                  <Building2 className={`w-5 h-5 ${isEditing ? 'text-amber-500' : 'text-blue-500'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isEditing
                      ? (language === 'fr' ? 'Modifier la Structure' : 'Edit Structure')
                      : (language === 'fr' ? 'Ajouter une Structure' : 'Add Structure')}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isEditing
                      ? (language === 'fr' ? 'Mettre à jour les informations' : 'Update information')
                      : (language === 'fr' ? 'Créer une nouvelle structure' : 'Create a new structure')}
                  </p>
                </div>
              </div>
              <button aria-label="Close" onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleStructureSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District <span className="text-red-400">*</span></label>
                  <select aria-label="District" required value={structureForm.districtId} onChange={(e) => setStructureForm({ ...structureForm, districtId: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow">
                    <option value="">{language === 'fr' ? 'Sélectionner...' : 'Select...'}</option>
                    {districts.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code <span className="text-red-400">*</span></label>
                  <input type="text" aria-label="Code" required value={structureForm.code} onChange={(e) => setStructureForm({ ...structureForm, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'fr' ? 'Raison Sociale' : 'Company Name'} <span className="text-red-400">*</span>
                  </label>
                  <input type="text" aria-label="Company Name" required value={structureForm.name} onChange={(e) => setStructureForm({ ...structureForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type <span className="text-red-400">*</span></label>
                  <select aria-label="Type" required value={structureForm.type} onChange={(e) => setStructureForm({ ...structureForm, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow">
                    <option value="agence">{language === 'fr' ? 'Agence' : 'Agency'}</option>
                    <option value="antenne">{language === 'fr' ? 'Antenne' : 'Antenna'}</option>
                    <option value="cellule">Cellule</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'fr' ? 'Wilaya' : 'Province'}
                  </label>
                  <input type="text" aria-label="Wilaya" value={structureForm.wilaya} onChange={(e) => setStructureForm({ ...structureForm, wilaya: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'fr' ? 'Adresse' : 'Address'}
                  </label>
                  <input type="text" aria-label="Address" value={structureForm.address} onChange={(e) => setStructureForm({ ...structureForm, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow" />
                </div>
              </div>
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800/60">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 active:scale-[0.98]">
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button type="submit"
                  className="px-5 py-2.5 bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900">
                  {isEditing ? (language === 'fr' ? 'Mettre à jour' : 'Update') : (language === 'fr' ? 'Enregistrer' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Add/Edit Modal for Stations ─── */}
      {showAddModal && activeTab === 'stations' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-800/60/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEditing ? 'bg-amber-500/10' : 'bg-blue-500/10'}`}>
                  <MapPin className={`w-5 h-5 ${isEditing ? 'text-amber-500' : 'text-blue-500'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isEditing
                      ? (language === 'fr' ? 'Modifier la Station' : 'Edit Station')
                      : (language === 'fr' ? 'Ajouter une Station' : 'Add Station')}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isEditing
                      ? (language === 'fr' ? 'Mettre à jour les informations' : 'Update information')
                      : (language === 'fr' ? 'Créer un nouveau point de vente' : 'Create a new station')}
                  </p>
                </div>
              </div>
              <button aria-label="Close" onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleStationSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Structure <span className="text-red-400">*</span></label>
                  <select aria-label="Structure" required value={stationForm.structureId} onChange={(e) => setStationForm({ ...stationForm, structureId: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow">
                    <option value="">{language === 'fr' ? 'Sélectionner...' : 'Select...'}</option>
                    {structures.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code <span className="text-red-400">*</span></label>
                  <input type="text" aria-label="Code" required value={stationForm.code} onChange={(e) => setStationForm({ ...stationForm, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'fr' ? 'Raison Sociale' : 'Company Name'} <span className="text-red-400">*</span>
                  </label>
                  <input type="text" aria-label="Company Name" required value={stationForm.name} onChange={(e) => setStationForm({ ...stationForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'fr' ? 'Wilaya' : 'Province'}
                  </label>
                  <input type="text" aria-label="Wilaya" value={stationForm.wilaya} onChange={(e) => setStationForm({ ...stationForm, wilaya: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'fr' ? 'Adresse' : 'Address'}
                  </label>
                  <input type="text" aria-label="Address" value={stationForm.address} onChange={(e) => setStationForm({ ...stationForm, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow" />
                </div>
              </div>
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800/60">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 active:scale-[0.98]">
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button type="submit"
                  className="px-5 py-2.5 bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900">
                  {isEditing ? (language === 'fr' ? 'Mettre à jour' : 'Update') : (language === 'fr' ? 'Enregistrer' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── View Modal ─── */}
      {showViewModal && selectedRow && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-800/60/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  {activeTab === 'structures' ? <Building2 className="w-5 h-5 text-blue-500" /> : <MapPin className="w-5 h-5 text-blue-500" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {activeTab === 'structures'
                      ? (language === 'fr' ? 'Détails de la Structure' : 'Structure Details')
                      : (language === 'fr' ? 'Détails de la Station' : 'Station Details')}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedRow.name || selectedRow.code}</p>
                </div>
              </div>
              <button aria-label="Close" onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(activeTab === 'structures'
                  ? [
                      { label: 'Code', value: selectedRow.code },
                      { label: language === 'fr' ? 'Raison Sociale' : 'Name', value: selectedRow.name },
                      { label: 'Type', value: selectedRow.type === 'agence' ? 'Agence' : selectedRow.type === 'antenne' ? 'Antenne' : 'Cellule' },
                      { label: 'District', value: getDisplayValue(selectedRow.district) },
                      { label: language === 'fr' ? 'Wilaya' : 'Province', value: selectedRow.wilaya || '-' },
                      { label: language === 'fr' ? 'Adresse' : 'Address', value: selectedRow.address || '-' },
                      { label: language === 'fr' ? 'Nb Stations' : 'Stations', value: selectedRow._count?.stations ?? selectedRow._count_stations ?? '-' },
                    ]
                  : [
                      { label: 'Code', value: selectedRow.code },
                      { label: language === 'fr' ? 'Raison Sociale' : 'Name', value: selectedRow.name },
                      { label: 'Structure', value: getDisplayValue(selectedRow.structure) },
                      { label: 'District', value: getDisplayValue(selectedRow.district || (selectedRow.structure && typeof selectedRow.structure === 'object' ? selectedRow.structure.district : null)) },
                      { label: language === 'fr' ? 'Wilaya' : 'Province', value: selectedRow.wilaya || '-' },
                      { label: language === 'fr' ? 'Adresse' : 'Address', value: selectedRow.address || '-' },
                      { label: language === 'fr' ? 'Nb TPE' : 'TPE Count', value: selectedRow._count?.tpes ?? selectedRow._count_tpes ?? '-' },
                    ]
                ).map((field, index) => (
                  <div key={index} className="bg-gray-50/80 dark:bg-slate-800/30 rounded-xl p-3 border border-gray-100 dark:border-slate-800/60/40">
                    <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{field.label}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{getDisplayValue(field.value)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-slate-800/60 flex justify-end">
              <button onClick={() => setShowViewModal(false)}
                className="px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                {language === 'fr' ? 'Fermer' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {showDeleteModal && selectedRow && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-800/60/50 max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === 'fr' ? 'Confirmer la suppression' : 'Confirm Delete'}
                </h3>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/40">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {language === 'fr'
                    ? `Êtes-vous sûr de vouloir supprimer "${selectedRow.name}" (${selectedRow.code}) ?`
                    : `Are you sure you want to delete "${selectedRow.name}" (${selectedRow.code})?`}
                </p>
              </div>
              {deleteError && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400">{deleteError}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-slate-800/60 flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 active:scale-[0.98]">
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button onClick={confirmDelete}
                className="px-5 py-2.5 bg-gradient-to-b from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/35 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900">
                {language === 'fr' ? 'Supprimer' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StructureManagement;
