import { useCallback, useEffect, useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'
import { BellIcon, CartIcon, ChatIcon } from '../components/icons.jsx'
import BrandMark from '../components/BrandMark.jsx'

// Kerangka dashboard (sidebar + topbar) bergaya CoreUI, dipakai super admin & user.
export default function Layout({ menu, roleLabel, children }) {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [alerts, setAlerts] = useState({ data: [], unread_count: 0, chat_unread_count: 0 })
  const [alertsOpen, setAlertsOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const initials = (user?.name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const profilePath = user?.role === 'super_admin' ? '/admin/profil' : '/dashboard/profil'
  const admin = user?.role === 'super_admin'
  const chatPath = admin ? '/admin/chat' : '/dashboard/chat'
  const cartPath = '/dashboard/keranjang'
  const toggleSidebar = () => {
    if (window.matchMedia('(max-width: 820px)').matches) {
      setOpen((value) => !value)
    } else {
      setCollapsed((value) => !value)
    }
  }

  const out = async () => { await logout(); nav('/web-it', { replace: true }) }
  const loadAlerts = useCallback(async () => {
    try { setAlerts(await api.get('/notifications')) } catch (error) { console.error('Gagal memuat notifikasi:', error) }
  }, [])
  const loadCart = useCallback(async () => {
    if (admin) return
    try {
      const response = await api.get('/me/cart')
      setCartCount((response.data || []).reduce((count, item) => count + item.quantity, 0))
    } catch (error) {
      console.error('Gagal memuat jumlah keranjang:', error)
    }
  }, [admin])

  useEffect(() => {
    loadAlerts()
    loadCart()
    const timer = window.setInterval(() => { loadAlerts(); loadCart() }, 15000)
    const onCartChange = () => loadCart()
    window.addEventListener('vienxa:cart-updated', onCartChange)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('vienxa:cart-updated', onCartChange)
    }
  }, [loadAlerts, loadCart])

  const readNotification = async (notification) => {
    if (!notification.read_at) {
      try {
        await api.post(`/notifications/${notification.id}/read`)
        await loadAlerts()
      } catch (error) {
        console.error('Gagal menandai notifikasi:', error)
      }
    }
    setAlertsOpen(false)
    if (notification.link) nav(notification.link)
  }

  const readAll = async () => {
    try { await api.post('/notifications/read-all'); await loadAlerts() }
    catch (error) { console.error('Gagal menandai semua notifikasi:', error) }
  }

  const compactView = window.matchMedia('(max-width: 820px)').matches

  return (
    <div className={`shell${open ? ' open' : ''}${collapsed ? ' sidebar-collapsed' : ''}`}>
      <aside className="side">
        <Link to="/web-it" className="side-brand" aria-label="VIENXA GROUP"><BrandMark /></Link>
        <nav>
          {menu.map((g) => (
            <div key={g.group || 'main'}>
              {g.group && <p className="side-title">{g.group}</p>}
              {g.items.map((i) => (
                <NavLink key={i.to} to={i.to} end={i.end} onClick={() => setOpen(false)} aria-label={i.label} title={collapsed && !compactView ? i.label : undefined}>
                  <span className="ico" aria-hidden="true">{i.icon}</span><span className="side-label">{i.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}

      <div className="main">
        <header className="top">
          <button className="hamb" aria-label={compactView ? (open ? 'Tutup menu navigasi' : 'Buka menu navigasi') : (collapsed ? 'Tampilkan menu navigasi' : 'Ciutkan menu navigasi')} aria-expanded={compactView ? open : !collapsed} onClick={toggleSidebar}>☰</button>
          <span className="role">{roleLabel}</span>
          <div className="top-right">
            <Link to={chatPath} className="top-icon" aria-label="Chat penjualan"><ChatIcon />{alerts.chat_unread_count > 0 && <span className="top-count">{alerts.chat_unread_count}</span>}</Link>
            {!admin && <Link to={cartPath} className="top-icon" aria-label="Keranjang"><CartIcon />{cartCount > 0 && <span className="top-count">{cartCount}</span>}</Link>}
            <div className="notification-wrap">
              <button className="top-icon" aria-label="Notifikasi" aria-expanded={alertsOpen} onClick={() => setAlertsOpen(!alertsOpen)}>
                <BellIcon />{alerts.unread_count > 0 && <span className="top-count">{alerts.unread_count}</span>}
              </button>
              {alertsOpen && (
                <div className="notification-panel">
                  <header><b>Notifikasi</b>{!!alerts.unread_count && <button onClick={readAll}>Tandai semua dibaca</button>}</header>
                  {alerts.data.length ? alerts.data.map((notification) => (
                    <button className={notification.read_at ? 'notification read' : 'notification'} key={notification.id} onClick={() => readNotification(notification)}>
                      <b>{notification.title}</b><span>{notification.message}</span><small>{new Date(notification.created_at).toLocaleString('id-ID')}</small>
                    </button>
                  )) : <p className="muted">Belum ada notifikasi.</p>}
                </div>
              )}
            </div>
            <Link className="who" to={profilePath} aria-label="Edit profil">
              {user?.avatar ? <img className="avatar avatar-photo" src={user.avatar} alt="" /> : <span className="avatar">{initials}</span>}
              <span className="who-t"><b>{user.name}</b><small>{user.email}</small></span>
            </Link>
            <button className="btn sm ghost" onClick={out}>Keluar</button>
          </div>
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  )
}
