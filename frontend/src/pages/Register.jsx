import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../services/api'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'MEMBER' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await register(formData)
      navigate('/login')
    } catch (err) {
      setError('Erreur lors de la création du compte !')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold">A</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Créer un compte 🚀</h1>
          <p className="text-gray-500 text-sm mt-1">Rejoignez Agile Platform gratuitement</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-5 border border-red-100 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">NOM COMPLET</label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">EMAIL</label>
              <input
                type="email"
                placeholder="john@gmail.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">MOT DE PASSE</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">RÔLE</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition"
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                value={formData.role}
              >
                <option value="MEMBER">👨‍💻 Membre</option>
                <option value="CHEF">👔 Chef de projet</option>
                <option value="ADMIN">👑 Administrateur</option>
              </select>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Création...' : 'Créer mon compte →'}
            </button>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-5">
          Déjà un compte ?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-indigo-600 font-medium cursor-pointer hover:underline"
          >
            Se connecter
          </span>
        </p>

        <p
          onClick={() => navigate('/')}
          className="text-center text-gray-400 text-xs mt-3 cursor-pointer hover:text-gray-600 transition"
        >
          ← Retour à l'accueil
        </p>

      </div>
    </div>
  )
}

export default Register