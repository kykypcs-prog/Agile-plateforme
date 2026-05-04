const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

// Inscription
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé !' })
    }

    // Crypter le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role }
    })

    res.status(201).json({ message: 'Compte créé avec succès !', user })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Connexion
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    })
    if (!user) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect !' })
    }

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect !' })
    }

    // Créer le token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    )

    res.json({ message: 'Connexion réussie !', token, user })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

module.exports = { register, login }
