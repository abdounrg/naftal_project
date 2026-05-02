import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useLanguage } from '../context/LanguageContext';
import { usersApi, structuresApi } from '../lib/api';
import { Send, Check, AlertCircle, Loader2 } from 'lucide-react';

type UserRole = 'dpe_member' | 'district_member' | 'agency_member' | 'antenna_member';

interface RequestFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  structureCode: string;
}

const RequestUser = () => {
  const { language } = useLanguage();
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [formData, setFormData] = useState<RequestFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'agency_member',
    structureCode: '',
  });

  // Structure code lookup
  const [structureName, setStructureName] = useState('');
  const [structureDistrict, setStructureDistrict] = useState('');
  const [structureLookupStatus, setStructureLookupStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');
  const structureTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const roleOptions: { value: UserRole; label: { fr: string; en: string } }[] = [
    { value: 'dpe_member', label: { fr: 'Membre DPE', en: 'DPE Member' } },
    { value: 'agency_member', label: { fr: 'Membre Agence', en: 'Agency Member' } },
    { value: 'antenna_member', label: { fr: 'Membre Antenne', en: 'Antenna Member' } },
    { value: 'district_member', label: { fr: 'Membre District', en: 'District Member' } },
  ];

  // Look up structure by code
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

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setSubmitMessage(language === 'fr' ? 'Le nom est requis' : 'Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setSubmitMessage(language === 'fr' ? 'L\'email est requis' : 'Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setSubmitMessage(language === 'fr' ? 'Email invalide' : 'Invalid email');
      return false;
    }
    if (!formData.password) {
      setSubmitMessage(language === 'fr' ? 'Le mot de passe est requis' : 'Password is required');
      return false;
    }
    if (formData.password.length < 8) {
      setSubmitMessage(language === 'fr' ? 'Le mot de passe doit avoir au moins 8 caractères' : 'Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setSubmitMessage(language === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match');
      return false;
    }
    if (!formData.structureCode.trim()) {
      setSubmitMessage(language === 'fr' ? 'Le code de la structure est requis' : 'Structure code is required');
      return false;
    }
    if (structureLookupStatus !== 'found') {
      setSubmitMessage(language === 'fr' ? 'Structure introuvable' : 'Structure not found');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('idle');
    setSubmitMessage('');

    if (!validateForm()) {
      setSubmitStatus('error');
      return;
    }

    setSubmitStatus('loading');
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
        role: formData.role,
        structureCode: formData.structureCode,
      };
      
      const response = await usersApi.create(payload);
      setSubmitStatus('success');
      setSubmitMessage(
        language === 'fr'
          ? 'Demande d\'ajout d\'utilisateur soumise avec succès. En attente d\'approbation de l\'administrateur.'
          : 'User request submitted successfully. Awaiting admin approval.'
      );
      
      // Reset form after 3 seconds
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          role: 'agency_member',
          structureCode: '',
        });
        setStructureName('');
        setStructureDistrict('');
        setStructureLookupStatus('idle');
        setSubmitStatus('idle');
        setSubmitMessage('');
      }, 3000);
    } catch (error: any) {
      setSubmitStatus('error');
      setSubmitMessage(
        error.response?.data?.message ||
        (language === 'fr' ? 'Erreur lors de la soumission' : 'Error submitting request')
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            {language === 'fr' ? 'Demander l\'ajout d\'un utilisateur' : 'Request User Addition'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {language === 'fr'
              ? 'Soumettez une demande pour ajouter un nouvel utilisateur. Un administrateur examinera et approuvera votre demande.'
              : 'Submit a request to add a new user. An administrator will review and approve your request.'}
          </p>

          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-300">
                  {language === 'fr' ? 'Succès' : 'Success'}
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400">{submitMessage}</p>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-300">
                  {language === 'fr' ? 'Erreur' : 'Error'}
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400">{submitMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {language === 'fr' ? 'Nom complet' : 'Full Name'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={language === 'fr' ? 'Ex: محمد بن علي / Mohamed Benali' : 'Example: Mohamed Benali'}
                disabled={submitStatus === 'loading'}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {language === 'fr' ? 'Email' : 'Email'} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={language === 'fr' ? 'Ex: m.benali@naftal.dz' : 'Example: m.benali@naftal.dz'}
                disabled={submitStatus === 'loading'}
              />
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {language === 'fr' ? 'Utilisez un email NAFTAL (ex: prenom.nom@naftal.dz)' : 'Use a NAFTAL email (e.g. firstname.lastname@naftal.dz)'}
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {language === 'fr' ? 'Téléphone' : 'Phone'} <span className="text-gray-500">{language === 'fr' ? '(optionnel)' : '(optional)'}</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  const phone = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({ ...formData, phone });
                }}
                inputMode="numeric"
                maxLength={10}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0555123456"
                disabled={submitStatus === 'loading'}
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {language === 'fr' ? 'Rôle' : 'Role'} <span className="text-red-500">*</span>
              </label>
              <select
                aria-label={language === 'fr' ? 'Rôle utilisateur' : 'User role'}
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitStatus === 'loading'}
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {language === 'fr' ? option.label.fr : option.label.en}
                  </option>
                ))}
              </select>
            </div>

            {/* Structure Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {language === 'fr' ? 'Code Structure' : 'Structure Code'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.structureCode}
                onChange={(e) => setFormData({ ...formData, structureCode: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2616"
                disabled={submitStatus === 'loading'}
              />
              
              {structureLookupStatus === 'loading' && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {language === 'fr' ? 'Recherche en cours...' : 'Searching...'}
                </div>
              )}
              
              {structureLookupStatus === 'found' && (
                <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    <span className="font-semibold">{structureName}</span>
                    {structureDistrict && <span> • {structureDistrict}</span>}
                  </p>
                </div>
              )}
              
              {structureLookupStatus === 'not-found' && formData.structureCode.length >= 3 && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {language === 'fr' ? 'Structure introuvable' : 'Structure not found'}
                  </p>
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {language === 'fr' ? 'Mot de passe' : 'Password'} <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                disabled={submitStatus === 'loading'}
              />
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {language === 'fr' ? 'Au moins 8 caractères' : 'At least 8 characters'}
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {language === 'fr' ? 'Confirmer le mot de passe' : 'Confirm Password'} <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                disabled={submitStatus === 'loading'}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitStatus === 'loading'}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              {submitStatus === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {language === 'fr' ? 'Soumission en cours...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {language === 'fr' ? 'Soumettre la demande' : 'Submit Request'}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <span className="font-semibold">{language === 'fr' ? 'À savoir:' : 'Note:'}</span>{' '}
              {language === 'fr'
                ? 'Votre demande sera revue par un administrateur. Vous recevrez une notification une fois qu\'elle sera approuvée ou rejetée.'
                : 'Your request will be reviewed by an administrator. You will be notified once it is approved or rejected.'}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RequestUser;
