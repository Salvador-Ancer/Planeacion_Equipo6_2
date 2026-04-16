import { useLocation } from 'react-router-dom'
import { useAuth } from '../../App'

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Resumen general del proyecto' },
  '/projects':  { title: 'Proyectos', subtitle: 'Gestión de proyectos activos' },
  '/tasks':     { title: 'Tareas',    subtitle: 'Tablero Kanban del sprint' },
  '/reports':   { title: 'Reportes',  subtitle: 'Métricas y análisis de rendimiento' },
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const page = PAGE_TITLES[location.pathname] || { title: 'OPM', subtitle: '' }

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 'var(--sidebar-w)',
      right: 0,
      height: 'var(--navbar-h)',
      background: 'var(--white)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      zIndex: 90,
    }}>
      {/* Page title */}
      <div>
        <h1 style={{ fontSize: 17, fontWeight: 700, color: 'var(--navy)', lineHeight: 1.2 }}>
          {page.title}
        </h1>
        {page.subtitle && (
          <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 1 }}>{page.subtitle}</p>
        )}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Oracle badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 20,
          background: 'var(--oracle-red-light)',
          border: '1px solid #FECACA',
        }}>
          <svg width="14" height="11" viewBox="0 0 28 22" fill="none">
            <ellipse cx="14" cy="11" rx="13" ry="10" stroke="#C74634" strokeWidth="2" />
            <ellipse cx="14" cy="11" rx="7" ry="10" stroke="#C74634" strokeWidth="2" />
            <line x1="1" y1="11" x2="27" y2="11" stroke="#C74634" strokeWidth="2" />
          </svg>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--oracle-red)' }}>Oracle OPM</span>
        </div>

        {/* Notification bell */}
        <button style={{
          position: 'relative', width: 34, height: 34, borderRadius: 8,
          background: 'var(--bg)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--slate)',
        }}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--oracle-red)', border: '1.5px solid white',
          }} />
        </button>

        {/* User pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 10px 5px 5px',
          background: 'var(--bg)', borderRadius: 20,
          border: '1px solid var(--border)',
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'var(--oracle-red)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, flexShrink: 0,
          }}>
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--navy)' }}>
            {user?.name || 'Usuario'}
          </span>
        </div>
      </div>
    </header>
  )
}