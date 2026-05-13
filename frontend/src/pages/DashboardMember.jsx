import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyProjects, getTasks, getSprints, getMembers, updateTask } from '../services/api'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { LayoutDashboard, FolderKanban, Users, LogOut, Timer, ChevronRight, Kanban, ClipboardList } from 'lucide-react'
import BurndownChart from '../components/BurndownChart'
import Notifications from '../components/Notifications'
import HistoryLog from '../components/HistoryLog'

function DashboardMember() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [sprints, setSprints] = useState([])
  const [members, setMembers] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedSprint, setSelectedSprint] = useState('')
  const [activePage, setActivePage] = useState('dashboard')
  const user = JSON.parse(localStorage.getItem('user'))

  const myTasks = tasks.filter(t => t.userId === user?.id)

  const pieData = [
    { name: 'Terminé', value: myTasks.filter(t => t.status === 'DONE').length },
    { name: 'En cours', value: myTasks.filter(t => t.status === 'IN_PROGRESS').length },
    { name: 'À faire', value: myTasks.filter(t => t.status === 'TODO').length },
  ]
  const COLORS = ['#10b981', '#6366f1', '#e2e8f0']

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try { const res = await getMyProjects(); setProjects(res.data) } catch (err) { console.error(err) }
  }

  const fetchSprints = async (projectId) => {
    try { const res = await getSprints(projectId); setSprints(res.data) } catch (err) { console.error(err) }
  }

  const fetchMembers = async (projectId) => {
    try { const res = await getMembers(projectId); setMembers(res.data) } catch (err) { console.error(err) }
  }

  const fetchTasks = async (sprintId) => {
    try { const res = await getTasks(sprintId); setTasks(res.data) } catch (err) { console.error(err) }
  }

  const fetchMyTasks = async (sprintId) => {
    try {
      const res = await getTasks(sprintId)
      setTasks(res.data.filter(t => t.userId === user?.id))
    } catch (err) { console.error(err) }
  }

  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value)
    setSelectedSprint('')
    setTasks([])
    fetchSprints(e.target.value)
    fetchMembers(e.target.value)
  }

  const handleMoveTask = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus })
      if (activePage === 'mytasks') {
        fetchMyTasks(selectedSprint)
      } else {
        fetchTasks(selectedSprint)
      }
    } catch (err) { console.error(err) }
  }

  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/')
  }

  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { id: 'projects', icon: <FolderKanban size={18} />, label: 'Mes Projets' },
    { id: 'sprints', icon: <Timer size={18} />, label: 'Sprints' },
    { id: 'kanban', icon: <Kanban size={18} />, label: 'Kanban' },
    { id: 'mytasks', icon: <ClipboardList size={18} />, label: 'Mes Tâches' },
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
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-emerald-500 font-medium">Membre</p>
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
                  ? 'bg-emerald-50 text-emerald-600 font-medium'
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
            <p className="text-xs text-gray-400">Tableau de bord membre</p>
          </div>
         <div className="flex items-center gap-3">
  <Notifications />
  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-medium border border-emerald-100">
    👨‍💻 Membre
  </span>
</div>
        </div>

        <div className="p-8">

          {/* Dashboard */}
          {activePage === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Mes Projets', value: projects.length, color: 'text-emerald-600', border: 'border-emerald-100' },
                  { label: 'Mes Tâches', value: myTasks.length, color: 'text-indigo-600', border: 'border-indigo-100' },
                  { label: 'Terminées', value: myTasks.filter(t => t.status === 'DONE').length, color: 'text-violet-600', border: 'border-violet-100' },
                ].map((stat, i) => (
                  <div key={i} className={`bg-white rounded-2xl p-5 border ${stat.border} shadow-sm`}>
                    <p className="text-xs text-gray-500 font-medium mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    <HistoryLog showAll={false} projectId={projects[0]?.id} />
                        {/* Burndown */}
<BurndownChart projects={projects} />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">État de mes tâches</h3>
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

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Mes Projets récents</h3>
                  {projects.length === 0 ? (
                    <div className="text-center text-gray-300 py-8">
                      <FolderKanban size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Vous n'êtes assigné à aucun projet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {projects.slice(0, 4).map((project) => (
                        <div key={project.id} className="flex justify-between items-center py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                            <p className="text-sm font-medium text-gray-700">{project.name}</p>
                          </div>
                          <button
                            onClick={() => navigate(`/project/${project.id}`)}
                            className="text-emerald-600 text-xs hover:underline flex items-center gap-1"
                          >
                            Voir <ChevronRight size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mes Projets */}
          {activePage === 'projects' && (
            <div className="space-y-6">
              <h2 className="text-sm font-semibold text-gray-700">{projects.length} projet(s) assigné(s)</h2>
              {projects.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 border border-gray-100 text-center text-gray-400">
                  <FolderKanban size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Vous n'êtes assigné à aucun projet</p>
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
                        <span className="text-xs text-gray-400">{project.sprints?.length} sprint(s)</span>
                        <button
                          onClick={() => navigate(`/project/${project.id}`)}
                          className="text-emerald-600 text-xs hover:underline flex items-center gap-1"
                        >
                          Voir <ChevronRight size={12} />
                        </button>
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
              <h2 className="text-sm font-semibold text-gray-700">Sprints</h2>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <label className="text-xs text-gray-500 font-medium mb-2 block">SÉLECTIONNER UN PROJET</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
                  onChange={handleProjectChange}
                  value={selectedProject}
                >
                  <option value="">-- Choisir un projet --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {!selectedProject ? (
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
                    <div key={sprint.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-sm font-semibold text-gray-800">{sprint.name}</h3>
                        <span className="bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded-full border border-indigo-100">Actif</span>
                      </div>
                      <p className="text-xs text-gray-400">📅 {new Date(sprint.startDate).toLocaleDateString()} → {new Date(sprint.endDate).toLocaleDateString()}</p>
                      <div className="mt-4 pt-3 border-t border-gray-50">
                        <span className="text-xs text-gray-400">{sprint.tasks?.length || 0} tâche(s)</span>
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
              <h2 className="text-sm font-semibold text-gray-700">Tableau Kanban</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <label className="text-xs text-gray-500 font-medium mb-2 block">PROJET</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
                    onChange={handleProjectChange}
                    value={selectedProject}
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
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
                    onChange={(e) => { setSelectedSprint(e.target.value); fetchTasks(e.target.value) }}
                    value={selectedSprint}
                    disabled={!selectedProject}
                  >
                    <option value="">-- Choisir un sprint --</option>
                    {sprints.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

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
                            <p className="text-sm font-medium text-gray-800 mb-1">{task.title}</p>
                            {task.description && <p className="text-xs text-gray-400 mb-2">{task.description}</p>}
                            {task.assignee && (
                              <div className="flex items-center gap-1 mb-2">
                                <div className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center">
                                  <span className="text-emerald-600 text-xs">{task.assignee.name.charAt(0)}</span>
                                </div>
                                <span className="text-xs text-gray-400">{task.assignee.name}</span>
                              </div>
                            )}
                            {task.userId === user?.id && (
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
                                    className="text-xs bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded-lg transition text-emerald-600"
                                  >
                                    Avancer →
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                        {tasks.filter(t => t.status === col.status).length === 0 && (
                          <div className="text-center text-gray-300 py-8 text-xs">Aucune tâche</div>
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

          {/* Mes Tâches */}
          {activePage === 'mytasks' && (
            <div className="space-y-6">
              <h2 className="text-sm font-semibold text-gray-700">Mes Tâches assignées</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <label className="text-xs text-gray-500 font-medium mb-2 block">PROJET</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
                    onChange={handleProjectChange}
                    value={selectedProject}
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
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
                    onChange={(e) => { setSelectedSprint(e.target.value); fetchMyTasks(e.target.value) }}
                    value={selectedSprint}
                    disabled={!selectedProject}
                  >
                    <option value="">-- Choisir un sprint --</option>
                    {sprints.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedSprint ? (
                tasks.length === 0 ? (
                  <div className="bg-white rounded-2xl p-16 border border-gray-100 text-center text-gray-400">
                    <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Aucune tâche assignée dans ce sprint</p>
                  </div>
                ) : (
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
                              <p className="text-sm font-medium text-gray-800 mb-1">{task.title}</p>
                              {task.description && <p className="text-xs text-gray-400 mb-2">{task.description}</p>}
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
                                    className="text-xs bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded-lg transition text-emerald-600"
                                  >
                                    Avancer →
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                          {tasks.filter(t => t.status === col.status).length === 0 && (
                            <div className="text-center text-gray-300 py-8 text-xs">Aucune tâche</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="bg-white rounded-2xl p-16 border border-gray-100 text-center text-gray-400">
                  <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Sélectionnez un projet et un sprint</p>
                </div>
              )}
            </div>
          )}

          {/* Membres */}
          {activePage === 'members' && (
            <div className="space-y-6">
              <h2 className="text-sm font-semibold text-gray-700">Membres du projet</h2>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <label className="text-xs text-gray-500 font-medium mb-2 block">SÉLECTIONNER UN PROJET</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
                  onChange={(e) => { setSelectedProject(e.target.value); fetchMembers(e.target.value) }}
                  value={selectedProject}
                >
                  <option value="">-- Choisir un projet --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

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
                        <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">STATUT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr key={member.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${member.user.id === user?.id ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                                {member.user.name.charAt(0)}
                              </div>
                              <span className="text-sm font-medium text-gray-800">
                                {member.user.name}
                                {member.user.id === user?.id && <span className="ml-1 text-xs text-emerald-500">(Moi)</span>}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">{member.user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              member.user.role === 'ADMIN' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                              member.user.role === 'CHEF' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                              'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            }`}>{member.user.role}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-emerald-50 text-emerald-600 text-xs px-2 py-1 rounded-full border border-emerald-100">Actif</span>
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

export default DashboardMember