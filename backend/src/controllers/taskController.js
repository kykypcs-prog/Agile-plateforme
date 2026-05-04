const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Créer une tâche
const createTask = async (req, res) => {
  try {
    const { title, description, sprintId, userId } = req.body
    const task = await prisma.task.create({
      data: {
        title,
        description,
        sprintId: parseInt(sprintId),
        userId: userId ? parseInt(userId) : null
      },
      include: { assignee: true }
    })
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
      include: { assignee: true }
    })
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Modifier le statut d'une tâche
const updateTask = async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, status, userId } = req.body
    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        status,
        userId: userId ? parseInt(userId) : null
      },
      include: { assignee: true }
    })
    res.json({ message: 'Tâche modifiée avec succès !', task })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Supprimer une tâche
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params
    await prisma.task.delete({
      where: { id: parseInt(id) }
    })
    res.json({ message: 'Tâche supprimée avec succès !' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

module.exports = { createTask, getTasks, updateTask, deleteTask }