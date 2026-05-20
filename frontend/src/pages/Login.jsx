import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await login(formData)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      localStorage.setItem('lastLogin', new Date().toISOString()) // Déplacé ici
      const role = res.data.user.role
      if (role === 'ADMIN') navigate('/dashboard/admin')
      else if (role === 'CHEF') navigate('/dashboard/chef')
      else navigate('/dashboard/member')
    } catch (err) {
      setError('Email ou mot de passe incorrect !')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bon retour ! 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Connectez-vous à votre compte</p>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-indigo-100 shadow-xl">

          {error && (
            <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-xl mb-5 border border-rose-200 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">EMAIL</label>
              <input
                type="email"
                placeholder="john@gmail.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition bg-white"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">MOT DE PASSE</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition bg-white"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white py-2.5 rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition font-medium text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter →'}
            </button>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Pas encore de compte ?{' '}
          <span
            onClick={() => navigate('/register')}
            className="text-indigo-600 font-medium cursor-pointer hover:underline"
          >
            S'inscrire
          </span>
        </p>

      </div>
    </div>
  )
}

export default Login