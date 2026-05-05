import { useState } from 'react'
import { getSprints, getBurndown } from '../services/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function BurndownChart({ projects }) {
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedSprint, setSelectedSprint] = useState('')
  const [sprints, setSprints] = useState([])
  const [burndownData, setBurndownData] = useState([])
  const [sprintName, setSprintName] = useState('')
  const [totalTasks, setTotalTasks] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchSprints = async (projectId) => {
    try {
      const res = await getSprints(projectId)
      setSprints(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchBurndown = async (sprintId) => {
    setLoading(true)
    try {
      const res = await getBurndown(sprintId)
      setBurndownData(res.data.burndownData)
      setSprintName(res.data.sprint)
      setTotalTasks(res.data.totalTasks)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Burndown Chart</h3>
          {sprintName && (
            <p className="text-xs text-gray-400 mt-0.5">{sprintName} · {totalTasks} tâches</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs text-gray-500 font-medium mb-1.5 block">PROJET</label>
          <select
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
            onChange={(e) => {
              setSelectedProject(e.target.value)
              fetchSprints(e.target.value)
              setSelectedSprint('')
              setBurndownData([])
            }}
            value={selectedProject}
          >
            <option value="">-- Choisir un projet --</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium mb-1.5 block">SPRINT</label>
          <select
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
            onChange={(e) => {
              setSelectedSprint(e.target.value)
              fetchBurndown(e.target.value)
            }}
            value={selectedSprint}
            disabled={!selectedProject}
          >
            <option value="">-- Choisir un sprint --</option>
            {sprints.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          Chargement...
        </div>
      ) : burndownData.length > 0 ? (
        <div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={burndownData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                formatter={(value, name) => [value, name === 'ideal' ? 'Ideal' : 'Reel']}
              />
              <Legend
                formatter={(value) => value === 'ideal' ? 'Progression ideale' : 'Progression reelle'}
                wrapperStyle={{ fontSize: '12px' }}
              />
              <Line
                type="monotone"
                dataKey="ideal"
                stroke="#6366f1"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="reel"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', r: 4 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Total taches</p>
              <p className="text-lg font-bold text-gray-700">{totalTasks}</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-3 text-center border border-indigo-100">
              <p className="text-xs text-indigo-400 mb-1">Ligne ideale</p>
              <p className="text-lg font-bold text-indigo-600">- - -</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
              <p className="text-xs text-red-400 mb-1">Ligne reelle</p>
              <p className="text-lg font-bold text-red-500">---</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-48 text-gray-300">
          <p className="text-4xl mb-3">📉</p>
          <p className="text-sm">Selectionnez un projet et un sprint</p>
        </div>
      )}
    </div>
  )
}

export default BurndownChart