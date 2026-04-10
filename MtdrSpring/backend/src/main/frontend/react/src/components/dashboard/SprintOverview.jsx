import { useState, useEffect } from 'react'
import Card from '../common/Card'
import { sprintsApi } from '../../services/api'

//Mock data for when API is unavailable
const MOCK_SPRINT = {
  id: 1,
  name: 'Sprint 3 – Portal Web',
  startDate: '2026-04-01',
  endDate: '2026-04-14',
  progress: 68,
  totalTasks: 18,
  completedTasks: 12,
  inProgressTasks: 4,
  blockedTasks: 2,
  status: 'ACTIVE',
}

export default function SprintOverview() {
  const [sprint, setSprint] = useState(MOCK_SPRINT)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    sprintsApi.getActive()
      .then(setSprint)
      .catch(() => setSprint(MOCK_SPRINT))
      .finally(() => setLoading(false))
  }, [])

  const daysLeft = sprint
    ? Math.max(0, Math.ceil((new Date(sprint.endDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0

  const segments = [
    { label: 'Completadas', count: sprint?.completedTasks || 0, color: 'var(--green)' },
    { label: 'En progreso', count: sprint?.inProgressTasks || 0, color: 'var(--accent)' },
    { label: 'Bloqueadas', count: sprint?.blockedTasks || 0, color: 'var(--oracle-red)' },
    { label: 'Pendientes', count: (sprint?.totalTasks || 0) - (sprint?.completedTasks || 0) - (sprint?.inProgressTasks || 0) - (sprint?.blockedTasks || 0), color: 'var(--border)' },
  ]

  return (
    <Card>
      <Card.Header
        title="Sprint Actual"
        subtitle={sprint?.name}
        action={
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '3px 10px',
            borderRadius: 20, background: 'var(--green-light)', color: '#16a34a',
          }}>
            ● ACTIVO
          </span>
        }
      />

      {/* Progress bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Progreso del sprint</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>
            {sprint?.progress || 0}%
          </span>
        </div>
        <div style={{
          height: 8, borderRadius: 99, background: 'var(--border-light)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${sprint?.progress || 0}%`,
            background: 'linear-gradient(90deg, var(--green) 0%, #16a34a 100%)',
            borderRadius: 99,
            transition: 'width 1s ease',
          }} />
        </div>
      </div>

      {/* Segmented task bar */}
      <div style={{ display: 'flex', height: 4, borderRadius: 99, overflow: 'hidden', gap: 1, marginBottom: 16 }}>
        {segments.map((s) => (
          <div
            key={s.label}
            title={`${s.label}: ${s.count}`}
            style={{
              flex: s.count,
              background: s.color,
              minWidth: s.count > 0 ? 4 : 0,
            }}
          />
        ))}
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {segments.map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{s.label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)' }}>{s.count}</span>
          </div>
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="13" height="13" fill="none" stroke="var(--muted)" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            <strong style={{ color: daysLeft <= 2 ? 'var(--oracle-red)' : 'var(--navy)' }}>{daysLeft}</strong> días restantes
          </span>
        </div>
      </div>

      {/* Dates */}
      <Card.Divider />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
        <span style={{ color: 'var(--muted)' }}>Inicio: <strong style={{ color: 'var(--navy)' }}>{sprint?.startDate}</strong></span>
        <span style={{ color: 'var(--muted)' }}>Fin: <strong style={{ color: 'var(--navy)' }}>{sprint?.endDate}</strong></span>
        <span style={{ color: 'var(--muted)' }}>Total tareas: <strong style={{ color: 'var(--navy)' }}>{sprint?.totalTasks}</strong></span>
      </div>
    </Card>
  )
}