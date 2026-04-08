import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  const quickLinks = [
    { name: t('nav.home'), href: '/#hero' },
    { name: t('nav.modules'), href: '/#modules' },
    { name: t('nav.login'), href: '/login' },
  ];

  const modules = [
    'Gestion des TPE',
    'Chargeurs et Bases',
    'Cartes de Gestion',
  ];

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const colVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
  };

  return (
    <footer className="relative bg-[var(--naftal-dark-blue)] text-white overflow-hidden">
      {/* Yellow accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--naftal-yellow)] via-[var(--naftal-blue)] to-[var(--naftal-yellow)]" />

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,215,0,0.2) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(255,215,0,0.1) 0%, transparent 40%)` }}
      />

      <div className="relative z-10">
        {/* Main Footer Content */}
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Column */}
            <motion.div variants={colVariants} className="lg:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-6 group">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-[var(--naftal-yellow)] transition-colors duration-200 group-hover:border-white">
                  <img src="/naftal-logo.png" alt="NAFTAL Logo" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg leading-tight">NAFTAL</span>
                  <span className="text-xs leading-tight text-[var(--naftal-yellow)]">GAP</span>
                </div>
              </Link>
              <p className="text-blue-200 text-sm leading-relaxed mb-6">
                Plateforme de gestion electronique des activites de paiement pour les structures commerciales NAFTAL.
              </p>
              <div className="flex gap-3">
                {[Facebook, Twitter, Linkedin].map((Icon, index) => (
                  <motion.a
                    key={index}
                    href="#"
                    whileHover={{ scale: 1.1, backgroundColor: 'var(--naftal-yellow)', color: 'var(--naftal-dark-blue)' }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center"
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={colVariants}>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--naftal-yellow)] mb-6">
                {t('footer.quicklinks')}
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="group flex items-center gap-2 text-blue-200 hover:text-white transition-colors duration-200">
                      <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 text-[var(--naftal-yellow)]" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Modules */}
            <motion.div variants={colVariants}>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--naftal-yellow)] mb-6">
                {t('footer.modules')}
              </h4>
              <ul className="space-y-3">
                {modules.map((module) => (
                  <li key={module}>
                    <span className="text-blue-200">{module}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact */}
            <motion.div variants={colVariants}>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--naftal-yellow)] mb-6">
                {t('footer.contact')}
              </h4>
              <ul className="space-y-4">
                {[
                  { label: t('cta.email'), value: 'contact@naftal-gap.dz' },
                  { label: t('cta.phone'), value: '+213 23 XX XX XX' },
                  { label: t('cta.address'), value: 'Alger, Algerie' },
                ].map((contact) => (
                  <li key={contact.label}>
                    <p className="text-xs text-[var(--naftal-yellow)] mb-1">{contact.label}</p>
                    <p className="text-sm">{contact.value}</p>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          className="border-t border-white/10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-blue-300 text-center md:text-left">
                &copy; {new Date().getFullYear()} NAFTAL GAP. {t('footer.copyright')}
              </p>
              <div className="flex gap-6 text-sm text-blue-300">
                <a href="#" className="hover:text-[var(--naftal-yellow)] transition-colors duration-200">
                  {t('footer.privacy')}
                </a>
                <a href="#" className="hover:text-[var(--naftal-yellow)] transition-colors duration-200">
                  {t('footer.terms')}
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
