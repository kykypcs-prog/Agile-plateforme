const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Créer un projet
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body
    const project = await prisma.project.create({
      data: { name, description }
    })
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
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé !' })
    }
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
    await prisma.project.delete({
      where: { id: parseInt(id) }
    })
    res.json({ message: 'Projet supprimé avec succès !' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}

const addMember = async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    // Vérifier si le membre existe déjà
    const existing = await prisma.projectMember.findFirst({
      where: { projectId: parseInt(id), userId: parseInt(userId) }
    })
    if (existing) {
      return res.status(400).json({ message: 'Membre déjà dans le projet !' })
    }

    // Récupérer l'utilisateur à ajouter
    const userToAdd = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    })

    // Règle 1 : Pas d'Admin dans un projet
    if (userToAdd.role === 'ADMIN') {
      return res.status(400).json({ message: 'Un administrateur ne peut pas être ajouté à un projet !' })
    }

    // Récupérer les membres actuels du projet
    const currentMembers = await prisma.projectMember.findMany({
      where: { projectId: parseInt(id) },
      include: { user: true }
    })

    // Règle 2 : Pas de 2 Chefs dans un projet
    if (userToAdd.role === 'CHEF') {
      const existingChef = currentMembers.find(m => m.user.role === 'CHEF')
      if (existingChef) {
        return res.status(400).json({ message: 'Ce projet a déjà un chef de projet !' })
      }
    }

    // Règle 3 : Il faut d'abord un Chef avant d'ajouter un Membre
    if (userToAdd.role === 'MEMBER') {
      const hasChef = currentMembers.find(m => m.user.role === 'CHEF')
      if (!hasChef) {
        return res.status(400).json({ message: 'Vous devez d\'abord ajouter un chef de projet !' })
      }
    }

    const member = await prisma.projectMember.create({
      data: { projectId: parseInt(id), userId: parseInt(userId) },
      include: { user: true }
    })

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

    // Tâches par mois
    const tasks = await prisma.task.findMany({
      select: { createdAt: true }
    })

    // Grouper par mois
    const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec']
    const tasksByMonth = months.map((month, index) => ({
      name: month,
      taches: tasks.filter(t => new Date(t.createdAt).getMonth() === index).length
    }))

    res.json({
      totalProjects,
      totalUsers,
      totalTasks,
      totalSprints,
      tasksTodo,
      tasksInProgress,
      tasksDone,
      tasksByMonth
    })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }

}
// Supprimer un membre d'un projet
const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params
    await prisma.projectMember.deleteMany({
      where: {
        projectId: parseInt(id),
        userId: parseInt(userId)
      }
    })
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
      where: {
        members: {
          some: {
            userId: parseInt(userId)
          }
        }
      },
      include: { members: true, sprints: true }
    })
    res.json(projects)
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error })
  }
}
// Changer le rôle d'un utilisateur
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role }
    })
    res.json({ message: 'Rôle modifié avec succès !', user })
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
  updateUserRole
}