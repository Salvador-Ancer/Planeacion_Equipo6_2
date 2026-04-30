import { useState, useEffect } from 'react'
import TaskCard from '../components/tasks/TaskCard'
import { tareasApi, sprintsApi, proyectosApi } from '../services/api'
import { useAuth } from '../App'
import Button from '../components/common/Button'

const COLUMNS = [
  { key: 'Backlog',     label: 'Backlog',     color: 'var(--muted)',      dot: '#94A3B8' },
  { key: 'En Progreso', label: 'En progreso', color: 'var(--accent)',     dot: 'var(--accent)' },
  { key: 'Bloqueado',   label: 'Bloqueada',   color: 'var(--oracle-red)', dot: 'var(--oracle-red)' },
  { key: 'Completado',  label: 'Completado',  color: '#7A8C5A',           dot: '#7A8C5A' },
]

const STATUSES     = ['Backlog', 'En Progreso', 'Completado', 'Bloqueado']
const PRIORIDAD_COLOR = { Alta: '#A85550', Media: '#D97706', Baja: '#16A34A' }

function StatusModal({ task, onSave, onClose }) {
  const [estatus, setEstatus] = useState(task.estatus)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const updated = await tareasApi.update(task.id, { ...task, estatus })
      onSave(updated)
    } catch {
      // keep open on error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'white', borderRadius: 16, padding: 28, width: 340, boxShadow: 'var(--shadow-lg)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', margin: '0 0 4px' }}>Actualizar estado</h3>
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 20px', lineHeight: 1.4 }}>{task.nombre}</p>
        <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>
          Estado
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setEstatus(s)}
              style={{
                padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', textAlign: 'left',
                border: `2px solid ${estatus === s ? 'var(--accent)' : 'var(--border)'}`,
                background: estatus === s ? 'var(--accent-light)' : 'white',
                color: estatus === s ? 'var(--accent)' : 'var(--navy)',
                transition: 'all .15s',
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" loading={loading} onClick={handleSave}>Guardar</Button>
        </div>
      </div>
    </div>
  )
}

export default function DevDashboard() {
  const { user } = useAuth()
  const [tasks, setTasks]         = useState([])
  const [sprints, setSprints]     = useState([])
  const [proyectos, setProyectos] = useState([])
  const [loading, setLoading]     = useState(true)
  const [view, setView]           = useState('kanban')
  const [search, setSearch]       = useState('')
  const [editTask, setEditTask]   = useState(null)

  useEffect(() => {
    if (!user?.userId) { setLoading(false); return }
    Promise.all([
      tareasApi.getByAsignado(user.userId),
      sprintsApi.getActivos(),
      proyectosApi.getAll(),
    ])
      .then(([t, s, p]) => {
        setTasks(Array.isArray(t) ? t : [])
        setSprints(Array.isArray(s) ? s : [])
        setProyectos(Array.isArray(p) ? p : [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user?.userId])

  const handleUpdate = (updated) => {
    tareasApi.update(updated.id, updated).catch(() => {})
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
  }

  const handleStatusSave = (saved) => {
    setTasks(prev => prev.map(t => t.id === saved.id ? saved : t))
    setEditTask(null)
  }

  const filtered   = search ? tasks.filter(t => t.nombre?.toLowerCase().includes(search.toLowerCase())) : tasks
  const byStatus   = (s) => filtered.filter(t => t.estatus === s)

  const total       = tasks.length
  const enProgreso  = tasks.filter(t => t.estatus === 'En Progreso').length
  const completadas = tasks.filter(t => t.estatus === 'Completado').length
  const bloqueadas  = tasks.filter(t => t.estatus === 'Bloqueado').length
  const pct         = total > 0 ? Math.round((completadas / total) * 100) : 0

  const mySprintIds  = [...new Set(tasks.map(t => t.sprintId).filter(Boolean))]
  const mySprints    = sprints.filter(s => mySprintIds.includes(s.id))
  const myProyIds    = [...new Set(tasks.map(t => t.proyectoId).filter(Boolean))]
  const myProyectos  = proyectos.filter(p => myProyIds.includes(p.id))

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1300, animation: 'fadeIn .3s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
          Bienvenido, {user?.fullName?.split(' ')[0] || 'Developer'}
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '4px 0 0' }}>
          Aquí tienes un resumen de tus tareas y actividad
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
        {[
          { label: 'Total asignadas', value: total,       color: 'var(--navy)' },
          { label: 'En progreso',     value: enProgreso,  color: 'var(--accent)' },
          { label: 'Completadas',     value: completadas, color: '#7A8C5A' },
          { label: 'Bloqueadas',      value: bloqueadas,  color: '#A85550' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--white)', borderRadius: 'var(--radius)', padding: '14px 16px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius)', padding: '14px 16px', border: '1px solid var(--border)', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
            <span style={{ color: 'var(--muted)' }}>Mi progreso general</span>
            <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{pct}%</span>
          </div>
          <div style={{ height: 7, borderRadius: 99, background: 'var(--border-light)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: 'linear-gradient(90deg, #9E3527, #C74634, #E8614A)', transition: 'width 1s ease' }} />
          </div>
        </div>
      )}

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16, alignItems: 'start', marginTop: 8 }}>
        {/* Tasks panel */}
        <div>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 180, maxWidth: 280 }}>
              <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/></svg>
              </div>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar tarea..."
                style={{ width: '100%', height: 34, paddingLeft: 30, paddingRight: 10, border: '1px solid var(--border)', borderRadius: 7, fontSize: 12.5, outline: 'none', background: 'var(--white)', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 7, overflow: 'hidden', marginLeft: 'auto' }}>
              {[['kanban', '⊞'], ['list', '≡']].map(([v, icon]) => (
                <button key={v} onClick={() => setView(v)}
                  style={{ padding: '6px 12px', fontSize: 14, border: 'none', cursor: 'pointer', background: view === v ? 'var(--accent)' : 'var(--white)', color: view === v ? 'white' : 'var(--slate)', transition: 'all .15s' }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {total === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
              No tienes tareas asignadas aún.
            </div>
          )}

          {/* KANBAN — solo onUpdate, sin onEdit ni onDelete */}
          {view === 'kanban' && total > 0 && (
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
              {COLUMNS.map(col => (
                <div key={col.key} style={{ minWidth: 220, flex: '1 0 220px', maxWidth: 280 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, padding: '6px 2px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.dot }} />
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: col.color }}>{col.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: 'var(--border-light)', color: 'var(--muted)' }}>
                      {byStatus(col.key).length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {byStatus(col.key).map((task, i) => (
                      <div key={task.id} style={{ animation: `fadeIn .2s ease ${i * 0.05}s both` }}>
                        <TaskCard task={task} onUpdate={handleUpdate} />
                      </div>
                    ))}
                    {byStatus(col.key).length === 0 && (
                      <div style={{ padding: '20px 12px', textAlign: 'center', border: '2px dashed var(--border-light)', borderRadius: 10, color: 'var(--muted)', fontSize: 12 }}>
                        Sin tareas
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LIST — solo botón cambiar estado */}
          {view === 'list' && total > 0 && (
            <div style={{ background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 120px 90px 76px' }}>
                {['Tarea', 'Estado', 'Prioridad', 'Acción'].map((h, idx) => (
                  <div key={h} style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-light)', fontSize: 10.5, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', textAlign: idx === 3 ? 'center' : 'left' }}>{h}</div>
                ))}
                {filtered.map((task) => {
                  const col = COLUMNS.find(c => c.key === task.estatus) || COLUMNS[0]
                  return (
                    <div key={task.id} style={{ display: 'contents' }}>
                      <div style={{ padding: '12px 10px', borderBottom: '1px solid var(--border-light)', fontSize: 13, fontWeight: 500, color: 'var(--navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.nombre}</div>
                      <div style={{ padding: '12px 10px', borderBottom: '1px solid var(--border-light)' }}>
                        <span style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 20, color: col.color, background: `${col.dot}22` }}>{col.label}</span>
                      </div>
                      <div style={{ padding: '12px 10px', borderBottom: '1px solid var(--border-light)', fontSize: 11.5, fontWeight: 600, color: PRIORIDAD_COLOR[task.prioridad] || 'var(--muted)' }}>
                        {task.prioridad || '—'}
                      </div>
                      <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Button size="sm" variant="ghost" onClick={() => setEditTask(task)}>
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                        </Button>
                      </div>
                    </div>
                  )
                })}
                {filtered.length === 0 && total > 0 && (
                  <div style={{ gridColumn: '1 / -1', padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                    No hay tareas que coincidan con la búsqueda
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', margin: '0 0 12px' }}>Sprints activos</h3>
            {mySprints.length === 0 ? (
              <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: 0 }}>Sin sprints activos.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {mySprints.map(s => (
                  <div key={s.id} style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--navy)' }}>{s.nombre}</div>
                    {s.fechaFin && (
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                        Fin: {new Date(s.fechaFin).toLocaleDateString('es-MX')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', margin: '0 0 12px' }}>Mis proyectos</h3>
            {myProyectos.length === 0 ? (
              <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: 0 }}>Sin proyectos asignados.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {myProyectos.map(p => (
                  <div key={p.id} style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--navy)' }}>{p.nombre}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{p.estatus}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {editTask && (
        <StatusModal task={editTask} onSave={handleStatusSave} onClose={() => setEditTask(null)} />
      )}
    </div>
  )
}
