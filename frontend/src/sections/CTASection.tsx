import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Mail, Phone, MapPin } from 'lucide-react'

const CTASection = () => {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="cta"
      ref={sectionRef}
      className="relative py-24 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0047AB 0%, #002a66 50%, #0047AB 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradientShift 15s ease infinite',
      }}
    >
      {/* Floating Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white opacity-5 animate-float"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-white opacity-5 animate-float"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-white opacity-5 animate-float"
          style={{ animationDelay: '4s' }}
        />
        
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h2
              className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 transition-all duration-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
            >
              Pret a Optimiser Votre{' '}
              <span className="text-blue-200">Gestion des Paiements?</span>
            </h2>
            <p
              className={`text-lg text-blue-100 mb-8 max-w-xl mx-auto lg:mx-0 transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionTimingFunction: 'var(--ease-smooth)', transitionDelay: '200ms' }}
            >
              Contactez-nous pour une demonstration personnalisee de la plateforme GAP 
              et decouvrez comment simplifier la gestion de vos terminaux de paiement.
            </p>

            {/* CTA Button */}
            <div
              className={`transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionTimingFunction: 'var(--ease-spring)', transitionDelay: '400ms' }}
            >
              <button
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white text-[var(--naftal-blue)] font-semibold text-lg transition-all duration-300 hover:shadow-2xl"
                style={{
                  boxShadow: '0 0 30px rgba(255, 255, 255, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 0 50px rgba(255, 255, 255, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.3)'
                }}
              >
                Demander une Demo
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Right Content - Contact Cards */}
          <div className="space-y-4">
            {[
              {
                icon: Mail,
                title: 'Email',
                content: 'contact@naftal-gap.dz',
                delay: 500,
              },
              {
                icon: Phone,
                title: 'Telephone',
                content: '+213 23 XX XX XX',
                delay: 650,
              },
              {
                icon: MapPin,
                title: 'Adresse',
                content: 'Alger, Algerie',
                delay: 800,
              },
            ].map((contact) => (
              <div
                key={contact.title}
                className={`group flex items-center gap-4 p-5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-500 hover:bg-white/20 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
                }`}
                style={{
                  transitionTimingFunction: 'var(--ease-expo-out)',
                  transitionDelay: `${contact.delay}ms`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(8px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)'
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center transition-all duration-300 group-hover:bg-white/30">
                  <contact.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-200">{contact.title}</p>
                  <p className="text-lg font-semibold text-white">{contact.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTASection
