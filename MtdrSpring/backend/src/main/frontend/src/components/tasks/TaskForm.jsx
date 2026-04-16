import { useState, useEffect } from 'react'
import Button from '../common/Button'
import { tasksApi, projectsApi, usersApi } from '../../services/api'

const INITIAL = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  projectId: '',
  assigneeId: '',
  dueDate: '',
  storyPoints: '',
}

export default function TaskForm({ task, onSuccess, onCancel }) {
  const [form, setForm] = useState(task ? { ...INITIAL, ...task } : INITIAL)
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    projectsApi.getAll().then(setProjects).catch(() => setProjects([]))
    usersApi.getAll().then(setUsers).catch(() => setUsers([]))
  }, [])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('El título es obligatorio'); return }
    setLoading(true)
    setError('')
    try {
      const saved = task?.id
        ? await tasksApi.update(task.id, form)
        : await tasksApi.create(form)
      onSuccess?.(saved)
    } catch (e) {
      setError(e.message || 'Error al guardar la tarea')
    } finally {
      setLoading(false)
    }
  }

  const fieldStyle = {
    width: '100%', height: 36,
    padding: '0 10px',
    border: '1px solid var(--border)',
    borderRadius: 7,
    fontSize: 13, color: 'var(--navy)',
    outline: 'none', background: 'var(--white)',
    transition: 'border-color .15s',
  }

  const labelStyle = {
    display: 'block', fontSize: 11.5, fontWeight: 600,
    color: 'var(--slate)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.05em',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Title */}
      <div>
        <label style={labelStyle}>Título *</label>
        <input
          style={fieldStyle}
          placeholder="Título de la tarea"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {/* Description */}
      <div>
        <label style={labelStyle}>Descripción</label>
        <textarea
          style={{ ...fieldStyle, height: 80, padding: '8px 10px', resize: 'vertical' }}
          placeholder="Describe la tarea..."
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {/* Row: status + priority */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Estado</label>
          <select
            style={{ ...fieldStyle, cursor: 'pointer' }}
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
          >
            <option value="TODO">Por hacer</option>
            <option value="IN_PROGRESS">En progreso</option>
            <option value="REVIEW">En revisión</option>
            <option value="DONE">Hecho</option>
            <option value="BLOCKED">Bloqueada</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Prioridad</label>
          <select
            style={{ ...fieldStyle, cursor: 'pointer' }}
            value={form.priority}
            onChange={(e) => set('priority', e.target.value)}
          >
            <option value="HIGH">Alta</option>
            <option value="MEDIUM">Media</option>
            <option value="LOW">Baja</option>
          </select>
        </div>
      </div>

      {/* Row: project + assignee */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Proyecto</label>
          <select
            style={{ ...fieldStyle, cursor: 'pointer' }}
            value={form.projectId}
            onChange={(e) => set('projectId', e.target.value)}
          >
            <option value="">Sin proyecto</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Asignado a</label>
          <select
            style={{ ...fieldStyle, cursor: 'pointer' }}
            value={form.assigneeId}
            onChange={(e) => set('assigneeId', e.target.value)}
          >
            <option value="">Sin asignar</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row: due date + story points */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Fecha límite</label>
          <input
            type="date"
            style={fieldStyle}
            value={form.dueDate}
            onChange={(e) => set('dueDate', e.target.value)}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <div>
          <label style={labelStyle}>Story Points</label>
          <input
            type="number"
            min="0" max="21"
            style={fieldStyle}
            placeholder="1–21"
            value={form.storyPoints}
            onChange={(e) => set('storyPoints', e.target.value)}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <p style={{ fontSize: 12, color: 'var(--oracle-red)', padding: '8px 10px', background: 'var(--red-light)', borderRadius: 6 }}>
          {error}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button variant="primary" loading={loading} onClick={handleSubmit}>
          {task?.id ? 'Actualizar tarea' : 'Crear tarea'}
        </Button>
      </div>
    </div>
  )
}