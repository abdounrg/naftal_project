import { useEffect, useRef, useState } from 'react'
import { 
  CreditCard, 
  IdCard, 
  ShieldCheck, 
  LayoutDashboard, 
  ArrowLeftRight 
} from 'lucide-react'

const Features = () => {
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

  const features = [
    {
      icon: CreditCard,
      title: 'Gestion des TPE',
      description: 'Suivez vos terminaux de paiement depuis l\'acquisition jusqu\'a la mise en service. Gestion complete du cycle de vie.',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: IdCard,
      title: 'Suivi des Cartes',
      description: 'Gerez les cartes de gestion et de maintenance avec un suivi en temps reel et des alertes automatiques.',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: ShieldCheck,
      title: 'Controle des Acces',
      description: 'Systeme de roles et privileges securise pour une gestion hierarchique efficace et tracable.',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: LayoutDashboard,
      title: 'Tableau de Bord',
      description: 'Visualisez vos indicateurs de performance et l\'etat de votre parc en un coup d\'oeil.',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      icon: ArrowLeftRight,
      title: 'Gestion des Transferts',
      description: 'Suivez les mouvements de materiel entre structures avec tracabilite complete et historique.',
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50',
    },
  ]

  return (
    <section
      ref={sectionRef}
      className="relative py-24 bg-white overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 10% 20%, rgba(0, 71, 171, 0.05) 0%, transparent 30%),
                              radial-gradient(circle at 90% 80%, rgba(0, 71, 171, 0.05) 0%, transparent 30%)`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
          >
            Fonctionnalites{' '}
            <span className="text-[var(--naftal-blue)]">Principales</span>
          </h2>
          <p
            className={`text-lg text-gray-600 max-w-2xl mx-auto transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionTimingFunction: 'var(--ease-smooth)', transitionDelay: '200ms' }}
          >
            Une plateforme complete pour la gestion de vos terminaux de paiement electronique
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`group relative bg-white rounded-2xl p-8 border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:border-[var(--naftal-blue)]/20 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{
                transitionTimingFunction: 'var(--ease-expo-out)',
                transitionDelay: `${400 + index * 120}ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-12px)'
                e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 71, 171, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = ''
              }}
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110`}
                style={{ transitionTimingFunction: 'var(--ease-spring)' }}
              >
                <feature.icon className={`w-7 h-7 bg-gradient-to-br ${feature.color} text-white rounded-lg p-1.5`} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[var(--naftal-blue)] transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--naftal-blue)] to-[var(--naftal-dark-blue)] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-2xl" 
                style={{ transformOrigin: 'left', transitionTimingFunction: 'var(--ease-expo-out)' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
