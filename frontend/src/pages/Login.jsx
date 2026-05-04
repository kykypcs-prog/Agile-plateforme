import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

 const handleSubmit = async (e) => {
  e.preventDefault()
  try {
    const res = await login(formData)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    
    // Redirection selon le rôle
    const role = res.data.user.role
    if (role === 'ADMIN') {
      navigate('/dashboard/admin')
    } else if (role === 'CHEF') {
      navigate('/dashboard/chef')
    } else {
      navigate('/dashboard/member')
    }
  } catch (err) {
    setError('Email ou mot de passe incorrect !')
  }
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🚀 Agile Platform</h1>
          <p className="text-gray-500 mt-2">Connectez-vous à votre compte</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
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

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Se connecter
          </button>
        </div>

        <p className="text-center text-gray-500 mt-6">
          Pas encore de compte ?{' '}
          <span
            onClick={() => navigate('/register')}
            className="text-blue-600 font-medium cursor-pointer hover:underline"
          >
            S'inscrire
          </span>
        </p>

      </div>
    </div>
  )
}

export default Login