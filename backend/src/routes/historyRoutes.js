const express = require('express')
const router = express.Router()
const { getProjectHistory, getAllHistory } = require('../controllers/historyController')
const { authenticateToken } = require('../middlewares/authMiddleware')

router.get('/', authenticateToken, getAllHistory)
router.get('/:id', authenticateToken, getProjectHistory)

module.exports = router
