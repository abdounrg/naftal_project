import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'

const Modules = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
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

  const modules = [
    {
      title: 'Gestion des TPE NAFTALCARD',
      description: 'Suivi complet des terminaux de paiement electronique avec gestion du stock, de la maintenance, des retours et des transferts.',
      image: '/module-tpe.jpg',
      features: [
        'Stock TPE',
        'Maintenance',
        'Retours',
        'Transferts',
        'Reforme',
      ],
      color: 'from-blue-500 to-blue-600',
      stats: { label: 'TPE Geres', value: '1,234' },
    },
    {
      title: 'Gestion des Chargeurs et Bases',
      description: 'Controle des accessoires et equipements associes avec gestion des stocks et suivi des transferts entre structures.',
      image: '/module-chargers.jpg',
      features: [
        'Stock Chargeurs',
        'Stock Bases',
        'Transferts Chargeurs',
        'Transferts Bases',
      ],
      color: 'from-green-500 to-green-600',
      stats: { label: 'Accessoires', value: '2,456' },
    },
    {
      title: 'Gestion des Cartes de Gestion',
      description: 'Administration des cartes de gestion et maintenance avec suivi en temps reel du statut et des anomalies.',
      image: '/module-cards.jpg',
      features: [
        'Stock Cartes',
        'Cartes en Circulation',
        'Suivi des Cartes',
        'Transferts',
      ],
      color: 'from-purple-500 to-purple-600',
      stats: { label: 'Cartes Actives', value: '3,789' },
    },
  ]

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % modules.length)
  }

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + modules.length) % modules.length)
  }

  return (
    <section
      id="modules"
      ref={sectionRef}
      className="relative py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%)' }}
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, var(--naftal-blue) 1px, transparent 1px),
                              linear-gradient(to bottom, var(--naftal-blue) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
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
            Modules de <span className="text-[var(--naftal-blue)]">Gestion</span>
          </h2>
          <p
            className={`text-lg text-gray-600 max-w-2xl mx-auto transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionTimingFunction: 'var(--ease-smooth)', transitionDelay: '200ms' }}
          >
            Trois modules interconnectes pour une gestion complete de votre parc
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className={`relative transition-all duration-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
          style={{ transitionTimingFunction: 'var(--ease-expo-out)', transitionDelay: '400ms' }}
        >
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 hover:text-[var(--naftal-blue)] hover:shadow-xl transition-all duration-300"
            style={{ transitionTimingFunction: 'var(--ease-spring)' }}
            aria-label="Previous module"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 hover:text-[var(--naftal-blue)] hover:shadow-xl transition-all duration-300"
            style={{ transitionTimingFunction: 'var(--ease-spring)' }}
            aria-label="Next module"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Cards Container */}
          <div className="overflow-hidden px-8">
            <div
              className="flex transition-transform duration-700"
              style={{
                transform: `translateX(-${activeIndex * 100}%)`,
                transitionTimingFunction: 'var(--ease-expo-out)',
              }}
            >
              {modules.map((module, index) => (
                <div
                  key={module.title}
                  className="w-full flex-shrink-0 px-4"
                >
                  <div
                    className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100"
                    style={{
                      transform: index === activeIndex ? 'scale(1)' : 'scale(0.95)',
                      opacity: index === activeIndex ? 1 : 0.5,
                      transition: 'all 0.5s var(--ease-expo-out)',
                    }}
                  >
                    <div className="grid lg:grid-cols-2 gap-0">
                      {/* Image Side */}
                      <div className="relative h-64 lg:h-auto overflow-hidden">
                        <img
                          src={module.image}
                          alt={module.title}
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                          style={{ transitionTimingFunction: 'var(--ease-smooth)' }}
                        />
                        <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-10`} />
                        
                        {/* Stats Badge */}
                        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg">
                          <p className="text-2xl font-bold text-gray-900">{module.stats.value}</p>
                          <p className="text-xs text-gray-500">{module.stats.label}</p>
                        </div>
                      </div>

                      {/* Content Side */}
                      <div className="p-8 lg:p-12 flex flex-col justify-center">
                        <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                          {module.title}
                        </h3>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                          {module.description}
                        </p>

                        {/* Features List */}
                        <div className="grid grid-cols-2 gap-3">
                          {module.features.map((feature) => (
                            <div
                              key={feature}
                              className="flex items-center gap-2 text-sm text-gray-700"
                            >
                              <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${module.color} flex items-center justify-center flex-shrink-0`}>
                                <Check className="w-3 h-3 text-white" />
                              </div>
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-3 mt-8">
            {modules.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === activeIndex
                    ? 'w-8 h-2 bg-[var(--naftal-blue)]'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
                style={{ transitionTimingFunction: 'var(--ease-spring)' }}
                aria-label={`Go to module ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Modules
