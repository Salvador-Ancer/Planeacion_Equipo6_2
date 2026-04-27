import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SprintOverview from '../components/dashboard/SprintOverview'
import KPIBox from '../components/dashboard/KPIBox'
import ChatWidget from '../components/ai/ChatWidget'
import Card from '../components/common/Card'
import { tareasApi } from '../services/api'

// estatus values from DB: 'Backlog' | 'En Progreso' | 'Completado' | 'Bloqueado'
const STATUS_BADGE = {
  'Completado':  { bg: '#F0F2EC', color: '#7A8C5A', label: 'Completado' },
  'En Progreso': { bg: '#F5ECEB', color: '#A85550', label: 'En progreso' },
  'Backlog':     { bg: '#F1F5F9', color: '#64748B', label: 'Backlog' },
  'Bloqueado':   { bg: '#FEE2E2', color: '#A85550', label: 'Bloqueada' },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [tareas, setTareas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    tareasApi.getAll()
      .then(setTareas)
      .catch(() => setTareas([]))
      .finally(() => setLoading(false))
  }, [])

  const completadas  = tareas.filter(t => t.estatus === 'Completado').length
  const enProgreso   = tareas.filter(t => t.estatus === 'En Progreso').length
  const bloqueadas   = tareas.filter(t => t.estatus === 'Bloqueado').length
  const recentTareas = [...tareas].sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)).slice(0, 5)

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

      {/* Left / Main column */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Sprint overview */}
        <div style={{ animation: 'fadeIn .3s ease .05s both' }}>
          <SprintOverview />
        </div>

        {/* KPI grid */}
        <div style={{ animation: 'fadeIn .3s ease .1s both' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)', marginBottom: 12 }}>
            Resumen de tareas
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <KPIBox
              title="Completadas"
              value={completadas}
              subtitle="Tareas completadas en total"
              color="var(--green)"
              icon={
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              }
            />
            <KPIBox
              title="En Progreso"
              value={enProgreso}
              subtitle="Tareas actualmente activas"
              color="var(--accent)"
              icon={
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" strokeLinecap="round" />
                </svg>
              }
            />
            <KPIBox
              title="Bloqueadas"
              value={bloqueadas}
              subtitle="Tareas con bloqueos activos"
              color="var(--oracle-red)"
              icon={
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              }
            />
          </div>
        </div>

        {/* Recent tasks table */}
        <div style={{ animation: 'fadeIn .3s ease .15s both' }}>
          <Card>
            <Card.Header
              title="Tareas recientes"
              subtitle="Actividad del sprint actual"
              action={
                <button onClick={() => navigate('/tareas')} style={{
                  fontSize: 12, color: 'var(--accent)', fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}>
                  Ver todas
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              }
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 120px 80px',
                padding: '6px 10px',
                fontSize: 10.5, fontWeight: 600, color: 'var(--muted)',
                textTransform: 'uppercase', letterSpacing: '.06em',
                borderBottom: '1px solid var(--border-light)',
              }}>
                <span>Tarea</span><span>Estado</span><span>Prioridad</span>
              </div>

              {loading && (
                <div style={{ padding: '20px 10px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                  Cargando…
                </div>
              )}

              {!loading && recentTareas.length === 0 && (
                <div style={{ padding: '20px 10px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                  No hay tareas disponibles
                </div>
              )}

              {recentTareas.map((tarea, i) => {
                const s = STATUS_BADGE[tarea.estatus] || STATUS_BADGE['Backlog']
                return (
                  <div
                    key={tarea.id}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 120px 80px',
                      padding: '10px 10px',
                      borderRadius: 6,
                      transition: 'background .15s',
                      animation: `fadeIn .2s ease ${i * 0.05}s both`,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: 13, color: 'var(--navy)', fontWeight: 500 }}>{tarea.nombre}</span>
                    <span>
                      <span style={{
                        fontSize: 10.5, padding: '2px 8px', borderRadius: 20,
                        background: s.bg, color: s.color, fontWeight: 600,
                      }}>{s.label}</span>
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: tarea.prioridad === 'Alta'  ? 'var(--oracle-red)'
                           : tarea.prioridad === 'Media' ? 'var(--amber)'
                           : 'var(--green)',
                    }}>
                      ● {tarea.prioridad || '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Right / Chat column */}
      <div style={{
        width: 300, flexShrink: 0,
        animation: 'slideIn .35s ease .1s both',
      }}>
        <ChatWidget sprintData={null} projectData={null} />
      </div>
    </div>
  )
}
