import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, Sun, Moon, Globe } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  scrollY?: number;
  isDashboard?: boolean;
}

const Navbar = ({ scrollY = 0, isDashboard = false }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  useLocation();

  const isScrolled = scrollY > 50 || isDashboard;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const navLinks = [
    { name: t('nav.home'), href: '/#hero' },
    { name: t('nav.modules'), href: '/#modules' },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 ${
        isScrolled
          ? 'glassmorphism py-3'
          : 'bg-transparent py-5'
      }`}
      style={{ transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.4s ease, backdrop-filter 0.5s ease' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className={`flex items-center gap-3 transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
            style={{ transitionTimingFunction: 'var(--ease-expo-out)', transitionDelay: '0ms' }}
          >
            <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-md ring-2 ring-[var(--naftal-yellow)]">
              <img 
                src="/naftal-logo.png" 
                alt="NAFTAL Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className={`font-bold text-xl leading-tight transition-colors duration-300 ${
                isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'
              }`}>
                NAFTAL
              </span>
              <span className="text-xs font-semibold leading-tight tracking-wider uppercase text-[var(--naftal-yellow)]">
                GAP
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {!isDashboard && navLinks.map((link, index) => (
              <a
                key={link.name}
                href={link.href}
                className={`relative text-sm font-medium transition-all duration-300 group ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                } ${isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white/90'} hover:text-[var(--naftal-blue)]`}
                style={{ transitionTimingFunction: 'var(--ease-expo-out)', transitionDelay: `${100 + index * 80}ms` }}
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--naftal-yellow)] transition-all duration-300 group-hover:w-full" 
                  style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
                />
              </a>
            ))}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              } ${isScrolled ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' : 'text-white/90 hover:bg-white/10'}`}
              style={{ transitionTimingFunction: 'var(--ease-spring)', transitionDelay: '300ms' }}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-[var(--naftal-yellow)]" />
              ) : (
                <Moon className="w-5 h-5 text-[var(--naftal-blue)]" />
              )}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              } ${isScrolled ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' : 'text-white/90 hover:bg-white/10'} border border-[var(--naftal-yellow)]/50`}
              style={{ transitionTimingFunction: 'var(--ease-spring)', transitionDelay: '350ms' }}
              aria-label="Toggle language"
            >
              <Globe className="w-4 h-4 text-[var(--naftal-yellow)]" />
              <span className="uppercase">{language}</span>
            </button>

            {/* Login Button */}
            <Link
              to="/login"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium text-sm transition-all duration-500 hover:shadow-lg hover:shadow-blue-500/30 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              }`}
              style={{
                background: 'var(--naftal-blue)',
                transitionTimingFunction: 'var(--ease-spring)',
                transitionDelay: '400ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.background = 'var(--naftal-dark-blue)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.background = 'var(--naftal-blue)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              {t('nav.login')}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${isScrolled ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : 'hover:bg-white/10'}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'}`} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ${
            isMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
          style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-4 space-y-2">
            {!isDashboard && navLinks.map((link, index) => (
              <a
                key={link.name}
                href={link.href}
                className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-[var(--naftal-light-blue)] dark:hover:bg-gray-800 hover:text-[var(--naftal-blue)] transition-all duration-300 font-medium"
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {link.name}
              </a>
            ))}
            
            {/* Mobile Theme & Language */}
            <div className="flex items-center gap-4 px-4 py-3">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {isDarkMode ? t('theme.light') : t('theme.dark')}
              </button>
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <Globe className="w-5 h-5" />
                {language === 'fr' ? 'English' : 'Français'}
              </button>
            </div>
            
            <Link
              to="/login"
              className="w-full mt-4 btn-primary flex items-center justify-center gap-2"
            >
              {t('nav.login')}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
