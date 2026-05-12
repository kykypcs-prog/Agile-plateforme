const express = require('express')
const router = express.Router()
const { getProjectHistory, getAllHistory } = require('../controllers/historyController')
const { verifyToken } = require('../middlewares/authMiddleware')

router.get('/', verifyToken, getAllHistory)
router.get('/:id', verifyToken, getProjectHistory)

module.exports = router
