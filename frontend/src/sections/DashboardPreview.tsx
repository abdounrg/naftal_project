import { useEffect, useRef, useState } from 'react'
import { TrendingUp, Users, Clock, Shield, Activity, BarChart3 } from 'lucide-react'

const DashboardPreview = () => {
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
      { threshold: 0.15 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const stats = [
    { icon: Activity, value: '1,234', label: 'TPE Geres', color: 'bg-blue-500' },
    { icon: TrendingUp, value: '98%', label: 'Disponibilite', color: 'bg-green-500' },
    { icon: Users, value: '156', label: 'Structures', color: 'bg-purple-500' },
    { icon: Clock, value: '< 24h', label: 'Temps de Reparation', color: 'bg-orange-500' },
    { icon: Shield, value: '100%', label: 'Tracabilite', color: 'bg-cyan-500' },
    { icon: BarChart3, value: '24/7', label: 'Monitoring', color: 'bg-pink-500' },
  ]

  return (
    <section
      id="dashboard"
      ref={sectionRef}
      className="relative py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #f5f5f5 0%, #e6f0ff 100%)' }}
    >
      {/* Background Decorations */}
      <div className="absolute inset-0">
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(0, 71, 171, 0.3) 0%, transparent 70%)',
            transform: 'translate(30%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(0, 71, 171, 0.2) 0%, transparent 70%)',
            transform: 'translate(-30%, 30%)',
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
            Tableau de Bord <span className="text-[var(--naftal-blue)]">Intuitif</span>
          </h2>
          <p
            className={`text-lg text-gray-600 max-w-2xl mx-auto transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionTimingFunction: 'var(--ease-smooth)', transitionDelay: '200ms' }}
          >
            Visualisez vos donnees en temps reel et prenez des decisions eclairees
          </p>
        </div>

        {/* Dashboard Preview */}
        <div className="relative">
          {/* Stats Cards - Floating Around Dashboard */}
          <div className="hidden lg:block">
            {stats.slice(0, 3).map((stat, index) => (
              <div
                key={stat.label}
                className={`absolute bg-white rounded-xl shadow-lg p-4 transition-all duration-700 ${
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                }`}
                style={{
                  transitionTimingFunction: 'var(--ease-spring)',
                  transitionDelay: `${800 + index * 150}ms`,
                  animation: `float ${5 + index}s ease-in-out infinite`,
                  animationDelay: `${index * 0.5}s`,
                  ...(index === 0 && { top: '10%', left: '0', transform: 'translateX(-50%)' }),
                  ...(index === 1 && { top: '5%', right: '0', transform: 'translateX(50%)' }),
                  ...(index === 2 && { bottom: '20%', left: '-2%', transform: 'translateX(-30%)' }),
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
            {stats.slice(3, 6).map((stat, index) => (
              <div
                key={stat.label}
                className={`absolute bg-white rounded-xl shadow-lg p-4 transition-all duration-700 ${
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                }`}
                style={{
                  transitionTimingFunction: 'var(--ease-spring)',
                  transitionDelay: `${1250 + index * 150}ms`,
                  animation: `float ${6 + index}s ease-in-out infinite`,
                  animationDelay: `${(index + 3) * 0.5}s`,
                  ...(index === 0 && { bottom: '15%', right: '0', transform: 'translateX(50%)' }),
                  ...(index === 1 && { top: '40%', right: '-3%', transform: 'translateX(20%)' }),
                  ...(index === 2 && { bottom: '5%', left: '15%' }),
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Dashboard Image */}
          <div
            className={`relative mx-auto max-w-4xl transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
            }`}
            style={{
              transitionTimingFunction: 'var(--ease-expo-out)',
              transitionDelay: '500ms',
              perspective: '1500px',
            }}
          >
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500"
              style={{
                boxShadow: '0 40px 80px rgba(0, 71, 171, 0.25)',
                transformStyle: 'preserve-3d',
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = (e.clientX - rect.left) / rect.width - 0.5
                const y = (e.clientY - rect.top) / rect.height - 0.5
                e.currentTarget.style.transform = `perspective(1500px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(30px)`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'perspective(1500px) rotateY(0) rotateX(0) translateZ(0)'
              }}
            >
              <img
                src="/dashboard-preview.jpg"
                alt="NAFTAL GAP Dashboard Preview"
                className="w-full h-auto"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/5 to-transparent pointer-events-none" />
            </div>

            {/* Mobile Stats Grid */}
            <div className="lg:hidden mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`bg-white rounded-xl shadow-md p-4 transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{
                    transitionTimingFunction: 'var(--ease-expo-out)',
                    transitionDelay: `${800 + index * 100}ms`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Visualisation en Temps Reel',
              description: 'Suivez l\'etat de votre parc de TPE et cartes en temps reel avec des mises a jour instantanees.',
            },
            {
              title: 'Indicateurs de Performance',
              description: 'Analysez les KPIs essentiels comme le taux de disponibilite, les temps de reparation et plus.',
            },
            {
              title: 'Alertes Intelligentes',
              description: 'Recevez des notifications automatiques pour les anomalies et les equipements a surveiller.',
            },
          ].map((feature, index) => (
            <div
              key={feature.title}
              className={`text-center transition-all duration-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionTimingFunction: 'var(--ease-expo-out)',
                transitionDelay: `${1400 + index * 150}ms`,
              }}
            >
              <h4 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h4>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default DashboardPreview
