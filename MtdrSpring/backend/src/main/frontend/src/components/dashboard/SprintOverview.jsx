import { useState, useEffect } from 'react'
import Card from '../common/Card'
import { sprintsApi, tareasApi } from '../../services/api'

export default function SprintOverview() {
  const [sprint, setSprint] = useState(null)
  const [stats, setStats] = useState({ total: 0, completadas: 0, enProgreso: 0, bloqueadas: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sprintsApi.getActivos()
      .then(async (sprints) => {
        const activeSprint = Array.isArray(sprints) ? sprints[0] : null
        setSprint(activeSprint)
        if (activeSprint?.id) {
          const tareas = await tareasApi.getBySprint(activeSprint.id).catch(() => [])
          const total      = tareas.length
          const completadas = tareas.filter(t => t.estatus === 'Completado').length
          const enProgreso  = tareas.filter(t => t.estatus === 'En Progreso').length
          const bloqueadas  = tareas.filter(t => t.estatus === 'Bloqueado').length
          const progress    = total > 0 ? Math.round((completadas / total) * 100) : 0
          setStats({ total, completadas, enProgreso, bloqueadas, progress })
        }
      })
      .catch(() => setSprint(null))
      .finally(() => setLoading(false))
  }, [])

  const daysLeft = sprint?.fechaFin
    ? Math.max(0, Math.ceil((new Date(sprint.fechaFin) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0

  if (!loading && !sprint) {
    return (
      <Card>
        <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
          No hay sprints activos en este momento
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <Card.Header
        title="Sprint Actual"
        subtitle={sprint?.nombre || (loading ? 'Cargando…' : '—')}
        action={
          sprint && (
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '3px 10px',
              borderRadius: 20, background: 'var(--oracle-red-light)', color: 'var(--oracle-red)',
            }}>
              ● ACTIVO
            </span>
          )
        }
      />

      {/* Progress bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Progreso del sprint</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>
            {stats.progress || 0}%
          </span>
        </div>
        <div style={{ height: 8, borderRadius: 99, background: 'var(--border-light)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${stats.progress || 0}%`,
            background: 'linear-gradient(90deg, #9E3527, #C74634, #E8614A)',
            borderRadius: 99,
            transition: 'width 1s ease',
          }} />
        </div>
      </div>

      {/* Days remaining */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
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
        <span style={{ color: 'var(--muted)' }}>
          Inicio: <strong style={{ color: 'var(--navy)' }}>
            {sprint?.fechaInicio ? new Date(sprint.fechaInicio).toLocaleDateString('es-MX') : '—'}
          </strong>
        </span>
        <span style={{ color: 'var(--muted)' }}>
          Fin: <strong style={{ color: 'var(--navy)' }}>
            {sprint?.fechaFin ? new Date(sprint.fechaFin).toLocaleDateString('es-MX') : '—'}
          </strong>
        </span>
        <span style={{ color: 'var(--muted)' }}>
          Total tareas: <strong style={{ color: 'var(--navy)' }}>{stats.total}</strong>
        </span>
      </div>
    </Card>
  )
}
