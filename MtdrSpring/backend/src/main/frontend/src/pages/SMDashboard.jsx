import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { tareasApi, sprintsApi, usuariosApi } from '../services/api'
import ChatWidget from '../components/ai/ChatWidget'

const ESTATUS_COLOR = {
  'Backlog':     { bg: '#F3F4F6', color: '#374151' },
  'En Progreso': { bg: '#F1F5F9', color: '#374151' },
  'Bloqueado':   { bg: '#F5ECEB', color: '#A85550' },
  'Completado':  { bg: '#F0F2EC', color: '#7A8C5A' },
}

const PRIORIDAD_COLOR = {
  'Alta':  '#A85550',
  'Media': 'var(--amber)',
  'Baja':  '#7A8C5A',
}

function StatCard({ label, value, color = 'var(--accent)', onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--white)', borderRadius: 'var(--radius)',
        border: '1px solid var(--border)', padding: '18px 20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow .15s',
      }}
      onMouseEnter={(e) => { if (onClick) e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
      onMouseLeave={(e) => { if (onClick) e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color }}>{value}</div>
    </div>
  )
}

function SprintProgressCard({ sprint, tareas }) {
  const sprintTareas = tareas.filter(t => t.sprintId === sprint.id)
  const total       = sprintTareas.length
  const completadas = sprintTareas.filter(t => t.estatus === 'Completado').length
  const bloqueadas  = sprintTareas.filter(t => t.estatus === 'Bloqueado').length
  const pct         = total > 0 ? Math.round((completadas / total) * 100) : 0

  const diasRestantes = sprint.fechaFin
    ? Math.ceil((new Date(sprint.fechaFin) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '16px 18px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--navy)' }}>{sprint.nombre}</div>
          {sprint.objetivo && (
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{sprint.objetivo}</div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'var(--oracle-red-light)', color: 'var(--oracle-red)' }}>
            Activo
          </span>
          {diasRestantes !== null && (
            <span style={{ fontSize: 10.5, color: diasRestantes <= 3 ? '#A85550' : 'var(--muted)' }}>
              {diasRestantes > 0 ? `${diasRestantes}d restantes` : 'Vencido'}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11 }}>
          <span style={{ color: 'var(--muted)' }}>{completadas}/{total} completadas</span>
          <span style={{ fontWeight: 700, color: pct >= 70 ? '#7A8C5A' : pct >= 40 ? 'var(--accent)' : '#A85550' }}>{pct}%</span>
        </div>
        <div style={{ height: 6, background: 'var(--bg)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            width: `${pct}%`,
            background: pct >= 70 ? '#7A8C5A' : pct >= 40 ? 'var(--accent)' : '#A85550',
            transition: 'width .4s ease',
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--muted)' }}>
        <span>{total} tareas</span>
        {bloqueadas > 0 && <span style={{ color: '#A85550', fontWeight: 600 }}>{bloqueadas} bloqueadas</span>}
        <span>{sprintTareas.filter(t => t.estatus === 'En Progreso').length} en progreso</span>
      </div>
    </div>
  )
}

export default function SMDashboard() {
  const navigate = useNavigate()
  const [tareas,    setTareas]    = useState([])
  const [sprints,   setSprints]   = useState([])
  const [usuarios,  setUsuarios]  = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      tareasApi.getAll(),
      sprintsApi.getActivos(),
      usuariosApi.getAll(),
    ])
      .then(([t, s, u]) => {
        setTareas(Array.isArray(t) ? t : [])
        setSprints(Array.isArray(s) ? s : [])
        setUsuarios(Array.isArray(u) ? u : [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const getUserName = (id) => {
    if (!id) return '—'
    const u = usuarios.find(u => Number(u.id) === Number(id))
    return u ? (u.fullName || u.email || `#${id}`) : `#${id}`
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      </div>
    )
  }

  const total       = tareas.length
  const enProgreso  = tareas.filter(t => t.estatus === 'En Progreso').length
  const bloqueadas  = tareas.filter(t => t.estatus === 'Bloqueado').length
  const completadas = tareas.filter(t => t.estatus === 'Completado').length

  const recentTareas = [...tareas]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 6)

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)', margin: 0 }}>Panel Scrum Master</h1>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '3px 0 0' }}>Visión global del equipo y sprints activos</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => navigate('/sprints')}
              style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer',
              }}
            >
              + Nuevo Sprint
            </button>
            <button
              onClick={() => navigate('/tareas')}
              style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: 'var(--bg)', color: 'var(--navy)', border: '1px solid var(--border)', cursor: 'pointer',
              }}
            >
              + Nueva Tarea
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <StatCard label="Total Tareas"   value={total}       onClick={() => navigate('/tareas')} />
          <StatCard label="En Progreso"    value={enProgreso}  color="var(--accent)" onClick={() => navigate('/tareas')} />
          <StatCard label="Completadas"    value={completadas} color="#7A8C5A" />
          <StatCard label="Bloqueadas"     value={bloqueadas}  color="#A85550" onClick={() => navigate('/tareas')} />
        </div>

        {/* Active sprints */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', margin: 0 }}>
              Sprints activos ({sprints.length})
            </h2>
            <button
              onClick={() => navigate('/sprints')}
              style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
            >
              Ver todos →
            </button>
          </div>
          {sprints.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '32px 20px',
              background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
              color: 'var(--muted)', fontSize: 13,
            }}>
              No hay sprints activos. <button onClick={() => navigate('/sprints')} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Crear uno</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
              {sprints.map(s => <SprintProgressCard key={s.id} sprint={s} tareas={tareas} />)}
            </div>
          )}
        </div>

        {/* Recent tasks */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', margin: 0 }}>Tareas recientes</h2>
            <button
              onClick={() => navigate('/tareas')}
              style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
            >
              Ver todas →
            </button>
          </div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 130px 80px 120px',
              padding: '8px 14px',
              fontSize: 10.5, fontWeight: 600, color: 'var(--muted)',
              textTransform: 'uppercase', letterSpacing: '.06em',
              borderBottom: '1px solid var(--border-light)',
              background: 'var(--bg)',
            }}>
              <span>Tarea</span><span>Estado</span><span>Prioridad</span><span>Asignado a</span>
            </div>
            {recentTareas.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                No hay tareas en el sistema
              </div>
            ) : (
              recentTareas.map((t, i) => {
                const sc = ESTATUS_COLOR[t.estatus] || ESTATUS_COLOR['Backlog']
                return (
                  <div key={t.id} style={{
                    display: 'grid', gridTemplateColumns: '1fr 130px 80px 120px',
                    padding: '10px 14px',
                    borderBottom: i < recentTareas.length - 1 ? '1px solid var(--border-light)' : 'none',
                    transition: 'background .12s',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: 13, color: 'var(--navy)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.nombre}
                    </span>
                    <span>
                      <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 20, background: sc.bg, color: sc.color, fontWeight: 600 }}>
                        {t.estatus}
                      </span>
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: PRIORIDAD_COLOR[t.prioridad] || 'var(--muted)' }}>
                      ● {t.prioridad || '—'}
                    </span>
                    <span style={{ fontSize: 11.5, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getUserName(t.asignadoA)}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Chat widget */}
      <div style={{ width: 300, flexShrink: 0 }}>
        <ChatWidget sprintData={sprints[0] || null} projectData={null} />
      </div>
    </div>
  )
}
