const express = require('express')
const router = express.Router()
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController')
const { authenticateToken } = require('../middlewares/authMiddleware')

router.get('/', authenticateToken, getNotifications)
router.put('/:id/read', authenticateToken, markAsRead)
router.put('/read-all', authenticateToken, markAllAsRead)

module.exports = router