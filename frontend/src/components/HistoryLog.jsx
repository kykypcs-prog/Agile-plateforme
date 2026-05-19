import { useState, useEffect } from 'react'
import { getProjectHistory, getAllHistory } from '../services/api'
import { Clock } from 'lucide-react'

function HistoryLog({ projectId, showAll }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchHistory()
  }, [projectId])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const res = showAll ? await getAllHistory() : await getProjectHistory(projectId)
      setHistory(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (role) => {
    if (role === 'ADMIN') return 'bg-rose-50 text-rose-600 border border-rose-100'
    if (role === 'CHEF') return 'bg-indigo-50 text-indigo-600 border border-indigo-100'
    return 'bg-emerald-50 text-emerald-600 border border-emerald-100'
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700">Historique des activités</h3>
        </div>
        {history.length > 0 && (
          <span className="bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded-full border border-indigo-100">
            {history.length} activité(s)
          </span>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="text-center text-gray-300 py-8">
            <p className="text-xs">Chargement...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center text-gray-300 py-8">
            <Clock size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-xs">Aucune activité</p>
          </div>
        ) : (
          history.map((item) => (
            <div key={item.id} className="flex items-start gap-3 px-6 py-3 border-b border-gray-50 hover:bg-gray-50 transition">
              <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                {item.user?.name?.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs font-medium text-gray-800">{item.user?.name}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${getRoleColor(item.user?.role)}`}>
                    {item.user?.role}
                  </span>
                  {showAll && item.project && (
                    <span className="text-xs text-gray-400">· {item.project.name}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{item.action}</p>
                <p className="text-xs text-gray-300 mt-0.5">
                  {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default HistoryLog