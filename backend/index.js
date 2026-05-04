const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./src/routes/authRoutes')
const projectRoutes = require('./src/routes/projectRoutes')
const sprintRoutes = require('./src/routes/sprintRoutes')
const taskRoutes = require('./src/routes/taskRoutes')

const app = express()
const PORT = process.env.PORT || 5000

// Middlewares
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/sprints', sprintRoutes)
app.use('/api/tasks', taskRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'API Agile Platform fonctionne !' })
})

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`)
})