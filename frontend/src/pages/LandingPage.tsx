import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Shield, Users, TrendingUp, CheckCircle, CreditCard, IdCard, ShieldCheck, LayoutDashboard, ArrowLeftRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Phone, MapPin } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: [0.4, 0, 0.2, 1] },
});

const sectionReveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] },
};

const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0);
  const { t } = useLanguage();

  // Throttled scroll handler for navbar only
  const ticking = useRef(false);
  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Throttled 3D tilt for dashboard image
  const tiltRef = useRef<HTMLDivElement>(null);
  const tiltRafRef = useRef<number | null>(null);
  const handleTiltMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (tiltRafRef.current) return;
    tiltRafRef.current = requestAnimationFrame(() => {
      tiltRafRef.current = null;
      const el = tiltRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(1000px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateZ(20px)`;
    });
  }, []);
  const handleTiltLeave = useCallback(() => {
    if (tiltRafRef.current) { cancelAnimationFrame(tiltRafRef.current); tiltRafRef.current = null; }
    if (tiltRef.current) tiltRef.current.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) translateZ(0)';
  }, []);

  const features = [
    {
      icon: CreditCard,
      title: t('features.tpe.title'),
      description: t('features.tpe.desc'),
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: IdCard,
      title: t('features.cards.title'),
      description: t('features.cards.desc'),
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      icon: ShieldCheck,
      title: t('features.access.title'),
      description: t('features.access.desc'),
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: LayoutDashboard,
      title: t('features.dashboard.title'),
      description: t('features.dashboard.desc'),
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      icon: ArrowLeftRight,
      title: t('features.transfers.title'),
      description: t('features.transfers.desc'),
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    },
  ];

  const modules = [
    {
      title: t('modules.tpe.title'),
      description: t('modules.tpe.desc'),
      image: '/module-tpe.jpg',
      features: [t('module.tag.stockTpe'), t('module.tag.maintenance'), t('module.tag.retours'), t('module.tag.transferts'), t('module.tag.reforme')],
      color: 'from-blue-500 to-blue-600',
      stats: { label: t('stats.tpe'), value: '1,234' },
    },
    {
      title: t('modules.chargers.title'),
      description: t('modules.chargers.desc'),
      image: '/module-chargers.jpg',
      features: [t('module.tag.stockChargers'), t('module.tag.stockBases'), t('module.tag.transfertsChargers'), t('module.tag.transfertsBases')],
      color: 'from-green-500 to-green-600',
      stats: { label: t('module.stat.accessories'), value: '2,456' },
    },
    {
      title: t('modules.cards.title'),
      description: t('modules.cards.desc'),
      image: '/module-cards.jpg',
      features: [t('module.tag.stockCards'), t('module.tag.cardsCirculation'), t('module.tag.cardTracking'), t('module.tag.transferts')],
      color: 'from-purple-500 to-purple-600',
      stats: { label: t('module.stat.activeCards'), value: '3,789' },
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      <Navbar scrollY={scrollY} />
      
      {/* Hero Section */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center overflow-hidden pt-20"
      >
        {/* Full Background Image */}
        <div className="absolute inset-0">
          <img
            src="/Gemini_Generated_Image_oztwf6oztwf6oztw.png"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
          />
          {/* Dark gradient overlay for text readability */}
          <div
            className="absolute inset-0 hero-overlay-gradient"
          />
          {/* Subtle pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] hero-pattern"
          />
        </div>

        {/* Floating yellow accent dots */}
        <div className="absolute top-24 right-20 w-3 h-3 rounded-full bg-[var(--naftal-yellow)] opacity-70" />
        <div className="absolute bottom-40 left-10 w-2 h-2 rounded-full bg-[var(--naftal-yellow)] opacity-50" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Badge */}
              <motion.div
                {...fadeUp(0)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.06] backdrop-blur-[10px]"
              >
                <span className="w-2 h-2 rounded-full bg-[var(--naftal-yellow)]" />
                <span className="text-sm font-medium text-gray-300">{t('hero.badge')}</span>
              </motion.div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1]">
                <motion.span {...fadeUp(0.1)} className="block text-[var(--naftal-yellow)]">
                  {t('hero.title').split(' ')[0]}
                </motion.span>
                <motion.span {...fadeUp(0.18)} className="block text-white">
                  {t('hero.title').split(' ').slice(1, 3).join(' ')}
                </motion.span>
                <motion.span {...fadeUp(0.26)} className="block text-white">
                  {t('hero.title').split(' ').slice(3).join(' ')}
                </motion.span>
              </h1>

              {/* Subtitle */}
              <motion.p {...fadeUp(0.34)} className="text-lg text-gray-400 leading-relaxed max-w-xl">
                {t('hero.subtitle')}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div {...fadeUp(0.42)} className="flex flex-wrap gap-4">
                <motion.a
                  href="#modules"
                  whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0, 71, 171, 0.5)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="group flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-base bg-blue-500"
                >
                  {t('hero.cta.primary')}
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </motion.a>
                <motion.button
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="group flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base border-2 border-white/20 text-white hover:border-white/40 bg-white/5 backdrop-blur-[10px]"
                >
                  <Play className="w-5 h-5" />
                  {t('hero.cta.secondary')}
                </motion.button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div {...fadeUp(0.5)} className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[var(--naftal-yellow)]" />
                  <span className="text-sm text-gray-400">{t('hero.trust.secure')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-gray-400">{t('hero.trust.structures')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[var(--naftal-yellow)]" />
                  <span className="text-sm text-gray-400">{t('hero.trust.realtime')}</span>
                </div>
              </motion.div>
            </div>

            {/* Right Content - Dashboard Preview */}
            <motion.div {...fadeUp(0.28)} className="perspective-1000">
              <div className="relative">
                {/* Main Dashboard Image */}
                <div
                  ref={tiltRef}
                  className="relative rounded-2xl overflow-hidden hero-dashboard-shadow transition-transform duration-100 ease-out"
                  onMouseMove={handleTiltMove}
                  onMouseLeave={handleTiltLeave}
                >
                  <img src="/hero-dashboard.jpg" alt="NAFTAL GAP Dashboard" className="w-full h-auto relative z-[1]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-[2]" />
                </div>

                {/* Floating Stats Card - Top Right */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
                  className="absolute -top-4 -right-4 rounded-xl p-4 glass-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-500/20">
                      <CheckCircle className="w-5 h-5 text-[var(--naftal-success)]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">98%</p>
                      <p className="text-xs text-gray-400">{t('stats.availability')}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Stats Card - Bottom Left */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.85, duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
                  className="absolute -bottom-4 -left-4 rounded-xl p-4 glass-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[rgba(0,71,171,0.25)]">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">1,234</p>
                      <p className="text-xs text-gray-400">{t('stats.tpe')}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Gradient Fade - seamless into next section */}
        <div
          className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none gradient-fade-bottom"
        />
      </section>

      {/* Features Section */}
      <section className="relative pt-24 pb-24 overflow-hidden bg-dark-section">
        <div className="absolute top-10 right-10 w-6 h-6 rounded-full bg-[var(--naftal-yellow)] opacity-30" />
        <div className="absolute bottom-20 left-20 w-4 h-4 rounded-full bg-[var(--naftal-yellow)] opacity-20" />
        
        <motion.div {...sectionReveal} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              {t('features.title').split(' ')[0]}{' '}
              <span className="text-[var(--naftal-blue)]">{t('features.title').split(' ').slice(1).join(' ')}</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.08, duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 hover:shadow-2xl hover:shadow-blue-900/20 hover:border-blue-500/30 will-change-transform"
              >
                <div className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-6 transition-transform duration-200 group-hover:scale-110 ring-2 ring-blue-500/20`}>
                  <feature.icon className={`w-7 h-7 bg-gradient-to-br ${feature.color} text-white rounded-lg p-1.5`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors duration-200">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--naftal-yellow)] to-[var(--naftal-blue)] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl origin-left" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="relative py-24 overflow-hidden bg-dark-gradient-section">
        <div className="absolute top-20 left-10 w-5 h-5 rounded-full bg-[var(--naftal-yellow)] opacity-25" />
        
        <motion.div {...sectionReveal} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              {t('modules.title').split(' ')[0]}{' '}
              <span className="text-[var(--naftal-blue)]">{t('modules.title').split(' ').slice(1).join(' ')}</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              {t('modules.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {modules.map((module, i) => (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.1, duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group bg-slate-800/60 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl border border-slate-700/50 hover:shadow-2xl hover:shadow-blue-900/20 hover:border-blue-500/30 will-change-transform"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={module.image} alt={module.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-10`} />
                  <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border-l-4 border-amber-400">
                    <p className="text-xl font-bold text-white">{module.stats.value}</p>
                    <p className="text-xs text-gray-400">{module.stats.label}</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3">{module.title}</h3>
                  <p className="text-gray-400 mb-6 text-sm">{module.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {module.features.map((feature) => (
                      <span key={feature} className="px-3 py-1 bg-blue-900/30 text-blue-300 text-xs rounded-full font-medium border border-blue-800/30">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Contact Section */}
      <section className="relative py-24 overflow-hidden bg-naftal-contact-section">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-[var(--naftal-yellow)] opacity-10" />
          <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-[var(--naftal-yellow)] opacity-5" />
        </div>

        <motion.div {...sectionReveal} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              {t('cta.title')}
            </h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Mail, title: t('cta.email'), content: 'contact@naftal-gap.dz' },
              { icon: Phone, title: t('cta.phone'), content: '+213 23 XX XX XX' },
              { icon: MapPin, title: t('cta.address'), content: 'Naftal, Route des Dunes, BP 73 Chéraga, Alger' },
            ].map((contact, i) => (
              <motion.div
                key={contact.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-yellow-400/60"
              >
                <div className="w-12 h-12 rounded-xl bg-yellow-400/20 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                  <contact.icon className="w-6 h-6 text-[var(--naftal-yellow)]" />
                </div>
                <div>
                  <p className="text-sm text-blue-200 mb-1">{contact.title}</p>
                  <p className="text-base font-semibold text-white">{contact.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
