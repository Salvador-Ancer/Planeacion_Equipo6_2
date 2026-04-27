import { useLocation } from 'react-router-dom'
import { useAuth } from '../../App'

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Resumen general del proyecto' },
  '/projects':  { title: 'Proyectos', subtitle: 'Gestión de proyectos activos' },
  '/tasks':     { title: 'Tareas',    subtitle: 'Tablero Kanban del sprint' },
  '/reports':   { title: 'Reportes',  subtitle: 'Métricas y análisis de rendimiento' },
}

export default function Navbar() {
  const { user } = useAuth()
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
            {(user?.fullName || user?.email || 'U')[0].toUpperCase()}
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--navy)' }}>
            {user?.fullName || user?.email || 'Usuario'}
          </span>
        </div>
      </div>
    </header>
  )
}