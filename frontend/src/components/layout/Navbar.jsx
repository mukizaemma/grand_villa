import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useScrolled } from '@hooks/useScrolled'
import { BRAND, PUBLIC_CTA, PUBLIC_NAV } from '@features/hotel/brand'
import MobileDrawer from './MobileDrawer'
import styles from './Navbar.module.css'

export default function Navbar({ hasHero = false }) {
  const scrolled = useScrolled(60)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const isTransparent = hasHero && !scrolled

  return (
    <>
      <header className={`${styles.navbar} ${isTransparent ? styles.transparent : styles.solid}`}>
        <div className={`container ${styles.inner}`}>
          <NavLink to="/" className={styles.brand}>
            <img src={BRAND.logo} alt={BRAND.name} className={styles.logoImg} />
            <span className={styles.wordmark}>
              <strong>{BRAND.shortName}</strong>
              <small>Apartment</small>
            </span>
          </NavLink>

          <nav className={styles.desktopNav} aria-label="Primary">
            {PUBLIC_NAV.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink to={PUBLIC_CTA.path} className={styles.ctaBtn}>
              {PUBLIC_CTA.label}
            </NavLink>
          </nav>

          <button
            className={styles.menuToggle}
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
