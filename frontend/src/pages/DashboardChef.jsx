import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProjects, createProject, deleteProject, getSprints, createSprint, deleteSprint, getUsers, addMember, getMembers, removeMember, getStats, getTasks, createTask, updateTask, deleteTask, updateSprintStatus } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { LayoutDashboard, FolderKanban, Users, LogOut, Timer, ChevronRight, Trash2, Plus, X, Kanban, Sparkles, TrendingUp, CheckCircle, Clock, UserPlus, Calendar, BarChart2 } from 'lucide-react'
import BurndownChart from '../components/BurndownChart'
import Notifications from '../components/Notifications'
import HistoryLog from '../components/HistoryLog'

function DashboardChef() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState({})
  const [activePage, setActivePage] = useState('dashboard')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })

  // Sprints
  const [selectedProjectSprint, setSelectedProjectSprint] = useState('')
  const [sprints, setSprints] = useState([])
  const [showSprintForm, setShowSprintForm] = useState(false)
  const [sprintForm, setSprintForm] = useState({ name: '', startDate: '', endDate: '' })

  // Membres
  const [selectedProjectMember, setSelectedProjectMember] = useState('')
  const [members, setMembers] = useState([])
  const [users, setUsers] = useState([])
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState('')

  // Kanban
  const [selectedProjectKanban, setSelectedProjectKanban] = useState('')
  const [sprintsKanban, setSprintsKanban] = useState([])
  const [selectedSprint, setSelectedSprint] = useState('')
  const [tasks, setTasks] = useState([])
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', userId: '' })

  const user = JSON.parse(localStorage.getItem('user'))

  const pieData = [
    { name: 'Terminé', value: stats.tasksDone || 0, color: '#10b981' },
    { name: 'En cours', value: stats.tasksInProgress || 0, color: '#6366f1' },
    { name: 'À faire', value: stats.tasksTodo || 0, color: '#f59e0b' },
  ]
  const COLORS = ['#10b981', '#6366f1', '#f59e0b']

  const chartData = stats.tasksByMonth || []

  useEffect(() => {
    fetchProjects()
    fetchStats()
    fetchUsers()
  }, [])

  const fetchProjects = async () => {
    try { const res = await getProjects(); setProjects(res.data) } catch (err) { console.error(err) }
  }
  const fetchStats = async () => {
    try { const res = await getStats(); setStats(res.data) } catch (err) { console.error(err) }
  }
  const fetchUsers = async () => {
    try { const res = await getUsers(); setUsers(res.data) } catch (err) { console.error(err) }
  }
  const fetchSprints = async (projectId) => {
    try { const res = await getSprints(projectId); setSprints(res.data) } catch (err) { console.error(err) }
  }
  const fetchSprintsKanban = async (projectId) => {
    try { const res = await getSprints(projectId); setSprintsKanban(res.data) } catch (err) { console.error(err) }
  }
  const fetchMembers = async (projectId) => {
    try { const res = await getMembers(projectId); setMembers(res.data) } catch (err) { console.error(err) }
  }
  const fetchTasks = async (sprintId) => {
    try { const res = await getTasks(sprintId); setTasks(res.data) } catch (err) { console.error(err) }
  }

  const handleCreateProject = async () => {
    try {
      await createProject(formData)
      setShowForm(false); setFormData({ name: '', description: '' })
      fetchProjects(); fetchStats()
    } catch (err) { console.error(err) }
  }

  const handleDeleteProject = async (id) => {
    if (window.confirm('Supprimer ce projet ?')) {
      try {
        await deleteProject(id)
        fetchProjects()
        fetchStats()
        setSprints([])
        setTasks([])
        setSelectedProjectSprint('')
        setSelectedProjectKanban('')
        setSelectedSprint('')
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleCreateSprint = async () => {
    try {
      await createSprint({ ...sprintForm, projectId: selectedProjectSprint })
      setShowSprintForm(false); setSprintForm({ name: '', startDate: '', endDate: '' })
      fetchSprints(selectedProjectSprint)
    } catch (err) { console.error(err) }
  }

  const handleDeleteSprint = async (sprintId) => {
    if (window.confirm('Supprimer ce sprint ?')) {
      try { await deleteSprint(sprintId); fetchSprints(selectedProjectSprint) } catch (err) { console.error(err) }
    }
  }

  const handleAddMember = async () => {
    try {
      await addMember(selectedProjectMember, selectedUser)
      setShowMemberForm(false)
      setSelectedUser('')
      fetchMembers(selectedProjectMember)
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'ajout du membre !')
    }
  }
  
  const handleRemoveMember = async (userId) => {
    if (window.confirm('Retirer ce membre ?')) {
      try { await removeMember(selectedProjectMember, userId); fetchMembers(selectedProjectMember) } catch (err) { console.error(err) }
    }
  }

  const handleCreateTask = async () => {
    try {
      await createTask({ ...taskForm, sprintId: selectedSprint })
      setShowTaskForm(false); setTaskForm({ title: '', description: '', userId: '' })
      fetchTasks(selectedSprint)
    } catch (err) { console.error(err) }
  }

  const handleMoveTask = async (taskId, newStatus) => {
    try { await updateTask(taskId, { status: newStatus }); fetchTasks(selectedSprint) } catch (err) { console.error(err) }
  }

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Supprimer cette tâche ?')) {
      try { await deleteTask(taskId); fetchTasks(selectedSprint) } catch (err) { console.error(err) }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/')
  }

  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard', gradient: 'from-indigo-500 to-purple-600' },
    { id: 'projects', icon: <FolderKanban size={18} />, label: 'Projets', gradient: 'from-blue-500 to-cyan-600' },
    { id: 'sprints', icon: <Timer size={18} />, label: 'Sprints', gradient: 'from-emerald-500 to-teal-600' },
    { id: 'kanban', icon: <Kanban size={18} />, label: 'Kanban', gradient: 'from-violet-500 to-purple-600' },
    { id: 'members', icon: <Users size={18} />, label: 'Membres', gradient: 'from-rose-500 to-pink-600' },
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(99, 102, 241, 0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.5s ease-out; }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
        .animate-pulseGlow { animation: pulseGlow 2s infinite; }
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -12px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
        }
      `}</style>

      {/* Sidebar */}
      <div className="w-60 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex flex-col fixed h-full shadow-2xl animate-slideIn">
        <div className="p-5 border-b border-gray-700/50">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg animate-pulseGlow">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">AgileFlow</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-white/10 rounded-xl backdrop-blur-sm">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-indigo-300 font-medium">Chef de projet</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3">
          <p className="text-xs text-gray-400 font-medium px-3 mb-3 mt-2 tracking-wider">NAVIGATION</p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-300 text-left text-sm ${
                activePage === item.id
                  ? `bg-gradient-to-r ${item.gradient} text-white shadow-md scale-[1.02]`
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-700/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 text-sm"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 ml-60">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="animate-fadeInUp">
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {menuItems.find(m => m.id === activePage)?.label}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Tableau de bord chef de projet</p>
          </div>
          <div className="flex items-center gap-4">
            <Notifications />
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-md">
              👔 Chef de projet
            </span>
          </div>
        </div>

        <div className="p-8 animate-fadeInUp">
          {/* Dashboard */}
          {activePage === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-5">
                {[
                  { label: 'Projets', value: stats.totalProjects || 0, icon: <FolderKanban size={20} />, gradient: 'from-indigo-500 to-purple-600' },
                  { label: 'Sprints', value: stats.totalSprints || 0, icon: <Timer size={20} />, gradient: 'from-emerald-500 to-teal-600' },
                  { label: 'Tâches', value: stats.totalTasks || 0, icon: <CheckCircle size={20} />, gradient: 'from-violet-500 to-purple-600' },
                  { label: 'Membres', value: stats.totalUsers || 0, icon: <Users size={20} />, gradient: 'from-amber-500 to-orange-600' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 shadow-lg card-hover border border-gray-100 relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500`}></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
                        <div className={`p-2 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-md`}>
                          {stat.icon}
                        </div>
                      </div>
                      <p className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</p>
                      <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp size={12} />
                        <span>+8% ce mois</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg card-hover border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <BarChart2 size={16} className="text-indigo-500" />
                    Tâches par mois
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip cursor={{ fill: '#f3f4f6' }} />
                      <Bar dataKey="taches" fill="url(#gradientBar)" radius={[8, 8, 0, 0]} />
                      <defs>
                        <linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1"/>
                          <stop offset="100%" stopColor="#818cf8"/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg card-hover border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <PieChart size={16} className="text-emerald-500" />
                    État des tâches
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({name, value, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index]} stroke="white" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden card-hover">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Clock size={16} className="text-indigo-500" />
                    Mes Projets
                  </h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">PROJET</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">SPRINTS</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">MEMBRES</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.slice(0, 5).map((project) => (
                      <tr key={project.id} className="border-b border-gray-50 hover:bg-indigo-50/30 transition-all duration-200 group">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">{project.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{project.sprints?.length || 0}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{project.members?.length || 0}</td>
                        <td className="px-6 py-4 flex gap-3">
                          <button onClick={() => navigate(`/project/${project.id}`)} className="text-indigo-600 text-xs hover:underline flex items-center gap-1 font-medium transition-all hover:gap-2">
                            Voir <ChevronRight size={12} />
                          </button>
                          <button onClick={() => handleDeleteProject(project.id)} className="text-red-400 hover:text-red-600 transition-all hover:scale-110">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <HistoryLog showAll={false} projectId={projects[0]?.id} />
              <BurndownChart projects={projects} />
            </div>
          )}

          {/* Projets */}
          {activePage === 'projects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-gray-700">{projects.length} projet(s)</h2>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <Plus size={16} /> Nouveau Projet
                </button>
              </div>

              {showForm && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-fadeInUp">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-gray-700">Nouveau Projet</h3>
                    <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-all hover:rotate-90"><X size={18} /></button>
                  </div>
                  <input
                    type="text"
                    placeholder="Nom du projet"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 mb-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 mb-4 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  <div className="flex gap-3">
                    <button onClick={handleCreateProject} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:shadow-md transition-all hover:scale-105">Créer</button>
                    <button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">Annuler</button>
                  </div>
                </div>
              )}

              {projects.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 text-center text-gray-400 shadow-lg">
                  <FolderKanban size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucun projet pour le moment</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-5">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-white rounded-2xl p-5 shadow-lg card-hover border border-gray-100 group">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-sm font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{project.name}</h3>
                        <span className="bg-gradient-to-r from-emerald-400 to-teal-400 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">Actif</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-4 line-clamp-2">{project.description || 'Aucune description'}</p>
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-400">{project.sprints?.length || 0} sprint(s) · {project.members?.length || 0} membre(s)</span>
                        <div className="flex gap-2">
                          <button onClick={() => navigate(`/project/${project.id}`)} className="text-indigo-600 text-xs hover:underline flex items-center gap-1 transition-all hover:gap-2">
                            Voir <ChevronRight size={12} />
                          </button>
                          <button onClick={() => handleDeleteProject(project.id)} className="text-red-400 hover:text-red-600 transition-all hover:scale-110">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sprints */}
          {activePage === 'sprints' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-gray-700">Gestion des Sprints</h2>
                {selectedProjectSprint && (
                  <button
                    onClick={() => setShowSprintForm(!showSprintForm)}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <Plus size={16} /> Nouveau Sprint
                  </button>
                )}
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                <label className="text-xs text-gray-500 font-semibold mb-2 block uppercase tracking-wider">SÉLECTIONNER UN PROJET</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                  onChange={(e) => { setSelectedProjectSprint(e.target.value); fetchSprints(e.target.value) }}
                  value={selectedProjectSprint}
                >
                  <option value="">-- Choisir un projet --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {showSprintForm && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-fadeInUp">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-gray-700">Nouveau Sprint</h3>
                    <button onClick={() => setShowSprintForm(false)} className="text-gray-400 hover:text-gray-600 transition-all hover:rotate-90"><X size={18} /></button>
                  </div>
                  <input
                    type="text"
                    placeholder="Nom du sprint"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 mb-3 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                    onChange={(e) => setSprintForm({ ...sprintForm, name: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Date début</label>
                      <input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400" onChange={(e) => setSprintForm({ ...sprintForm, startDate: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Date fin</label>
                      <input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400" onChange={(e) => setSprintForm({ ...sprintForm, endDate: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleCreateSprint} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:shadow-md transition-all hover:scale-105">Créer</button>
                    <button onClick={() => setShowSprintForm(false)} className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">Annuler</button>
                  </div>
                </div>
              )}

              {!selectedProjectSprint ? (
                <div className="bg-white rounded-2xl p-16 text-center text-gray-400 shadow-lg">
                  <Timer size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Sélectionnez un projet pour voir ses sprints</p>
                </div>
              ) : sprints.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 text-center text-gray-400 shadow-lg">
                  <Calendar size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucun sprint pour ce projet</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-5">
                  {sprints.map((sprint) => (
                    <div key={sprint.id} className="bg-white rounded-2xl p-5 shadow-lg card-hover border border-gray-100 group">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-sm font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">{sprint.name}</h3>
                        <span className="bg-gradient-to-r from-indigo-400 to-purple-400 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">En cours</span>
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        📅 {new Date(sprint.startDate).toLocaleDateString()} → {new Date(sprint.endDate).toLocaleDateString()}
                      </p>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-400">{sprint.tasks?.length || 0} tâche(s)</span>
                        <button onClick={() => handleDeleteSprint(sprint.id)} className="text-red-400 hover:text-red-600 transition-all hover:scale-110">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Kanban */}
          {activePage === 'kanban' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-gray-700">Tableau Kanban</h2>
                {selectedSprint && (
                  <button
                    onClick={() => setShowTaskForm(!showTaskForm)}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <Plus size={16} /> Nouvelle Tâche
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                  <label className="text-xs text-gray-500 font-semibold mb-2 block uppercase tracking-wider">PROJET</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                    onChange={(e) => { setSelectedProjectKanban(e.target.value); fetchSprintsKanban(e.target.value); setSelectedSprint(''); setTasks([]) }}
                    value={selectedProjectKanban}
                  >
                    <option value="">-- Choisir un projet --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                  <label className="text-xs text-gray-500 font-semibold mb-2 block uppercase tracking-wider">SPRINT</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-400 transition-all"
                    onChange={(e) => { setSelectedSprint(e.target.value); fetchTasks(e.target.value) }}
                    value={selectedSprint}
                    disabled={!selectedProjectKanban}
                  >
                    <option value="">-- Choisir un sprint --</option>
                    {sprintsKanban.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {showTaskForm && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-fadeInUp">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-gray-700">Nouvelle Tâche</h3>
                    <button onClick={() => setShowTaskForm(false)} className="text-gray-400 hover:text-gray-600 transition-all hover:rotate-90"><X size={18} /></button>
                  </div>
                  <input
                    type="text"
                    placeholder="Titre de la tâche"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 mb-3 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 mb-3 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  />
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 mb-4 text-sm focus:outline-none focus:border-violet-400 transition-all"
                    onChange={(e) => setTaskForm({ ...taskForm, userId: e.target.value })}
                    value={taskForm.userId}
                  >
                    <option value="">-- Assigner à --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-3">
                    <button onClick={handleCreateTask} className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:shadow-md transition-all hover:scale-105">Créer</button>
                    <button onClick={() => setShowTaskForm(false)} className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">Annuler</button>
                  </div>
                </div>
              )}

              {selectedSprint ? (
                <div className="grid grid-cols-3 gap-5">
                  {[
                    { status: 'TODO', label: 'À Faire', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
                    { status: 'IN_PROGRESS', label: 'En Cours', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', dot: 'bg-indigo-500' },
                    { status: 'DONE', label: 'Terminé', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' }
                  ].map((col) => (
                    <div key={col.status} className={`${col.bg} rounded-2xl p-4 shadow-lg border ${col.border} card-hover`}>
                      <div className="flex items-center gap-2 mb-4">
                        <div className={`w-2 h-2 rounded-full ${col.dot} animate-pulse`}></div>
                        <h3 className={`text-sm font-bold ${col.color}`}>{col.label}</h3>
                        <span className="ml-auto bg-white text-gray-500 text-xs px-2 py-0.5 rounded-full border border-gray-200 shadow-sm">
                          {tasks.filter(t => t.status === col.status).length}
                        </span>
                      </div>
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {tasks.filter(t => t.status === col.status).map((task) => (
                          <div key={task.id} className="bg-white rounded-xl p-3 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200 group">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-sm font-semibold text-gray-800">{task.title}</p>
                              <button onClick={() => handleDeleteTask(task.id)} className="text-gray-300 hover:text-red-400 transition-all hover:scale-110">
                                <Trash2 size={12} />
                              </button>
                            </div>
                            {task.description && <p className="text-xs text-gray-400 mb-2">{task.description}</p>}
                            {task.assignee && (
                              <div className="flex items-center gap-1 mb-2">
                                <div className="w-4 h-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
                                  <span className="text-white text-[8px]">{task.assignee.name.charAt(0)}</span>
                                </div>
                                <span className="text-xs text-gray-500">{task.assignee.name}</span>
                              </div>
                            )}
                            <div className="flex gap-1 mt-2 pt-2 border-t border-gray-50">
                              {col.status !== 'TODO' && (
                                <button
                                  onClick={() => handleMoveTask(task.id, col.status === 'IN_PROGRESS' ? 'TODO' : 'IN_PROGRESS')}
                                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg transition-all text-gray-600 hover:scale-105"
                                >
                                  ← Reculer
                                </button>
                              )}
                              {col.status !== 'DONE' && (
                                <button
                                  onClick={() => handleMoveTask(task.id, col.status === 'TODO' ? 'IN_PROGRESS' : 'DONE')}
                                  className="text-xs bg-indigo-100 hover:bg-indigo-200 px-2 py-1 rounded-lg transition-all text-indigo-600 hover:scale-105"
                                >
                                  Avancer →
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {tasks.filter(t => t.status === col.status).length === 0 && (
                          <div className="text-center text-gray-300 py-8 text-xs">
                            Aucune tâche
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-16 text-center text-gray-400 shadow-lg">
                  <Kanban size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Sélectionnez un projet et un sprint</p>
                </div>
              )}
            </div>
          )}

          {/* Membres */}
          {activePage === 'members' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-gray-700">Gestion des Membres</h2>
                {selectedProjectMember && (
                  <button
                    onClick={() => setShowMemberForm(!showMemberForm)}
                    className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <Plus size={16} /> Ajouter un membre
                  </button>
                )}
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                <label className="text-xs text-gray-500 font-semibold mb-2 block uppercase tracking-wider">SÉLECTIONNER UN PROJET</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
                  onChange={(e) => { setSelectedProjectMember(e.target.value); fetchMembers(e.target.value) }}
                  value={selectedProjectMember}
                >
                  <option value="">-- Choisir un projet --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {showMemberForm && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-fadeInUp">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-gray-700">Ajouter un membre</h3>
                    <button onClick={() => setShowMemberForm(false)} className="text-gray-400 hover:text-gray-600 transition-all hover:rotate-90"><X size={18} /></button>
                  </div>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 mb-4 text-sm focus:outline-none focus:border-rose-400 transition-all"
                    onChange={(e) => setSelectedUser(e.target.value)}
                    value={selectedUser}
                  >
                    <option value="">-- Choisir un utilisateur --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                  <div className="flex gap-3">
                    <button onClick={handleAddMember} className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:shadow-md transition-all hover:scale-105">Ajouter</button>
                    <button onClick={() => setShowMemberForm(false)} className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">Annuler</button>
                  </div>
                </div>
              )}

              {!selectedProjectMember ? (
                <div className="bg-white rounded-2xl p-16 text-center text-gray-400 shadow-lg">
                  <Users size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Sélectionnez un projet pour voir ses membres</p>
                </div>
              ) : members.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 text-center text-gray-400 shadow-lg">
                  <UserPlus size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucun membre pour ce projet</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">NOM</th>
                        <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">EMAIL</th>
                        <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">RÔLE</th>
                        <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr key={member.id} className="border-b border-gray-50 hover:bg-rose-50/30 transition-all duration-200">
                          <td className="px-6 py-4 text-sm font-semibold text-gray-800">{member.user.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{member.user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              member.user.role === 'ADMIN' ? 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 border border-rose-200' :
                              member.user.role === 'CHEF' ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200' :
                              'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-200'
                            }`}>{member.user.role}</span>
                          </td>
                          <td className="px-6 py-4">
                            <button onClick={() => handleRemoveMember(member.user.id)} className="text-red-400 hover:text-red-600 transition-all hover:scale-110">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardChef