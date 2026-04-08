import { useState, useEffect } from 'react'
import { Menu, X, ChevronRight } from 'lucide-react'

interface NavbarProps {
  scrollY: number
}

const Navbar = ({ scrollY }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const isScrolled = scrollY > 50

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const navLinks = [
    { name: 'Accueil', href: '#hero' },
    { name: 'Modules', href: '#modules' },
    { name: 'Dashboard', href: '#dashboard' },
    { name: 'Roles', href: '#roles' },
    { name: 'Contact', href: '#cta' },
  ]

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'glassmorphism py-3'
          : 'bg-transparent py-5'
      }`}
      style={{
        transitionTimingFunction: 'var(--ease-expo-out)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault()
              scrollToSection('#hero')
            }}
            className={`flex items-center gap-3 transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
            style={{
              transitionTimingFunction: 'var(--ease-expo-out)',
              transitionDelay: '0ms',
            }}
          >
            <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-md border-2 border-[var(--naftal-blue)]/10">
              <img 
                src="/naftal-logo.png" 
                alt="NAFTAL Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className={`font-bold text-xl leading-tight transition-colors duration-300 ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>
                NAFTAL
              </span>
              <span className={`text-xs font-semibold leading-tight tracking-wider uppercase transition-colors duration-300 ${
                isScrolled ? 'text-[var(--naftal-blue)]' : 'text-[var(--naftal-yellow)]'
              }`}>
                GAP
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection(link.href)
                }}
                className={`relative text-sm font-medium transition-all duration-300 group ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                } ${isScrolled ? 'text-gray-700 hover:text-[var(--naftal-blue)]' : 'text-white/90 hover:text-white'}`}
                style={{
                  transitionTimingFunction: 'var(--ease-expo-out)',
                  transitionDelay: `${100 + index * 80}ms`,
                }}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${isScrolled ? 'bg-[var(--naftal-blue)]' : 'bg-white'}`} 
                  style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
                />
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium text-sm transition-all duration-500 hover:shadow-lg hover:shadow-blue-500/30 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              }`}
              style={{
                background: 'var(--naftal-blue)',
                transitionTimingFunction: 'var(--ease-spring)',
                transitionDelay: '500ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
                e.currentTarget.style.background = 'var(--naftal-dark-blue)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.background = 'var(--naftal-blue)'
              }}
            >
              Connexion
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? 'text-gray-700' : 'text-white'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? 'text-gray-700' : 'text-white'}`} />
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
          <div className="bg-white rounded-xl shadow-xl p-4 space-y-2">
            {navLinks.map((link, index) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection(link.href)
                }}
                className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-[var(--naftal-light-blue)] hover:text-[var(--naftal-blue)] transition-all duration-300 font-medium"
                style={{
                  transitionDelay: `${index * 50}ms`,
                }}
              >
                {link.name}
              </a>
            ))}
            <button className="w-full mt-4 btn-primary flex items-center justify-center gap-2">
              Connexion
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
