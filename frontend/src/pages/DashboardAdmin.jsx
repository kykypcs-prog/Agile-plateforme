import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProjects, createProject, deleteProject, getUsers, getStats, addMember, getMembers, removeMember, updateUserRole, getSprints, createSprint, deleteSprint } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { LayoutDashboard, FolderKanban, Users, BarChart2, LogOut, Timer, ChevronRight, Trash2, Plus, X } from 'lucide-react'
import BurndownChart from '../components/BurndownChart'

function DashboardAdmin() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({})
  const [activePage, setActivePage] = useState('dashboard')
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [projectForm, setProjectForm] = useState({ name: '', description: '' })
  const [selectedProject, setSelectedProject] = useState('')
  const [members, setMembers] = useState([])
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedProjectSprint, setSelectedProjectSprint] = useState('')
  const [sprints, setSprints] = useState([])
  const [showSprintForm, setShowSprintForm] = useState(false)
  const [sprintForm, setSprintForm] = useState({ name: '', startDate: '', endDate: '' })
  const user = JSON.parse(localStorage.getItem('user'))

  const pieData = [
    { name: 'Terminé', value: stats.tasksDone || 0 },
    { name: 'En cours', value: stats.tasksInProgress || 0 },
    { name: 'À faire', value: stats.tasksTodo || 0 },
  ]
  const COLORS = ['#10b981', '#6366f1', '#e2e8f0']

 const chartData = stats.tasksByMonth || []
  useEffect(() => {
    fetchProjects()
    fetchUsers()
    fetchStats()
  }, [])

  const fetchProjects = async () => {
    try { const res = await getProjects(); setProjects(res.data) } catch (err) { console.error(err) }
  }
  const fetchUsers = async () => {
    try { const res = await getUsers(); setUsers(res.data) } catch (err) { console.error(err) }
  }
  const fetchStats = async () => {
    try { const res = await getStats(); setStats(res.data) } catch (err) { console.error(err) }
  }
  const fetchMembers = async (projectId) => {
    try { const res = await getMembers(projectId); setMembers(res.data) } catch (err) { console.error(err) }
  }
  const fetchSprints = async (projectId) => {
    try { const res = await getSprints(projectId); setSprints(res.data) } catch (err) { console.error(err) }
  }

  const handleCreateProject = async () => {
    try {
      await createProject(projectForm)
      setShowProjectForm(false)
      setProjectForm({ name: '', description: '' })
      fetchProjects(); fetchStats()
    } catch (err) { console.error(err) }
  }

  const handleDeleteProject = async (id) => {
    if (window.confirm('Supprimer ce projet ?')) {
      try { await deleteProject(id); fetchProjects(); fetchStats() } catch (err) { console.error(err) }
    }
  }

  const handleAddMember = async () => {
    try {
      await addMember(selectedProject, selectedUser)
      setShowMemberForm(false); setSelectedUser('')
      fetchMembers(selectedProject)
    } catch (err) { console.error(err) }
  }

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Retirer ce membre ?')) {
      try { await removeMember(selectedProject, userId); fetchMembers(selectedProject) } catch (err) { console.error(err) }
    }
  }

  const handleUpdateRole = async (userId, role) => {
    try { await updateUserRole(userId, role); fetchUsers() } catch (err) { console.error(err) }
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

  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/')
  }

  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { id: 'projects', icon: <FolderKanban size={18} />, label: 'Projets' },
    { id: 'sprints', icon: <Timer size={18} />, label: 'Sprints' },
    { id: 'members', icon: <Users size={18} />, label: 'Membres' },
    { id: 'users', icon: <Users size={18} />, label: 'Utilisateurs' },
    { id: 'stats', icon: <BarChart2 size={18} />, label: 'Statistiques' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <div className="w-60 bg-white border-r border-gray-100 flex flex-col fixed h-full shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <span className="font-semibold text-gray-800 text-sm">Agile Platform</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-rose-500 font-medium">Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3">
          <p className="text-xs text-gray-400 font-medium px-3 mb-2 mt-2">NAVIGATION</p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all text-left text-sm ${
                activePage === item.id
                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all text-sm"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 ml-60">

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {menuItems.find(m => m.id === activePage)?.label}
            </h1>
            <p className="text-xs text-gray-400">Tableau de bord administrateur</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-xs font-medium border border-rose-100">
              👑 Administrateur
            </span>
          </div>
        </div>

        <div className="p-8">

          {/* Dashboard */}
          {activePage === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Projets', value: stats.totalProjects || 0, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
                  { label: 'Sprints', value: stats.totalSprints || 0, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                  { label: 'Tâches', value: stats.totalTasks || 0, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
                  { label: 'Utilisateurs', value: stats.totalUsers || 0, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                ].map((stat, i) => (
                  <div key={i} className={`bg-white rounded-2xl p-5 border ${stat.border} shadow-sm`}>
                    <p className="text-xs text-gray-500 font-medium mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Tâches par mois</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="taches" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">État des tâches</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name, value}) => `${name}: ${value}`}>
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700">Projets récents</h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">PROJET</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">SPRINTS</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">MEMBRES</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.slice(0, 5).map((project) => (
                      <tr key={project.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{project.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{project.sprints?.length}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{project.members?.length}</td>
                        <td className="px-6 py-4 flex gap-2">
                          <button onClick={() => navigate(`/project/${project.id}`)} className="text-indigo-600 text-xs hover:underline flex items-center gap-1">
                            Voir <ChevronRight size={12} />
                          </button>
                          <button onClick={() => handleDeleteProject(project.id)} className="text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Projets */}
          {activePage === 'projects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-semibold text-gray-700">{projects.length} projet(s)</h2>
                <button
                  onClick={() => setShowProjectForm(!showProjectForm)}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 transition"
                >
                  <Plus size={16} /> Nouveau Projet
                </button>
              </div>

              {showProjectForm && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-gray-700">Nouveau Projet</h3>
                    <button onClick={() => setShowProjectForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                  </div>
                  <input
                    type="text"
                    placeholder="Nom du projet"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 mb-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 mb-4 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <button onClick={handleCreateProject} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 transition">Créer</button>
                    <button onClick={() => setShowProjectForm(false)} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-200 transition">Annuler</button>
                  </div>
                </div>
              )}

              {projects.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 border border-gray-100 text-center text-gray-400">
                  <FolderKanban size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucun projet pour le moment</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-sm font-semibold text-gray-800">{project.name}</h3>
                        <span className="bg-emerald-50 text-emerald-600 text-xs px-2 py-0.5 rounded-full border border-emerald-100">Actif</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-4 line-clamp-2">{project.description}</p>
                      <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                        <span className="text-xs text-gray-400">{project.sprints?.length} sprint(s) · {project.members?.length} membre(s)</span>
                        <div className="flex gap-2">
                          <button onClick={() => navigate(`/project/${project.id}`)} className="text-indigo-600 text-xs hover:underline flex items-center gap-1">
                            Voir <ChevronRight size={12} />
                          </button>
                          <button onClick={() => handleDeleteProject(project.id)} className="text-red-400 hover:text-red-600 transition-colors">
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
                <h2 className="text-sm font-semibold text-gray-700">Gestion des Sprints</h2>
                {selectedProjectSprint && (
                  <button
                    onClick={() => setShowSprintForm(!showSprintForm)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 transition"
                  >
                    <Plus size={16} /> Nouveau Sprint
                  </button>
                )}
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <label className="text-xs text-gray-500 font-medium mb-2 block">SÉLECTIONNER UN PROJET</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
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
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-gray-700">Nouveau Sprint</h3>
                    <button onClick={() => setShowSprintForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                  </div>
                  <input
                    type="text"
                    placeholder="Nom du sprint"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 mb-3 text-sm focus:outline-none focus:border-indigo-400"
                    onChange={(e) => setSprintForm({ ...sprintForm, name: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Date début</label>
                      <input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" onChange={(e) => setSprintForm({ ...sprintForm, startDate: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Date fin</label>
                      <input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" onChange={(e) => setSprintForm({ ...sprintForm, endDate: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleCreateSprint} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 transition">Créer</button>
                    <button onClick={() => setShowSprintForm(false)} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-200 transition">Annuler</button>
                  </div>
                </div>
              )}

              {!selectedProjectSprint ? (
                <div className="bg-white rounded-2xl p-16 border border-gray-100 text-center text-gray-400">
                  <Timer size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Sélectionnez un projet pour voir ses sprints</p>
                </div>
              ) : sprints.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 border border-gray-100 text-center text-gray-400">
                  <Timer size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucun sprint pour ce projet</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {sprints.map((sprint) => (
                    <div key={sprint.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-sm font-semibold text-gray-800">{sprint.name}</h3>
                        <span className="bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded-full border border-indigo-100">Actif</span>
                      </div>
                      <p className="text-xs text-gray-400">📅 {new Date(sprint.startDate).toLocaleDateString()} → {new Date(sprint.endDate).toLocaleDateString()}</p>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-50">
                        <span className="text-xs text-gray-400">{sprint.tasks?.length || 0} tâche(s)</span>
                        <button onClick={() => handleDeleteSprint(sprint.id)} className="text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Membres */}
          {activePage === 'members' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-semibold text-gray-700">Gestion des Membres</h2>
                {selectedProject && (
                  <button
                    onClick={() => setShowMemberForm(!showMemberForm)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 transition"
                  >
                    <Plus size={16} /> Ajouter un membre
                  </button>
                )}
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <label className="text-xs text-gray-500 font-medium mb-2 block">SÉLECTIONNER UN PROJET</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                  onChange={(e) => { setSelectedProject(e.target.value); fetchMembers(e.target.value) }}
                  value={selectedProject}
                >
                  <option value="">-- Choisir un projet --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {showMemberForm && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-gray-700">Ajouter un membre</h3>
                    <button onClick={() => setShowMemberForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                  </div>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 mb-4 text-sm focus:outline-none focus:border-indigo-400"
                    onChange={(e) => setSelectedUser(e.target.value)}
                    value={selectedUser}
                  >
                    <option value="">-- Choisir un utilisateur --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={handleAddMember} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 transition">Ajouter</button>
                    <button onClick={() => setShowMemberForm(false)} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-200 transition">Annuler</button>
                  </div>
                </div>
              )}

              {!selectedProject ? (
                <div className="bg-white rounded-2xl p-16 border border-gray-100 text-center text-gray-400">
                  <Users size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Sélectionnez un projet pour voir ses membres</p>
                </div>
              ) : members.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 border border-gray-100 text-center text-gray-400">
                  <Users size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucun membre pour ce projet</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-50">
                        <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">NOM</th>
                        <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">EMAIL</th>
                        <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">RÔLE</th>
                        <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr key={member.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-800">{member.user.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{member.user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              member.user.role === 'ADMIN' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                              member.user.role === 'CHEF' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                              'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            }`}>{member.user.role}</span>
                          </td>
                          <td className="px-6 py-4">
                            <button onClick={() => handleRemoveMember(member.user.id)} className="text-red-400 hover:text-red-600 transition-colors">
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

          {/* Utilisateurs */}
          {activePage === 'users' && (
            <div className="space-y-6">
              <h2 className="text-sm font-semibold text-gray-700">{users.length} utilisateur(s)</h2>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">NOM</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">EMAIL</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">RÔLE</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">CHANGER RÔLE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{u.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            u.role === 'ADMIN' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                            u.role === 'CHEF' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                            'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>{u.role}</span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400"
                            value={u.role}
                            onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="CHEF">CHEF</option>
                            <option value="MEMBER">MEMBER</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Statistiques */}
          {activePage === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'À faire', value: stats.tasksTodo || 0, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100' },
                  { label: 'En cours', value: stats.tasksInProgress || 0, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
                  { label: 'Terminées', value: stats.tasksDone || 0, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                ].map((stat, i) => (
                  <div key={i} className={`bg-white rounded-2xl p-6 border ${stat.border} shadow-sm`}>
                    <p className="text-xs text-gray-500 font-medium mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    {/* Burndown */}
<BurndownChart projects={projects} />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Tâches par mois</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="taches" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">État des tâches</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({name, value}) => `${name}: ${value}`}>
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default DashboardAdmin