import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardChef from './pages/DashboardChef'
import DashboardAdmin from './pages/DashboardAdmin'
import DashboardMember from './pages/DashboardMember'
import ProjectDetail from './pages/ProjectDetail'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard/chef" element={
          <ProtectedRoute>
            <DashboardChef />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin" element={
          <ProtectedRoute>
            <DashboardAdmin />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/member" element={
          <ProtectedRoute>
            <DashboardMember />
          </ProtectedRoute>
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