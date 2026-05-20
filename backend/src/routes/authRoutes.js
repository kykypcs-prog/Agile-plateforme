const express = require('express')
const router = express.Router()
const { register, login, adminCreateUser } = require('../controllers/authController')
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware') // ← chemin adapté

router.post('/register', register)
router.post('/login', login)
router.post('/admin/users', authenticateToken, isAdmin, adminCreateUser)

module.exports = router