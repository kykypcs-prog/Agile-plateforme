const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { createNotification } = require('./notificationController')
const { createHistory } = require('./historyController')

// Créer un sprint
const createSprint = async (req, res) => {
  try {
    const { name, startDate, endDate, projectId } = req.body

    // Vérifier que la date de fin est après la date de début
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ 
        message: 'La date de fin doit être après la date de début !' 
      })
    }

    // Vérifier qu'il n'y a pas déjà un sprint EN_COURS
    const activeSprint = await prisma.sprint.findFirst({
      where: { projectId: parseInt(projectId), status: 'EN_COURS' }
    })
    if (activeSprint) {
      return res.status(400).json({ 
        message: 'Ce projet a déjà un sprint en cours !' 
      })
    }

    const sprint = await prisma.sprint.create({
      data: { 
        name, 
        startDate: new Date(startDate), 
        endDate: new Date(endDate), 
        projectId: parseInt(projectId),
        status: 'A_VENIR'
      }
    })

    // Historique
    await createHistory(req.user.id, `A créé le sprint "${name}"`, parseInt(projectId))

    // Notifier les membres du projet
    const members = await prisma.projectMember.findMany({
      where: { projectId: parseInt(projectId) },
      include: { user: true }
    })
    for (const member of members) {
      await createNotification(member.userId, `Nouveau sprint "${name}" créé dans votre projet !`)
    }

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
      include: { tasks: true },
      orderBy: { startDate: 'asc' }
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

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ 
        message: 'La date de fin doit être après la date de début !' 
      })
    }

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

    const sprint = await prisma.sprint.findUnique({ where: { id: parseInt(id) } })
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint non trouvé !' })
    }

    // Supprimer les tâches du sprint
    await prisma.task.deleteMany({ where: { sprintId: parseInt(id) } })
    await prisma.sprint.delete({ where: { id: parseInt(id) } })

    // Historique
    await createHistory(req.user.id, `A supprimé le sprint "${sprint.name}"`, sprint.projectId)

    // Notifier les membres du projet
    const members = await prisma.projectMember.findMany({
      where: { projectId: sprint.projectId }
    })
    for (const member of members) {
      await createNotification(member.userId, `Le sprint "${sprint.name}" a été supprimé !`)
    }

    res.json({ message: 'Sprint supprimé avec succès !' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Changer le statut d'un sprint
const updateSprintStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const sprint = await prisma.sprint.findUnique({ where: { id: parseInt(id) } })
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint non trouvé !' })
    }

    if (status === 'EN_COURS') {
      const activeSprint = await prisma.sprint.findFirst({
        where: {
          projectId: sprint.projectId,
          status: 'EN_COURS',
          id: { not: parseInt(id) }
        }
      })
      if (activeSprint) {
        return res.status(400).json({ message: 'Ce projet a déjà un sprint en cours !' })
      }
    }

    const updatedSprint = await prisma.sprint.update({
      where: { id: parseInt(id) },
      data: { status }
    })

    // Historique
    await createHistory(req.user.id, `A changé le statut du sprint "${sprint.name}" en ${status}`, sprint.projectId)

    // Notifier les membres
    const members = await prisma.projectMember.findMany({
      where: { projectId: sprint.projectId }
    })
    for (const member of members) {
      await createNotification(member.userId, `Le sprint "${sprint.name}" est maintenant ${status}`)
    }

    res.json({ message: 'Statut mis à jour !', sprint: updatedSprint })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Progression d'un sprint
const getSprintProgress = async (req, res) => {
  try {
    const { id } = req.params
    const sprint = await prisma.sprint.findUnique({
      where: { id: parseInt(id) },
      include: { tasks: true }
    })
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint non trouvé !' })
    }

    const totalTasks = sprint.tasks.length
    const doneTasks = sprint.tasks.filter(t => t.status === 'DONE').length
    const inProgressTasks = sprint.tasks.filter(t => t.status === 'IN_PROGRESS').length
    const todoTasks = sprint.tasks.filter(t => t.status === 'TODO').length
    const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100)

    res.json({ totalTasks, doneTasks, inProgressTasks, todoTasks, progress })
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

    if (!sprint) return res.status(404).json({ message: 'Sprint non trouvé !' })

    const startDate = new Date(sprint.startDate)
    const endDate = new Date(sprint.endDate)
    const totalTasks = sprint.tasks.length

    const days = []
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    const burndownData = days.map((day, index) => {
      const ideal = Math.round(totalTasks - (totalTasks / (days.length - 1)) * index)
      const doneTasks = sprint.tasks.filter(task => task.status === 'DONE').length
      const remaining = index === days.length - 1 ? totalTasks - doneTasks : null

      return {
        day: `J${index + 1}`,
        date: day.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        ideal: ideal < 0 ? 0 : ideal,
        reel: index === 0 ? totalTasks : remaining
      }
    })

    res.json({ sprint: sprint.name, totalTasks, burndownData })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

module.exports = { 
  createSprint, getSprints, updateSprint, deleteSprint, 
  getBurndown, updateSprintStatus, getSprintProgress 
}