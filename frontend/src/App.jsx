import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardChef from './pages/DashboardChef'
import DashboardAdmin from './pages/DashboardAdmin'
import DashboardMember from './pages/DashboardMember'
import ProjectDetail from './pages/ProjectDetail'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard/admin" element={
          <RoleRoute allowedRole="ADMIN">
            <DashboardAdmin />
          </RoleRoute>
        } />

        <Route path="/dashboard/chef" element={
          <RoleRoute allowedRole="CHEF">
            <DashboardChef />
          </RoleRoute>
        } />

        <Route path="/dashboard/member" element={
          <RoleRoute allowedRole="MEMBER">
            <DashboardMember />
          </RoleRoute>
        } />

        <Route path="/project/:id" element={
          <ProtectedRoute>
            <ProjectDetail />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App