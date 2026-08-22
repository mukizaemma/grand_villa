import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarOff,
  BedDouble,
  Sparkles,
  Images,
  Upload,
  FileText,
  Settings,
  LogOut,
  Menu,
  Home,
  Coffee,
  UtensilsCrossed,
  Bell,
  ClipboardList,
  BookOpen,
  User,
} from 'lucide-react'
import { BRAND } from '@features/hotel/brand'
import { useStaffAuth } from '../auth/StaffAuthContext'
import styles from './StaffLayout.module.css'

const NAV = [
  { to: '/staff/settings', label: 'Site setting', icon: Settings },
  { to: '/staff/pages?open=home-page', label: 'Home Page', icon: Home },
  { to: '/staff/pages', label: 'Pages', icon: FileText, end: true },
  { to: '/staff/accommodation', label: 'Rooms', icon: BedDouble },
  { to: '/staff/reservations', label: 'Bookings', icon: CalendarCheck },
  { to: '/staff/availability', label: 'Availability', icon: CalendarOff },
  { to: '/staff/pages?open=bar-restaurant-page', label: 'Restaurant page', icon: Coffee },
  { to: '/staff/menu', label: 'Menu items', icon: UtensilsCrossed },
  { to: '/staff/things-to-do', label: 'Things to do', icon: Sparkles },
  { to: '/staff/amenities', label: 'Amenities', icon: Bell },
  { to: '/staff/gallery', label: 'Site Gallery', icon: Images },
  { to: '/staff/media', label: 'Media Gallery', icon: Upload },
  { to: '/staff/audit', label: 'Site audit', icon: ClipboardList },
  { to: '/staff/guide', label: 'User Guide', icon: BookOpen },
  { to: '/staff/account', label: 'My account', icon: User },
]

export default function StaffLayout() {
  const { user, ready, logout } = useStaffAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.title = `${BRAND.shortName} — Staff`
    if (ready && !user) navigate('/staff/login', { replace: true })
  }, [ready, user, navigate])

  if (!ready || !user) return null

  const name = user.firstName || user.email

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        <div className={styles.brand}>
          <span className={styles.mark}>{BRAND.mark}</span>
          <div>
            <strong>{BRAND.shortName}</strong>
            <small>Staff desk</small>
          </div>
        </div>
        <nav>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => (isActive ? styles.active : undefined)}
              onClick={() => setOpen(false)}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className={styles.main}>
        <header className={styles.top}>
          <button type="button" className={styles.menu} onClick={() => setOpen((v) => !v)}>
            <Menu size={18} />
          </button>
          <input className={styles.search} placeholder="Search…" disabled aria-hidden="true" />
          <div className={styles.user}>
            <span>{name}</span>
            <button type="button" onClick={() => logout().then(() => navigate('/staff/login'))}>
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </header>
        <div className={styles.content}>
          <Outlet />
        </div>
        <footer className={styles.credit}>
          Developed by{' '}
          <a href="https://iremetech.com" target="_blank" rel="noopener noreferrer">
            Ireme Tech
          </a>
        </footer>
      </div>
    </div>
  )
}
