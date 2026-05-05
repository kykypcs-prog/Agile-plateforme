import { useNavigate } from 'react-router-dom'

function Index() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-12 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="font-semibold text-gray-800">Agile Platform</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="text-gray-600 text-sm hover:text-gray-900 transition px-4 py-2"
          >
            Se connecter
          </button>
          <button
            onClick={() => navigate('/register')}
            className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
          >
            Commencer gratuitement
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center px-8 pt-24 pb-16">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-indigo-100">
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
          Méthode Agile · Scrum · Kanban
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Gérez vos projets avec
          <span className="text-indigo-600"> la méthode Agile</span>
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Une plateforme complète pour organiser vos sprints, suivre vos tâches et collaborer efficacement en équipe.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('/register')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition font-medium"
          >
            Démarrer maintenant →
          </button>
          <button
            onClick={() => navigate('/login')}
            className="text-gray-600 px-6 py-3 rounded-xl border border-gray-200 hover:border-gray-300 transition font-medium text-sm"
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
              description: 'Créez et organisez vos projets avec des équipes dédiées et des rôles bien définis.'
            },
            {
              icon: '🏃',
              title: 'Sprints Agile',
              description: 'Planifiez vos sprints avec des dates de début et de fin pour une livraison régulière.'
            },
            {
              icon: '✅',
              title: 'Tableau Kanban',
              description: 'Visualisez l\'avancement de vos tâches en temps réel avec un tableau Kanban intuitif.'
            },
            {
              icon: '👥',
              title: 'Gestion des Membres',
              description: 'Invitez des membres, assignez des rôles et gérez les permissions de chaque utilisateur.'
            },
            {
              icon: '📊',
              title: 'Statistiques',
              description: 'Suivez la performance de votre équipe avec des graphiques et des métriques détaillées.'
            },
            {
              icon: '🔐',
              title: 'Sécurité',
              description: 'Authentification sécurisée avec JWT et gestion des accès par rôle.'
            },
          ].map((feature, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50 transition-all">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Roles */}
      <div className="bg-gray-50 border-t border-gray-100 py-20">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">3 rôles pour votre équipe</h2>
          <p className="text-gray-500 text-sm mb-12">Chaque membre a accès aux fonctionnalités adaptées à son rôle</p>
          <div className="grid grid-cols-3 gap-6">
            {[
              {
                icon: '👑',
                role: 'Administrateur',
                color: 'bg-rose-50 border-rose-100',
                badge: 'bg-rose-100 text-rose-600',
                features: ['Gestion complète', 'Tous les projets', 'Gestion des utilisateurs', 'Statistiques globales']
              },
              {
                icon: '👔',
                role: 'Chef de projet',
                color: 'bg-indigo-50 border-indigo-100',
                badge: 'bg-indigo-100 text-indigo-600',
                features: ['Créer des projets', 'Gérer les sprints', 'Assigner les tâches', 'Gérer son équipe']
              },
              {
                icon: '👨‍💻',
                role: 'Membre',
                color: 'bg-emerald-50 border-emerald-100',
                badge: 'bg-emerald-100 text-emerald-600',
                features: ['Voir ses projets', 'Gérer ses tâches', 'Tableau Kanban', 'Voir son équipe']
              },
            ].map((role, i) => (
              <div key={i} className={`${role.color} rounded-2xl p-6 border text-left`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{role.icon}</span>
                  <span className={`${role.badge} text-xs font-medium px-2 py-1 rounded-full`}>{role.role}</span>
                </div>
                <ul className="space-y-2">
                  {role.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
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
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Prêt à commencer ?</h2>
        <p className="text-gray-500 text-sm mb-8">Créez votre compte gratuitement et commencez à gérer vos projets dès aujourd'hui.</p>
        <button
          onClick={() => navigate('/register')}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition font-medium"
        >
          Créer mon compte →
        </button>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 py-6 text-center">
        <p className="text-xs text-gray-400">© 2025 Agile Platform · Projet de soutenance</p>
      </div>

    </div>
  )
}

export default Index