import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Camera,
  Trash2,
  Lock,
  Mail,
  User as UserIcon,
  Shield,
  Building2,
  MapPin,
  CircleCheck,
  Clock,
  Info,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const roleLabels: Record<string, Record<string, string>> = {
  fr: {
    administrator: 'Administrateur',
    dpe_member: 'Membre DPE',
    agency_member: 'Membre Agence',
    district_member: 'Membre District',
    antenna_member: 'Membre Antenne',
  },
  en: {
    administrator: 'Administrator',
    dpe_member: 'DPE Member',
    agency_member: 'Agency Member',
    district_member: 'District Member',
    antenna_member: 'Antenna Member',
  },
};

const statusTone: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20',
  inactive: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 ring-slate-500/20',
  rejected: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20',
};

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB

const Settings = () => {
  const { user, updateAvatar, removeAvatar } = useAuth();
  const { language } = useLanguage();
  const avatar = user?.avatarUrl ?? null;
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = (fr: string, en: string) => (language === 'fr' ? fr : en);

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const roleLabel = user?.role ? roleLabels[language]?.[user.role] || user.role : '—';
  const statusKey = (user?.status || '').toLowerCase();
  const statusClass = statusTone[statusKey] ?? statusTone.inactive;

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return t('Jamais', 'Never');
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
  };

  const handlePick = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(t('Veuillez selectionner une image valide.', 'Please select a valid image.'));
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError(
        t(
          'Image trop volumineuse (max 2 Mo).',
          'Image is too large (max 2 MB).'
        )
      );
      return;
    }

    setBusy(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('read-failed'));
        reader.readAsDataURL(file);
      });
      await updateAvatar(dataUrl);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message;
      setError(msg || t("Impossible de televerser l'image.", 'Could not upload the image.'));
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    setError(null);
    setBusy(true);
    try {
      await removeAvatar();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message;
      setError(msg || t('Impossible de supprimer la photo.', 'Could not remove the picture.'));
    } finally {
      setBusy(false);
    }
  };

  const fields: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: t('Nom complet', 'Full name'), value: user?.name || '—', icon: UserIcon },
    { label: t('Adresse e-mail', 'Email address'), value: user?.email || '—', icon: Mail },
    { label: t('Role', 'Role'), value: roleLabel, icon: Shield },
    { label: t('Structure', 'Structure'), value: user?.structure?.name || '—', icon: Building2 },
    { label: t('District', 'District'), value: user?.district?.name || '—', icon: MapPin },
    { label: t('Statut du compte', 'Account status'), value: user?.status || '—', icon: CircleCheck },
    { label: t('Derniere connexion', 'Last sign-in'), value: formatDate(user?.lastLoginAt), icon: Clock },
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full bg-blue-400/15 dark:bg-blue-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[420px] h-[420px] rounded-full bg-amber-400/15 dark:bg-amber-500/10 blur-3xl" />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 dark:border-slate-800/60 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center gap-3">
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg text-[12.5px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('Retour', 'Back')}
          </Link>
          <div className="ml-2">
            <h1 className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              {t('Parametres', 'Settings')}
            </h1>
            <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-1 leading-none">
              {t('Profil et compte', 'Profile and account')}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        {/* Read-only banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200/70 dark:border-blue-500/20"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div className="text-[13px] text-blue-900 dark:text-blue-200 leading-relaxed">
            <p className="font-semibold">
              {t('Informations en lecture seule', 'Read-only profile')}
            </p>
            <p className="text-blue-800/80 dark:text-blue-200/80 mt-0.5">
              {t(
                "Vos donnees personnelles sont gerees par un administrateur. Vous pouvez uniquement modifier votre photo de profil.",
                'Your personal data is managed by an administrator. You can only change your profile picture.'
              )}
            </p>
          </div>
        </motion.div>

        {/* Profile card */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/60 backdrop-blur-xl overflow-hidden shadow-sm"
        >
          {/* Cover */}
          <div className="h-24 sm:h-28 bg-slate-900 dark:bg-slate-800 relative overflow-hidden">
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.18]"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)',
                backgroundSize: '22px 22px',
              }}
            />
            <div className="absolute -top-12 -right-10 w-56 h-56 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-blue-400/15 blur-3xl" />
          </div>

          <div className="px-5 sm:px-6 pb-6">
            {/* Avatar row — avatar on its own column */}
            <div className="flex items-start gap-4 sm:gap-5 -mt-12">
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-2xl ring-4 ring-white dark:ring-slate-900 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center text-2xl font-semibold tracking-tight overflow-hidden shadow-md border border-slate-200/70 dark:border-slate-700/60">
                  {avatar ? (
                    <img src={avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{userInitials}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handlePick}
                  disabled={busy}
                  aria-label={t('Changer la photo', 'Change picture')}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-md ring-2 ring-white dark:ring-slate-900 hover:scale-105 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Identity + actions on the right */}
              <div className="flex-1 min-w-0 pt-14">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight truncate capitalize">
                      {user?.name || '—'}
                    </h2>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                      {user?.email || '—'}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-900/5 text-slate-700 dark:bg-white/10 dark:text-slate-200 ring-1 ring-slate-900/10 dark:ring-white/10">
                        <Shield className="w-3 h-3" />
                        {roleLabel}
                      </span>
                      {user?.status && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ring-1 ${statusClass} capitalize`}>
                          {user.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Avatar actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handlePick}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[12.5px] font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      {avatar ? t('Changer', 'Change') : t('Ajouter une photo', 'Add a picture')}
                    </button>
                    {avatar && (
                      <button
                        type="button"
                        onClick={handleRemove}
                        className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-[12.5px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/15 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t('Supprimer', 'Remove')}
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFile}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Avatar hints / errors */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11.5px] text-slate-500 dark:text-slate-400">
              <span>{t('PNG, JPG ou WEBP', 'PNG, JPG or WEBP')}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span>{t('2 Mo maximum', '2 MB max')}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span>{t('Synchronisee sur tous vos appareils', 'Synced across all your devices')}</span>
            </div>
            {error && (
              <p className="mt-2 text-[12px] font-medium text-rose-600 dark:text-rose-400">
                {error}
              </p>
            )}
          </div>
        </motion.section>

        {/* Profile fields (read-only) */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/60 backdrop-blur-xl overflow-hidden shadow-sm"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/70 dark:border-slate-800/60">
            <div>
              <h3 className="text-[14px] font-semibold tracking-tight text-slate-900 dark:text-white">
                {t('Informations personnelles', 'Personal information')}
              </h3>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
                {t(
                  'Geree par un administrateur',
                  'Managed by an administrator'
                )}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-700">
              <Lock className="w-3 h-3" />
              {t('Lecture seule', 'Read-only')}
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {fields.map((f) => (
              <div
                key={f.label}
                className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 px-6 py-3.5"
              >
                <div className="flex items-center gap-2 text-[12.5px] font-medium text-slate-500 dark:text-slate-400">
                  <f.icon className="w-3.5 h-3.5" />
                  {f.label}
                </div>
                <div className="sm:col-span-2 text-[13.5px] text-slate-900 dark:text-slate-100 break-words">
                  {f.value}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Footer hint */}
        <p className="text-[11.5px] text-slate-400 dark:text-slate-500 text-center pt-2">
          {t(
            "Pour modifier vos informations, contactez un administrateur.",
            'To update your information, please contact an administrator.'
          )}
        </p>
      </main>
    </div>
  );
};

export default Settings;
