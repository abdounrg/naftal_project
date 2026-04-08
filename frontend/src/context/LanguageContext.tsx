import { createContext, useContext, useState, type ReactNode } from 'react';

export type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.modules': 'Modules',
    'nav.login': 'Connexion',
    'nav.logout': 'Deconnexion',
    
    // Hero
    'hero.badge': 'Plateforme NAFTAL',
    'hero.title': 'Gestion Electronique des Activites de Paiement',
    'hero.subtitle': 'Plateforme de gestion des terminaux de paiement electronique pour les structures commerciales NAFTAL. Suivez, controlez et optimisez vos operations en temps reel.',
    'hero.cta.primary': 'Explorer la Plateforme',
    'hero.cta.secondary': 'Documentation',
    'hero.trust.secure': 'Securise',
    'hero.trust.structures': '100+ Structures',
    'hero.trust.realtime': 'Temps reel',
    
    // Features
    'features.title': 'Fonctionnalites Principales',
    'features.subtitle': 'Une plateforme complete pour la gestion de vos terminaux de paiement electronique',
    'features.tpe.title': 'Gestion des TPE',
    'features.tpe.desc': 'Suivez vos terminaux de paiement depuis l\'acquisition jusqu\'a la mise en service. Gestion complete du cycle de vie.',
    'features.cards.title': 'Suivi des Cartes',
    'features.cards.desc': 'Gerez les cartes de gestion et de maintenance avec un suivi en temps reel et des alertes automatiques.',
    'features.access.title': 'Controle des Acces',
    'features.access.desc': 'Systeme de roles et privileges securise pour une gestion hierarchique efficace et tracable.',
    'features.dashboard.title': 'Tableau de Bord',
    'features.dashboard.desc': 'Visualisez vos indicateurs de performance et l\'etat de votre parc en un coup d\'oeil.',
    'features.transfers.title': 'Gestion des Transferts',
    'features.transfers.desc': 'Suivez les mouvements de materiel entre structures avec tracabilite complete et historique.',
    
    // Modules
    'modules.title': 'Modules de Gestion',
    'modules.subtitle': 'Trois modules interconnectes pour une gestion complete de votre parc',
    'modules.tpe.title': 'Gestion des TPE NAFTALCARD',
    'modules.tpe.desc': 'Suivi complet des terminaux de paiement electronique avec gestion du stock, du parc en circulation, de la maintenance, des retours et des transferts.',
    'modules.chargers.title': 'Gestion des Chargeurs et Bases',
    'modules.chargers.desc': 'Controle des accessoires et equipements associes avec gestion des stocks et suivi des transferts entre structures.',
    'modules.cards.title': 'Gestion des Cartes de Gestion',
    'modules.cards.desc': 'Administration des cartes de gestion et maintenance avec suivi en temps reel du statut et des anomalies.',
    
    // Stats
    'stats.tpe': 'TPE Geres',
    'stats.availability': 'Disponibilite',
    'stats.structures': 'Structures',
    'stats.repair': 'Temps de Reparation',
    'stats.traceability': 'Tracabilite',
    'stats.monitoring': 'Monitoring',
    
    // CTA
    'cta.title': 'Contactez-Nous',
    'cta.subtitle': 'Pour toute information ou assistance concernant la plateforme NAFTAL GAP, n\'hesitez pas a nous contacter.',
    'cta.email': 'Email',
    'cta.phone': 'Telephone',
    'cta.address': 'Adresse',
    
    // Footer
    'footer.quicklinks': 'Liens Rapides',
    'footer.modules': 'Modules',
    'footer.contact': 'Contact',
    'footer.copyright': 'Tous droits reserves.',
    'footer.privacy': 'Politique de Confidentialite',
    'footer.terms': 'Conditions d\'Utilisation',
    
    // Login
    'login.title': 'Connexion',
    'login.subtitle': 'Connectez-vous a votre compte NAFTAL GAP',
    'login.email': 'Adresse email',
    'login.password': 'Mot de passe',
    'login.remember': 'Se souvenir de moi',
    'login.forgot': 'Mot de passe oublie?',
    'login.button': 'Se connecter',
    'login.noaccount': 'Vous n\'avez pas de compte?',
    'login.contact': 'Contactez l\'administrateur',
    
    // TPE Module
    'tpe.stock.title': 'Stock TPE',
    'tpe.stock.subtitle': 'Gestion du stock des terminaux de paiement',
    'tpe.fleet.title': 'Parc TPE',
    'tpe.fleet.subtitle': 'Suivi des TPE en circulation',
    'tpe.maintenance.title': 'Maintenance TPE',
    'tpe.maintenance.subtitle': 'Gestion des TPE en maintenance',
    'tpe.returns.title': 'Retours et Reconfiguration',
    'tpe.returns.subtitle': 'Suivi des TPE retournes et reconfigures',
    'tpe.transfers.title': 'Transferts TPE',
    'tpe.transfers.subtitle': 'Gestion des transferts de TPE entre structures',
    'tpe.reform.title': 'TPE a Reforme',
    'tpe.reform.subtitle': 'Suivi des TPE irreparables',
    
    // Roles
    'role.administrator': 'Administrateur',
    'role.dpe_member': 'Membre DPE',
    'role.agency_member': 'Membre Agence',
    'role.station_manager': 'Chef de Station',

    // Navbar mobile
    'theme.light': 'Mode Clair',
    'theme.dark': 'Mode Sombre',

    // Footer
    'footer.description': 'Plateforme de gestion electronique des activites de paiement pour les structures commerciales NAFTAL.',
    'footer.module.tpe': 'Gestion des TPE',
    'footer.module.chargers': 'Chargeurs et Bases',
    'footer.module.cards': 'Cartes de Gestion',
    'footer.contact.phone': 'Telephone',
    'footer.contact.address': 'Adresse',

    // Landing page module tags
    'module.tag.stockTpe': 'Stock TPE',
    'module.tag.parcTpe': 'Parc TPE',
    'module.tag.maintenance': 'Maintenance',
    'module.tag.retours': 'Retours',
    'module.tag.transferts': 'Transferts',
    'module.tag.reforme': 'Reforme',
    'module.tag.stockChargers': 'Stock Chargeurs',
    'module.tag.stockBases': 'Stock Bases',
    'module.tag.transfertsChargers': 'Transferts Chargeurs',
    'module.tag.transfertsBases': 'Transferts Bases',
    'module.tag.stockCards': 'Stock Cartes',
    'module.tag.cardsCirculation': 'Cartes en Circulation',
    'module.tag.cardTracking': 'Suivi des Cartes',
    'module.stat.accessories': 'Accessoires',
    'module.stat.activeCards': 'Cartes Actives',

    // Dashboard
    'dashboard.transactions': 'Transactions',
    'dashboard.terminalId': 'ID Terminal',
    'month.jan': 'Jan',
    'month.feb': 'Fev',
    'month.mar': 'Mar',
    'month.apr': 'Avr',
    'month.may': 'Mai',
    'month.jun': 'Jun',
    'month.jul': 'Jul',
    'month.aug': 'Aou',
    'month.sep': 'Sep',
    'month.oct': 'Oct',
    'month.nov': 'Nov',
    'month.dec': 'Dec',

    // Quick links
    'quicklink.home': 'Accueil',
    'quicklink.modules': 'Modules',
    'quicklink.dashboard': 'Dashboard',
    'quicklink.roles': 'Roles',
    'quicklink.contact': 'Contact',

    // Common
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.add': 'Ajouter',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.close': 'Fermer',
    'common.export': 'Exporter',
    'common.print': 'Imprimer',
    'common.actions': 'Actions',
    'common.status': 'Statut',
    'common.date': 'Date',
    'common.serial': 'Numero de serie',
    'common.model': 'Modele',
    'common.structure': 'Structure',
    'common.district': 'District',
    'common.station': 'Station',
    'common.view': 'Voir',
    'common.details': 'Details',
    'common.loading': 'Chargement...',
    'common.noData': 'Aucune donnee disponible',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.modules': 'Modules',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    
    // Hero
    'hero.badge': 'NAFTAL Platform',
    'hero.title': 'Electronic Payment Activity Management',
    'hero.subtitle': 'Electronic payment terminal management platform for NAFTAL commercial structures. Track, control and optimize your operations in real time.',
    'hero.cta.primary': 'Explore Platform',
    'hero.cta.secondary': 'Documentation',
    'hero.trust.secure': 'Secure',
    'hero.trust.structures': '100+ Structures',
    'hero.trust.realtime': 'Real-time',
    
    // Features
    'features.title': 'Main Features',
    'features.subtitle': 'A complete platform for managing your electronic payment terminals',
    'features.tpe.title': 'TPE Management',
    'features.tpe.desc': 'Track your payment terminals from acquisition to deployment. Complete lifecycle management.',
    'features.cards.title': 'Card Tracking',
    'features.cards.desc': 'Manage management and maintenance cards with real-time tracking and automatic alerts.',
    'features.access.title': 'Access Control',
    'features.access.desc': 'Secure role and privilege system for effective and traceable hierarchical management.',
    'features.dashboard.title': 'Dashboard',
    'features.dashboard.desc': 'View your performance indicators and fleet status at a glance.',
    'features.transfers.title': 'Transfer Management',
    'features.transfers.desc': 'Track equipment movements between structures with complete traceability and history.',
    
    // Modules
    'modules.title': 'Management Modules',
    'modules.subtitle': 'Three interconnected modules for complete fleet management',
    'modules.tpe.title': 'TPE NAFTALCARD Management',
    'modules.tpe.desc': 'Complete tracking of electronic payment terminals with stock management, fleet in circulation, maintenance, returns and transfers.',
    'modules.chargers.title': 'Charger and Base Management',
    'modules.chargers.desc': 'Control of accessories and associated equipment with stock management and transfer tracking between structures.',
    'modules.cards.title': 'Management Card Administration',
    'modules.cards.desc': 'Administration of management and maintenance cards with real-time status and anomaly tracking.',
    
    // Stats
    'stats.tpe': 'TPE Managed',
    'stats.availability': 'Availability',
    'stats.structures': 'Structures',
    'stats.repair': 'Repair Time',
    'stats.traceability': 'Traceability',
    'stats.monitoring': 'Monitoring',
    
    // CTA
    'cta.title': 'Contact Us',
    'cta.subtitle': 'For any information or assistance regarding the NAFTAL GAP platform, feel free to reach out to us.',
    'cta.email': 'Email',
    'cta.phone': 'Phone',
    'cta.address': 'Address',
    
    // Footer
    'footer.quicklinks': 'Quick Links',
    'footer.modules': 'Modules',
    'footer.contact': 'Contact',
    'footer.copyright': 'All rights reserved.',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Use',
    
    // Login
    'login.title': 'Login',
    'login.subtitle': 'Sign in to your NAFTAL GAP account',
    'login.email': 'Email address',
    'login.password': 'Password',
    'login.remember': 'Remember me',
    'login.forgot': 'Forgot password?',
    'login.button': 'Sign in',
    'login.noaccount': 'Don\'t have an account?',
    'login.contact': 'Contact administrator',
    
    // TPE Module
    'tpe.stock.title': 'TPE Stock',
    'tpe.stock.subtitle': 'Payment terminal stock management',
    'tpe.fleet.title': 'TPE Fleet',
    'tpe.fleet.subtitle': 'Tracking TPE in circulation',
    'tpe.maintenance.title': 'TPE Maintenance',
    'tpe.maintenance.subtitle': 'Managing TPE under maintenance',
    'tpe.returns.title': 'Returns and Reconfiguration',
    'tpe.returns.subtitle': 'Tracking returned and reconfigured TPE',
    'tpe.transfers.title': 'TPE Transfers',
    'tpe.transfers.subtitle': 'Managing TPE transfers between structures',
    'tpe.reform.title': 'TPE for Reform',
    'tpe.reform.subtitle': 'Tracking irreparable TPE',
    
    // Roles
    'role.administrator': 'Administrator',
    'role.dpe_member': 'DPE Member',
    'role.agency_member': 'Agency Member',
    'role.station_manager': 'Station Manager',

    // Navbar mobile
    'theme.light': 'Light Mode',
    'theme.dark': 'Dark Mode',

    // Footer
    'footer.description': 'Electronic payment activity management platform for NAFTAL commercial structures.',
    'footer.module.tpe': 'TPE Management',
    'footer.module.chargers': 'Chargers and Bases',
    'footer.module.cards': 'Management Cards',
    'footer.contact.phone': 'Phone',
    'footer.contact.address': 'Address',

    // Landing page module tags
    'module.tag.stockTpe': 'TPE Stock',
    'module.tag.parcTpe': 'TPE Fleet',
    'module.tag.maintenance': 'Maintenance',
    'module.tag.retours': 'Returns',
    'module.tag.transferts': 'Transfers',
    'module.tag.reforme': 'Reform',
    'module.tag.stockChargers': 'Charger Stock',
    'module.tag.stockBases': 'Base Stock',
    'module.tag.transfertsChargers': 'Charger Transfers',
    'module.tag.transfertsBases': 'Base Transfers',
    'module.tag.stockCards': 'Card Stock',
    'module.tag.cardsCirculation': 'Cards in Circulation',
    'module.tag.cardTracking': 'Card Tracking',
    'module.stat.accessories': 'Accessories',
    'module.stat.activeCards': 'Active Cards',

    // Dashboard
    'dashboard.transactions': 'Transactions',
    'dashboard.terminalId': 'Terminal ID',
    'month.jan': 'Jan',
    'month.feb': 'Feb',
    'month.mar': 'Mar',
    'month.apr': 'Apr',
    'month.may': 'May',
    'month.jun': 'Jun',
    'month.jul': 'Jul',
    'month.aug': 'Aug',
    'month.sep': 'Sep',
    'month.oct': 'Oct',
    'month.nov': 'Nov',
    'month.dec': 'Dec',

    // Quick links
    'quicklink.home': 'Home',
    'quicklink.modules': 'Modules',
    'quicklink.dashboard': 'Dashboard',
    'quicklink.roles': 'Roles',
    'quicklink.contact': 'Contact',

    // Common
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.add': 'Add',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.export': 'Export',
    'common.print': 'Print',
    'common.actions': 'Actions',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.serial': 'Serial Number',
    'common.model': 'Model',
    'common.structure': 'Structure',
    'common.district': 'District',
    'common.station': 'Station',
    'common.view': 'View',
    'common.details': 'Details',
    'common.loading': 'Loading...',
    'common.noData': 'No data available',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language') as Language;
      return saved || 'fr';
    }
    return 'fr';
  });

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.fr] || key;
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
