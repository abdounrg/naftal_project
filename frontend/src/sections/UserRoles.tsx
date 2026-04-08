import { useEffect, useRef, useState } from 'react'
import { 
  Crown, 
  UserCog, 
  Building2, 
  Store, 
  Antenna,
  Check,
  X
} from 'lucide-react'

const UserRoles = () => {
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

  const roles = [
    {
      icon: Crown,
      title: 'Administrateur',
      level: 'DPE',
      description: 'Acces complet, gestion des parametres et validation des utilisateurs',
      privileges: [
        { text: 'Consultation de toutes les structures', granted: true },
        { text: 'Saisie de donnees pour toutes les structures', granted: true },
        { text: 'Gestion des parametres applicatifs', granted: true },
        { text: 'Gestion complete des utilisateurs', granted: true },
        { text: 'Validation des ajouts d\'utilisateurs', granted: true },
      ],
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      icon: UserCog,
      title: 'Membre DPE',
      level: 'DPE',
      description: 'Saisie de donnees pour toutes les structures sans acces aux parametres',
      privileges: [
        { text: 'Consultation de toutes les structures', granted: true },
        { text: 'Saisie de donnees pour toutes les structures', granted: true },
        { text: 'Gestion des parametres applicatifs', granted: false },
        { text: 'Gestion limitee des utilisateurs', granted: true },
        { text: 'Validation des utilisateurs', granted: false },
      ],
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Building2,
      title: 'Membre District',
      level: 'District',
      description: 'Saisie pour son district et structures associees, gestion des utilisateurs',
      privileges: [
        { text: 'Consultation de son district', granted: true },
        { text: 'Saisie pour son district et structures', granted: true },
        { text: 'Ajout d\'utilisateurs district', granted: true },
        { text: 'Acces aux parametres applicatifs', granted: false },
        { text: 'Validation des utilisateurs', granted: false },
      ],
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Store,
      title: 'Membre Agence',
      level: 'Agence',
      description: 'Saisie des donnees de son agence uniquement',
      privileges: [
        { text: 'Consultation de son agence', granted: true },
        { text: 'Saisie des donnees de son agence', granted: true },
        { text: 'Ajout d\'utilisateurs', granted: false },
        { text: 'Acces aux parametres', granted: false },
        { text: 'Donnees autres structures', granted: false },
      ],
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Antenna,
      title: 'Membre Antenne',
      level: 'Antenne',
      description: 'Saisie des donnees de son antenne uniquement',
      privileges: [
        { text: 'Consultation de son antenne', granted: true },
        { text: 'Saisie des donnees de son antenne', granted: true },
        { text: 'Ajout d\'utilisateurs', granted: false },
        { text: 'Acces aux parametres', granted: false },
        { text: 'Donnees autres structures', granted: false },
      ],
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50',
    },
  ]

  return (
    <section
      id="roles"
      ref={sectionRef}
      className="relative py-24 bg-white overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(0, 71, 171, 0.05) 0%, transparent 50%)`,
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
            Roles et <span className="text-[var(--naftal-blue)]">Privileges</span>
          </h2>
          <p
            className={`text-lg text-gray-600 max-w-2xl mx-auto transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionTimingFunction: 'var(--ease-smooth)', transitionDelay: '200ms' }}
          >
            Une hierarchie claire pour une gestion efficace et securisee
          </p>
        </div>

        {/* Organization Hierarchy Visual */}
        <div
          className={`mb-16 transition-all duration-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionTimingFunction: 'var(--ease-expo-out)', transitionDelay: '300ms' }}
        >
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
            <div className="px-4 py-2 rounded-lg bg-[var(--naftal-blue)] text-white font-medium">
              DPE (Direction Paiement Electronique)
            </div>
            <div className="text-gray-400">→</div>
            <div className="px-4 py-2 rounded-lg bg-blue-100 text-[var(--naftal-blue)] font-medium">
              District
            </div>
            <div className="text-gray-400">→</div>
            <div className="px-4 py-2 rounded-lg bg-green-100 text-green-700 font-medium">
              Structure Commerciale (Agence / Antenne)
            </div>
            <div className="text-gray-400">→</div>
            <div className="px-4 py-2 rounded-lg bg-purple-100 text-purple-700 font-medium">
              Station (Point de Vente)
            </div>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role, index) => (
            <div
              key={role.title}
              className={`group relative bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-xl ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{
                transitionTimingFunction: 'var(--ease-expo-out)',
                transitionDelay: `${400 + index * 100}ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.borderColor = 'rgba(0, 71, 171, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'rgb(243, 244, 246)'
              }}
            >
              {/* Header */}
              <div className={`p-6 ${role.bgColor}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center shadow-lg`}>
                    <role.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium bg-white/80 text-gray-700`}>
                    {role.level}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{role.title}</h3>
                <p className="text-sm text-gray-600">{role.description}</p>
              </div>

              {/* Privileges List */}
              <div className="p-6">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Privileges
                </h4>
                <ul className="space-y-3">
                  {role.privileges.map((privilege, pIndex) => (
                    <li
                      key={pIndex}
                      className="flex items-start gap-3 text-sm"
                    >
                      {privilege.granted ? (
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <X className="w-3 h-3 text-gray-400" />
                        </div>
                      )}
                      <span className={privilege.granted ? 'text-gray-700' : 'text-gray-400'}>
                        {privilege.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Accent */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${role.color}`} />
            </div>
          ))}
        </div>

        {/* User Management Note */}
        <div
          className={`mt-12 p-6 bg-[var(--naftal-light-blue)] rounded-2xl transition-all duration-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionTimingFunction: 'var(--ease-expo-out)', transitionDelay: '900ms' }}
        >
          <h4 className="text-lg font-bold text-gray-900 mb-3">Gestion des Utilisateurs</h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-[var(--naftal-blue)] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <p>L'ajout d'utilisateur est effectue par le district</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-[var(--naftal-blue)] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <p>La validation est requise par l'administrateur</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-[var(--naftal-blue)] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <p>Historique detaille des modifications automatique</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default UserRoles
