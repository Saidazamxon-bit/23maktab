import { useState } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import {
  Activity, Bell, Bot, CalendarDays, ExternalLink, GraduationCap, Image as ImageIcon, LayoutDashboard,
  LogOut, Menu, Moon, Newspaper, School, Settings, Sun, Users, X,
} from 'lucide-react'
import { useAdminAuth } from './auth/AdminAuthContext'
import { useTheme } from '../lib/theme'
import { UiProvider } from './ui'
import './admin.css'

const NAV = [
  { to: '/admin', label: 'Boshqaruv', icon: LayoutDashboard, end: true },
  { to: '/admin/teachers', label: 'O‘qituvchilar', icon: Users },
  { to: '/admin/classes', label: 'Sinflar', icon: School },
  { to: '/admin/schedule', label: 'Dars jadvali', icon: CalendarDays },
  { to: '/admin/bells', label: 'Qo‘ng‘iroqlar', icon: Bell },
  { to: '/admin/bot', label: 'Telegram bot', icon: Bot },
  { to: '/admin/news', label: 'Yangiliklar', icon: Newspaper },
  { to: '/admin/gallery', label: 'Galereya', icon: ImageIcon },
  { to: '/admin/settings', label: 'Sozlamalar', icon: Settings },
  { to: '/admin/activity', label: 'Faoliyat jurnali', icon: Activity },
]

/** Faqat tizimga kirgan admin ko'radi; aks holda kirish sahifasiga yo'naltiradi. */
export function AdminShell() {
  const { isAuthenticated, isLoading, username, logout } = useAdminAuth()
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const loc = useLocation()

  if (isLoading) return <div className="admin-root"><div className="a-state center">Yuklanmoqda…</div></div>
  if (!isAuthenticated) return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />

  return (
    <UiProvider>
      <div className="admin-root">
        <div className="a-shell">
          {open && <div className="a-overlay" onClick={() => setOpen(false)} />}
          <aside className={`a-side ${open ? 'open' : ''}`}>
            <div className="a-brand">
              <span className="a-brand-mark"><GraduationCap size={20} /></span>
              <div>
                <b>23-MAKTAB</b>
                <small>Admin panel</small>
              </div>
              <button type="button" className="a-icon-btn a-side-close" onClick={() => setOpen(false)} aria-label="Menyuni yopish">
                <X size={18} />
              </button>
            </div>
            <nav className="a-nav" aria-label="Admin menyu">
              {NAV.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `a-nav-item ${isActive ? 'active' : ''}`}>
                  <Icon size={18} /> <span>{label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="a-side-foot">
              <Link to="/" className="a-nav-item"><ExternalLink size={18} /> <span>Saytni ko‘rish</span></Link>
            </div>
          </aside>

          <div className="a-main">
            <header className="a-top">
              <button type="button" className="a-icon-btn a-menu" onClick={() => setOpen(true)} aria-label="Menyuni ochish">
                <Menu size={20} />
              </button>
              <div className="a-top-spacer" />
              <button type="button" className="a-icon-btn" onClick={toggle} aria-label="Mavzuni almashtirish" title="Mavzuni almashtirish">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <span className="a-user"><span className="a-avatar">{(username || '?')[0].toUpperCase()}</span>{username}</span>
              <button type="button" className="a-btn ghost sm" onClick={() => void logout()}>
                <LogOut size={14} /> Chiqish
              </button>
            </header>
            <main className="a-content">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </UiProvider>
  )
}
