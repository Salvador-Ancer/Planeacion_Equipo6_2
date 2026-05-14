import { useState, useEffect } from 'react'
import { usuariosApi, tareasApi } from '../services/api'

const DEV_ROLES = ['Developer']

function capacidadLabel(enProgreso) {
  if (enProgreso === 0) return { label: 'Disponible', bg: '#F0F2EC', color: '#7A8C5A' }
  if (enProgreso <= 2)  return { label: 'Baja carga',  bg: '#F0F2EC', color: '#7A8C5A' }
  if (enProgreso <= 4)  return { label: 'Ocupado',     bg: '#F1F5F9', color: '#374151' }
  return                       { label: 'Saturado',    bg: '#F5ECEB', color: '#A85550' }
}

const ESTATUS_BAR = {
  'Backlog':     '#E5E7EB',
  'En Progreso': '#374151',
  'Bloqueado':   '#A85550',
  'Completado':  '#7A8C5A',
}

export default function CargaDev() {
  const [usuarios, setUsuarios] = useState([])
  const [tareas,   setTareas]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filtro,   setFiltro]   = useState('Todos')

  useEffect(() => {
    Promise.all([usuariosApi.getAll(), tareasApi.getAll()])
      .then(([u, t]) => {
        setUsuarios(Array.isArray(u) ? u : [])
        setTareas(Array.isArray(t) ? t : [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const devs = usuarios.filter(u => DEV_ROLES.includes(u.rol))

  const devStats = devs.map(dev => {
    const mis = tareas.filter(t => Number(t.asignadoA) === Number(dev.id))
    const backlog    = mis.filter(t => t.estatus === 'Backlog').length
    const enProgreso = mis.filter(t => t.estatus === 'En Progreso').length
    const bloqueado  = mis.filter(t => t.estatus === 'Bloqueado').length
    const completado = mis.filter(t => t.estatus === 'Completado').length
    const total      = mis.length
    const sp         = mis.reduce((s, t) => s + (t.storyPoints || 0), 0)
    const cap        = capacidadLabel(enProgreso)
    return { ...dev, backlog, enProgreso, bloqueado, completado, total, sp, cap }
  })

  const filtrados = filtro === 'Todos' ? devStats : devStats.filter(d => d.cap.label === filtro)
  const sorted    = [...filtrados].sort((a, b) => a.enProgreso - b.enProgreso)

  const labels = ['Todos', 'Disponible', 'Baja carga', 'Ocupado', 'Saturado']

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)', margin: 0 }}>Carga del Equipo</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '3px 0 0' }}>
          Disponibilidad y carga de trabajo por miembro — úsalo para decidir a quién asignar tareas
        </p>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Disponible', desc: '0 tareas en progreso', bg: '#F0F2EC', color: '#7A8C5A' },
          { label: 'Baja carga', desc: '1-2 en progreso',      bg: '#F0F2EC', color: '#7A8C5A' },
          { label: 'Ocupado',    desc: '3-4 en progreso',      bg: '#F1F5F9', color: '#374151' },
          { label: 'Saturado',   desc: '5+ en progreso',       bg: '#F5ECEB', color: '#A85550' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 20, background: l.bg }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: l.color }}>{l.label}</span>
            <span style={{ fontSize: 11, color: l.color, opacity: .75 }}>{l.desc}</span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {labels.map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12.5, fontWeight: 500,
              cursor: 'pointer', border: '1px solid var(--border)',
              background: filtro === f ? 'var(--accent)' : 'var(--white)',
              color: filtro === f ? 'white' : 'var(--navy)',
              transition: 'all .15s',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          No hay miembros que coincidan con ese filtro.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {sorted.map(dev => {
            const { bg, color, label } = dev.cap
            const barTotal = dev.total || 1
            return (
              <div key={dev.id} style={{
                background: 'var(--white)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '18px 20px',
                borderTop: `3px solid ${color}`,
              }}>
                {/* Avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--accent)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, fontWeight: 700,
                  }}>
                    {dev.fullName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {dev.fullName}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{dev.rol}</div>
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: bg, color, flexShrink: 0 }}>
                    {label}
                  </span>
                </div>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 14 }}>
                  {[
                    { label: 'Backlog',   value: dev.backlog,    color: '#6B7280' },
                    { label: 'Progreso',  value: dev.enProgreso, color: '#374151' },
                    { label: 'Bloqueado', value: dev.bloqueado,  color: '#A85550' },
                    { label: 'Listo',     value: dev.completado, color: '#7A8C5A' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '6px 4px', borderRadius: 6, background: 'var(--bg)' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 9.5, color: 'var(--muted)', fontWeight: 600 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Distribution bar */}
                {dev.total > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', height: 7, borderRadius: 99, overflow: 'hidden', gap: 1 }}>
                      {['Backlog', 'En Progreso', 'Bloqueado', 'Completado'].map(est => {
                        const count = est === 'En Progreso' ? dev.enProgreso
                          : est === 'Bloqueado' ? dev.bloqueado
                          : est === 'Completado' ? dev.completado
                          : dev.backlog
                        const w = (count / barTotal) * 100
                        return w > 0 ? (
                          <div key={est} style={{ width: `${w}%`, background: ESTATUS_BAR[est], borderRadius: 2 }} title={`${est}: ${count}`} />
                        ) : null
                      })}
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 3 }}>
                      {dev.total} tareas · {dev.sp} story points
                    </div>
                  </div>
                )}

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
