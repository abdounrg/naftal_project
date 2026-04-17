import { useState, useCallback, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import { useLanguage } from '../../context/LanguageContext';
import { usersApi, structuresApi } from '../../lib/api';
import { useApiData } from '../../hooks/useApiData';
import { X, UserPlus, Shield, Building2 } from 'lucide-react';

type UserRole = 'administrator' | 'dpe_member' | 'district_member' | 'agency_member' | 'antenna_member';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  district: string;
  structure: string;
  station: string;
  status: string;
  created_at: string;
  last_login: string;
}

const UserManagement = () => {
  const { language } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchUsers = useCallback(() => usersApi.getAll({ per_page: 1000 }), []);
  const { data: users, refetch } = useApiData<User>({ fetchFn: fetchUsers });

  const emptyForm = { name: '', email: '', phone: '', password: '', role: 'agency_member' as UserRole, structureCode: '' };
  const [formData, setFormData] = useState(emptyForm);

  // Structure code lookup
  const [structureName, setStructureName] = useState('');
  const [structureDistrict, setStructureDistrict] = useState('');
  const [structureLookupStatus, setStructureLookupStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');
  const structureTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const code = formData.structureCode.trim();
    if (code.length < 3) {
      setStructureName('');
      setStructureDistrict('');
      setStructureLookupStatus('idle');
      return;
    }
    setStructureLookupStatus('loading');
    clearTimeout(structureTimerRef.current);
    structureTimerRef.current = setTimeout(async () => {
      try {
        const res = await structuresApi.lookupStructureByCode(code);
        const data = res.data?.data;
        if (data) {
          setStructureName(data.name);
          setStructureDistrict(data.district?.name || '');
          setStructureLookupStatus('found');
        } else {
          setStructureName('');
          setStructureDistrict('');
          setStructureLookupStatus('not-found');
        }
      } catch {
        setStructureName('');
        setStructureDistrict('');
        setStructureLookupStatus('not-found');
      }
    }, 400);
    return () => clearTimeout(structureTimerRef.current);
  }, [formData.structureCode]);

  const roleLabels: Record<UserRole, { fr: string; en: string; color: string }> = {
    administrator: { fr: 'Administrateur', en: 'Administrator', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    dpe_member: { fr: 'Membre DPE', en: 'DPE Member', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    district_member: { fr: 'Membre District', en: 'District Member', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
    agency_member: { fr: 'Membre Agence', en: 'Agency Member', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    antenna_member: { fr: 'Membre Antenne', en: 'Antenna Member', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && selectedUser) {
        const updateData: Record<string, unknown> = { name: formData.name, email: formData.email, phone: formData.phone, role: formData.role, structureCode: formData.structureCode || undefined };
        if (formData.password) updateData.password = formData.password;
        await usersApi.update(selectedUser.id, updateData);
      } else {
        await usersApi.create({ name: formData.name, email: formData.email, phone: formData.phone, password: formData.password, role: formData.role, structureCode: formData.structureCode || undefined });
      }
      setShowAddModal(false);
      setSelectedUser(null);
      setIsEditing(false);
      setFormData(emptyForm);
      setStructureName('');
      setStructureDistrict('');
      setStructureLookupStatus('idle');
      refetch();
    } catch (err) {
      console.error('Failed to save user:', err);
    }
  };

  const handleEdit = (row: User) => {
    setSelectedUser(row);
    setIsEditing(true);
    const sCode = typeof row.structure === 'object' && row.structure ? (row.structure as any).code : '';
    const sName = typeof row.structure === 'object' && row.structure ? (row.structure as any).name : (row.structure || '');
    const dName = typeof row.district === 'object' && row.district ? (row.district as any).name : (row.district || '');
    setStructureName(sName);
    setStructureDistrict(dName);
    if (sCode) setStructureLookupStatus('found');
    setFormData({ name: row.name, email: row.email, phone: row.phone || '', password: '', role: row.role, structureCode: sCode });
    setShowAddModal(true);
  };

  const handleDelete = async (row: User) => {
    await usersApi.delete(row.id);
    refetch();
  };

  const columns = [
    { key: 'name', label: language === 'fr' ? 'Nom' : 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: language === 'fr' ? 'Telephone' : 'Phone' },
    {
      key: 'role',
      label: language === 'fr' ? 'Role' : 'Role',
      render: (value: UserRole) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleLabels[value]?.color || ''}`}>
          {language === 'fr' ? roleLabels[value]?.fr : roleLabels[value]?.en}
        </span>
      ),
    },
    { key: 'district', label: 'District', render: (value: any) => <span>{typeof value === 'object' && value ? value.name : (value || '-')}</span> },
    { key: 'structure', label: language === 'fr' ? 'Structure' : 'Structure', render: (value: any) => <span>{typeof value === 'object' && value ? value.name : (value || '-')}</span> },
    {
      key: 'status',
      label: language === 'fr' ? 'Statut' : 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          value === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
        }`}>
          {value === 'active' ? (language === 'fr' ? 'Actif' : 'Active') :
           value === 'pending' ? (language === 'fr' ? 'En attente' : 'Pending') :
           (language === 'fr' ? 'Inactif' : 'Inactive')}
        </span>
      ),
    },
  ];

  return (
    <DashboardLayout
      title={language === 'fr' ? 'Gestion des Utilisateurs' : 'User Management'}
      subtitle={language === 'fr' ? 'Gerer les utilisateurs et leurs privileges' : 'Manage users and their privileges'}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 grid-stagger">
        {[
          { label: language === 'fr' ? 'Total Utilisateurs' : 'Total Users', value: String(users.length), color: 'bg-blue-500', icon: UserPlus },
          { label: language === 'fr' ? 'Administrateurs' : 'Administrators', value: String(users.filter(u => u.role === 'administrator').length), color: 'bg-red-500', icon: Shield },
          { label: language === 'fr' ? 'Membres DPE' : 'DPE Members', value: String(users.filter(u => u.role === 'dpe_member').length), color: 'bg-blue-500', icon: Building2 },
          { label: language === 'fr' ? 'Actifs' : 'Active', value: String(users.filter(u => u.status === 'active').length), color: 'bg-green-500', icon: UserPlus },
          { label: language === 'fr' ? 'En Attente' : 'Pending', value: String(users.filter(u => u.status === 'pending').length), color: 'bg-yellow-500', icon: UserPlus },
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

      {/* Role Privilege Matrix */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {language === 'fr' ? 'Matrice des Privileges' : 'Privilege Matrix'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-gray-400">{language === 'fr' ? 'Role' : 'Role'}</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-500 dark:text-gray-400">{language === 'fr' ? 'Consultation' : 'View'}</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-500 dark:text-gray-400">{language === 'fr' ? 'Saisie' : 'Data Entry'}</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-500 dark:text-gray-400">{language === 'fr' ? 'Perimetre' : 'Scope'}</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-500 dark:text-gray-400">{language === 'fr' ? 'Parametres App' : 'App Settings'}</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-500 dark:text-gray-400">{language === 'fr' ? 'Gestion Utilisateurs' : 'User Mgmt'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {[
                { role: language === 'fr' ? 'Administrateur' : 'Administrator', view: true, entry: true, scope: language === 'fr' ? 'Toutes structures' : 'All structures', settings: true, users: true },
                { role: language === 'fr' ? 'Membre DPE' : 'DPE Member', view: true, entry: true, scope: language === 'fr' ? 'Toutes structures' : 'All structures', settings: false, users: false },
                { role: language === 'fr' ? 'Membre District' : 'District Member', view: true, entry: true, scope: language === 'fr' ? 'District + agences/antennes' : 'District + agencies/antennas', settings: true, users: true },
                { role: language === 'fr' ? 'Membre Agence' : 'Agency Member', view: true, entry: true, scope: language === 'fr' ? 'Donnees agence' : 'Agency data', settings: false, users: false },
                { role: language === 'fr' ? 'Membre Antenne' : 'Antenna Member', view: true, entry: true, scope: language === 'fr' ? 'Donnees antenne' : 'Antenna data', settings: false, users: false },
              ].map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.role}</td>
                  <td className="px-4 py-3 text-center">{row.view ? '✅' : '❌'}</td>
                  <td className="px-4 py-3 text-center">{row.entry ? '✅' : '❌'}</td>
                  <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{row.scope}</td>
                  <td className="px-4 py-3 text-center">{row.settings ? '✅' : '❌'}</td>
                  <td className="px-4 py-3 text-center">{row.users ? '✅' : '❌'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={users}
        title={language === 'fr' ? 'Liste des Utilisateurs' : 'User List'}
        onAdd={() => { setIsEditing(false); setSelectedUser(null); setFormData(emptyForm); setShowAddModal(true); }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={(row) => { setSelectedUser(row); setShowViewModal(true); }}
      />

      {/* Add/Edit User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay-enter">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-content-enter">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing
                  ? (language === 'fr' ? 'Modifier Utilisateur' : 'Edit User')
                  : (language === 'fr' ? 'Ajouter un Utilisateur' : 'Add User')}
              </h3>
              <button onClick={() => { setShowAddModal(false); setSelectedUser(null); setIsEditing(false); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'fr' ? 'Nom complet' : 'Full Name'} *
                  </label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--naftal-blue)] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--naftal-blue)] focus:border-transparent" placeholder="email@naftal.dz" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'fr' ? 'Telephone' : 'Phone'} *
                  </label>
                  <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--naftal-blue)] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'fr' ? 'Mot de passe' : 'Password'} {!isEditing && '*'}
                  </label>
                  <input type="password" required={!isEditing} minLength={8} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={isEditing ? (language === 'fr' ? 'Laisser vide pour ne pas changer' : 'Leave blank to keep current') : ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--naftal-blue)] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'fr' ? 'Role' : 'Role'} *
                  </label>
                  <select required value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--naftal-blue)] focus:border-transparent">
                    {Object.entries(roleLabels).map(([key, val]) => (
                      <option key={key} value={key}>{language === 'fr' ? val.fr : val.en}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'fr' ? 'Code Structure' : 'Structure Code'} *
                  </label>
                  <input type="text" required maxLength={4} value={formData.structureCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4);
                      setFormData({ ...formData, structureCode: val });
                    }}
                    placeholder="ex: 2616"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--naftal-blue)] focus:border-transparent" />
                  {structureLookupStatus === 'loading' && (
                    <p className="text-xs text-blue-500 mt-1">{language === 'fr' ? 'Recherche...' : 'Searching...'}</p>
                  )}
                  {structureLookupStatus === 'not-found' && (
                    <p className="text-xs text-red-500 mt-1">{language === 'fr' ? 'Structure non trouvee' : 'Structure not found'}</p>
                  )}
                  {structureLookupStatus === 'found' && (
                    <p className="text-xs text-green-600 mt-1">{structureName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'fr' ? 'Nom Structure' : 'Structure Name'}
                  </label>
                  <input type="text" readOnly tabIndex={-1} value={structureName}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District</label>
                  <input type="text" readOnly tabIndex={-1} value={structureDistrict}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => { setShowAddModal(false); setSelectedUser(null); setIsEditing(false); }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button type="submit"
                  className="px-4 py-2 bg-[var(--naftal-blue)] text-white rounded-lg hover:bg-[var(--naftal-dark-blue)] transition-colors">
                  {language === 'fr' ? 'Enregistrer' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay-enter">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full modal-content-enter">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Details Utilisateur' : 'User Details'}
              </h3>
              <button onClick={() => { setShowViewModal(false); setSelectedUser(null); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--naftal-blue)] to-[var(--naftal-dark-blue)] flex items-center justify-center text-white text-xl font-bold">
                  {selectedUser.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedUser.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleLabels[selectedUser.role]?.color || ''}`}>
                    {language === 'fr' ? roleLabels[selectedUser.role]?.fr : roleLabels[selectedUser.role]?.en}
                  </span>
                </div>
              </div>
              {[
                { label: 'Email', value: selectedUser.email },
                { label: language === 'fr' ? 'Telephone' : 'Phone', value: selectedUser.phone },
                { label: 'District', value: typeof selectedUser.district === 'object' && selectedUser.district ? (selectedUser.district as any).name : selectedUser.district },
                { label: 'Structure', value: typeof selectedUser.structure === 'object' && selectedUser.structure ? (selectedUser.structure as any).name : selectedUser.structure },
                { label: 'Station', value: typeof selectedUser.station === 'object' && selectedUser.station ? (selectedUser.station as any).name : selectedUser.station },
                { label: language === 'fr' ? 'Date creation' : 'Created', value: selectedUser.created_at },
                { label: language === 'fr' ? 'Derniere connexion' : 'Last Login', value: selectedUser.last_login },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UserManagement;
