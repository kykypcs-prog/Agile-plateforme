import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProjects, createProject, deleteProject, getUsers, getStats, addMember, getMembers, removeMember, updateUserRole, getSprints, createSprint, deleteSprint, deleteUser, adminCreateUser } from '../services/api'  // ← nouvelle fonction
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { LayoutDashboard, FolderKanban, Users, BarChart2, LogOut, Timer, ChevronRight, Trash2, Plus, X, Sparkles, TrendingUp, CheckCircle, Clock, UserPlus, Calendar } from 'lucide-react'
import BurndownChart from '../components/BurndownChart'
import Notifications from '../components/Notifications'
import HistoryLog from '../components/HistoryLog'

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
  
  // États pour la création d'utilisateur
  const [showUserForm, setShowUserForm] = useState(false)
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'MEMBER' })

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
      try {
        await deleteProject(id)
        fetchProjects()
        fetchStats()
        setSprints([])
        setSelectedProject('')
        setSelectedProjectSprint('')
        setMembers([])
      } catch (err) { console.error(err) }
    }
  }

  const handleAddMember = async () => {
    try {
      await addMember(selectedProject, selectedUser)
      setShowMemberForm(false)
      setSelectedUser('')
      fetchMembers(selectedProject)
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'ajout du membre !')
    }
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

  const handleDeleteUser = async (id) => {
    if (window.confirm('Supprimer cet utilisateur définitivement ?')) {
      try {
        await deleteUser(id)
        fetchUsers()
        fetchStats()
      } catch (err) {
        alert(err.response?.data?.message || 'Erreur !')
      }
    }
  }

  // NOUVELLE FONCTION : création d'utilisateur par l'admin
  const handleCreateUser = async () => {
    try {
      await adminCreateUser(userForm)
      setShowUserForm(false)
      setUserForm({ name: '', email: '', password: '', role: 'MEMBER' })
      fetchUsers()
      fetchStats()
      alert(`Utilisateur ${userForm.role} créé avec succès`)
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la création')
    }
  }

  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard', gradient: 'from-indigo-500 to-purple-600' },
    { id: 'projects', icon: <FolderKanban size={18} />, label: 'Projets', gradient: 'from-blue-500 to-cyan-600' },
    { id: 'sprints', icon: <Timer size={18} />, label: 'Sprints', gradient: 'from-emerald-500 to-teal-600' },
    { id: 'members', icon: <Users size={18} />, label: 'Membres', gradient: 'from-violet-500 to-purple-600' },
    { id: 'users', icon: <UserPlus size={18} />, label: 'Utilisateurs', gradient: 'from-rose-500 to-pink-600' },
    { id: 'stats', icon: <BarChart2 size={18} />, label: 'Statistiques', gradient: 'from-amber-500 to-orange-600' },
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

      {/* Sidebar inchangée */}
      <div className="w-60 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex flex-col fixed h-full shadow-2xl animate-slideIn">
        <div className="p-5 border-b border-gray-700/50">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg animate-pulseGlow">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">AgileFlow</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-white/10 rounded-xl backdrop-blur-sm">
            <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-rose-300 font-medium">Administrateur</p>
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

      {/* Main Content */}
      <div className="flex-1 ml-60">
        {/* Header inchangé */}
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="animate-fadeInUp">
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {menuItems.find(m => m.id === activePage)?.label}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Tableau de bord administrateur</p>
          </div>
          <div className="flex items-center gap-4">
            <Notifications />
            <span className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-md">👑 Administrateur</span>
          </div>
        </div>

        <div className="p-8 animate-fadeInUp">
          {/* Dashboard - inchangé */}
          {activePage === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-5">
                {[
                  { label: 'Projets', value: stats.totalProjects || 0, icon: <FolderKanban size={20} />, gradient: 'from-indigo-500 to-purple-600' },
                  { label: 'Sprints', value: stats.totalSprints || 0, icon: <Timer size={20} />, gradient: 'from-emerald-500 to-teal-600' },
                  { label: 'Tâches', value: stats.totalTasks || 0, icon: <CheckCircle size={20} />, gradient: 'from-violet-500 to-purple-600' },
                  { label: 'Utilisateurs', value: stats.totalUsers || 0, icon: <Users size={20} />, gradient: 'from-amber-500 to-orange-600' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 shadow-lg card-hover border border-gray-100 relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500`}></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
                        <div className={`p-2 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-md`}>{stat.icon}</div>
                      </div>
                      <p className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</p>
                      <div className="mt-2 flex items-center gap-1 text-xs text-green-600"><TrendingUp size={12} /><span>+12% ce mois</span></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg card-hover border border-gray-100"><h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"><BarChart2 size={16} className="text-indigo-500" />Tâches par mois</h3><ResponsiveContainer width="100%" height={250}><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="taches" fill="url(#gradientBar)" radius={[8,8,0,0]} /></BarChart></ResponsiveContainer></div>
                <div className="bg-white rounded-2xl p-6 shadow-lg card-hover border border-gray-100"><h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"><PieChart size={16} className="text-emerald-500" />État des tâches</h3><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({name, value, percent}) => `${name} ${(percent*100).toFixed(0)}%`}>{pieData.map((e,i)=><Cell key={i} fill={COLORS[i]} stroke="white" strokeWidth={2}/>)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden card-hover"><div className="px-6 py-4 border-b border-gray-100"><h3 className="text-sm font-bold text-gray-700 flex items-center gap-2"><Clock size={16} className="text-indigo-500" />Projets récents</h3></div><table className="w-full"><thead><tr className="border-b border-gray-100 bg-gray-50/50"><th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold">PROJET</th><th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold">SPRINTS</th><th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold">MEMBRES</th><th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold">ACTIONS</th></tr></thead><tbody>{projects.slice(0,5).map(p=><tr key={p.id} className="border-b border-gray-50"><td className="px-6 py-4 text-sm font-semibold">{p.name}</td><td className="px-6 py-4 text-sm text-gray-500">{p.sprints?.length||0}</td><td className="px-6 py-4 text-sm text-gray-500">{p.members?.length||0}</td><td className="px-6 py-4 flex gap-3"><button onClick={()=>navigate(`/project/${p.id}`)} className="text-indigo-600 text-xs hover:underline">Voir</button><button onClick={()=>handleDeleteProject(p.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button></td></tr>)}</tbody></table></div>
            </div>
          )}

          {/* Projets - inchangé */}
          {activePage === 'projects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center"><h2 className="text-sm font-bold text-gray-700">{projects.length} projet(s)</h2><button onClick={()=>setShowProjectForm(!showProjectForm)} className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg"><Plus size={16}/>Nouveau Projet</button></div>
              {showProjectForm && (<div className="bg-white rounded-2xl p-6 shadow-lg"><div className="flex justify-between items-center mb-4"><h3 className="text-sm font-bold text-gray-700">Nouveau Projet</h3><button onClick={()=>setShowProjectForm(false)}><X size={18}/></button></div><input type="text" placeholder="Nom" className="w-full border rounded-xl px-4 py-2.5 mb-3" onChange={(e)=>setProjectForm({...projectForm,name:e.target.value})}/><input type="text" placeholder="Description" className="w-full border rounded-xl px-4 py-2.5 mb-4" onChange={(e)=>setProjectForm({...projectForm,description:e.target.value})}/><div className="flex gap-3"><button onClick={handleCreateProject} className="bg-indigo-600 text-white px-5 py-2 rounded-xl">Créer</button><button onClick={()=>setShowProjectForm(false)} className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl">Annuler</button></div></div>)}
              {projects.length===0?<div className="bg-white rounded-2xl p-16 text-center text-gray-400"><FolderKanban size={48} className="mx-auto mb-3 opacity-30"/><p>Aucun projet</p></div>:<div className="grid grid-cols-3 gap-5">{projects.map(p=><div key={p.id} className="bg-white rounded-2xl p-5 shadow-lg"><div className="flex justify-between items-start mb-3"><h3 className="text-sm font-bold">{p.name}</h3><span className="bg-emerald-400 text-white text-xs px-2 py-0.5 rounded-full">Actif</span></div><p className="text-xs text-gray-400 mb-4">{p.description||'Aucune description'}</p><div className="flex justify-between items-center pt-3 border-t"><span className="text-xs text-gray-400">{p.sprints?.length||0} sprint(s) · {p.members?.length||0} membre(s)</span><div className="flex gap-2"><button onClick={()=>navigate(`/project/${p.id}`)} className="text-indigo-600 text-xs hover:underline">Voir</button><button onClick={()=>handleDeleteProject(p.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button></div></div></div>)}</div>}
            </div>
          )}

          {/* Sprints - inchangé */}
          {activePage === 'sprints' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center"><h2 className="text-sm font-bold text-gray-700">Gestion des Sprints</h2>{selectedProjectSprint&&<button onClick={()=>setShowSprintForm(!showSprintForm)} className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-xl"><Plus size={16}/>Nouveau Sprint</button>}</div>
              <div className="bg-white rounded-2xl p-5 shadow-lg"><label className="text-xs text-gray-500 font-semibold mb-2 block">SÉLECTIONNER UN PROJET</label><select className="w-full border rounded-xl px-4 py-2.5" onChange={(e)=>{setSelectedProjectSprint(e.target.value); fetchSprints(e.target.value)}} value={selectedProjectSprint}><option value="">-- Choisir --</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
              {showSprintForm&&(<div className="bg-white rounded-2xl p-6 shadow-lg"><div className="flex justify-between items-center mb-4"><h3 className="text-sm font-bold">Nouveau Sprint</h3><button onClick={()=>setShowSprintForm(false)}><X size={18}/></button></div><input type="text" placeholder="Nom" className="w-full border rounded-xl px-4 py-2.5 mb-3" onChange={(e)=>setSprintForm({...sprintForm,name:e.target.value})}/><div className="grid grid-cols-2 gap-3 mb-4"><div><label>Date début</label><input type="date" className="w-full border rounded-xl px-4 py-2.5" onChange={(e)=>setSprintForm({...sprintForm,startDate:e.target.value})}/></div><div><label>Date fin</label><input type="date" className="w-full border rounded-xl px-4 py-2.5" onChange={(e)=>setSprintForm({...sprintForm,endDate:e.target.value})}/></div></div><div className="flex gap-3"><button onClick={handleCreateSprint} className="bg-emerald-500 text-white px-5 py-2 rounded-xl">Créer</button><button onClick={()=>setShowSprintForm(false)} className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl">Annuler</button></div></div>)}
              {!selectedProjectSprint?<div className="bg-white rounded-2xl p-16 text-center text-gray-400"><Timer size={48} className="mx-auto mb-3 opacity-30"/><p>Sélectionnez un projet</p></div>:sprints.length===0?<div className="bg-white rounded-2xl p-16 text-center text-gray-400"><Calendar size={48} className="mx-auto mb-3 opacity-30"/><p>Aucun sprint</p></div>:<div className="grid grid-cols-3 gap-5">{sprints.map(s=><div key={s.id} className="bg-white rounded-2xl p-5 shadow-lg"><div className="flex justify-between items-start mb-3"><h3 className="text-sm font-bold">{s.name}</h3><span className="bg-indigo-400 text-white text-xs px-2 py-0.5 rounded-full">En cours</span></div><p className="text-xs text-gray-400">📅 {new Date(s.startDate).toLocaleDateString()} → {new Date(s.endDate).toLocaleDateString()}</p><div className="flex justify-between items-center mt-4 pt-3 border-t"><span className="text-xs text-gray-400">{s.tasks?.length||0} tâche(s)</span><button onClick={()=>handleDeleteSprint(s.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button></div></div>)}</div>}
            </div>
          )}

          {/* Membres - inchangé */}
          {activePage === 'members' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center"><h2 className="text-sm font-bold text-gray-700">Gestion des Membres</h2>{selectedProject&&<button onClick={()=>setShowMemberForm(!showMemberForm)} className="flex items-center gap-2 bg-violet-500 text-white px-5 py-2.5 rounded-xl"><Plus size={16}/>Ajouter un membre</button>}</div>
              <div className="bg-white rounded-2xl p-5 shadow-lg"><label className="text-xs text-gray-500 font-semibold mb-2 block">SÉLECTIONNER UN PROJET</label><select className="w-full border rounded-xl px-4 py-2.5" onChange={(e)=>{setSelectedProject(e.target.value); fetchMembers(e.target.value)}} value={selectedProject}><option value="">-- Choisir --</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
              {showMemberForm&&(<div className="bg-white rounded-2xl p-6 shadow-lg"><div className="flex justify-between items-center mb-4"><h3>Ajouter un membre</h3><button onClick={()=>setShowMemberForm(false)}><X size={18}/></button></div><select className="w-full border rounded-xl px-4 py-2.5 mb-4" onChange={(e)=>setSelectedUser(e.target.value)} value={selectedUser}><option value="">-- Choisir --</option>{users.map(u=><option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}</select><div className="flex gap-3"><button onClick={handleAddMember} className="bg-violet-500 text-white px-5 py-2 rounded-xl">Ajouter</button><button onClick={()=>setShowMemberForm(false)} className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl">Annuler</button></div></div>)}
              {!selectedProject?<div className="bg-white rounded-2xl p-16 text-center text-gray-400"><Users size={48} className="mx-auto mb-3 opacity-30"/><p>Sélectionnez un projet</p></div>:members.length===0?<div className="bg-white rounded-2xl p-16 text-center text-gray-400"><UserPlus size={48} className="mx-auto mb-3 opacity-30"/><p>Aucun membre</p></div>:<div className="bg-white rounded-2xl shadow-lg overflow-hidden"><table className="w-full"><thead><tr className="border-b bg-gray-50/50"><th className="px-6 py-3 text-left text-xs font-semibold">NOM</th><th className="px-6 py-3 text-left text-xs font-semibold">EMAIL</th><th className="px-6 py-3 text-left text-xs font-semibold">RÔLE</th><th className="px-6 py-3 text-left text-xs font-semibold">ACTION</th></tr></thead><tbody>{members.map(m=><tr key={m.id} className="border-b"><td className="px-6 py-4 text-sm font-semibold">{m.user.name}</td><td className="px-6 py-4 text-sm text-gray-500">{m.user.email}</td><td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded-full font-semibold ${m.user.role==='ADMIN'?'bg-rose-100 text-rose-700':m.user.role==='CHEF'?'bg-indigo-100 text-indigo-700':'bg-emerald-100 text-emerald-700'}`}>{m.user.role}</span></td><td className="px-6 py-4"><button onClick={()=>handleRemoveMember(m.user.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button></td></tr>)}</tbody></table></div>}
            </div>
          )}

          {/* Utilisateurs - MODIFIÉ : ajout du bouton et du formulaire */}
          {activePage === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-gray-700">{users.length} utilisateur(s)</h2>
                <button
                  onClick={() => setShowUserForm(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <Plus size={16} /> Créer un utilisateur
                </button>
              </div>

              {/* Modal de création utilisateur */}
              {showUserForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeInUp" onClick={() => setShowUserForm(false)}>
                  <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-800">Nouvel utilisateur</h3>
                      <button onClick={() => setShowUserForm(false)} className="text-gray-400 hover:text-gray-600 transition-all hover:rotate-90">
                        <X size={20} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Nom complet"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        value={userForm.name}
                        onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        value={userForm.email}
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      />
                      <input
                        type="password"
                        placeholder="Mot de passe"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        value={userForm.password}
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      />
                      <div>
                        <label className="text-xs text-gray-500 font-semibold mb-1 block">Rôle</label>
                        <select
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                          value={userForm.role}
                          onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                        >
                          <option value="MEMBER">Membre</option>
                          <option value="CHEF">Chef de projet</option>
                        </select>
                      </div>
                      <button
                        onClick={handleCreateUser}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2.5 rounded-xl text-sm font-medium hover:shadow-md transition-all hover:scale-[1.02]"
                      >
                        Créer l'utilisateur
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">NOM</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">EMAIL</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">RÔLE</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">CHANGER RÔLE</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-gray-50 hover:bg-rose-50/30 transition-all duration-200">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">{u.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            u.role === 'ADMIN' ? 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 border border-rose-200' :
                            u.role === 'CHEF' ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200' :
                            'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-200'
                          }`}>{u.role}</span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-rose-400 transition-all"
                            value={u.role}
                            onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="CHEF">CHEF</option>
                            <option value="MEMBER">MEMBER</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          {u.id !== JSON.parse(localStorage.getItem('user'))?.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-red-400 hover:text-red-600 transition-all hover:scale-110"
                              title="Supprimer cet utilisateur"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Statistiques - inchangé */}
          {activePage === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-5">{[
                { label: 'À faire', value: stats.tasksTodo || 0, icon: <Clock size={20}/>, gradient: 'from-amber-500 to-orange-600' },
                { label: 'En cours', value: stats.tasksInProgress || 0, icon: <TrendingUp size={20}/>, gradient: 'from-indigo-500 to-purple-600' },
                { label: 'Terminées', value: stats.tasksDone || 0, icon: <CheckCircle size={20}/>, gradient: 'from-emerald-500 to-teal-600' },
              ].map((stat,i)=><div key={i} className="bg-white rounded-2xl p-5 shadow-lg"><div className="flex items-center justify-between mb-2"><p className="text-xs text-gray-500 uppercase">{stat.label}</p><div className={`p-2 bg-gradient-to-br ${stat.gradient} rounded-xl`}>{stat.icon}</div></div><p className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</p></div>)}</div>
              <HistoryLog showAll={true} />
              <BurndownChart projects={projects} />
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg"><h3 className="text-sm font-bold mb-4 flex items-center gap-2"><BarChart2 size={16} className="text-indigo-500"/>Tâches par mois</h3><ResponsiveContainer width="100%" height={250}><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="taches" fill="url(#gradientBarStats)" radius={[8,8,0,0]}/></BarChart></ResponsiveContainer></div>
                <div className="bg-white rounded-2xl p-6 shadow-lg"><h3 className="text-sm font-bold mb-4 flex items-center gap-2"><PieChart size={16} className="text-emerald-500"/>État des tâches</h3><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({name,value,percent})=>`${name} ${(percent*100).toFixed(0)}%`}>{pieData.map((e,i)=><Cell key={i} fill={COLORS[i]} stroke="white" strokeWidth={2}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Définition des gradients (pour les barres) */}
      <defs>
        <linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#818cf8"/></linearGradient>
        <linearGradient id="gradientBarStats" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#a78bfa"/></linearGradient>
      </defs>
    </div>
  )
}

export default DashboardAdmin