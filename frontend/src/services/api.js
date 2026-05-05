import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
})

// Ajouter le token automatiquement
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.authorization = token
  }
  return config
})

// Auth
export const register = (data) => API.post('/auth/register', data)
export const login = (data) => API.post('/auth/login', data)

// Projets
export const getProjects = () => API.get('/projects')
export const createProject = (data) => API.post('/projects', data)
export const updateProject = (id, data) => API.put(`/projects/${id}`, data)
export const deleteProject = (id) => API.delete(`/projects/${id}`)
export const getMyProjects = () => API.get('/projects/my-projects')
export const getStats = () => API.get('/projects/stats')

// Membres
export const addMember = (projectId, userId) => API.post(`/projects/${projectId}/members`, { userId })
export const getMembers = (projectId) => API.get(`/projects/${projectId}/members`)
export const removeMember = (projectId, userId) => API.delete(`/projects/${projectId}/members/${userId}`)

// Utilisateurs
export const getUsers = () => API.get('/projects/users')
export const updateUserRole = (id, role) => API.put(`/projects/users/${id}/role`, { role })

// Sprints
export const getSprints = (projectId) => API.get(`/sprints/${projectId}`)
export const createSprint = (data) => API.post('/sprints', data)
export const deleteSprint = (id) => API.delete(`/sprints/${id}`)
export const getBurndown = (sprintId) => API.get(`/sprints/burndown/${sprintId}`)

// Tâches
export const getTasks = (sprintId) => API.get(`/tasks/${sprintId}`)
export const createTask = (data) => API.post('/tasks', data)
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data)
export const deleteTask = (id) => API.delete(`/tasks/${id}`)

export default API