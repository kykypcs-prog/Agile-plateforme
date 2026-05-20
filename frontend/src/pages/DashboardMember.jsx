import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyProjects, getTasks, getSprints, getMembers, updateTask } from '../services/api'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { LayoutDashboard, FolderKanban, Users, LogOut, Timer, ChevronRight, Kanban, ClipboardList, Sparkles, TrendingUp, CheckCircle, Clock, UserPlus, Calendar } from 'lucide-react'
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
  const COLORS = ['#10b981', '#6366f1', '#f59e0b']

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
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard', gradient: 'from-emerald-500 to-teal-600' },
    { id: 'projects', icon: <FolderKanban size={18} />, label: 'Mes Projets', gradient: 'from-blue-500 to-cyan-600' },
    { id: 'sprints', icon: <Timer size={18} />, label: 'Sprints', gradient: 'from-violet-500 to-purple-600' },
    { id: 'kanban', icon: <Kanban size={18} />, label: 'Kanban', gradient: 'from-indigo-500 to-purple-600' },
    { id: 'mytasks', icon: <ClipboardList size={18} />, label: 'Mes Tâches', gradient: 'from-amber-500 to-orange-600' },
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
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
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
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg animate-pulseGlow">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">AgileFlow</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-white/10 rounded-xl backdrop-blur-sm">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-emerald-300 font-medium">Membre</p>
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
            <p className="text-xs text-gray-500 mt-0.5">Tableau de bord membre</p>
          </div>
          <div className="flex items-center gap-4">
            <Notifications />
            <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-md">
              👨‍💻 Membre
            </span>
          </div>
        </div>

        <div className="p-8 animate-fadeInUp">
          {/* Dashboard */}
          {activePage === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-5">
                {[
                  { label: 'Mes Projets', value: projects.length, icon: <FolderKanban size={20} />, gradient: 'from-emerald-500 to-teal-600' },
                  { label: 'Mes Tâches', value: myTasks.length, icon: <ClipboardList size={20} />, gradient: 'from-indigo-500 to-purple-600' },
                  { label: 'Terminées', value: myTasks.filter(t => t.status === 'DONE').length, icon: <CheckCircle size={20} />, gradient: 'from-violet-500 to-purple-600' },
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
                        <span>+5% ce mois</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg card-hover border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <PieChart size={16} className="text-emerald-500" />
                    État de mes tâches
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

                <div className="bg-white rounded-2xl p-6 shadow-lg card-hover border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Clock size={16} className="text-indigo-500" />
                    Mes Projets récents
                  </h3>
                  {projects.length === 0 ? (
                    <div className="text-center text-gray-300 py-8">
                      <FolderKanban size={48} className="mx-auto mb-3 opacity-30" />
                      <p className="text-xs">Vous n'êtes assigné à aucun projet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {projects.slice(0, 4).map((project) => (
                        <div key={project.id} className="flex justify-between items-center py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-pulse"></div>
                            <p className="text-sm font-semibold text-gray-700 group-hover:text-emerald-600 transition-colors">{project.name}</p>
                          </div>
                          <button
                            onClick={() => navigate(`/project/${project.id}`)}
                            className="text-emerald-600 text-xs hover:underline flex items-center gap-1 transition-all hover:gap-2"
                          >
                            Voir <ChevronRight size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <HistoryLog showAll={false} projectId={projects[0]?.id} />
              <BurndownChart projects={projects} />
            </div>
          )}

          {/* Mes Projets */}
          {activePage === 'projects' && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-gray-700">{projects.length} projet(s) assigné(s)</h2>
              {projects.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 text-center text-gray-400 shadow-lg">
                  <FolderKanban size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Vous n'êtes assigné à aucun projet</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-5">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-white rounded-2xl p-5 shadow-lg card-hover border border-gray-100 group">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-sm font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">{project.name}</h3>
                        <span className="bg-gradient-to-r from-emerald-400 to-teal-400 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">Actif</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-4 line-clamp-2">{project.description || 'Aucune description'}</p>
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-400">{project.sprints?.length || 0} sprint(s)</span>
                        <button
                          onClick={() => navigate(`/project/${project.id}`)}
                          className="text-emerald-600 text-xs hover:underline flex items-center gap-1 transition-all hover:gap-2"
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
              <h2 className="text-sm font-bold text-gray-700">Sprints</h2>

              <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                <label className="text-xs text-gray-500 font-semibold mb-2 block uppercase tracking-wider">SÉLECTIONNER UN PROJET</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
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
                        <h3 className="text-sm font-bold text-gray-800 group-hover:text-violet-600 transition-colors">{sprint.name}</h3>
                        <span className="bg-gradient-to-r from-violet-400 to-purple-400 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">Actif</span>
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        📅 {new Date(sprint.startDate).toLocaleDateString()} → {new Date(sprint.endDate).toLocaleDateString()}
                      </p>
                      <div className="mt-4 pt-3 border-t border-gray-100">
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
              <h2 className="text-sm font-bold text-gray-700">Tableau Kanban</h2>

              <div className="grid grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                  <label className="text-xs text-gray-500 font-semibold mb-2 block uppercase tracking-wider">PROJET</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    onChange={handleProjectChange}
                    value={selectedProject}
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
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition-all"
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
                            <p className="text-sm font-semibold text-gray-800 mb-1">{task.title}</p>
                            {task.description && <p className="text-xs text-gray-400 mb-2">{task.description}</p>}
                            {task.assignee && (
                              <div className="flex items-center gap-1 mb-2">
                                <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-sm">
                                  <span className="text-white text-[8px]">{task.assignee.name.charAt(0)}</span>
                                </div>
                                <span className="text-xs text-gray-500">{task.assignee.name}</span>
                              </div>
                            )}
                            {task.userId === user?.id && (
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
                                    className="text-xs bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded-lg transition-all text-emerald-600 hover:scale-105"
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
                <div className="bg-white rounded-2xl p-16 text-center text-gray-400 shadow-lg">
                  <Kanban size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Sélectionnez un projet et un sprint</p>
                </div>
              )}
            </div>
          )}

          {/* Mes Tâches */}
          {activePage === 'mytasks' && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-gray-700">Mes Tâches assignées</h2>

              <div className="grid grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                  <label className="text-xs text-gray-500 font-semibold mb-2 block uppercase tracking-wider">PROJET</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                    onChange={handleProjectChange}
                    value={selectedProject}
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
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 transition-all"
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
                  <div className="bg-white rounded-2xl p-16 text-center text-gray-400 shadow-lg">
                    <ClipboardList size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Aucune tâche assignée dans ce sprint</p>
                  </div>
                ) : (
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
                            <div key={task.id} className="bg-white rounded-xl p-3 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200">
                              <p className="text-sm font-semibold text-gray-800 mb-1">{task.title}</p>
                              {task.description && <p className="text-xs text-gray-400 mb-2">{task.description}</p>}
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
                                    className="text-xs bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded-lg transition-all text-emerald-600 hover:scale-105"
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
                <div className="bg-white rounded-2xl p-16 text-center text-gray-400 shadow-lg">
                  <ClipboardList size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Sélectionnez un projet et un sprint</p>
                </div>
              )}
            </div>
          )}

          {/* Membres */}
          {activePage === 'members' && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-gray-700">Membres du projet</h2>

              <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                <label className="text-xs text-gray-500 font-semibold mb-2 block uppercase tracking-wider">SÉLECTIONNER UN PROJET</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
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
                        <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">STATUT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr key={member.id} className="border-b border-gray-50 hover:bg-rose-50/30 transition-all duration-200">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${
                                member.user.id === user?.id 
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600' 
                                  : 'bg-gradient-to-r from-gray-400 to-gray-500'
                              }`}>
                                {member.user.name.charAt(0)}
                              </div>
                              <span className="text-sm font-semibold text-gray-800">
                                {member.user.name}
                                {member.user.id === user?.id && <span className="ml-1 text-xs text-emerald-600">(Moi)</span>}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{member.user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              member.user.role === 'ADMIN' ? 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 border border-rose-200' :
                              member.user.role === 'CHEF' ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200' :
                              'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-200'
                            }`}>{member.user.role}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-xs px-3 py-1 rounded-full border border-emerald-200 shadow-sm">Actif</span>
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