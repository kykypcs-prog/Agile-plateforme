const express = require('express')
const router = express.Router()
const { 
  createSprint, 
  getSprints, 
  updateSprint, 
  deleteSprint, 
  getBurndown,
  updateSprintStatus,
  getSprintProgress
} = require('../controllers/sprintController')
const { authenticateToken } = require('../middlewares/authMiddleware')

router.post('/', authenticateToken, createSprint)
router.get('/burndown/:id', authenticateToken, getBurndown)
router.get('/progress/:id', authenticateToken, getSprintProgress)
router.get('/project/:projectId', authenticateToken, getSprints)  // ← modifié : /project/:projectId
router.put('/:id/status', authenticateToken, updateSprintStatus)
router.put('/:id', authenticateToken, updateSprint)
router.delete('/:id', authenticateToken, deleteSprint)

module.exports = router