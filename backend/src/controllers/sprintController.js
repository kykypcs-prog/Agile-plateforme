const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Créer un sprint
const createSprint = async (req, res) => {
  try {
    const { name, startDate, endDate, projectId } = req.body
    const sprint = await prisma.sprint.create({
      data: { name, startDate: new Date(startDate), endDate: new Date(endDate), projectId: parseInt(projectId) }
    })
    res.status(201).json({ message: 'Sprint créé avec succès !', sprint })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Récupérer les sprints d'un projet
const getSprints = async (req, res) => {
  try {
    const { projectId } = req.params
    const sprints = await prisma.sprint.findMany({
      where: { projectId: parseInt(projectId) },
      include: { tasks: true }
    })
    res.json(sprints)
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Modifier un sprint
const updateSprint = async (req, res) => {
  try {
    const { id } = req.params
    const { name, startDate, endDate } = req.body
    const sprint = await prisma.sprint.update({
      where: { id: parseInt(id) },
      data: { name, startDate: new Date(startDate), endDate: new Date(endDate) }
    })
    res.json({ message: 'Sprint modifié avec succès !', sprint })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Supprimer un sprint
const deleteSprint = async (req, res) => {
  try {
    const { id } = req.params
    await prisma.sprint.delete({
      where: { id: parseInt(id) }
    })
    res.json({ message: 'Sprint supprimé avec succès !' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

module.exports = { createSprint, getSprints, updateSprint, deleteSprint }