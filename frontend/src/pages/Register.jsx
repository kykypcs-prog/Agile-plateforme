import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../services/api'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'MEMBER' })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await register(formData)
      navigate('/login')
    } catch (err) {
      setError('Erreur lors de la création du compte !')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🚀 Agile Platform</h1>
          <p className="text-gray-500 mt-2">Créez votre compte</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Nom complet</label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="john@gmail.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Rôle</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="MEMBER">Membre</option>
              <option value="CHEF">Chef de projet</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
          >
            S'inscrire
          </button>
        </div>

        <p className="text-center text-gray-500 mt-6">
          Déjà un compte ?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-blue-600 font-medium cursor-pointer hover:underline"
          >
            Se connecter
          </span>
        </p>

      </div>
    </div>
  )
}

export default Register