const express = require('express')
const router = express.Router()
const { 
  createProject, 
  getProjects, 
  getProject, 
  updateProject, 
  deleteProject,
  addMember,
  getMembers,
  getUsers,
  getStats,
  removeMember,
  getMyProjects,
  updateUserRole,
  deleteUser
} = require('../controllers/projectController')
const { authenticateToken } = require('../middlewares/authMiddleware') // ← ici

// Routes
router.get('/stats', authenticateToken, getStats)
router.get('/users', authenticateToken, getUsers)
router.get('/my-projects', authenticateToken, getMyProjects)
router.post('/', authenticateToken, createProject)
router.get('/', authenticateToken, getProjects)
router.get('/:id', authenticateToken, getProject)
router.put('/:id', authenticateToken, updateProject)
router.delete('/:id', authenticateToken, deleteProject)
router.post('/:id/members', authenticateToken, addMember)
router.get('/:id/members', authenticateToken, getMembers)
router.delete('/:id/members/:userId', authenticateToken, removeMember)
router.put('/users/:id/role', authenticateToken, updateUserRole)
router.delete('/users/:id', authenticateToken, deleteUser)

module.exports = router