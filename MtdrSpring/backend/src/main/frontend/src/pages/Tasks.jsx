import { useState, useEffect } from 'react'
import TaskCard from '../components/tasks/TaskCard'
import TaskForm from '../components/tasks/TaskForm'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import { tareasApi } from '../services/api'

// DB values: 'Backlog' | 'En Progreso' | 'Completado' | 'Bloqueado'
const COLUMNS = [
  { key: 'Backlog',     label: 'Backlog',      color: 'var(--muted)',       dot: '#94A3B8' },
  { key: 'En Progreso', label: 'En progreso',  color: 'var(--accent)',      dot: 'var(--accent)' },
  { key: 'Bloqueado',   label: 'Bloqueada',    color: 'var(--oracle-red)',  dot: 'var(--oracle-red)' },
  { key: 'Completado',  label: 'Completado',   color: '#7A8C5A',            dot: '#7A8C5A' },
]

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('kanban')
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterPriority, setFilterPriority] = useState('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    tareasApi.getAll()
      .then(setTasks)
      .catch(() => setTasks([]))
      .finally(() => setLoading(false))
  }, [])

  const handleUpdate = (updated) => {
    tareasApi.update(updated.id, updated).catch(() => {})
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
  }

  const handleDelete = (id) => {
    tareasApi.delete(id).catch(() => {})
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const handleSave = (saved) => {
    if (editTask?.id) {
      setTasks(prev => prev.map(t => t.id === saved.id ? saved : t))
    } else {
      setTasks(prev => [...prev, saved])
    }
    setShowForm(false)
    setEditTask(null)
  }

  const filtered = tasks.filter(t => {
    if (filterStatus !== 'ALL' && t.estatus !== filterStatus) return false
    if (filterPriority !== 'ALL' && t.prioridad !== filterPriority) return false
    if (search && !t.nombre?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const byStatus = (status) => filtered.filter(t => t.estatus === status)

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180, maxWidth: 260 }}>
          <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/></svg>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar tarea..."
            style={{ width: '100%', height: 34, paddingLeft: 30, paddingRight: 10, border: '1px solid var(--border)', borderRadius: 7, fontSize: 12.5, outline: 'none', background: 'white' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ height: 34, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12.5, cursor: 'pointer', outline: 'none', background: 'white' }}>
          <option value="ALL">Todos los estados</option>
          {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>

        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          style={{ height: 34, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12.5, cursor: 'pointer', outline: 'none', background: 'white' }}>
          <option value="ALL">Toda prioridad</option>
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
        </select>

        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 7, overflow: 'hidden', marginLeft: 'auto' }}>
          {[['kanban', '⊞'], ['list', '≡']].map(([v, icon]) => (
            <button key={v} onClick={() => setView(v)}
              style={{
                padding: '6px 12px', fontSize: 14, border: 'none', cursor: 'pointer',
                background: view === v ? 'var(--accent)' : 'white',
                color: view === v ? 'white' : 'var(--slate)',
                transition: 'all .15s',
              }}>
              {icon}
            </button>
          ))}
        </div>

        <Button variant="primary" size="sm"
          icon={<svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
          onClick={() => { setEditTask(null); setShowForm(true) }}>
          Nueva tarea
        </Button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {COLUMNS.map(col => (
          <div key={col.key} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'white', borderRadius: 20, border: '1px solid var(--border)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: col.dot }} />
            <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{col.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>{byStatus(col.key).length}</span>
          </div>
        ))}
      </div>

      {loading && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Cargando tareas…</div>
      )}

      {!loading && tasks.length === 0 && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
          No hay tareas disponibles
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
                    <TaskCard task={task} onUpdate={handleUpdate} onDelete={handleDelete} onEdit={(t) => { setEditTask(t); setShowForm(true) }} />
                  </div>
                ))}
                {byStatus(col.key).length === 0 && (
                  <div style={{
                    padding: '20px 12px', textAlign: 'center',
                    border: '2px dashed var(--border-light)', borderRadius: 10,
                    color: 'var(--muted)', fontSize: 12,
                  }}>
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
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 90px 90px', gap: 0 }}>
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
                    <Button size="sm" variant="ghost" onClick={() => { setEditTask(task); setShowForm(true) }}>
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(task.id)}>
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </Button>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                No hay tareas que coincidan con los filtros
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Task form modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 300, animation: 'fadeIn .2s ease',
        }} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, width: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>{editTask?.id ? 'Editar tarea' : 'Nueva tarea'}</h3>
            <TaskForm task={editTask} onSuccess={handleSave} onCancel={() => { setShowForm(false); setEditTask(null) }} />
          </div>
        </div>
      )}
    </div>
  )
}
