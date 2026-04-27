import { useState, useEffect } from 'react'
import Card from '../components/common/Card'
import { tareasApi, usuariosApi, proyectosApi } from '../services/api'

function StatBar({ value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ height: 6, borderRadius: 99, background: 'var(--border-light)', overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width .8s ease' }} />
    </div>
  )
}

export default function Desempeno() {
  const [devStats, setDevStats] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([proyectosApi.getAll(), tareasApi.getAll(), usuariosApi.getAll()])
      .then(([proyectos, tareas, usuarios]) => {
        // Scope to projects that belong to this admin's context (all projects they can see)
        // Client-side join: collect unique asignadoA from tasks in these projects
        const proyectoIds = new Set(proyectos.map(p => p.id))
        const tareasEnProyectos = tareas.filter(t => proyectoIds.has(t.proyectoId))
        const asignadosIds = new Set(
          tareasEnProyectos.map(t => t.asignadoA).filter(id => id != null)
        )

        // Only include users who are assigned to at least one task in the admin's projects
        const devs = usuarios.filter(u => asignadosIds.has(u.id))

        const stats = devs.map(dev => {
          const myTasks      = tareasEnProyectos.filter(t => t.asignadoA === dev.id)
          const completadas  = myTasks.filter(t => t.estatus === 'Completado').length
          const enProgreso   = myTasks.filter(t => t.estatus === 'En Progreso').length
          const bloqueadas   = myTasks.filter(t => t.estatus === 'Bloqueado').length
          const horasEstim   = myTasks.reduce((s, t) => s + (t.horasEstimadas || 0), 0)
          const horasReales  = myTasks.reduce((s, t) => s + (t.horasReales   || 0), 0)
          const storyPoints  = myTasks.filter(t => t.estatus === 'Completado')
                                      .reduce((s, t) => s + (t.storyPoints || 0), 0)
          const efficiency   = horasEstim > 0
            ? Math.round((horasEstim / Math.max(horasReales, 1)) * 100)
            : null
          const completionPct = myTasks.length > 0
            ? Math.round((completadas / myTasks.length) * 100)
            : 0

          return {
            dev, total: myTasks.length, completadas, enProgreso, bloqueadas,
            horasEstim, horasReales, storyPoints, efficiency, completionPct,
          }
        }).sort((a, b) => b.completadas - a.completadas)

        setDevStats(stats)
      })
      .catch(() => setDevStats([]))
      .finally(() => setLoading(false))
  }, [])

  const totalCompletadas = devStats.reduce((s, d) => s + d.completadas, 0)
  const maxTasks = Math.max(...devStats.map(d => d.total), 1)

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Desarrolladores',    value: devStats.length,                              color: 'var(--navy)' },
          { label: 'Tareas completadas', value: totalCompletadas,                             color: '#7A8C5A' },
          { label: 'Story Points',       value: devStats.reduce((s, d) => s + d.storyPoints, 0), color: 'var(--accent)' },
        ].map(({ label, value, color }) => (
          <Card key={label} style={{ textAlign: 'center', padding: '16px 12px' }}>
            <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{label}</div>
          </Card>
        ))}
      </div>

      {loading && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Cargando datos…</div>
      )}

      {!loading && devStats.length === 0 && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
          No hay datos de desempeño disponibles para tus proyectos
        </div>
      )}

      {/* Developer cards */}
      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {devStats.map((s, i) => {
            const initials = (s.dev.fullName || s.dev.email || '?').slice(0, 2).toUpperCase()
            return (
              <Card key={s.dev.id} style={{ animation: `fadeIn .25s ease ${i * 0.06}s both` }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  {/* Avatar */}
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--oracle-red)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700,
                  }}>
                    {initials}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Name + role + efficiency */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>
                        {s.dev.fullName || s.dev.email}
                      </span>
                      {s.dev.rol && (
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: 'var(--border-light)', color: 'var(--muted)' }}>
                          {s.dev.rol}
                        </span>
                      )}
                      {s.efficiency !== null && (
                        <span style={{
                          marginLeft: 'auto', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                          background: s.efficiency >= 100 ? '#F0F2EC' : '#F1F5F9',
                          color: s.efficiency >= 100 ? '#7A8C5A' : 'var(--muted)',
                        }}>
                          {s.efficiency}% eficiencia
                        </span>
                      )}
                    </div>

                    {/* Task progress bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>Tareas</span>
                      <StatBar value={s.total} max={maxTasks} color="var(--accent)" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', whiteSpace: 'nowrap' }}>{s.total}</span>
                    </div>

                    {/* Stats grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                      {[
                        { label: 'Completadas',  value: s.completadas,  color: '#7A8C5A' },
                        { label: 'En progreso',  value: s.enProgreso,   color: 'var(--accent)' },
                        { label: 'Bloqueadas',   value: s.bloqueadas,   color: 'var(--oracle-red)' },
                        { label: 'Story pts',    value: s.storyPoints,  color: 'var(--navy)' },
                        { label: 'Horas reales', value: s.horasReales,  color: 'var(--muted)' },
                      ].map(({ label, value, color }) => (
                        <div key={label} style={{ background: 'var(--bg)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color }}>{value}</div>
                          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Completion bar */}
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11 }}>
                        <span style={{ color: 'var(--muted)' }}>Tasa de completitud</span>
                        <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{s.completionPct}%</span>
                      </div>
                      <div style={{ height: 5, borderRadius: 99, background: 'var(--border-light)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 99,
                          width: `${s.completionPct}%`,
                          background: s.completionPct >= 70 ? '#7A8C5A' : s.completionPct >= 40 ? 'var(--accent)' : 'var(--oracle-red)',
                          transition: 'width .8s ease',
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
