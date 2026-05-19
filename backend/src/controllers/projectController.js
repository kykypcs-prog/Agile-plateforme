const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { createNotification } = require('./notificationController')
const { createHistory } = require('./historyController')

// Créer un projet
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body
    const project = await prisma.project.create({ data: { name, description } })

    // Historique
    await createHistory(req.user.id, `A créé le projet "${name}"`, project.id)

    res.status(201).json({ message: 'Projet créé avec succès !', project })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Récupérer tous les projets
const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: { members: true, sprints: true }
    })
    res.json(projects)
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Récupérer un projet
const getProject = async (req, res) => {
  try {
    const { id } = req.params
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: { members: true, sprints: true }
    })
    if (!project) return res.status(404).json({ message: 'Projet non trouvé !' })
    res.json(project)
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Modifier un projet
const updateProject = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description } = req.body
    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: { name, description }
    })
    res.json({ message: 'Projet modifié avec succès !', project })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Supprimer un projet
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params

    const project = await prisma.project.findUnique({ where: { id: parseInt(id) } })

    // Récupérer tous les membres avant suppression
    const members = await prisma.projectMember.findMany({
      where: { projectId: parseInt(id) }
    })

    // Notifier tous les membres
    for (const member of members) {
      await createNotification(member.userId, `Le projet "${project.name}" a été supprimé !`)
    }

    const sprints = await prisma.sprint.findMany({ where: { projectId: parseInt(id) } })
    for (const sprint of sprints) {
      await prisma.task.deleteMany({ where: { sprintId: sprint.id } })
    }
    await prisma.sprint.deleteMany({ where: { projectId: parseInt(id) } })
    await prisma.projectMember.deleteMany({ where: { projectId: parseInt(id) } })
    await prisma.history.deleteMany({ where: { projectId: parseInt(id) } })
    await prisma.project.delete({ where: { id: parseInt(id) } })

    res.json({ message: 'Projet supprimé avec succès !' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Ajouter un membre
const addMember = async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    const existing = await prisma.projectMember.findFirst({
      where: { projectId: parseInt(id), userId: parseInt(userId) }
    })
    if (existing) return res.status(400).json({ message: 'Membre déjà dans le projet !' })

    const userToAdd = await prisma.user.findUnique({ where: { id: parseInt(userId) } })

    if (userToAdd.role === 'ADMIN') {
      return res.status(400).json({ message: 'Un administrateur ne peut pas être ajouté à un projet !' })
    }

    const currentMembers = await prisma.projectMember.findMany({
      where: { projectId: parseInt(id) },
      include: { user: true }
    })

    if (userToAdd.role === 'CHEF') {
      const existingChef = currentMembers.find(m => m.user.role === 'CHEF')
      if (existingChef) return res.status(400).json({ message: 'Ce projet a déjà un chef de projet !' })
    }

    if (userToAdd.role === 'MEMBER') {
      const hasChef = currentMembers.find(m => m.user.role === 'CHEF')
      if (!hasChef) return res.status(400).json({ message: 'Vous devez d\'abord ajouter un chef de projet !' })
    }

    const member = await prisma.projectMember.create({
      data: { projectId: parseInt(id), userId: parseInt(userId) },
      include: { user: true }
    })

    // Notification au membre ajouté
    const project = await prisma.project.findUnique({ where: { id: parseInt(id) } })
    await createNotification(userId, `Vous avez été ajouté au projet "${project.name}"`)
    
    // Historique
    await createHistory(req.user.id, `A ajouté ${userToAdd.name} au projet`, parseInt(id))

    res.status(201).json({ message: 'Membre ajouté avec succès !', member })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Récupérer les membres d'un projet
const getMembers = async (req, res) => {
  try {
    const { id } = req.params
    const members = await prisma.projectMember.findMany({
      where: { projectId: parseInt(id) },
      include: { user: true }
    })
    res.json(members)
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Récupérer tous les utilisateurs
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true }
    })
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Statistiques
const getStats = async (req, res) => {
  try {
    const totalProjects = await prisma.project.count()
    const totalUsers = await prisma.user.count()
    const totalTasks = await prisma.task.count()
    const totalSprints = await prisma.sprint.count()
    const tasksTodo = await prisma.task.count({ where: { status: 'TODO' } })
    const tasksInProgress = await prisma.task.count({ where: { status: 'IN_PROGRESS' } })
    const tasksDone = await prisma.task.count({ where: { status: 'DONE' } })

    const tasks = await prisma.task.findMany({ select: { createdAt: true } })
    const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec']
    const tasksByMonth = months.map((month, index) => ({
      name: month,
      taches: tasks.filter(t => new Date(t.createdAt).getMonth() === index).length
    }))

    res.json({
      totalProjects, totalUsers, totalTasks, totalSprints,
      tasksTodo, tasksInProgress, tasksDone, tasksByMonth
    })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Supprimer un membre
const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params

    // Vérifier si le membre a des tâches en cours
    const tasksInProgress = await prisma.task.findFirst({
      where: {
        userId: parseInt(userId),
        status: 'IN_PROGRESS',
        sprint: { projectId: parseInt(id) }
      }
    })
    if (tasksInProgress) {
      return res.status(400).json({ message: 'Ce membre a des tâches en cours !' })
    }

    // Notifier le membre retiré
    await createNotification(parseInt(userId), `Vous avez été retiré du projet !`)

    // Vérifier si c'est un chef avec des sprints actifs
    const userToRemove = await prisma.user.findUnique({ where: { id: parseInt(userId) } })
    if (userToRemove.role === 'CHEF') {
      const activeSprint = await prisma.sprint.findFirst({
        where: { projectId: parseInt(id), status: 'EN_COURS' }
      })
      if (activeSprint) {
        return res.status(400).json({ message: 'Le chef ne peut pas être retiré avec un sprint actif !' })
      }
    }

    await prisma.projectMember.deleteMany({
      where: { projectId: parseInt(id), userId: parseInt(userId) }
    })

    // Historique
    await createHistory(req.user.id, `A retiré ${userToRemove.name} du projet`, parseInt(id))

    res.json({ message: 'Membre supprimé avec succès !' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Récupérer les projets d'un utilisateur
const getMyProjects = async (req, res) => {
  try {
    const userId = req.user.id
    const projects = await prisma.project.findMany({
      where: { members: { some: { userId: parseInt(userId) } } },
      include: { members: true, sprints: true }
    })
    res.json(projects)
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

// Mettre à jour le rôle d'un utilisateur
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role }
    })

    // Notifier l'utilisateur
    await createNotification(
      parseInt(id),
      `Votre rôle a été changé en ${role} !`
    )

    res.json({
      message: 'Rôle modifié avec succès !',
      user
    })
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur',
      error
    })
  }
}

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    // Supprimer les notifications
    await prisma.notification.deleteMany({ where: { userId: parseInt(id) } })

    // Supprimer l'historique
    await prisma.history.deleteMany({ where: { userId: parseInt(id) } })

    // Retirer des projets
    await prisma.projectMember.deleteMany({ where: { userId: parseInt(id) } })

    // Désassigner les tâches
    await prisma.task.updateMany({
      where: { userId: parseInt(id) },
      data: { userId: null }
    })

    // Supprimer l'utilisateur
    await prisma.user.delete({ where: { id: parseInt(id) } })

    res.json({ message: 'Utilisateur supprimé avec succès !' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

module.exports = { 
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject, 
  addMember, 
  getMembers,
  getUsers,
  getStats,
  removeMember,
  getMyProjects,
  updateUserRole,
  deleteUser
}