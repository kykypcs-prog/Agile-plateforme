import { useNavigate } from 'react-router-dom'

function Index() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50/30 to-white">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-12 py-5 border-b border-indigo-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="font-semibold text-gray-800">Agile Platform</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="text-gray-600 text-sm hover:text-indigo-600 transition px-4 py-2"
          >
            Se connecter
          </button>
          <button
            onClick={() => navigate('/register')}
            className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm px-5 py-2 rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition shadow-md"
          >
            Commencer gratuitement
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center px-8 pt-24 pb-16">
        <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-indigo-200 shadow-sm">
          <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></div>
          Méthode Agile · Scrum · Kanban
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Gérez vos projets avec
          <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent"> la méthode Agile</span>
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Une plateforme complète pour organiser vos sprints, suivre vos tâches et collaborer efficacement en équipe.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('/register')}
            className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition font-medium shadow-md"
          >
            Démarrer maintenant →
          </button>
          <button
            onClick={() => navigate('/login')}
            className="text-gray-600 px-6 py-3 rounded-xl border border-gray-300 hover:border-indigo-300 hover:text-indigo-600 transition font-medium text-sm bg-white"
          >
            Se connecter
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-8 pb-24">
        <div className="grid grid-cols-3 gap-6">
          {[
            {
              icon: '📋',
              title: 'Gestion de Projets',
              description: 'Créez et organisez vos projets avec des équipes dédiées et des rôles bien définis.',
              color: 'from-rose-50 to-rose-100 border-rose-200'
            },
            {
              icon: '🏃',
              title: 'Sprints Agile',
              description: 'Planifiez vos sprints avec des dates de début et de fin pour une livraison régulière.',
              color: 'from-indigo-50 to-indigo-100 border-indigo-200'
            },
            {
              icon: '✅',
              title: 'Tableau Kanban',
              description: 'Visualisez l\'avancement de vos tâches en temps réel avec un tableau Kanban intuitif.',
              color: 'from-emerald-50 to-emerald-100 border-emerald-200'
            },
            {
              icon: '👥',
              title: 'Gestion des Membres',
              description: 'Invitez des membres, assignez des rôles et gérez les permissions de chaque utilisateur.',
              color: 'from-amber-50 to-amber-100 border-amber-200'
            },
            {
              icon: '📊',
              title: 'Statistiques',
              description: 'Suivez la performance de votre équipe avec des graphiques et des métriques détaillées.',
              color: 'from-violet-50 to-violet-100 border-violet-200'
            },
            {
              icon: '🔐',
              title: 'Sécurité',
              description: 'Authentification sécurisée avec JWT et gestion des accès par rôle.',
              color: 'from-sky-50 to-sky-100 border-sky-200'
            },
          ].map((feature, i) => (
            <div key={i} className={`bg-gradient-to-br ${feature.color} rounded-2xl p-6 border shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Roles */}
      <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-t border-gray-200 py-20">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">3 rôles pour votre équipe</h2>
          <p className="text-gray-500 text-sm mb-12">Chaque membre a accès aux fonctionnalités adaptées à son rôle</p>
          <div className="grid grid-cols-3 gap-6">
            {[
              {
                icon: '👑',
                role: 'Administrateur',
                color: 'bg-rose-100 border-rose-300',
                badge: 'bg-rose-200 text-rose-700',
                features: ['Gestion complète', 'Tous les projets', 'Gestion des utilisateurs', 'Statistiques globales']
              },
              {
                icon: '👔',
                role: 'Chef de projet',
                color: 'bg-indigo-100 border-indigo-300',
                badge: 'bg-indigo-200 text-indigo-700',
                features: ['Créer des projets', 'Gérer les sprints', 'Assigner les tâches', 'Gérer son équipe']
              },
              {
                icon: '👨‍💻',
                role: 'Membre',
                color: 'bg-emerald-100 border-emerald-300',
                badge: 'bg-emerald-200 text-emerald-700',
                features: ['Voir ses projets', 'Gérer ses tâches', 'Tableau Kanban', 'Voir son équipe']
              },
            ].map((role, i) => (
              <div key={i} className={`${role.color} rounded-2xl p-6 border-2 shadow-lg hover:shadow-xl transition-all duration-300 text-left`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{role.icon}</span>
                  <span className={`${role.badge} text-xs font-bold px-2 py-1 rounded-full`}>{role.role}</span>
                </div>
                <ul className="space-y-2">
                  {role.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-2xl mx-auto text-center px-8 py-24">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-12 shadow-xl">
          <h2 className="text-3xl font-bold text-white mb-4">Prêt à commencer ?</h2>
          <p className="text-indigo-100 text-sm mb-8">Créez votre compte gratuitement et commencez à gérer vos projets dès aujourd'hui.</p>
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-indigo-600 px-8 py-3 rounded-xl hover:bg-gray-100 transition font-medium shadow-md"
          >
            Créer mon compte →
          </button>
        </div>
      </div>

    </div>
  )
}

export default Index