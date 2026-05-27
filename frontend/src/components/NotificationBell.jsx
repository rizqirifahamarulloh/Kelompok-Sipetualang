import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, X, AlertCircle, CheckCircle, InfoIcon, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { notificationService } from '@/services/notificationService'
import { useAuth } from '@/contexts/AuthContext'

const sectionTitles = {
  transaction: 'Riwayat Transaksi',
  payment: 'Riwayat Pembayaran',
  verification: 'Riwayat Verifikasi',
  other: 'Riwayat Lainnya',
}

export default function NotificationBell({ variant = 'default', additionalNotifications = [] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationService.getNotifications()
      if (response.status === 'success') {
        setNotifications(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined
    }

    const loadNotifications = async () => {
      await fetchNotifications()
    }

    loadNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const handleToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const nextOpen = !isOpen
    setIsOpen(nextOpen)

    if (nextOpen) {
      await fetchNotifications()
    }
  }

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id)
      setNotifications((current) => current.filter((notif) => notif.id_notifikasi !== id))
    } catch (error) {
      console.error('Gagal menghapus notifikasi:', error)
    }
  }

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((notif) => !notif.is_read)
    if (!unread.length) {
      return
    }

    try {
      await Promise.all(unread.map((notif) => notificationService.markNotificationRead(notif.id_notifikasi)))
      await fetchNotifications()
    } catch (error) {
      console.error('Gagal menandai notifikasi sebagai dibaca:', error)
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'danger':
        return 'border-l-red-500 bg-red-50 dark:bg-red-950/20'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
      case 'success':
        return 'border-l-green-500 bg-green-50 dark:bg-green-950/20'
      case 'info':
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'danger':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'info':
      default:
        return <InfoIcon className="w-4 h-4 text-blue-500" />
    }
  }

  const mergedNotifications = useMemo(() => {
    return [
      ...notifications,
      ...additionalNotifications
    ]
      .map((notif) => ({
        ...notif,
        created_at: notif.created_at ? new Date(notif.created_at).toISOString() : new Date().toISOString()
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [notifications, additionalNotifications])

  const unreadNotifications = mergedNotifications.filter((notif) => !notif.is_read)
  const readNotifications = mergedNotifications.filter((notif) => notif.is_read)
  const totalUnread = unreadNotifications.length

  const groupedReadNotifications = [
    { type: 'transaction', items: readNotifications.filter((notif) => notif.type === 'transaction') },
    { type: 'payment', items: readNotifications.filter((notif) => notif.type === 'payment') },
    { type: 'verification', items: readNotifications.filter((notif) => notif.type === 'verification') },
    { type: 'other', items: readNotifications.filter((notif) => !['transaction', 'payment', 'verification'].includes(notif.type)) },
  ]

  return (
    <div className={`relative ${variant === 'navbar' ? '' : ''}`}>
      <button
        onClick={handleToggle}
        className={`relative flex items-center justify-center rounded transition-colors duration-300 ease-in-out
          ${variant === 'navbar'
            ? 'bg-transparent p-2 border-none cursor-pointer hover:bg-white/10 text-white'
            : 'bg-white/10 p-2.5 hover:bg-white/20 text-white'
          }`}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {totalUnread > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 max-h-[600px] overflow-hidden rounded-lg shadow-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 z-50"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 p-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Notifikasi</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Riwayat notifikasi terhubung langsung ke database</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[520px]">
              {loading && mergedNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Memuat notifikasi...</p>
                </div>
              ) : !isAuthenticated ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Silakan login dahulu untuk melihat notifikasi.</p>
                  <Link to="/login" className="inline-flex mt-4 items-center rounded-full bg-sp-primary px-4 py-2 text-sm font-semibold text-white hover:bg-[rgb(26,122,77)]">
                    Login sekarang
                  </Link>
                </div>
              ) : mergedNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada notifikasi.</p>
                </div>
              ) : (
                <div className="space-y-4 p-4">
                  {unreadNotifications.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Belum Dibaca</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Notifikasi penting berada di atas.</p>
                        </div>
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        >
                          Tandai semua dibaca
                        </button>
                      </div>
                      <div className="space-y-2">
                        {unreadNotifications.map((notif) => (
                          <div
                            key={notif.id_notifikasi}
                            className={`relative rounded-2xl border p-4 shadow-sm ${getSeverityColor(notif.severity)}`}
                          >
                            <div className="absolute right-3 top-3 flex gap-2">
                              <button
                                onClick={() => handleDelete(notif.id_notifikasi)}
                                className="text-gray-400 hover:text-red-500"
                                title="Hapus notifikasi"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">{getSeverityIcon(notif.severity)}</div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{notif.title}</p>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{notif.message}</p>
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{new Date(notif.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {groupedReadNotifications.map((section) =>
                    section.items.length > 0 ? (
                      <div key={section.type} className="space-y-3">
                        <div className="px-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{sectionTitles[section.type]}</p>
                        </div>
                        <div className="space-y-2">
                          {section.items.map((notif) => (
                            <div
                              key={notif.id_notifikasi}
                              className={`relative rounded-2xl border p-4 shadow-sm ${getSeverityColor(notif.severity)}`}
                            >
                              <div className="absolute right-3 top-3 flex gap-2">
                                <button
                                  onClick={() => handleDelete(notif.id_notifikasi)}
                                  className="text-gray-400 hover:text-red-500"
                                  title="Hapus notifikasi"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">{getSeverityIcon(notif.severity)}</div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{notif.title}</p>
                                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{notif.message}</p>
                                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{new Date(notif.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
