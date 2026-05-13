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
router.get('/burndown/:id', verifyToken, getBurndown)
router.get('/progress/:id', verifyToken, getSprintProgress)
router.get('/:projectId', verifyToken, getSprints)
router.put('/:id/status', verifyToken, updateSprintStatus)
router.put('/:id', verifyToken, updateSprint)
router.delete('/:id', verifyToken, deleteSprint)

module.exports = router