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
const { verifyToken } = require('../middlewares/authMiddleware')

router.post('/', verifyToken, createSprint)
router.get('/:projectId', verifyToken, getSprints)
router.put('/:id', verifyToken, updateSprint)
router.delete('/:id', verifyToken, deleteSprint)
router.get('/burndown/:id', verifyToken, getBurndown)
router.put('/:id/status', verifyToken, updateSprintStatus)
router.get('/:id/progress', verifyToken, getSprintProgress)

module.exports = router