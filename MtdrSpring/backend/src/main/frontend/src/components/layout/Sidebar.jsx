import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../App'

const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    to: '/projects',
    label: 'Proyectos',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M3 7a2 2 0 012-2h3l2 2h9a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      </svg>
    ),
  },
  {
    to: '/tasks',
    label: 'Tareas',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 3h14a2 2 0 012 2v16l-3-2-2 2-2-2-2 2-2-2-3 2V5a2 2 0 012-2z" />
      </svg>
    ),
  },
  {
    to: '/reports',
    label: 'Reportes',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <aside style={{
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      width: 'var(--sidebar-w)',
      background: 'var(--white)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{
        height: 'var(--navbar-h)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
            <ellipse cx="14" cy="11" rx="13" ry="10" stroke="#C74634" strokeWidth="2" />
            <ellipse cx="14" cy="11" rx="7" ry="10" stroke="#C74634" strokeWidth="2" />
            <line x1="1" y1="11" x2="27" y2="11" stroke="#C74634" strokeWidth="2" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--oracle-red)', letterSpacing: '-.3px' }}>
            ORACLE
          </span>
        </div>
      </div>

      {/* Section label */}
      <div style={{ padding: '20px 20px 8px' }}>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.08em', color: 'var(--muted)', textTransform: 'uppercase' }}>
          Menú principal
        </span>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.to
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                fontWeight: active ? 600 : 400,
                fontSize: 13.5,
                color: active ? 'var(--accent)' : 'var(--slate)',
                background: active ? 'var(--accent-light)' : 'transparent',
                borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
                transition: 'all .15s ease',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = 'var(--bg)'
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'transparent'
              }}
            >
              {item.icon}
              {item.label}
            </NavLink>
          )
        })}

        {/* AI Assistant separator */}
        <div style={{ height: 1, background: 'var(--border-light)', margin: '10px 2px' }} />
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.08em', color: 'var(--muted)', textTransform: 'uppercase', padding: '0 12px' }}>
          Asistente
        </span>
        <div style={{
          margin: '6px 0',
          padding: '10px 12px',
          borderRadius: 8,
          background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
          border: '1px solid #BFDBFE',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--accent)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>IA Asistente</div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>Activo en dashboard</div>
          </div>
        </div>
      </nav>

      {/* User footer */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--oracle-red)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 600, flexShrink: 0,
        }}>
          {user?.name ? user.name[0].toUpperCase() : 'U'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name || 'Usuario'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email || ''}
          </div>
        </div>
        <button
          onClick={logout}
          title="Cerrar sesión"
          style={{
            color: 'var(--muted)', padding: 4, borderRadius: 6,
            transition: 'color .15s', display: 'flex', cursor: 'pointer',
            background: 'none', border: 'none',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--oracle-red)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </aside>
  )
}