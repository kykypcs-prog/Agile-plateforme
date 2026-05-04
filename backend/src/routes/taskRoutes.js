const express = require('express')
const router = express.Router()
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController')
const { verifyToken } = require('../middlewares/authMiddleware')

router.post('/', verifyToken, createTask)
router.get('/:sprintId', verifyToken, getTasks)
router.put('/:id', verifyToken, updateTask)
router.delete('/:id', verifyToken, deleteTask)

module.exports = router