const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { createNotification } = require('./notificationController')
const { createHistory } = require('./historyController')

// Créer une tâche
const createTask = async (req, res) => {
  try {
    const { title, description, sprintId, userId, priority } = req.body

    // Vérifier que le sprint n'est pas TERMINE
    const sprint = await prisma.sprint.findUnique({
      where: { id: parseInt(sprintId) }
    })
    if (sprint.status === 'TERMINE') {
      return res.status(400).json({ 
        message: 'Impossible de créer une tâche dans un sprint terminé !' 
      })
    }

    const task = await prisma.task.create({
      data: { 
        title, description, 
        sprintId: parseInt(sprintId), 
        userId: userId ? parseInt(userId) : null,
        priority: priority || 'MOYENNE'
      },
      include: { assignee: true }
    })

    // Notification à la personne assignée
    if (userId) {
      await createNotification(userId, `Une tâche "${title}" vous a été assignée !`)
    }

    // Historique
    await createHistory(req.user.id, `A créé la tâche "${title}"`, sprint.projectId)

    res.status(201).json({ message: 'Tâche créée avec succès !', task })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Récupérer les tâches d'un sprint
const getTasks = async (req, res) => {
  try {
    const { sprintId } = req.params
    const tasks = await prisma.task.findMany({
      where: { sprintId: parseInt(sprintId) },
      include: { assignee: true },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' }
      ]
    })
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Modifier une tâche
const updateTask = async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, status, userId, priority } = req.body

    const oldTask = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: { sprint: true }
    })

    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: { title, description, status, priority, userId: userId ? parseInt(userId) : null },
      include: { assignee: true }
    })

    // Notification si statut changé
    if (status && status !== oldTask.status && task.userId) {
      await createNotification(
        task.userId, 
        `La tâche "${task.title}" est maintenant ${status}`
      )
    }

    // Notification si nouvelle assignation
    if (userId && userId !== oldTask.userId) {
      await createNotification(userId, `La tâche "${task.title}" vous a été assignée !`)
    }

    // Historique
    if (status && status !== oldTask.status) {
      await createHistory(
        req.user.id, 
        `A changé le statut de "${task.title}" en ${status}`,
        oldTask.sprint.projectId
      )
    }

    res.json({ message: 'Tâche modifiée avec succès !', task })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Supprimer une tâche
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: { sprint: true }
    })

    await prisma.task.delete({ where: { id: parseInt(id) } })

    // Historique
    await createHistory(req.user.id, `A supprimé la tâche "${task.title}"`, task.sprint.projectId)

    res.json({ message: 'Tâche supprimée avec succès !' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

module.exports = { createTask, getTasks, updateTask, deleteTask }