import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSprints, createSprint, deleteSprint, getMembers, addMember, getUsers, removeMember, getTasks, createTask, updateTask, deleteTask, updateSprintStatus } from '../services/api'
import { LayoutDashboard, FolderKanban, Users, Timer, Plus, X, Trash2, ChevronRight, Sparkles, Calendar, CheckCircle, TrendingUp, LogOut, Menu } from 'lucide-react'

function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState('sprints')
  const [sprints, setSprints] = useState([])
  const [members, setMembers] = useState([])
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])
  const [selectedSprint, setSelectedSprint] = useState('')
  const [showSprintForm, setShowSprintForm] = useState(false)
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [sprintForm, setSprintForm] = useState({ name: '', startDate: '', endDate: '' })
  const [taskForm, setTaskForm] = useState({ title: '', description: '', userId: '' })
  const [selectedUser, setSelectedUser] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const user = JSON.parse(localStorage.getItem('user'))
  const isMember = user?.role === 'MEMBER'

  useEffect(() => {
    if (id) {
      fetchSprints()
      fetchMembers()
      fetchUsers()
    }
    
    // Sauvegarder l'état du sidebar dans localStorage
    const savedState = localStorage.getItem('sidebarOpenProject')
    if (savedState !== null) {
      setSidebarOpen(savedState === 'true')
    }
  }, [id])

  // Sauvegarder l'état du sidebar
  useEffect(() => {
    localStorage.setItem('sidebarOpenProject', sidebarOpen)
  }, [sidebarOpen])

  const fetchSprints = async () => {
    try {
      const res = await getSprints(id)
      setSprints(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchMembers = async () => {
    try {
      const res = await getMembers(id)
      setMembers(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchUsers = async () => {
    try {
      const res = await getUsers()
      setUsers(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchTasks = async (sprintId) => {
    if (!sprintId) return
    try {
      const res = await getTasks(sprintId)
      if (isMember) {
        setTasks(res.data.filter(t => t.userId === user?.id))
      } else {
        setTasks(res.data)
      }
    } catch (err) { console.error(err) }
  }

  const handleCreateSprint = async () => {
    try {
      await createSprint({ ...sprintForm, projectId: id })
      setShowSprintForm(false)
      setSprintForm({ name: '', startDate: '', endDate: '' })
      fetchSprints()
    } catch (err) { console.error(err) }
  }

  const handleDeleteSprint = async (sprintId) => {
    if (window.confirm('Supprimer ce sprint ?')) {
      try {
        await deleteSprint(sprintId)
        if (selectedSprint === sprintId) {
          setSelectedSprint('')
          setTasks([])
        }
        fetchSprints()
      } catch (err) { console.error(err) }
    }
  }

  const handleUpdateSprintStatus = async (sprintId, status) => {
    try {
      await updateSprintStatus(sprintId, status)
      fetchSprints()
    } catch (err) { alert(err.response?.data?.message || 'Erreur !') }
  }

  const handleAddMember = async () => {
    if (!selectedUser) return
    try {
      await addMember(id, selectedUser)
      setShowMemberForm(false)
      setSelectedUser('')
      fetchMembers()
    } catch (err) { console.error(err) }
  }

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Retirer ce membre ?')) {
      try {
        await removeMember(id, userId)
        fetchMembers()
      } catch (err) { console.error(err) }
    }
  }

  const handleCreateTask = async () => {
    try {
      await createTask({ ...taskForm, sprintId: selectedSprint })
      setShowTaskForm(false)
      setTaskForm({ title: '', description: '', userId: '' })
      await fetchTasks(selectedSprint)
    } catch (err) { console.error(err) }
  }

  const handleMoveTask = async (taskId, newStatus) => {
    if (isMember) {
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, status: newStatus } : t
      ))
      try {
        await updateTask(taskId, { status: newStatus })
      } catch (err) {
        console.error(err)
        await fetchTasks(selectedSprint)
      }
    } else {
      try {
        await updateTask(taskId, { status: newStatus })
        await fetchTasks(selectedSprint)
      } catch (err) {
        console.error(err)
        await fetchTasks(selectedSprint)
      }
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Supprimer cette tâche ?')) {
      try {
        await deleteTask(taskId)
        await fetchTasks(selectedSprint)
      } catch (err) { console.error(err) }
    }
  }

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status)

  const goToDashboard = () => {
    const userRole = user?.role
    if (userRole === 'ADMIN') navigate('/dashboard/admin')
    else if (userRole === 'CHEF') navigate('/dashboard/chef')
    else navigate('/dashboard/member')
  }

  const menuItems = [
    { id: 'sprints', icon: <Timer size={18} />, label: 'Sprints', gradient: 'from-indigo-500 to-purple-600' },
    { id: 'kanban', icon: <CheckCircle size={18} />, label: 'Kanban', gradient: 'from-emerald-500 to-teal-600' },
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
        @keyframes slideOut {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(-20px); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(99, 102, 241, 0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.5s ease-out; }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
        .animate-slideOut { animation: slideOut 0.3s ease-out; }
        .animate-pulseGlow { animation: pulseGlow 2s infinite; }
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -12px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
        }
        .sidebar-transition {
          transition: transform 0.3s ease-in-out, width 0.3s ease-in-out;
        }
      `}</style>

      {/* Overlay pour mobile quand sidebar est ouvert */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar avec bouton hamburger */}
      <div className={`
        fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 
        flex flex-col shadow-2xl z-40 sidebar-transition
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      style={{ width: '260px' }}>
        
        {/* Header du sidebar */}
        <div className="p-5 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg animate-pulseGlow">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">AgileFlow</span>
            </div>
            {/* Bouton hamburger pour fermer le sidebar */}
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-all duration-300 hover:rotate-90"
              title="Fermer le menu"
            >
              <Menu size={20} className="text-gray-400 hover:text-white" />
            </button>
          </div>
          
          <button
            onClick={goToDashboard}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-4 mt-4 transition-all hover:gap-3 w-full"
          >
            <LayoutDashboard size={16} /> ← Retour au Dashboard
          </button>
          
          <div className="flex items-center gap-3 p-2 bg-white/10 rounded-xl backdrop-blur-sm">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-indigo-300 font-medium truncate">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          <p className="text-xs text-gray-400 font-medium px-3 mb-3 mt-2 tracking-wider">GESTION</p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id)
                // Fermer automatiquement sur mobile après sélection
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false)
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-300 text-left text-sm ${
                activePage === item.id
                  ? `bg-gradient-to-r ${item.gradient} text-white shadow-md scale-[1.02]`
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-700/50">
          <button
            onClick={() => {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              navigate('/')
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 text-sm"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`
        flex-1 min-w-0 transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'ml-[260px]' : 'ml-0'}
      `}>
        {/* Header avec bouton pour rouvrir le sidebar */}
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 md:px-8 py-3 md:py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Bouton hamburger pour rouvrir le sidebar - visible seulement quand sidebar est fermé */}
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
                title="Ouvrir le menu"
              >
                <Menu size={20} className="text-gray-600" />
              </button>
            )}
            <div className="animate-fadeInUp">
              <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex items-center gap-2">
                {menuItems.find(m => m.id === activePage)?.icon}
                {menuItems.find(m => m.id === activePage)?.label}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">Détail du projet</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold shadow-sm ${
              user?.role === 'ADMIN' ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white' :
              user?.role === 'CHEF' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' :
              'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
            }`}>
              {user?.role}
            </span>
            <span className="text-gray-600 text-[10px] sm:text-sm bg-gray-100 px-2 sm:px-3 py-1 rounded-full truncate max-w-[120px] sm:max-w-none">
              👤 {user?.name}
            </span>
          </div>
        </div>

        <div className="p-3 sm:p-4 md:p-6 lg:p-8 animate-fadeInUp">
          {/* SPRINTS */}
          {activePage === 'sprints' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Timer size={18} className="text-indigo-500" />
                  Sprints du projet
                </h3>
                {(user?.role === 'ADMIN' || user?.role === 'CHEF') && (
                  <button
                    onClick={() => setShowSprintForm(!showSprintForm)}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto justify-center"
                  >
                    <Plus size={16} /> Nouveau Sprint
                  </button>
                )}
              </div>

              {showSprintForm && (
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 animate-fadeInUp">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-700">Nouveau Sprint</h3>
                    <button onClick={() => setShowSprintForm(false)} className="text-gray-400 hover:text-gray-600 transition-all hover:rotate-90">
                      <X size={18} />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Nom du sprint"
                    className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 mb-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    onChange={(e) => setSprintForm({ ...sprintForm, name: e.target.value })}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Date début</label>
                      <input type="date" className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm" onChange={(e) => setSprintForm({ ...sprintForm, startDate: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Date fin</label>
                      <input type="date" className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm" onChange={(e) => setSprintForm({ ...sprintForm, endDate: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={handleCreateSprint} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:shadow-md transition-all hover:scale-105">Créer</button>
                    <button onClick={() => setShowSprintForm(false)} className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">Annuler</button>
                  </div>
                </div>
              )}

              {sprints.length === 0 ? (
                <div className="bg-white rounded-xl sm:rounded-2xl p-12 sm:p-16 text-center text-gray-400 shadow-lg">
                  <Timer size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucun sprint pour ce projet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {sprints.map((sprint) => (
                    <div key={sprint.id} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg card-hover border border-gray-100 group">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-sm sm:text-base font-bold text-gray-800 group-hover:text-indigo-600 transition-colors truncate max-w-[150px]">{sprint.name}</h3>
                        <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-semibold shadow-sm whitespace-nowrap ${
                          sprint.status === 'EN_COURS' ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white' :
                          sprint.status === 'TERMINE' ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' :
                          'bg-gradient-to-r from-indigo-400 to-purple-400 text-white'
                        }`}>
                          {sprint.status === 'EN_COURS' ? '🟢 En cours' :
                           sprint.status === 'TERMINE' ? '⚫ Terminé' :
                           '🔵 À venir'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        📅 {new Date(sprint.startDate).toLocaleDateString()} → {new Date(sprint.endDate).toLocaleDateString()}
                      </p>
                      <div className="flex flex-wrap justify-between items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-400">{sprint.tasks?.length || 0} tâche(s)</span>
                        <div className="flex flex-wrap items-center gap-2">
                          {user?.role === 'CHEF' && sprint.status === 'A_VENIR' && (
                            <button onClick={() => handleUpdateSprintStatus(sprint.id, 'EN_COURS')} className="text-[10px] sm:text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">▶ Démarrer</button>
                          )}
                          {user?.role === 'CHEF' && sprint.status === 'EN_COURS' && (
                            <button onClick={() => handleUpdateSprintStatus(sprint.id, 'TERMINE')} className="text-[10px] sm:text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">⏹ Terminer</button>
                          )}
                          {(user?.role === 'ADMIN' || user?.role === 'CHEF') && sprint.status !== 'EN_COURS' && (
                            <button onClick={() => handleDeleteSprint(sprint.id)} className="text-red-400 hover:text-red-600 transition-all hover:scale-110">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* KANBAN */}
          {activePage === 'kanban' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-2">
                  <CheckCircle size={18} className="text-emerald-500" />
                  Tableau Kanban
                </h3>
                {selectedSprint && (user?.role === 'ADMIN' || user?.role === 'CHEF') && (
                  <button
                    onClick={() => setShowTaskForm(!showTaskForm)}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto justify-center"
                  >
                    <Plus size={16} /> Nouvelle Tâche
                  </button>
                )}
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg border border-gray-100">
                <label className="text-xs text-gray-500 font-semibold mb-2 block uppercase tracking-wider">Sélectionner un sprint</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                  onChange={(e) => {
                    setSelectedSprint(e.target.value)
                    fetchTasks(e.target.value)
                  }}
                  value={selectedSprint}
                >
                  <option value="">-- Choisir un sprint --</option>
                  {sprints.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {showTaskForm && (
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 animate-fadeInUp">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-700">Nouvelle Tâche</h3>
                    <button onClick={() => setShowTaskForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                  </div>
                  <input
                    type="text"
                    placeholder="Titre"
                    className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 mb-3 text-sm"
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 mb-3 text-sm"
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  />
                  <select
                    className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 mb-4 text-sm"
                    onChange={(e) => setTaskForm({ ...taskForm, userId: e.target.value })}
                    value={taskForm.userId}
                  >
                    <option value="">-- Assigner à --</option>
                    {members.map((m) => (
                      <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                    ))}
                  </select>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={handleCreateTask} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2 rounded-xl text-sm">Créer</button>
                    <button onClick={() => setShowTaskForm(false)} className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl text-sm">Annuler</button>
                  </div>
                </div>
              )}

              {selectedSprint ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                  {[
                    { status: 'TODO', label: '📋 À Faire', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
                    { status: 'IN_PROGRESS', label: '🔄 En Cours', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', dot: 'bg-indigo-500' },
                    { status: 'DONE', label: '✅ Terminé', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' }
                  ].map((col) => (
                    <div key={col.status} className={`${col.bg} rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border ${col.border} card-hover`}>
                      <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <div className={`w-2 h-2 rounded-full ${col.dot} animate-pulse`}></div>
                        <h3 className={`text-xs sm:text-sm font-bold ${col.color}`}>{col.label}</h3>
                        <span className="ml-auto bg-white text-gray-500 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full border">
                          {getTasksByStatus(col.status).length}
                        </span>
                      </div>
                      <div className="space-y-2 sm:space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {getTasksByStatus(col.status).map((task) => (
                          <div key={task.id} className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-md border border-gray-100 hover:shadow-lg transition-all">
                            <div className="flex justify-between items-start mb-1 sm:mb-2">
                              <p className="text-xs sm:text-sm font-semibold text-gray-800">{task.title}</p>
                              {(user?.role === 'ADMIN' || user?.role === 'CHEF' || task.userId === user?.id) && (
                                <button onClick={() => handleDeleteTask(task.id)} className="text-gray-300 hover:text-red-400 transition-all hover:scale-110">
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                            {task.description && <p className="text-[10px] sm:text-xs text-gray-400 mb-1 sm:mb-2">{task.description}</p>}
                            {task.assignee && (
                              <div className="flex items-center gap-1 mb-1 sm:mb-2">
                                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-[6px] sm:text-[8px]">{task.assignee.name.charAt(0)}</span>
                                </div>
                                <span className="text-[10px] sm:text-xs text-gray-500 truncate">{task.assignee.name}</span>
                              </div>
                            )}
                            <div className="flex gap-1 mt-1 sm:mt-2 pt-1 sm:pt-2 border-t border-gray-50">
                              {col.status !== 'TODO' && (
                                <button
                                  onClick={() => handleMoveTask(task.id, col.status === 'IN_PROGRESS' ? 'TODO' : 'IN_PROGRESS')}
                                  className="text-[10px] sm:text-xs bg-gray-100 hover:bg-gray-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg"
                                >
                                  ← Reculer
                                </button>
                              )}
                              {col.status !== 'DONE' && (
                                <button
                                  onClick={() => handleMoveTask(task.id, col.status === 'TODO' ? 'IN_PROGRESS' : 'DONE')}
                                  className="text-[10px] sm:text-xs bg-indigo-100 hover:bg-indigo-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-indigo-600"
                                >
                                  Avancer →
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {getTasksByStatus(col.status).length === 0 && (
                          <div className="text-center text-gray-300 py-4 sm:py-8 text-[10px] sm:text-xs">Aucune tâche</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl sm:rounded-2xl p-12 sm:p-16 text-center text-gray-400 shadow-lg">
                  <CheckCircle size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Sélectionnez un sprint pour voir le Kanban</p>
                </div>
              )}
            </div>
          )}

          {/* MEMBRES */}
          {activePage === 'members' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Users size={18} className="text-rose-500" />
                  Membres du projet
                </h3>
                {(user?.role === 'ADMIN' || user?.role === 'CHEF') && (
                  <button
                    onClick={() => setShowMemberForm(!showMemberForm)}
                    className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-medium hover:shadow-lg w-full sm:w-auto justify-center"
                  >
                    <Plus size={16} /> Ajouter un membre
                  </button>
                )}
              </div>

              {showMemberForm && (
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 animate-fadeInUp">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-700">Ajouter un membre</h3>
                    <button onClick={() => setShowMemberForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                  </div>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 mb-4 text-sm"
                    onChange={(e) => setSelectedUser(e.target.value)}
                    value={selectedUser}
                  >
                    <option value="">-- Choisir un utilisateur --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={handleAddMember} className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-5 py-2 rounded-xl text-sm">Ajouter</button>
                    <button onClick={() => setShowMemberForm(false)} className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl text-sm">Annuler</button>
                  </div>
                </div>
              )}

              {members.length === 0 ? (
                <div className="bg-white rounded-xl sm:rounded-2xl p-12 sm:p-16 text-center text-gray-400 shadow-lg">
                  <Users size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucun membre pour ce projet</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                          <th className="text-left px-4 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-xs text-gray-500 font-semibold uppercase">Nom</th>
                          <th className="text-left px-4 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-xs text-gray-500 font-semibold uppercase">Email</th>
                          <th className="text-left px-4 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-xs text-gray-500 font-semibold uppercase">Rôle</th>
                          <th className="text-left px-4 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-xs text-gray-500 font-semibold uppercase">Statut</th>
                          {(user?.role === 'ADMIN' || user?.role === 'CHEF') && <th className="text-left px-4 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-xs text-gray-500 font-semibold uppercase">Action</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((member) => (
                          <tr key={member.id} className="border-b border-gray-50 hover:bg-rose-50/30 transition-all">
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold shadow-sm ${
                                  member.user.id === user?.id ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-gray-400 to-gray-500'
                                }`}>
                                  {member.user.name.charAt(0)}
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate max-w-[100px]">
                                  {member.user.name}
                                  {member.user.id === user?.id && <span className="ml-1 text-[10px] sm:text-xs text-emerald-600">(Moi)</span>}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 truncate max-w-[150px]">{member.user.email}</td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-semibold whitespace-nowrap ${
                                member.user.role === 'ADMIN' ? 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 border border-rose-200' :
                                member.user.role === 'CHEF' ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200' :
                                'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-200'
                              }`}>{member.user.role}</span>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <span className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full border border-emerald-200 shadow-sm">Actif</span>
                            </td>
                            {(user?.role === 'ADMIN' || user?.role === 'CHEF') && (
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
                                <button onClick={() => handleRemoveMember(member.user.id)} className="text-red-400 hover:text-red-600 flex items-center gap-1 text-[10px] sm:text-xs transition-all hover:scale-105">
                                  <Trash2 size={14} /> Retirer
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectDetail