const jwt = require('jsonwebtoken')

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']

  if (!token) {
    return res.status(401).json({ message: 'Accès refusé, token manquant !' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide !' })
  }
}

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Accès interdit' })
  }
  next()
}

module.exports = { authenticateToken, isAdmin }