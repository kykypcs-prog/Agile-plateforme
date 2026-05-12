const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Récupérer les notifications d'un utilisateur
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id
    const notifications = await prisma.notification.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' }
    })
    res.json(notifications)
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Marquer une notification comme lue
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params
    const notification = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { read: true }
    })
    res.json({ message: 'Notification lue !', notification })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Marquer toutes les notifications comme lues
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id
    await prisma.notification.updateMany({
      where: { userId: parseInt(userId), read: false },
      data: { read: true }
    })
    res.json({ message: 'Toutes les notifications lues !' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Créer une notification (utilisé en interne)
const createNotification = async (userId, message) => {
  try {
    await prisma.notification.create({
      data: { userId: parseInt(userId), message }
    })
  } catch (error) {
    console.error('Erreur notification:', error)
  }
}

module.exports = { getNotifications, markAsRead, markAllAsRead, createNotification }
