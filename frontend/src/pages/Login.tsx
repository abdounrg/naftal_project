import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Sun, Moon, Globe, X, MessageSquareWarning, Loader2, CheckCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../lib/api';

const Login = () => {
  const [email, setEmail] = useState(() => localStorage.getItem('rememberedEmail') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('rememberMe') === 'true');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportForm, setSupportForm] = useState({
    requesterName: '',
    requesterEmail: email,
    requesterPhone: '',
    problemDescription: '',
  });

  const { isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password, rememberMe);
      navigate('/home');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(
        axiosError.response?.data?.message ||
          (language === 'fr' ? 'Identifiants invalides' : 'Invalid credentials')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  const openSupportModal = () => {
    setSupportMessage('');
    setSupportForm((prev) => ({ ...prev, requesterEmail: email || prev.requesterEmail }));
    setShowSupportModal(true);
  };

  const submitSupportRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupportMessage('');
    setSupportLoading(true);
    try {
      await authApi.createLoginSupportRequest(supportForm);
      setSupportMessage(
        language === 'fr'
          ? 'Demande envoyee. L\'administrateur a ete notifie.'
          : 'Request sent. The administrator has been notified.'
      );
      setSupportForm({ requesterName: '', requesterEmail: email || '', requesterPhone: '', problemDescription: '' });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setSupportMessage(
        axiosError.response?.data?.message ||
          (language === 'fr' ? 'Erreur lors de l\'envoi de la demande.' : 'Failed to send request.')
      );
    } finally {
      setSupportLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-[400ms]">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 shadow-soft">
              <img src="/naftal-logo.png" alt="NAFTAL Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[13px] leading-tight tracking-tight text-slate-900 dark:text-white">NAFTAL</span>
              <span className="text-[10px] leading-tight font-semibold text-amber-500 uppercase tracking-widest">GAP System</span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5">
            <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {isDarkMode ? <Sun className="w-[18px] h-[18px] text-amber-500" /> : <Moon className="w-[18px] h-[18px] text-slate-400" />}
            </button>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[13px] font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span className="uppercase text-slate-600 dark:text-gray-400 text-[11px] font-semibold">{language}</span>
            </button>
          </div>
        </div>

        <div className="max-w-sm w-full mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-[13px] text-slate-400 hover:text-blue-500 transition-colors mb-10">
            <ArrowLeft className="w-3.5 h-3.5" />
            {language === 'fr' ? 'Retour' : 'Back'}
          </Link>

          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-5 shadow-glow-blue">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1.5">{t('login.title')}</h2>
            <p className="text-[14px] text-slate-500 dark:text-gray-400">{t('login.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[13px]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-slate-700 dark:text-gray-300 mb-1.5">{t('login.email')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/50 transition-all"
                  placeholder="email@naftal.dz"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-slate-700 dark:text-gray-300 mb-1.5">{t('login.password')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/50 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-[13px] text-slate-500 dark:text-gray-400">{t('login.remember')}</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl text-white font-semibold text-[14px] bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                t('login.button')
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[13px] text-gray-400 dark:text-gray-500">
              {t('login.noaccount')}{' '}
              <button
                type="button"
                onClick={openSupportModal}
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
              >
                {t('login.contact')}
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img src="/login-bg.png" alt="NAFTAL Station" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/20" />

        <div className="relative z-10 flex flex-col justify-end p-10 w-full">
          <div className="backdrop-blur-md bg-white/10 rounded-2xl border border-white/15 p-6 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-white/20 shadow-lg shrink-0">
                <img src="/naftal-logo.png" alt="NAFTAL Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">NAFTAL GAP</h3>
                <p className="text-blue-100/70 text-[13px] leading-snug">
                  {language === 'fr'
                    ? 'Gestion electronique des activites de paiement'
                    : 'Electronic payment activity management'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
              {[
                { value: '1,234', label: language === 'fr' ? 'TPE Geres' : 'TPE Managed' },
                { value: '156', label: language === 'fr' ? 'Structures' : 'Structures' },
                { value: '98%', label: language === 'fr' ? 'Disponibilite' : 'Availability' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-xl font-bold text-amber-400">{stat.value}</p>
                  <p className="text-[12px] text-blue-100/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showSupportModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquareWarning className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {language === 'fr' ? 'Contacter l\'administration' : 'Contact Administration'}
                </h3>
              </div>
              <button
                aria-label={language === 'fr' ? 'Fermer la fenêtre' : 'Close modal'}
                title={language === 'fr' ? 'Fermer' : 'Close'}
                onClick={() => setShowSupportModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={submitSupportRequest} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-1">
                  {language === 'fr' ? 'Nom complet' : 'Full name'}
                </label>
                <input
                  type="text"
                  required
                  value={supportForm.requesterName}
                  onChange={(e) => setSupportForm({ ...supportForm, requesterName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  placeholder={language === 'fr' ? 'Ex: محمد بن علي / Mohamed Benali' : 'Example: Mohamed Benali'}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={supportForm.requesterEmail}
                  onChange={(e) => setSupportForm({ ...supportForm, requesterEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  placeholder="prenom.nom@naftal.dz"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-1">
                  {language === 'fr' ? 'Telephone (optionnel)' : 'Phone (optional)'}
                </label>
                <input
                  type="tel"
                  value={supportForm.requesterPhone}
                  onChange={(e) => {
                    const requesterPhone = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setSupportForm({ ...supportForm, requesterPhone });
                  }}
                  inputMode="numeric"
                  maxLength={10}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  placeholder="0555123456"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-1">
                  {language === 'fr' ? 'Description du probleme' : 'Problem description'}
                </label>
                <textarea
                  required
                  minLength={10}
                  value={supportForm.problemDescription}
                  onChange={(e) => setSupportForm({ ...supportForm, problemDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white h-28 resize-none"
                  placeholder={
                    language === 'fr'
                      ? 'Decrivez votre probleme de connexion (mot de passe, compte bloque, etc.)'
                      : 'Describe your login issue (password, locked account, etc.)'
                  }
                />
              </div>

              {supportMessage && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5" />
                  <span>{supportMessage}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSupportModal(false)}
                  className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-gray-300"
                >
                  {language === 'fr' ? 'Fermer' : 'Close'}
                </button>
                <button
                  type="submit"
                  disabled={supportLoading}
                  className="px-4 py-2 text-sm rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium disabled:opacity-60"
                >
                  {supportLoading ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {language === 'fr' ? 'Envoi...' : 'Sending...'}
                    </span>
                  ) : (
                    (language === 'fr' ? 'Envoyer la demande' : 'Send request')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
