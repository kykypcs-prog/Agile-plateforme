import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

function Index() {
  const navigate = useNavigate()

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up')
        }
      })
    }, { threshold: 0.1 })

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-blue-900 text-white overflow-hidden">

      {/* Effet de fond animé (cercles flous) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center px-6 md:px-12 py-5 backdrop-blur-md bg-white/5 border-b border-white/10 sticky top-0">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="font-semibold text-white tracking-tight text-lg">Agile Platform</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="text-white/80 text-sm hover:text-white transition px-4 py-2 rounded-xl hover:bg-white/10"
          >
            Se connecter
          </button>
          <button
            onClick={() => navigate('/register')}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm px-5 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Commencer gratuitement
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-6 pt-32 pb-24 animate-on-scroll">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-blue-200 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-white/20 shadow-sm">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping"></div>
          Méthode Agile · Scrum · Kanban
        </div>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
          Gérez vos projets avec
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">la méthode Agile</span>
        </h1>
        <p className="text-lg text-blue-100/80 mb-10 max-w-2xl mx-auto leading-relaxed">
          Une plateforme complète pour organiser vos sprints, suivre vos tâches et collaborer efficacement en équipe.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/register')}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Démarrer maintenant →
          </button>
          <button
            onClick={() => navigate('/login')}
            className="text-white px-6 py-3 rounded-xl border border-white/30 hover:bg-white/10 transition-all font-medium backdrop-blur-sm"
          >
            Se connecter
          </button>
        </div>
      </div>

      {/* CTA Section - Dégradé bleu/cyan */}
      <div className="relative z-10 max-w-3xl mx-auto text-center px-6 py-20 animate-on-scroll">
        <div className="bg-gradient-to-br from-blue-600/30 via-indigo-600/30 to-cyan-600/30 backdrop-blur-xl rounded-3xl p-10 md:p-12 border border-white/20 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Prêt à transformer votre gestion de projet ?</h2>
          <p className="text-blue-100 text-md mb-8">Rejoignez des centaines d'équipes qui utilisent Agile Platform au quotidien.</p>
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-indigo-700 px-8 py-3 rounded-xl hover:bg-gray-100 transition-all font-semibold shadow-md hover:shadow-xl transform hover:-scale-105"
          >
            Créer mon compte gratuitement →
          </button>
        </div>
      </div>

      {/* Footer minimal */}
      <div className="relative z-10 border-t border-white/10 py-6 text-center text-white/40 text-xs">
        © 2025 Agile Platform · Projet de soutenance
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .animate-on-scroll.fade-in-up {
          opacity: 1;
          transform: translateY(0);
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

export default Index