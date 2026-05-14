import { useState, useEffect } from 'react'
import TaskCard from '../components/tasks/TaskCard'
import Button from '../components/common/Button'
import { tareasApi } from '../services/api'
import { useAuth } from '../App'

const STATUSES = ['Backlog', 'En Progreso', 'Completado', 'Bloqueado']

function StatusModal({ task, onSave, onClose }) {
  const [estatus, setEstatus] = useState(task.estatus)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const updated = await tareasApi.update(task.id, { ...task, estatus })
      onSave(updated)
    } catch {
      // keep modal open on error
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

// DB values: 'Backlog' | 'En Progreso' | 'Completado' | 'Bloqueado'
const COLUMNS = [
  { key: 'Backlog',     label: 'Backlog',     color: 'var(--muted)',      dot: '#94A3B8' },
  { key: 'En Progreso', label: 'En progreso', color: 'var(--accent)',     dot: 'var(--accent)' },
  { key: 'Bloqueado',   label: 'Bloqueada',   color: 'var(--oracle-red)', dot: 'var(--oracle-red)' },
  { key: 'Completado',  label: 'Completado',  color: '#7A8C5A',           dot: '#7A8C5A' },
]

export default function MisTareas() {
  const { user } = useAuth()
  const [tasks, setTasks]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [view, setView]         = useState('kanban')
  const [editTask, setEditTask] = useState(null)
  const [search, setSearch]     = useState('')

  useEffect(() => {
    if (!user?.userId) { setLoading(false); return }
    tareasApi.getByAsignado(user.userId)
      .then(setTasks)
      .catch(() => setTasks([]))
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

  const filtered = search
    ? tasks.filter(t => t.nombre?.toLowerCase().includes(search.toLowerCase()))
    : tasks

  const byStatus = (status) => filtered.filter(t => t.estatus === status)

  const completadas = tasks.filter(t => t.estatus === 'Completado').length
  const enProgreso  = tasks.filter(t => t.estatus === 'En Progreso').length
  const pct = tasks.length > 0 ? Math.round((completadas / tasks.length) * 100) : 0

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      {/* Header stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total asignadas', value: tasks.length,  color: 'var(--navy)' },
          { label: 'En progreso',     value: enProgreso,    color: 'var(--accent)' },
          { label: 'Completadas',     value: completadas,   color: '#7A8C5A' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'white', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div style={{ background: 'white', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border)', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
            <span style={{ color: 'var(--muted)' }}>Mi progreso</span>
            <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{pct}%</span>
          </div>
          <div style={{ height: 7, borderRadius: 99, background: 'var(--border-light)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: 'linear-gradient(90deg, #5A6E3E, #7A8C5A)', transition: 'width 1s ease' }} />
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180, maxWidth: 280 }}>
          <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/></svg>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar tarea..."
            style={{ width: '100%', height: 34, paddingLeft: 30, paddingRight: 10, border: '1px solid var(--border)', borderRadius: 7, fontSize: 12.5, outline: 'none', background: 'white', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 7, overflow: 'hidden', marginLeft: 'auto' }}>
          {[['kanban', '⊞'], ['list', '≡']].map(([v, icon]) => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding: '6px 12px', fontSize: 14, border: 'none', cursor: 'pointer', background: view === v ? 'var(--accent)' : 'white', color: view === v ? 'white' : 'var(--slate)', transition: 'all .15s' }}>
              {icon}
            </button>
          ))}
        </div>

      </div>

      {loading && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Cargando mis tareas…</div>
      )}

      {!loading && tasks.length === 0 && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
          No tienes tareas asignadas
        </div>
      )}

      {/* KANBAN VIEW */}
      {!loading && view === 'kanban' && (
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
          {COLUMNS.map(col => (
            <div key={col.key} style={{ minWidth: 240, flex: '1 0 240px', maxWidth: 300 }}>
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

      {/* LIST VIEW */}
      {!loading && view === 'list' && (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 90px 90px' }}>
            {['Tarea', 'Estado', 'Prioridad', 'Acciones'].map(h => (
              <div key={h} style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-light)', fontSize: 10.5, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</div>
            ))}
            {filtered.map((task, i) => {
              const col = COLUMNS.find(c => c.key === task.estatus) || COLUMNS[0]
              return (
                <div key={task.id} style={{ display: 'contents' }}>
                  <div style={{ padding: '12px 10px', borderBottom: '1px solid var(--border-light)', fontSize: 13, fontWeight: 500, color: 'var(--navy)', animation: `fadeIn .2s ease ${i*0.04}s both` }}>{task.nombre}</div>
                  <div style={{ padding: '12px 10px', borderBottom: '1px solid var(--border-light)', animation: `fadeIn .2s ease ${i*0.04}s both` }}>
                    <span style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 20, color: col.color, background: `${col.dot}22` }}>{col.label}</span>
                  </div>
                  <div style={{ padding: '12px 10px', borderBottom: '1px solid var(--border-light)', fontSize: 11.5, fontWeight: 600, color: task.prioridad === 'Alta' ? 'var(--oracle-red)' : task.prioridad === 'Media' ? 'var(--amber)' : '#7A8C5A', animation: `fadeIn .2s ease ${i*0.04}s both` }}>
                    {task.prioridad || '—'}
                  </div>
                  <div style={{ padding: '10px 10px', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: 4, animation: `fadeIn .2s ease ${i*0.04}s both` }}>
                    <Button size="sm" variant="ghost" onClick={() => setEditTask(task)}>
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </Button>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && tasks.length > 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                No hay tareas que coincidan con la búsqueda
              </div>
            )}
          </div>
        </div>
      )}

      {editTask && (
        <StatusModal task={editTask} onSave={handleStatusSave} onClose={() => setEditTask(null)} />
      )}
    </div>
  )
}
