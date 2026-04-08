import { useEffect, useRef, useState } from 'react'
import { Facebook, Twitter, Linkedin, ChevronRight } from 'lucide-react'

import { useLanguage } from '../context/LanguageContext'

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false)
  const footerRef = useRef<HTMLElement>(null)
  const { t } = useLanguage()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (footerRef.current) {
      observer.observe(footerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const quickLinks = [
    { name: t('quicklink.home'), href: '#hero' },
    { name: t('quicklink.modules'), href: '#modules' },
    { name: t('quicklink.dashboard'), href: '#dashboard' },
    { name: t('quicklink.roles'), href: '#roles' },
    { name: t('quicklink.contact'), href: '#cta' },
  ]

  const modules = [
    t('footer.module.tpe'),
    t('footer.module.chargers'),
    t('footer.module.cards'),
  ]

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer
      ref={footerRef}
      className="relative bg-[var(--naftal-dark-blue)] text-white overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 40%),
                              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%)`,
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Column */}
            <div
              className={`lg:col-span-1 transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionTimingFunction: 'var(--ease-expo-out)', transitionDelay: '0ms' }}
            >
              <a href="#hero" className="flex items-center gap-3 mb-6 group">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-white/20 transition-all duration-300 group-hover:border-white/40">
                  <img 
                    src="/naftal-logo.png" 
                    alt="NAFTAL Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xl leading-tight">NAFTAL</span>
                  <span className="text-xs font-semibold leading-tight tracking-wider uppercase text-blue-300">GAP</span>
                </div>
              </a>
              <p className="text-blue-200 text-sm leading-relaxed mb-6">
                {t('footer.description')}
              </p>
              {/* Social Icons */}
              <div className="flex gap-3">
                {[
                  { icon: Facebook, label: 'Facebook' },
                  { icon: Twitter, label: 'Twitter' },
                  { icon: Linkedin, label: 'LinkedIn' },
                ].map((social, index) => (
                  <a
                    key={social.label}
                    href="#"
                    className={`w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center transition-all duration-300 hover:bg-white/20 hover:scale-110 ${
                      isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                    }`}
                    style={{
                      transitionTimingFunction: 'var(--ease-spring)',
                      transitionDelay: `${600 + index * 100}ms`,
                    }}
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div
              className={`transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionTimingFunction: 'var(--ease-expo-out)', transitionDelay: '150ms' }}
            >
              <h4 className="text-sm font-semibold uppercase tracking-wider text-blue-300 mb-6">
                {t('footer.quicklinks')}
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li
                    key={link.name}
                    className={`transition-all duration-300 ${
                      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}
                    style={{
                      transitionTimingFunction: 'var(--ease-smooth)',
                      transitionDelay: `${300 + index * 50}ms`,
                    }}
                  >
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault()
                        scrollToSection(link.href)
                      }}
                      className="group flex items-center gap-2 text-blue-200 hover:text-white transition-colors duration-300"
                    >
                      <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modules */}
            <div
              className={`transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionTimingFunction: 'var(--ease-expo-out)', transitionDelay: '300ms' }}
            >
              <h4 className="text-sm font-semibold uppercase tracking-wider text-blue-300 mb-6">
                {t('footer.modules')}
              </h4>
              <ul className="space-y-3">
                {modules.map((module, index) => (
                  <li
                    key={module}
                    className={`transition-all duration-300 ${
                      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}
                    style={{
                      transitionTimingFunction: 'var(--ease-smooth)',
                      transitionDelay: `${400 + index * 50}ms`,
                    }}
                  >
                    <span className="text-blue-200">{module}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div
              className={`transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionTimingFunction: 'var(--ease-expo-out)', transitionDelay: '450ms' }}
            >
              <h4 className="text-sm font-semibold uppercase tracking-wider text-blue-300 mb-6">
                {t('footer.contact')}
              </h4>
              <ul className="space-y-4">
                {[
                  { label: t('cta.email'), value: 'contact@naftal-gap.dz' },
                  { label: t('footer.contact.phone'), value: '+213 23 XX XX XX' },
                  { label: t('footer.contact.address'), value: 'Alger, Algerie' },
                ].map((contact, index) => (
                  <li
                    key={contact.label}
                    className={`transition-all duration-300 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                    style={{
                      transitionTimingFunction: 'var(--ease-smooth)',
                      transitionDelay: `${500 + index * 50}ms`,
                    }}
                  >
                    <p className="text-xs text-blue-400 mb-1">{contact.label}</p>
                    <p className="text-sm">{contact.value}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div
              className={`flex flex-col md:flex-row justify-between items-center gap-4 transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionTimingFunction: 'var(--ease-smooth)', transitionDelay: '700ms' }}
            >
              <p className="text-sm text-blue-300 text-center md:text-left">
                &copy; {new Date().getFullYear()} NAFTAL GAP. {t('footer.copyright')}
              </p>
              <div className="flex gap-6 text-sm text-blue-300">
                <a href="#" className="hover:text-white transition-colors duration-300">
                  {t('footer.privacy')}
                </a>
                <a href="#" className="hover:text-white transition-colors duration-300">
                  {t('footer.terms')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
