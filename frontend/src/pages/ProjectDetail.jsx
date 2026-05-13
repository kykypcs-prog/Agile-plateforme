import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSprints, createSprint, deleteSprint, getMembers, addMember, getUsers, removeMember, getTasks, createTask, updateTask, deleteTask, updateSprintStatus } from '../services/api'


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
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    fetchSprints()
    fetchMembers()
    fetchUsers()
  }, [])

  const fetchSprints = async () => {
    try {
      const res = await getSprints(id)
      setSprints(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMembers = async () => {
    try {
      const res = await getMembers(id)
      setMembers(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await getUsers()
      setUsers(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchTasks = async (sprintId) => {
    try {
      const res = await getTasks(sprintId)
      setTasks(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateSprint = async () => {
    try {
      await createSprint({ ...sprintForm, projectId: id })
      setShowSprintForm(false)
      setSprintForm({ name: '', startDate: '', endDate: '' })
      fetchSprints()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteSprint = async (sprintId) => {
    if (window.confirm('Supprimer ce sprint ?')) {
      try {
        await deleteSprint(sprintId)
        fetchSprints()
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleUpdateSprintStatus = async (sprintId, status) => {
  try {
    await updateSprintStatus(sprintId, status)
    fetchSprints()
  } catch (err) {
    alert(err.response?.data?.message || 'Erreur !')
  }
}


  const handleAddMember = async () => {
    try {
      await addMember(id, selectedUser)
      setShowMemberForm(false)
      setSelectedUser('')
      fetchMembers()
    } catch (err) {
      console.error(err)
    }
  }

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Retirer ce membre ?')) {
      try {
        await removeMember(id, userId)
        fetchMembers()
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleCreateTask = async () => {
    try {
      await createTask({ ...taskForm, sprintId: selectedSprint })
      setShowTaskForm(false)
      setTaskForm({ title: '', description: '', userId: '' })
      fetchTasks(selectedSprint)
    } catch (err) {
      console.error(err)
    }
  }

  const handleMoveTask = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus })
      fetchTasks(selectedSprint)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Supprimer cette tâche ?')) {
      try {
        await deleteTask(taskId)
        fetchTasks(selectedSprint)
      } catch (err) {
        console.error(err)
      }
    }
  }

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status)

  const menuItems = [
    { id: 'sprints', icon: '🏃', label: 'Sprints' },
    { id: 'kanban', icon: '✅', label: 'Kanban' },
    { id: 'members', icon: '👥', label: 'Membres' },
  ]

  return (
    <div className="flex min-h-screen">

    {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col fixed h-full">
        <div className="p-6 border-b border-gray-700">
          <button
            onClick={() => {
              const user = JSON.parse(localStorage.getItem('user'))
              if (user?.role === 'ADMIN') navigate('/dashboard/admin')
              else if (user?.role === 'CHEF') navigate('/dashboard/chef')
              else navigate('/dashboard/member')
            }}
            className="text-gray-400 hover:text-white text-sm mb-4 flex items-center gap-2"
          >
            ← Retour au Dashboard
          </button>

            
          <h1 className="text-xl font-bold"> Agile Platform</h1>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition text-left ${
                activePage === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 ml-64">

        {/* Header */}
        <div className="bg-white px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {menuItems.find(m => m.id === activePage)?.icon}{' '}
            {menuItems.find(m => m.id === activePage)?.label}
          </h2>
          <div className="flex items-center gap-3">
            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
              {user?.role}
            </span>
            <span className="text-gray-600 text-sm">👤 {user?.name}</span>
          </div>
        </div>

        <div className="p-8">

          {/* Sprints */}
{activePage === 'sprints' && (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-bold text-gray-800">🏃 Sprints du projet</h3>
      {(user?.role === 'ADMIN' || user?.role === 'CHEF') && (
        <button
          onClick={() => setShowSprintForm(!showSprintForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Nouveau Sprint
        </button>
      )}
    </div>

    {showSprintForm && (
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h3 className="font-bold text-gray-700 mb-4">Nouveau Sprint</h3>
        <input
          type="text"
          placeholder="Nom du sprint"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:border-blue-500"
          onChange={(e) => setSprintForm({ ...sprintForm, name: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Date début</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              onChange={(e) => setSprintForm({ ...sprintForm, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Date fin</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              onChange={(e) => setSprintForm({ ...sprintForm, endDate: e.target.value })}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleCreateSprint} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Créer</button>
          <button onClick={() => setShowSprintForm(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition">Annuler</button>
        </div>
      </div>
    )}

    {sprints.length === 0 ? (
      <div className="bg-white rounded-xl p-12 shadow-sm text-center text-gray-400">
        <p className="text-5xl mb-4">🏃</p>
        <p>Aucun sprint pour ce projet</p>
      </div>
    ) : (
      <div className="grid grid-cols-3 gap-4">
        {sprints.map((sprint) => (
          <div key={sprint.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-gray-800">{sprint.name}</h3>
              <span className={`text-xs px-2 py-1 rounded-full border font-medium ${
                sprint.status === 'EN_COURS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                sprint.status === 'TERMINE' ? 'bg-gray-50 text-gray-400 border-gray-100' :
                'bg-indigo-50 text-indigo-600 border-indigo-100'
              }`}>
                {sprint.status === 'EN_COURS' ? '🟢 En cours' :
                 sprint.status === 'TERMINE' ? '⚫ Terminé' :
                 '🔵 À venir'}
              </span>
            </div>
            <p className="text-gray-500 text-sm">📅 Début : {new Date(sprint.startDate).toLocaleDateString()}</p>
            <p className="text-gray-500 text-sm">📅 Fin : {new Date(sprint.endDate).toLocaleDateString()}</p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-gray-400">{sprint.tasks?.length} tâche(s)</span>
              <div className="flex items-center gap-2">
                {user?.role === 'CHEF' && sprint.status === 'A_VENIR' && (
                  <button
                    onClick={() => handleUpdateSprintStatus(sprint.id, 'EN_COURS')}
                    className="text-xs bg-emerald-100 text-emerald-600 px-2 py-1 rounded-lg hover:bg-emerald-200 transition"
                  >
                    ▶ Démarrer
                  </button>
                )}
                {user?.role === 'CHEF' && sprint.status === 'EN_COURS' && (
                  <button
                    onClick={() => handleUpdateSprintStatus(sprint.id, 'TERMINE')}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-200 transition"
                  >
                    ⏹ Terminer
                  </button>
                )}
                {(user?.role === 'ADMIN' || user?.role === 'CHEF') && sprint.status !== 'EN_COURS' && (
                  <button
                    onClick={() => handleDeleteSprint(sprint.id)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    🗑️
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

          {/* Kanban */}
          {activePage === 'kanban' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">✅ Tableau Kanban</h3>
                {selectedSprint && (user?.role === 'ADMIN' || user?.role === 'CHEF') && (
                  <button
                    onClick={() => setShowTaskForm(!showTaskForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    + Nouvelle Tâche
                  </button>
                )}
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
                <label className="block text-gray-700 font-medium mb-2">Sélectionner un sprint</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
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
                <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                  <h3 className="font-bold text-gray-700 mb-4">Nouvelle Tâche</h3>
                  <input
                    type="text"
                    placeholder="Titre de la tâche"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:border-blue-500"
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:border-blue-500"
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  />
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:border-blue-500"
                    onChange={(e) => setTaskForm({ ...taskForm, userId: e.target.value })}
                    value={taskForm.userId}
                  >
                    <option value="">-- Assigner à --</option>
                    {members.map((m) => (
                      <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-3">
                    <button onClick={handleCreateTask} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Créer</button>
                    <button onClick={() => setShowTaskForm(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition">Annuler</button>
                  </div>
                </div>
              )}

              {selectedSprint ? (
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { status: 'TODO', label: '📋 À Faire', color: 'text-gray-600', bg: 'bg-gray-50' },
                    { status: 'IN_PROGRESS', label: '🔄 En Cours', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { status: 'DONE', label: '✅ Terminé', color: 'text-green-600', bg: 'bg-green-50' }
                  ].map((col) => (
                    <div key={col.status} className={`${col.bg} rounded-xl p-4`}>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className={`font-bold ${col.color}`}>{col.label}</h3>
                        <span className="bg-white text-gray-600 text-xs px-2 py-1 rounded-full shadow-sm">
                          {getTasksByStatus(col.status).length}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {getTasksByStatus(col.status).map((task) => (
                          <div key={task.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-medium text-gray-700 text-sm">{task.title}</p>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-red-400 hover:text-red-600 text-xs"
                              >
                                🗑️
                              </button>
                            </div>
                            {task.description && (
                              <p className="text-xs text-gray-400 mb-2">{task.description}</p>
                            )}
                            {task.assignee && (
                              <p className="text-xs text-blue-500 mb-2">👤 {task.assignee.name}</p>
                            )}
                            <div className="flex gap-1 mt-2">
                              {col.status !== 'TODO' && (
                                <button
                                  onClick={() => handleMoveTask(task.id, col.status === 'IN_PROGRESS' ? 'TODO' : 'IN_PROGRESS')}
                                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
                                >
                                  ← Reculer
                                </button>
                              )}
                              {col.status !== 'DONE' && (
                                <button
                                  onClick={() => handleMoveTask(task.id, col.status === 'TODO' ? 'IN_PROGRESS' : 'DONE')}
                                  className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-600 px-2 py-1 rounded transition"
                                >
                                  Avancer →
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {getTasksByStatus(col.status).length === 0 && (
                          <div className="text-center text-gray-400 py-8 text-sm">
                            Aucune tâche
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-12 shadow-sm text-center text-gray-400">
                  <p className="text-5xl mb-4">✅</p>
                  <p>Sélectionnez un sprint pour voir le Kanban</p>
                </div>
              )}
            </div>
          )}

          {/* Membres */}
          {activePage === 'members' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">👥 Membres du projet</h3>
                {(user?.role === 'ADMIN' || user?.role === 'CHEF') && (
                  <button
                    onClick={() => setShowMemberForm(!showMemberForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    + Ajouter un membre
                  </button>
                )}
              </div>

              {showMemberForm && (
                <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                  <h3 className="font-bold text-gray-700 mb-4">Ajouter un membre</h3>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:border-blue-500"
                    onChange={(e) => setSelectedUser(e.target.value)}
                    value={selectedUser}
                  >
                    <option value="">-- Choisir un utilisateur --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                  <div className="flex gap-3">
                    <button onClick={handleAddMember} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Ajouter</button>
                    <button onClick={() => setShowMemberForm(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition">Annuler</button>
                  </div>
                </div>
              )}

              {members.length === 0 ? (
                <div className="bg-white rounded-xl p-12 shadow-sm text-center text-gray-400">
                  <p className="text-5xl mb-4">👥</p>
                  <p>Aucun membre pour ce projet</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 text-gray-500 font-medium">Nom</th>
                        <th className="text-left py-3 text-gray-500 font-medium">Email</th>
                        <th className="text-left py-3 text-gray-500 font-medium">Rôle</th>
                        <th className="text-left py-3 text-gray-500 font-medium">Statut</th>
                        {(user?.role === 'ADMIN' || user?.role === 'CHEF') && (
                          <th className="text-left py-3 text-gray-500 font-medium">Action</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr key={member.id} className="border-b border-gray-100">
                          <td className="py-3 font-medium text-gray-800">👤 {member.user.name}</td>
                          <td className="py-3 text-gray-500">{member.user.email}</td>
                          <td className="py-3">
                            <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">{member.user.role}</span>
                          </td>
                          <td className="py-3">
                            <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">Actif</span>
                          </td>
                          {(user?.role === 'ADMIN' || user?.role === 'CHEF') && (
                            <td className="py-3">
                              <button
                                onClick={() => handleRemoveMember(member.user.id)}
                                className="text-red-500 text-sm hover:underline"
                              >
                                🗑️ Retirer
                              </button>
                            </td>
                          )}
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

export default ProjectDetail