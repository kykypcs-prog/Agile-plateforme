const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Récupérer l'historique d'un projet
const getProjectHistory = async (req, res) => {
  try {
    const { id } = req.params
    const history = await prisma.history.findMany({
      where: { projectId: parseInt(id) },
      include: { user: { select: { name: true, role: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json(history)
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Récupérer tout l'historique (Admin)
const getAllHistory = async (req, res) => {
  try {
    const history = await prisma.history.findMany({
      include: { 
        user: { select: { name: true, role: true } },
        project: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    res.json(history)
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Créer un historique (utilisé en interne)
const createHistory = async (userId, action, projectId = null) => {
  try {
    await prisma.history.create({
      data: { 
        userId: parseInt(userId), 
        action,
        projectId: projectId ? parseInt(projectId) : null
      }
    })
  } catch (error) {
    console.error('Erreur historique:', error)
  }
}

module.exports = { getProjectHistory, getAllHistory, createHistory }
