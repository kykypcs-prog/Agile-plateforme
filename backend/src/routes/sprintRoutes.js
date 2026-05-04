const express = require('express')
const router = express.Router()
const { createSprint, getSprints, updateSprint, deleteSprint } = require('../controllers/sprintController')
const { verifyToken } = require('../middlewares/authMiddleware')

router.post('/', verifyToken, createSprint)
router.get('/:projectId', verifyToken, getSprints)
router.put('/:id', verifyToken, updateSprint)
router.delete('/:id', verifyToken, deleteSprint)

module.exports = router