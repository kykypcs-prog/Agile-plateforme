import { useNavigate } from 'react-router-dom'

function Index() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex flex-col items-center justify-center text-white">
      
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4"> Agile Platform</h1>
        <p className="text-xl text-blue-100">
          Gérez vos projets avec la méthode Agile
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        <div className="bg-white/20 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="font-bold text-lg">Gestion de Projets</h3>
          <p className="text-blue-100 text-sm mt-2">Créez et gérez vos projets facilement</p>
        </div>
        <div className="bg-white/20 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">🏃</div>
          <h3 className="font-bold text-lg">Sprints Agile</h3>
          <p className="text-blue-100 text-sm mt-2">Planifiez vos sprints efficacement</p>
        </div>
        <div className="bg-white/20 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h3 className="font-bold text-lg">Tableau Kanban</h3>
          <p className="text-blue-100 text-sm mt-2">Suivez l'avancement des tâches</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/login')}
          className="bg-white text-blue-600 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition"
        >
          Se connecter
        </button>
        <button
          onClick={() => navigate('/register')}
          className="bg-transparent border-2 border-white font-bold px-8 py-3 rounded-xl hover:bg-white/20 transition"
        >
          S'inscrire
        </button>
      </div>

    </div>
  )
}

export default Index