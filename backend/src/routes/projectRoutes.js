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
  updateUserRole
} = require('../controllers/projectController')
const { verifyToken } = require('../middlewares/authMiddleware')

router.get('/stats', verifyToken, getStats)
router.get('/users', verifyToken, getUsers)
router.get('/my-projects', verifyToken, getMyProjects)
router.post('/', verifyToken, createProject)
router.get('/', verifyToken, getProjects)
router.get('/:id', verifyToken, getProject)
router.put('/:id', verifyToken, updateProject)
router.delete('/:id', verifyToken, deleteProject)
router.post('/:id/members', verifyToken, addMember)
router.get('/:id/members', verifyToken, getMembers)
router.delete('/:id/members/:userId', verifyToken, removeMember)
router.put('/users/:id/role', verifyToken, updateUserRole)

module.exports = router