import { useState, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import { useLanguage } from '../../context/LanguageContext';
import { structuresApi } from '../../lib/api';
import { useApiData } from '../../hooks/useApiData';
import { X, Building2, MapPin } from 'lucide-react';

const StructureManagement = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'structures' | 'stations'>('structures');

  // ─── Modal state ───
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'agence' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
          : value === 'antenne' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
          : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
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
    {
      key: 'status',
      label: language === 'fr' ? 'Statut' : 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
        }`}>{value === 'active' ? (language === 'fr' ? 'Actif' : 'Active') : (language === 'fr' ? 'Inactif' : 'Inactive')}</span>
      ),
    },
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
    {
      key: 'status',
      label: language === 'fr' ? 'Statut' : 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
        }`}>{value === 'active' ? (language === 'fr' ? 'Actif' : 'Active') : (language === 'fr' ? 'Inactif' : 'Inactive')}</span>
      ),
    },
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 grid-stagger">
        {[
          { label: language === 'fr' ? 'Total Structures' : 'Total Structures', value: String(structures.length), color: 'bg-blue-500', icon: Building2 },
          { label: language === 'fr' ? 'Agences' : 'Agencies', value: String(structures.filter((s: any) => s.type === 'agence').length), color: 'bg-green-500', icon: Building2 },
          { label: language === 'fr' ? 'Antennes' : 'Antennas', value: String(structures.filter((s: any) => s.type === 'antenne').length), color: 'bg-purple-500', icon: Building2 },
          { label: language === 'fr' ? 'Total Stations' : 'Total Stations', value: String(stations.length), color: 'bg-orange-500', icon: MapPin },
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 stat-card">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('structures')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'structures'
              ? 'bg-[var(--naftal-blue)] text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Building2 className="w-4 h-4 inline mr-2" />
          {language === 'fr' ? 'Structures Commerciales' : 'Commercial Structures'}
        </button>
        <button
          onClick={() => setActiveTab('stations')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'stations'
              ? 'bg-[var(--naftal-blue)] text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <MapPin className="w-4 h-4 inline mr-2" />
          {language === 'fr' ? 'Points de Vente (Stations)' : 'Points of Sale (Stations)'}
        </button>
      </div>

      {/* Data Table */}
      {activeTab === 'structures' ? (
        <DataTable
          columns={structureColumns}
          data={structures}
          title={language === 'fr' ? 'Liste des Structures' : 'Structure List'}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      ) : (
        <DataTable
          columns={stationColumns}
          data={stations}
          title={language === 'fr' ? 'Liste des Stations' : 'Station List'}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      )}

      {/* ─── Add/Edit Modal for Structures ─── */}
      {showAddModal && activeTab === 'structures' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay-enter">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-content-enter">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing
                  ? (language === 'fr' ? 'Modifier la Structure' : 'Edit Structure')
                  : (language === 'fr' ? 'Ajouter une Structure' : 'Add Structure')}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleStructureSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District *</label>
                  <select required value={structureForm.districtId} onChange={(e) => setStructureForm({ ...structureForm, districtId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--naftal-blue)]">
                    <option value="">{language === 'fr' ? 'Sélectionner...' : 'Select...'}</option>
                    {districts.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code *</label>
                  <input type="text" required value={structureForm.code} onChange={(e) => setStructureForm({ ...structureForm, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--naftal-blue)]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'fr' ? 'Raison Sociale' : 'Company Name'} *
                  </label>
                  <input type="text" required value={structureForm.name} onChange={(e) => setStructureForm({ ...structureForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--naftal-blue)]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
                  <select required value={structureForm.type} onChange={(e) => setStructureForm({ ...structureForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--naftal-blue)]">
                    <option value="agence">{language === 'fr' ? 'Agence' : 'Agency'}</option>
                    <option value="antenne">{language === 'fr' ? 'Antenne' : 'Antenna'}</option>
                    <option value="cellule">Cellule</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'fr' ? 'Wilaya' : 'Province'}
                  </label>
                  <input type="text" value={structureForm.wilaya} onChange={(e) => setStructureForm({ ...structureForm, wilaya: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--naftal-blue)]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'fr' ? 'Adresse' : 'Address'}
                  </label>
                  <input type="text" value={structureForm.address} onChange={(e) => setStructureForm({ ...structureForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--naftal-blue)]" />
                </div>
              </div>
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button type="submit"
                  className="px-4 py-2 bg-[var(--naftal-blue)] text-white rounded-lg hover:bg-[var(--naftal-dark-blue)] transition-colors">
                  {isEditing ? (language === 'fr' ? 'Mettre à jour' : 'Update') : (language === 'fr' ? 'Enregistrer' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Add/Edit Modal for Stations ─── */}
      {showAddModal && activeTab === 'stations' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay-enter">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-content-enter">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing
                  ? (language === 'fr' ? 'Modifier la Station' : 'Edit Station')
                  : (language === 'fr' ? 'Ajouter une Station' : 'Add Station')}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleStationSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Structure *</label>
                  <select required value={stationForm.structureId} onChange={(e) => setStationForm({ ...stationForm, structureId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--naftal-blue)]">
                    <option value="">{language === 'fr' ? 'Sélectionner...' : 'Select...'}</option>
                    {structures.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code *</label>
                  <input type="text" required value={stationForm.code} onChange={(e) => setStationForm({ ...stationForm, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--naftal-blue)]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'fr' ? 'Raison Sociale' : 'Company Name'} *
                  </label>
                  <input type="text" required value={stationForm.name} onChange={(e) => setStationForm({ ...stationForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--naftal-blue)]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'fr' ? 'Wilaya' : 'Province'}
                  </label>
                  <input type="text" value={stationForm.wilaya} onChange={(e) => setStationForm({ ...stationForm, wilaya: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--naftal-blue)]" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'fr' ? 'Adresse' : 'Address'}
                  </label>
                  <input type="text" value={stationForm.address} onChange={(e) => setStationForm({ ...stationForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--naftal-blue)]" />
                </div>
              </div>
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button type="submit"
                  className="px-4 py-2 bg-[var(--naftal-blue)] text-white rounded-lg hover:bg-[var(--naftal-dark-blue)] transition-colors">
                  {isEditing ? (language === 'fr' ? 'Mettre à jour' : 'Update') : (language === 'fr' ? 'Enregistrer' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── View Modal ─── */}
      {showViewModal && selectedRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay-enter">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-content-enter">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {activeTab === 'structures'
                  ? (language === 'fr' ? 'Détails de la Structure' : 'Structure Details')
                  : (language === 'fr' ? 'Détails de la Station' : 'Station Details')}
              </h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{field.label}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{getDisplayValue(field.value)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button onClick={() => setShowViewModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                {language === 'fr' ? 'Fermer' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {showDeleteModal && selectedRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay-enter">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full modal-content-enter">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'fr' ? 'Confirmer la suppression' : 'Confirm Delete'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'fr'
                  ? `Êtes-vous sûr de vouloir supprimer "${selectedRow.name}" (${selectedRow.code}) ?`
                  : `Are you sure you want to delete "${selectedRow.name}" (${selectedRow.code})?`}
              </p>
              {deleteError && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{deleteError}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
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
