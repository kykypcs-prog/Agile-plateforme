const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { createNotification } = require('./notificationController')
const { createHistory } = require('./historyController')

// Créer une tâche
const createTask = async (req, res) => {
  try {
    const { title, description, sprintId, userId, priority } = req.body

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

    if (userId) {
      await createNotification(userId, `Une tâche "${title}" vous a été assignée !`)
    }
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

// Modifier une tâche (seulement les champs envoyés)
const updateTask = async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, status, userId, priority } = req.body

    const oldTask = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: { sprint: true }
    })

    // Construire l'objet data uniquement avec les champs fournis
    const data = {}
    if (title !== undefined) data.title = title
    if (description !== undefined) data.description = description
    if (status !== undefined) data.status = status
    if (priority !== undefined) data.priority = priority
    if (userId !== undefined) data.userId = userId ? parseInt(userId) : null

    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data,
      include: { assignee: true }
    })

    // Notifications
    if (status && status !== oldTask.status && task.userId) {
      await createNotification(
        task.userId,
        `La tâche "${task.title}" est maintenant ${status}`
      )
    }
    if (userId !== undefined && userId !== oldTask.userId && userId) {
      await createNotification(parseInt(userId), `La tâche "${task.title}" vous a été assignée !`)
    }
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

    if (task.userId) {
      await createNotification(task.userId, `La tâche "${task.title}" a été supprimée !`)
    }
    await createHistory(req.user.id, `A supprimé la tâche "${task.title}"`, task.sprint.projectId)

    res.json({ message: 'Tâche supprimée avec succès !' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

module.exports = { createTask, getTasks, updateTask, deleteTask }