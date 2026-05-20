const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ==================== REGISTER ====================
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont requis' })
    }
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'MEMBER'
      }
    })
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
    const { password: _, ...userWithoutPassword } = user
    res.status(201).json({ message: 'Utilisateur créé', user: userWithoutPassword, token })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

// ==================== LOGIN ====================
const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
    const { password: _, ...userWithoutPassword } = user
    res.json({ message: 'Connexion réussie', user: userWithoutPassword, token })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

// ==================== CRÉATION PAR ADMIN ====================
const adminCreateUser = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Accès réservé aux administrateurs' })
    }

    const { name, email, password, role } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Tous les champs sont requis' })
    }
    if (role !== 'MEMBER' && role !== 'CHEF') {
      return res.status(400).json({ message: 'Rôle invalide. Utilisez MEMBER ou CHEF' })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      }
    })

    const { password: _, ...userWithoutPassword } = user
    res.status(201).json({
      message: `Utilisateur ${role} créé avec succès`,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

module.exports = { register, login, adminCreateUser }