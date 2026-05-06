import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProjects, createProject, deleteProject, getSprints, createSprint, deleteSprint, getUsers, addMember, getMembers, removeMember, getStats, getTasks, createTask, updateTask, deleteTask } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { LayoutDashboard, FolderKanban, Users, LogOut, Timer, ChevronRight, Trash2, Plus, X, Kanban } from 'lucide-react'
import BurndownChart from '../components/BurndownChart'

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
    { name: 'Terminé', value: stats.tasksDone || 0 },
    { name: 'En cours', value: stats.tasksInProgress || 0 },
    { name: 'À faire', value: stats.tasksTodo || 0 },
  ]
  const COLORS = ['#10b981', '#6366f1', '#e2e8f0']

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
      try { await deleteProject(id); fetchProjects(); fetchStats() } catch (err) { console.error(err) }
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
      setShowMemberForm(false); setSelectedUser('')
      fetchMembers(selectedProjectMember)
    } catch (err) { console.error(err) }
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
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { id: 'projects', icon: <FolderKanban size={18} />, label: 'Projets' },
    { id: 'sprints', icon: <Timer size={18} />, label: 'Sprints' },
    { id: 'kanban', icon: <Kanban size={18} />, label: 'Kanban' },
    { id: 'members', icon: <Users size={18} />, label: 'Membres' },
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
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-indigo-500 font-medium">Chef de projet</p>
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
            <p className="text-xs text-gray-400">Tableau de bord chef de projet</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-medium border border-indigo-100">
              👔 Chef de projet
            </span>
          </div>
        </div>

        <div className="p-8">

          {/* Dashboard */}
          {activePage === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Projets', value: stats.totalProjects || 0, color: 'text-indigo-600', border: 'border-indigo-100' },
                  { label: 'Sprints', value: stats.totalSprints || 0, color: 'text-emerald-600', border: 'border-emerald-100' },
                  { label: 'Tâches', value: stats.totalTasks || 0, color: 'text-violet-600', border: 'border-violet-100' },
                  { label: 'Membres', value: stats.totalUsers || 0, color: 'text-amber-600', border: 'border-amber-100' },
                ].map((stat, i) => (
                  <div key={i} className={`bg-white rounded-2xl p-5 border ${stat.border} shadow-sm`}>
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
                  <h3 className="text-sm font-semibold text-gray-700">Mes Projets</h3>
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
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 transition"
                >
                  <Plus size={16} /> Nouveau Projet
                </button>
              </div>

              {showForm && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-gray-700">Nouveau Projet</h3>
                    <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                  </div>
                  <input
                    type="text"
                    placeholder="Nom du projet"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 mb-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 mb-4 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <button onClick={handleCreateProject} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 transition">Créer</button>
                    <button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-200 transition">Annuler</button>
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

          {/* Kanban */}
          {activePage === 'kanban' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-semibold text-gray-700">Tableau Kanban</h2>
                {selectedSprint && (
                  <button
                    onClick={() => setShowTaskForm(!showTaskForm)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 transition"
                  >
                    <Plus size={16} /> Nouvelle Tâche
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <label className="text-xs text-gray-500 font-medium mb-2 block">PROJET</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                    onChange={(e) => { setSelectedProjectKanban(e.target.value); fetchSprintsKanban(e.target.value); setSelectedSprint(''); setTasks([]) }}
                    value={selectedProjectKanban}
                  >
                    <option value="">-- Choisir un projet --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <label className="text-xs text-gray-500 font-medium mb-2 block">SPRINT</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
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
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-gray-700">Nouvelle Tâche</h3>
                    <button onClick={() => setShowTaskForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                  </div>
                  <input
                    type="text"
                    placeholder="Titre de la tâche"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 mb-3 text-sm focus:outline-none focus:border-indigo-400"
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 mb-3 text-sm focus:outline-none focus:border-indigo-400"
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  />
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 mb-4 text-sm focus:outline-none focus:border-indigo-400"
                    onChange={(e) => setTaskForm({ ...taskForm, userId: e.target.value })}
                    value={taskForm.userId}
                  >
                    <option value="">-- Assigner à --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={handleCreateTask} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 transition">Créer</button>
                    <button onClick={() => setShowTaskForm(false)} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-200 transition">Annuler</button>
                  </div>
                </div>
              )}

              {selectedSprint ? (
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { status: 'TODO', label: 'À Faire', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-400' },
                    { status: 'IN_PROGRESS', label: 'En Cours', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', dot: 'bg-indigo-500' },
                    { status: 'DONE', label: 'Terminé', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' }
                  ].map((col) => (
                    <div key={col.status} className={`${col.bg} rounded-2xl p-4 border ${col.border}`}>
                      <div className="flex items-center gap-2 mb-4">
                        <div className={`w-2 h-2 rounded-full ${col.dot}`}></div>
                        <h3 className={`text-sm font-semibold ${col.color}`}>{col.label}</h3>
                        <span className="ml-auto bg-white text-gray-500 text-xs px-2 py-0.5 rounded-full border border-gray-200">
                          {tasks.filter(t => t.status === col.status).length}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {tasks.filter(t => t.status === col.status).map((task) => (
                          <div key={task.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-sm font-medium text-gray-800">{task.title}</p>
                              <button onClick={() => handleDeleteTask(task.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                                <Trash2 size={12} />
                              </button>
                            </div>
                            {task.description && <p className="text-xs text-gray-400 mb-2">{task.description}</p>}
                            {task.assignee && (
                              <div className="flex items-center gap-1 mb-2">
                                <div className="w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <span className="text-indigo-600 text-xs">{task.assignee.name.charAt(0)}</span>
                                </div>
                                <span className="text-xs text-gray-400">{task.assignee.name}</span>
                              </div>
                            )}
                            <div className="flex gap-1 mt-2 pt-2 border-t border-gray-50">
                              {col.status !== 'TODO' && (
                                <button
                                  onClick={() => handleMoveTask(task.id, col.status === 'IN_PROGRESS' ? 'TODO' : 'IN_PROGRESS')}
                                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg transition text-gray-600"
                                >
                                  ← Reculer
                                </button>
                              )}
                              {col.status !== 'DONE' && (
                                <button
                                  onClick={() => handleMoveTask(task.id, col.status === 'TODO' ? 'IN_PROGRESS' : 'DONE')}
                                  className="text-xs bg-indigo-100 hover:bg-indigo-200 px-2 py-1 rounded-lg transition text-indigo-600"
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
                <div className="bg-white rounded-2xl p-16 border border-gray-100 text-center text-gray-400">
                  <Kanban size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Sélectionnez un projet et un sprint</p>
                </div>
              )}
            </div>
          )}

          {/* Membres */}
          {activePage === 'members' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-semibold text-gray-700">Gestion des Membres</h2>
                {selectedProjectMember && (
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

              {!selectedProjectMember ? (
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

        </div>
      </div>
    </div>
  )
}

export default DashboardChef