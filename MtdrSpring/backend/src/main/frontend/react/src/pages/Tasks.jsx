import { useState, useEffect } from 'react'
import TaskCard from '../components/tasks/TaskCard'
import TaskForm from '../components/tasks/TaskForm'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import { tasksApi } from '../services/api'

const COLUMNS = [
  { key: 'TODO', label: 'Por hacer', color: 'var(--muted)', dot: '#94A3B8' },
  { key: 'IN_PROGRESS', label: 'En progreso', color: 'var(--accent)', dot: 'var(--accent)' },
  { key: 'REVIEW', label: 'En revisión', color: 'var(--amber)', dot: 'var(--amber)' },
  { key: 'BLOCKED', label: 'Bloqueada', color: 'var(--oracle-red)', dot: 'var(--oracle-red)' },
  { key: 'DONE', label: 'Hecho', color: '#16a34a', dot: 'var(--green)' },
]

const MOCK_TASKS = [
  { id: 1, title: 'Diseño de arquitectura OCI', description: 'Definir la arquitectura cloud native con Kubernetes y ATP.', status: 'DONE', priority: 'HIGH', assignee: 'Salvador' },
  { id: 2, title: 'Modelo relacional de BD', description: 'Diseñar el esquema de base de datos en Oracle ATP.', status: 'DONE', priority: 'HIGH', assignee: 'María' },
  { id: 3, title: 'Implementación del portal web', description: 'Desarrollo del frontend en React y backend en Spring Boot.', status: 'IN_PROGRESS', priority: 'HIGH', assignee: 'Perla' },
  { id: 4, title: 'Integración Telegram Bot', description: 'Conectar el bot de Telegram con las APIs del sistema.', status: 'IN_PROGRESS', priority: 'HIGH', assignee: 'Rogiero' },
  { id: 5, title: 'KPIs de productividad', description: 'Implementar cálculo de métricas individuales y de equipo.', status: 'TODO', priority: 'MEDIUM', assignee: 'Silvana' },
  { id: 6, title: 'Módulo de IA con RAG', description: 'Base de conocimiento para resúmenes y detección de riesgos.', status: 'BLOCKED', priority: 'MEDIUM', assignee: 'Silvana' },
  { id: 7, title: 'Pruebas del sistema', description: 'Pruebas de integración y validación de flujos completos.', status: 'TODO', priority: 'HIGH', assignee: 'María' },
  { id: 8, title: 'Deploy en OKE', description: 'Configurar el despliegue de contenedores en Oracle Kubernetes Engine.', status: 'REVIEW', priority: 'HIGH', assignee: 'Salvador' },
]

export default function Tasks() {
  const [tasks, setTasks] = useState(MOCK_TASKS)
  const [view, setView] = useState('kanban') // 'kanban' | 'list'
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterPriority, setFilterPriority] = useState('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    tasksApi.getAll().then(setTasks).catch(() => {})
  }, [])

  const handleUpdate = (updated) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
  }

  const handleDelete = (id) => {
    tasksApi.delete(id).catch(() => {})
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const handleSave = (saved) => {
    if (editTask?.id) {
      setTasks(prev => prev.map(t => t.id === saved.id ? saved : t))
    } else {
      setTasks(prev => [...prev, { ...saved, id: Date.now() }])
    }
    setShowForm(false)
    setEditTask(null)
  }

  const filtered = tasks.filter(t => {
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const byStatus = (status) => filtered.filter(t => t.status === status)

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 180, maxWidth: 260 }}>
          <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/></svg>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar tarea..."
            style={{ width: '100%', height: 34, paddingLeft: 30, paddingRight: 10, border: '1px solid var(--border)', borderRadius: 7, fontSize: 12.5, outline: 'none', background: 'white' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Filters */}
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ height: 34, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12.5, cursor: 'pointer', outline: 'none', background: 'white' }}>
          <option value="ALL">Todos los estados</option>
          {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>

        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          style={{ height: 34, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12.5, cursor: 'pointer', outline: 'none', background: 'white' }}>
          <option value="ALL">Toda prioridad</option>
          <option value="HIGH">Alta</option>
          <option value="MEDIUM">Media</option>
          <option value="LOW">Baja</option>
        </select>

        {/* View toggle */}
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

      {/* KANBAN VIEW */}
      {view === 'kanban' && (
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
          {COLUMNS.map(col => (
            <div key={col.key} style={{ minWidth: 240, flex: '1 0 240px', maxWidth: 300 }}>
              {/* Column header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                marginBottom: 10, padding: '6px 2px',
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.dot }} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: col.color }}>{col.label}</span>
                <span style={{
                  marginLeft: 'auto', fontSize: 11, fontWeight: 700,
                  padding: '1px 7px', borderRadius: 20,
                  background: 'var(--border-light)', color: 'var(--muted)',
                }}>
                  {byStatus(col.key).length}
                </span>
              </div>

              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {byStatus(col.key).map((task, i) => (
                  <div key={task.id} style={{ animation: `fadeIn .2s ease ${i * 0.05}s both` }}>
                    <TaskCard task={task} onUpdate={handleUpdate} onDelete={handleDelete} />
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
      {view === 'list' && (
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 90px 90px 90px', gap: 0 }}>
            {/* Header */}
            <div style={{
              display: 'contents',
              fontSize: 10.5, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em',
            }}>
              {['Tarea', 'Estado', 'Prioridad', 'Asignado', 'Acciones'].map(h => (
                <div key={h} style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-light)', fontSize: 10.5, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</div>
              ))}
            </div>
            {/* Rows */}
            {filtered.map((task, i) => {
              const col = COLUMNS.find(c => c.key === task.status) || COLUMNS[0]
              return (
                <div key={task.id} style={{ display: 'contents' }}>
                  {[
                    <div style={{ padding: '12px 10px', borderBottom: '1px solid var(--border-light)', fontSize: 13, fontWeight: 500, color: 'var(--navy)', animation: `fadeIn .2s ease ${i*0.04}s both` }}>{task.title}</div>,
                    <div style={{ padding: '12px 10px', borderBottom: '1px solid var(--border-light)', animation: `fadeIn .2s ease ${i*0.04}s both` }}>
                      <span style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 20, color: col.color, background: `${col.dot}22` }}>{col.label}</span>
                    </div>,
                    <div style={{ padding: '12px 10px', borderBottom: '1px solid var(--border-light)', fontSize: 11.5, fontWeight: 600, color: task.priority === 'HIGH' ? 'var(--oracle-red)' : task.priority === 'MEDIUM' ? 'var(--amber)' : 'var(--green)', animation: `fadeIn .2s ease ${i*0.04}s both` }}>
                      {task.priority === 'HIGH' ? 'Alta' : task.priority === 'MEDIUM' ? 'Media' : 'Baja'}
                    </div>,
                    <div style={{ padding: '12px 10px', borderBottom: '1px solid var(--border-light)', animation: `fadeIn .2s ease ${i*0.04}s both` }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--navy-light)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                        {task.assignee?.[0] || '?'}
                      </div>
                    </div>,
                    <div style={{ padding: '10px 10px', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: 4, animation: `fadeIn .2s ease ${i*0.04}s both` }}>
                      <Button size="sm" variant="ghost" onClick={() => { setEditTask(task); setShowForm(true) }}>✏️</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(task.id)}>🗑️</Button>
                    </div>,
                  ].map((cell, ci) => <div key={ci}>{cell}</div>)}
                </div>
              )
            })}
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