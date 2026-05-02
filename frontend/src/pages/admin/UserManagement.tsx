import { useState, useCallback, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import PermissionsModal from '../../components/PermissionsModal';
import { useLanguage } from '../../context/LanguageContext';
import { usersApi, structuresApi } from '../../lib/api';
import { useApiData } from '../../hooks/useApiData';
import { X, UserPlus, Shield, Building2, Users, Clock, CheckCircle, AlertCircle, Loader2, Check, Trash2 } from 'lucide-react';

type UserRole = 'administrator' | 'dpe_member' | 'district_member' | 'agency_member' | 'antenna_member';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  district?: string | { id?: number; name?: string; code?: string } | null;
  structure?: string | { id?: number; name?: string; code?: string } | null;
  status?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  last_login?: string;
  lastLoginAt?: string;
  requestedBy?: { id?: number; name?: string; email?: string } | null;
}

const UserManagement = () => {
  const { language } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [isLoadingUserDetails, setIsLoadingUserDetails] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const showActionError = (err: any, fallback: string) => {
    const msg = err?.response?.data?.message || err?.message || fallback;
    setActionError(msg);
  };

  const fetchUsers = useCallback(() => usersApi.getAll({ per_page: 1000 }), []);
  const { data: users, refetch } = useApiData<User>({ fetchFn: fetchUsers });
  const fetchPending = useCallback(() => usersApi.getPending({ per_page: 1000 }), []);
  const { data: pendingUsers, refetch: refetchPending } = useApiData<User>({ fetchFn: fetchPending });

  const emptyForm = { name: '', email: '', phone: '', password: '', role: 'agency_member' as UserRole, structureCode: '' };
  const [formData, setFormData] = useState(emptyForm);

  // Structure code lookup
  const [structureName, setStructureName] = useState('');
  const [structureDistrict, setStructureDistrict] = useState('');
  const [structureLookupStatus, setStructureLookupStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');
  const structureTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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

  const formatDateTime = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-GB');
  };

  const getEntityName = (value: unknown) => {
    if (typeof value === 'string') return value || '-';
    if (value && typeof value === 'object' && 'name' in (value as Record<string, unknown>)) {
      return String((value as { name?: string }).name || '-');
    }
    return '-';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
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
      showActionError(err, language === 'fr' ? "Impossible d'enregistrer l'utilisateur." : 'Failed to save user.');
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
    setActionError(null);
    try {
      await usersApi.delete(row.id);
      refetch();
    } catch (err) {
      console.error('Failed to delete user:', err);
      showActionError(err, language === 'fr' ? "Impossible de supprimer l'utilisateur." : 'Failed to delete user.');
    }
  };

  const handleApproveUser = async (userId: number) => {
    setActionError(null);
    setApprovingId(userId);
    try {
      await usersApi.approveUser(userId);
      refetchPending();
      refetch();
    } catch (err) {
      console.error('Failed to approve user:', err);
      showActionError(err, language === 'fr' ? "Impossible d'approuver l'utilisateur." : 'Failed to approve user.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectUser = async (userId: number) => {
    setActionError(null);
    setRejectingId(userId);
    try {
      await usersApi.rejectUser(userId);
      refetchPending();
      refetch();
    } catch (err) {
      console.error('Failed to reject user:', err);
      showActionError(err, language === 'fr' ? "Impossible de rejeter l'utilisateur." : 'Failed to reject user.');
    } finally {
      setRejectingId(null);
    }
  };

  const columns = [
    { key: 'name', label: language === 'fr' ? 'Nom' : 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: language === 'fr' ? 'Telephone' : 'Phone' },
    {
      key: 'role',
      label: language === 'fr' ? 'Role' : 'Role',
      render: (value: UserRole) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${roleLabels[value]?.color || ''}`}>
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
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
          value === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
          value === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
          'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-300'
        }`}>
          {value === 'active' ? (language === 'fr' ? 'Actif' : 'Active') :
           value === 'pending' ? (language === 'fr' ? 'En attente' : 'Pending') :
           (language === 'fr' ? 'Inactif' : 'Inactive')}
        </span>
      ),
    },
    {
      key: 'permissions',
      label: language === 'fr' ? 'Permissions' : 'Permissions',
      render: (_value: unknown, row: User) => (
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedUser(row); setShowPermissionsModal(true); }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 transition-colors"
        >
          <Shield className="w-3.5 h-3.5" />
          {language === 'fr' ? 'Gerer' : 'Manage'}
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout
      title={language === 'fr' ? 'Gestion des Utilisateurs' : 'User Management'}
      subtitle={language === 'fr' ? 'Gerer les utilisateurs et leurs privileges' : 'Manage users and their privileges'}
    >
      {actionError && (
        <div className="mb-4 p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 flex items-start justify-between gap-3">
          <span className="text-sm text-red-700 dark:text-red-300">{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-red-700 dark:text-red-300 hover:opacity-70 text-sm"
          >
            ✕
          </button>
        </div>
      )}
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: language === 'fr' ? 'Total Utilisateurs' : 'Total Users', value: String(users.length), icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: language === 'fr' ? 'Administrateurs' : 'Administrators', value: String(users.filter(u => u.role === 'administrator').length), icon: Shield, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: language === 'fr' ? 'Membres DPE' : 'DPE Members', value: String(users.filter(u => u.role === 'dpe_member').length), icon: Building2, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: language === 'fr' ? 'Actifs' : 'Active', value: String(users.filter(u => u.status === 'active').length), icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: language === 'fr' ? 'Demandes en Attente' : 'Pending Requests', value: String(pendingUsers.length), icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
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

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-slate-900 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'active'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <Users className="w-4 h-4" />
          {language === 'fr' ? 'Utilisateurs Actifs' : 'Active Users'}
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
            activeTab === 'pending'
              ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          {language === 'fr' ? 'Demandes en Attente' : 'Pending Requests'}
          {pendingUsers.length > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {pendingUsers.length}
            </span>
          )}
        </button>
      </div>

      {/* Data Table */}
      {activeTab === 'active' ? (
      <DataTable
        columns={columns}
        data={users}
        title={language === 'fr' ? 'Liste des Utilisateurs' : 'User List'}
        section="users"
        onAdd={() => { setIsEditing(false); setSelectedUser(null); setFormData(emptyForm); setShowAddModal(true); }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={async (row) => {
          setSelectedUser(row);
          setShowViewModal(true);
          setIsLoadingUserDetails(true);
          try {
            const res = await usersApi.getById(row.id);
            const fullUser = res?.data?.data;
            if (fullUser) setSelectedUser(fullUser);
          } catch (err) {
            console.error('Failed to fetch user details:', err);
          } finally {
            setIsLoadingUserDetails(false);
          }
        }}
        filters={[
          { key: 'role', label: language === 'fr' ? 'Role' : 'Role', type: 'select' as const, options: ['administrator', 'dpe_member', 'district_member', 'agency_member', 'antenna_member'] },
          { key: 'status', label: language === 'fr' ? 'Statut' : 'Status', type: 'select' as const, options: ['active', 'inactive', 'pending'] },
          { key: 'district', label: 'District', type: 'select' as const, options: [...new Set(users.map((u: any) => typeof u.district === 'object' ? u.district?.name : u.district).filter(Boolean))] as string[] },
        ]}
      />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800/60 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {language === 'fr' ? 'Demandes en Attente d\'Approbation' : 'Pending Approval Requests'}
          </h3>
          
          {pendingUsers.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">{language === 'fr' ? 'Aucune demande en attente' : 'No pending requests'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-amber-200 dark:border-amber-800/30 rounded-xl bg-amber-50 dark:bg-amber-900/10">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{user.name}</h4>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>{user.email}</span>
                      <span>•</span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${roleLabels[user.role]?.color || ''}`}>
                        {language === 'fr' ? roleLabels[user.role]?.fr : roleLabels[user.role]?.en}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleApproveUser(user.id)}
                      disabled={approvingId === user.id || rejectingId === user.id}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {approvingId === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      {language === 'fr' ? 'Approuver' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleRejectUser(user.id)}
                      disabled={approvingId === user.id || rejectingId === user.id}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {rejectingId === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      {language === 'fr' ? 'Rejeter' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200/50 dark:border-slate-800/60/50">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEditing ? 'bg-amber-500/10' : 'bg-blue-500/10'}`}>
                  {isEditing ? <UserPlus className="w-5 h-5 text-amber-500" /> : <UserPlus className="w-5 h-5 text-blue-500" />}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {isEditing
                      ? (language === 'fr' ? 'Modifier Utilisateur' : 'Edit User')
                      : (language === 'fr' ? 'Ajouter un Utilisateur' : 'Add User')}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isEditing
                      ? (language === 'fr' ? 'Mettre a jour les informations' : 'Update user information')
                      : (language === 'fr' ? 'Remplir les informations ci-dessous' : 'Fill in the details below')}
                  </p>
                </div>
              </div>
              <button aria-label="Close" onClick={() => { setShowAddModal(false); setSelectedUser(null); setIsEditing(false); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {language === 'fr' ? 'Nom complet' : 'Full Name'} <span className="text-red-400">*</span>
                  </label>
                  <input type="text" aria-label="Full Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email <span className="text-red-400">*</span></label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="email@naftal.dz" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {language === 'fr' ? 'Telephone' : 'Phone'} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    aria-label="Phone"
                    required
                    value={formData.phone}
                    onChange={(e) => {
                      const phone = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, phone });
                    }}
                    inputMode="numeric"
                    maxLength={10}
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {language === 'fr' ? 'Mot de passe' : 'Password'} {!isEditing && <span className="text-red-400">*</span>}
                  </label>
                  <input type="password" required={!isEditing} minLength={8} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={isEditing ? (language === 'fr' ? 'Laisser vide pour ne pas changer' : 'Leave blank to keep current') : ''}
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {language === 'fr' ? 'Role' : 'Role'} <span className="text-red-400">*</span>
                  </label>
                  <select aria-label="Role" required value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                    {Object.entries(roleLabels).map(([key, val]) => (
                      <option key={key} value={key}>{language === 'fr' ? val.fr : val.en}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {language === 'fr' ? 'Code Structure' : 'Structure Code'} <span className="text-red-400">*</span>
                  </label>
                  <input type="text" required maxLength={4} value={formData.structureCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4);
                      setFormData({ ...formData, structureCode: val });
                    }}
                    placeholder="ex: 2616"
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                  {structureLookupStatus === 'loading' && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                      <p className="text-xs text-blue-500">{language === 'fr' ? 'Recherche...' : 'Searching...'}</p>
                    </div>
                  )}
                  {structureLookupStatus === 'not-found' && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <p className="text-xs text-red-500">{language === 'fr' ? 'Structure non trouvee' : 'Structure not found'}</p>
                    </div>
                  )}
                  {structureLookupStatus === 'found' && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{structureName}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {language === 'fr' ? 'Nom Structure' : 'Structure Name'}
                  </label>
                  <input type="text" aria-label="Structure Name" readOnly tabIndex={-1} value={structureName}
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-gray-600/50 text-gray-900 dark:text-white text-sm cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">District</label>
                  <input type="text" aria-label="District" readOnly tabIndex={-1} value={structureDistrict}
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-gray-600/50 text-gray-900 dark:text-white text-sm cursor-not-allowed" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t border-gray-100 dark:border-slate-800/60">
                <button type="button" onClick={() => { setShowAddModal(false); setSelectedUser(null); setIsEditing(false); }}
                  className="px-5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm font-medium">
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button type="submit"
                  className="px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all text-sm font-medium">
                  {language === 'fr' ? 'Enregistrer' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-200/50 dark:border-slate-800/60/50">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800/60 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Details Utilisateur' : 'User Details'}
              </h3>
              <button aria-label="Close" onClick={() => { setShowViewModal(false); setSelectedUser(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              {/* User header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--naftal-blue)] to-[var(--naftal-dark-blue)] flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-500/20">
                  {(selectedUser.name || 'U').split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedUser.name}</h4>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold mt-1 ${roleLabels[selectedUser.role]?.color || ''}`}>
                    {language === 'fr' ? roleLabels[selectedUser.role]?.fr : roleLabels[selectedUser.role]?.en}
                  </span>
                </div>
              </div>
              {/* Details */}
              {isLoadingUserDetails ? (
                <div className="py-8 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {language === 'fr' ? 'Chargement des details...' : 'Loading details...'}
                </div>
              ) : (
                <div className="space-y-0">
                  {[
                    { label: 'ID', value: selectedUser.id },
                    { label: 'Email', value: selectedUser.email },
                    { label: language === 'fr' ? 'Telephone' : 'Phone', value: selectedUser.phone },
                    { label: language === 'fr' ? 'Statut' : 'Status', value: selectedUser.status },
                    { label: 'District', value: getEntityName(selectedUser.district) },
                    { label: language === 'fr' ? 'Structure' : 'Structure', value: getEntityName(selectedUser.structure) },
                    {
                      label: language === 'fr' ? 'Code Structure' : 'Structure Code',
                      value: (selectedUser.structure && typeof selectedUser.structure === 'object' && 'code' in selectedUser.structure)
                        ? (selectedUser.structure as { code?: string }).code
                        : '-',
                    },
                    { label: language === 'fr' ? 'Date creation' : 'Created', value: formatDateTime(selectedUser.created_at || selectedUser.createdAt) },
                    { label: language === 'fr' ? 'Date mise a jour' : 'Updated', value: formatDateTime(selectedUser.updated_at || selectedUser.updatedAt) },
                    { label: language === 'fr' ? 'Derniere connexion' : 'Last Login', value: formatDateTime(selectedUser.last_login || selectedUser.lastLoginAt) },
                    {
                      label: language === 'fr' ? 'Demande par' : 'Requested By',
                      value: selectedUser.requestedBy?.name || selectedUser.requestedBy?.email || '-',
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-gray-50 dark:border-slate-800/60/40 last:border-0">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white text-right max-w-[60%] truncate">{String(item.value ?? '-')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedUser && (
        <PermissionsModal
          user={{ id: selectedUser.id, name: selectedUser.name, role: selectedUser.role }}
          onClose={() => { setShowPermissionsModal(false); setSelectedUser(null); }}
        />
      )}
    </DashboardLayout>
  );
};

export default UserManagement;
