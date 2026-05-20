const express = require('express')
const router = express.Router()
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController')
const { authenticateToken } = require('../middlewares/authMiddleware')

router.post('/', authenticateToken, createTask)
router.get('/:sprintId', authenticateToken, getTasks)
router.put('/:id', authenticateToken, updateTask)
router.delete('/:id', authenticateToken, deleteTask)

module.exports = router