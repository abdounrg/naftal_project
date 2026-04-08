import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Play, Shield, Users, TrendingUp, CheckCircle } from 'lucide-react'

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false)
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200)
    return () => clearTimeout(timer)
  }, [])

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      id="hero"
      ref={heroRef}
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
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              to right,
              rgba(0, 8, 30, 0.92) 0%,
              rgba(0, 15, 50, 0.85) 35%,
              rgba(0, 20, 60, 0.6) 60%,
              rgba(0, 20, 60, 0.35) 100%
            )`,
          }}
        />
        {/* Subtle circuit pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute top-20 right-16 w-3 h-3 rounded-full bg-[var(--naftal-yellow)] opacity-80 animate-pulse" />
      <div className="absolute bottom-1/3 left-8 w-2 h-2 rounded-full bg-[var(--naftal-yellow)] opacity-60 animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{
                transitionTimingFunction: 'var(--ease-expo-out)',
                transitionDelay: '100ms',
                background: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <span className="w-2 h-2 rounded-full bg-[var(--naftal-yellow)] animate-pulse" />
              <span className="text-sm font-medium text-gray-300">Plateforme NAFTAL</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1]">
              <span
                className={`block transition-all duration-600 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionTimingFunction: 'var(--ease-expo-out)',
                  transitionDelay: '200ms',
                  color: 'var(--naftal-yellow)',
                }}
              >
                Gestion
              </span>
              <span
                className={`block transition-all duration-600 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionTimingFunction: 'var(--ease-expo-out)',
                  transitionDelay: '320ms',
                  color: '#ffffff',
                }}
              >
                Electronique des
              </span>
              <span
                className={`block transition-all duration-600 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionTimingFunction: 'var(--ease-expo-out)',
                  transitionDelay: '440ms',
                  color: '#ffffff',
                }}
              >
                Activites de
              </span>
              <span
                className={`block transition-all duration-600 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionTimingFunction: 'var(--ease-expo-out)',
                  transitionDelay: '560ms',
                  color: '#ffffff',
                }}
              >
                Paiement
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className={`text-lg text-gray-400 leading-relaxed max-w-xl transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionTimingFunction: 'var(--ease-smooth)', transitionDelay: '700ms' }}
            >
              Plateforme de gestion des terminaux de paiement electronique pour les structures 
              commerciales NAFTAL. Suivez, controlez et optimisez vos operations en temps reel.
            </p>

            {/* CTA Buttons */}
            <div
              className={`flex flex-wrap gap-4 transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionTimingFunction: 'var(--ease-spring)', transitionDelay: '900ms' }}
            >
              <button
                onClick={() => scrollToSection('#modules')}
                className="group flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-base transition-all duration-300"
                style={{ background: 'var(--naftal-blue)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 71, 171, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Explorer la Plateforme
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => scrollToSection('#dashboard')}
                className="group flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300 border-2 border-white/20 text-white hover:border-white/40"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <Play className="w-5 h-5" />
                Documentation
              </button>
            </div>

            {/* Trust Indicators */}
            <div
              className={`flex flex-wrap items-center gap-6 pt-4 transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionTimingFunction: 'var(--ease-smooth)', transitionDelay: '1100ms' }}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[var(--naftal-yellow)]" />
                <span className="text-sm text-gray-400">Securise</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-400">100+ Structures</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[var(--naftal-yellow)]" />
                <span className="text-sm text-gray-400">Temps reel</span>
              </div>
            </div>
          </div>

          {/* Right Content - Floating Stats over background */}
          <div
            className={`relative transition-all duration-1000 hidden lg:block ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-24'
            }`}
            style={{
              transitionTimingFunction: 'var(--ease-expo-out)',
              transitionDelay: '600ms',
            }}
          >
            {/* Floating Stats Cards */}
            <div
              className={`absolute top-8 right-0 rounded-xl p-5 transition-all duration-700 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
              }`}
              style={{
                transitionTimingFunction: 'var(--ease-spring)',
                transitionDelay: '1000ms',
                animation: 'float 5s ease-in-out infinite',
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(40, 167, 69, 0.15)' }}
                >
                  <CheckCircle className="w-5 h-5 text-[var(--naftal-success)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">98%</p>
                  <p className="text-xs text-gray-400">Disponibilite</p>
                </div>
              </div>
            </div>

            <div
              className={`absolute bottom-24 left-0 rounded-xl p-5 transition-all duration-700 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
              }`}
              style={{
                transitionTimingFunction: 'var(--ease-spring)',
                transitionDelay: '1200ms',
                animation: 'float 7s ease-in-out infinite',
                animationDelay: '1s',
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(0, 71, 171, 0.2)' }}
                >
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">1,234</p>
                  <p className="text-xs text-gray-400">TPE Geres</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: 'linear-gradient(to top, white 0%, transparent 100%)',
        }}
      />
    </section>
  )
}

export default Hero
