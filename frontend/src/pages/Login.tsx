import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Sun, Moon, Globe } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
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

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900" style={{ transition: 'background-color 0.4s ease' }}>
      {/* Left Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg overflow-hidden ring-2 ring-[var(--naftal-yellow)]">
              <img src="/naftal-logo.png" alt="NAFTAL Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight text-gray-900 dark:text-white">NAFTAL</span>
              <span className="text-xs leading-tight text-[var(--naftal-yellow)]">GAP</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {isDarkMode ? <Sun className="w-5 h-5 text-[var(--naftal-yellow)]" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>
            <button onClick={toggleLanguage} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-[var(--naftal-yellow)]/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Globe className="w-4 h-4 text-[var(--naftal-yellow)]" />
              <span className="uppercase text-gray-700 dark:text-gray-300">{language}</span>
            </button>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto">
          {/* Back Button */}
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--naftal-blue)] transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            {language === 'fr' ? 'Retour' : 'Back'}
          </Link>

          {/* Login Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--naftal-blue)] to-[var(--naftal-dark-blue)] mb-4 shadow-lg shadow-blue-500/30">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('login.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('login.subtitle')}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('login.email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--naftal-blue)] focus:border-transparent transition-all"
                  placeholder="email@naftal.dz"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('login.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--naftal-blue)] focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[var(--naftal-blue)] border-gray-300 rounded focus:ring-[var(--naftal-blue)]"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{t('login.remember')}</span>
              </label>
              <a href="#" className="text-sm text-[var(--naftal-blue)] hover:text-[var(--naftal-yellow)] transition-colors">
                {t('login.forgot')}
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg text-white font-semibold bg-[var(--naftal-blue)] hover:bg-[var(--naftal-dark-blue)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--naftal-blue)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: '0 4px 14px rgba(0, 71, 171, 0.3)' }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 215, 0, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 71, 171, 0.3)';
              }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                t('login.button')
              )}
            </button>
          </form>

          {/* Contact Admin */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('login.noaccount')}{' '}
              <a href="#" className="text-[var(--naftal-blue)] hover:text-[var(--naftal-yellow)] font-medium transition-colors">
                {t('login.contact')}
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0047AB 0%, #002a66 100%)' }}>
        {/* Yellow accents */}
        <div className="absolute top-20 right-20 w-20 h-20 rounded-full bg-[var(--naftal-yellow)] opacity-20 animate-float" />
        <div className="absolute bottom-40 left-20 w-32 h-32 rounded-full bg-[var(--naftal-yellow)] opacity-10 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-4 h-4 rounded-full bg-[var(--naftal-yellow)] opacity-30 animate-float" style={{ animationDelay: '1s' }} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(to right, rgba(255,215,0,0.3) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,215,0,0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-[var(--naftal-yellow)] shadow-2xl mb-8">
            <img src="/naftal-logo.png" alt="NAFTAL Logo" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-4">NAFTAL GAP</h3>
          <p className="text-blue-100 max-w-md text-lg">
            {language === 'fr' 
              ? 'Plateforme de gestion electronique des activites de paiement pour les structures commerciales NAFTAL.'
              : 'Electronic payment activity management platform for NAFTAL commercial structures.'}
          </p>
          
          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-8">
            {[
              { value: '1,234', label: language === 'fr' ? 'TPE Geres' : 'TPE Managed' },
              { value: '156', label: language === 'fr' ? 'Structures' : 'Structures' },
              { value: '98%', label: language === 'fr' ? 'Disponibilite' : 'Availability' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-2xl font-bold text-[var(--naftal-yellow)]">{stat.value}</p>
                <p className="text-sm text-blue-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
