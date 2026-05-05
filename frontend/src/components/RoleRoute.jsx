 import { Navigate } from 'react-router-dom'

function RoleRoute({ children, allowedRole }) {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  // Pas connecté → Login
  if (!token) {
    return <Navigate to="/login" />
  }

  // Mauvais rôle → Rediriger vers son dashboard
  if (user?.role !== allowedRole) {
    if (user?.role === 'ADMIN') return <Navigate to="/dashboard/admin" />
    if (user?.role === 'CHEF') return <Navigate to="/dashboard/chef" />
    if (user?.role === 'MEMBER') return <Navigate to="/dashboard/member" />
  }

  return children
}

export default RoleRoute
