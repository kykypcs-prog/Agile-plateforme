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

// Burndown Chart
const getBurndown = async (req, res) => {
  try {
    const { id } = req.params

    const sprint = await prisma.sprint.findUnique({
      where: { id: parseInt(id) },
      include: { tasks: true }
    })

    if (!sprint) {
      return res.status(404).json({ message: 'Sprint non trouvé !' })
    }

    const startDate = new Date(sprint.startDate)
    const endDate = new Date(sprint.endDate)
    const totalTasks = sprint.tasks.length

    // Calculer le nombre de jours du sprint
    const days = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Calculer les données du burndown
    const burndownData = days.map((day, index) => {
      // Ligne idéale
      const ideal = Math.round(totalTasks - (totalTasks / (days.length - 1)) * index)

      // Tâches réellement terminées jusqu'à ce jour
      const doneTasks = sprint.tasks.filter(task => {
        return task.status === 'DONE'
      }).length

      const remaining = index === days.length - 1 ? totalTasks - doneTasks : null

      return {
        day: `J${index + 1}`,
        date: day.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        ideal: ideal < 0 ? 0 : ideal,
        reel: index === 0 ? totalTasks : remaining
      }
    })

    res.json({
      sprint: sprint.name,
      totalTasks,
      burndownData
    })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

module.exports = { createSprint, getSprints, updateSprint, deleteSprint, getBurndown }