 import { useState, useEffect } from 'react'
import { getNotifications, markAsRead, markAllAsRead } from '../services/api'
import { Bell, X } from 'lucide-react'

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [showPanel, setShowPanel] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications()
      setNotifications(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id)
      fetchNotifications()
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      fetchNotifications()
    } catch (err) {
      console.error(err)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="relative">

      {/* Bouton cloche */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition"
      >
        <Bell size={20} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Panel notifications */}
      {showPanel && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl z-50">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-gray-800">
              Notifications {unreadCount > 0 && <span className="text-red-500">({unreadCount})</span>}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Tout lire
                </button>
              )}
              <button onClick={() => setShowPanel(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <Bell size={24} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkAsRead(notif.id)}
                  className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition ${
                    !notif.read ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      !notif.read ? 'bg-indigo-500' : 'bg-gray-200'
                    }`}></div>
                    <div>
                      <p className="text-xs text-gray-700">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Notifications
