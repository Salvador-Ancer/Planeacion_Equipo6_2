import { useState } from 'react'
import Card from '../common/Card'
import { tasksApi } from '../../services/api'

const STATUS_CONFIG = {
  TODO: { label: 'Por hacer', color: 'var(--muted)', bg: 'var(--border-light)' },
  IN_PROGRESS: { label: 'En progreso', color: 'var(--accent)', bg: 'var(--accent-light)' },
  REVIEW: { label: 'En revisión', color: 'var(--amber)', bg: 'var(--amber-light)' },
  DONE: { label: 'Hecho', color: '#16a34a', bg: 'var(--green-light)' },
  BLOCKED: { label: 'Bloqueada', color: 'var(--oracle-red)', bg: 'var(--oracle-red-light)' },
}

const PRIORITY_CONFIG = {
  HIGH: { label: 'Alta', color: 'var(--oracle-red)' },
  MEDIUM: { label: 'Media', color: 'var(--amber)' },
  LOW: { label: 'Baja', color: 'var(--green)' },
}

export default function TaskCard({ task, onUpdate, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [updating, setUpdating] = useState(false)

  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM

  const handleStatusChange = async (newStatus) => {
    setUpdating(true)
    setMenuOpen(false)
    try {
      const updated = await tasksApi.updateStatus(task.id, newStatus)
      onUpdate?.(updated || { ...task, status: newStatus })
    } catch {
      // optimistic fallback
      onUpdate?.({ ...task, status: newStatus })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Card style={{ position: 'relative' }} hoverable>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '3px 8px',
          borderRadius: 20, background: status.bg, color: status.color,
          textTransform: 'uppercase', letterSpacing: '.04em',
        }}>
          {updating ? '…' : status.label}
        </span>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              color: 'var(--muted)', padding: '2px 4px', borderRadius: 4,
              cursor: 'pointer', background: 'none', border: 'none',
              display: 'flex', alignItems: 'center',
            }}
          >
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="10" cy="4" r="1.5" />
              <circle cx="10" cy="10" r="1.5" />
              <circle cx="10" cy="16" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: '100%',
              background: 'white', border: '1px solid var(--border)',
              borderRadius: 8, boxShadow: 'var(--shadow-md)',
              padding: 4, zIndex: 50, minWidth: 140,
              animation: 'fadeIn .15s ease',
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                Cambiar estado
              </div>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => handleStatusChange(key)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '6px 10px',
                    fontSize: 12.5, color: cfg.color, borderRadius: 5,
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 7,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = cfg.bg}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                  {cfg.label}
                </button>
              ))}
              <div style={{ height: 1, background: 'var(--border-light)', margin: '4px 0' }} />
              <button
                onClick={() => { onDelete?.(task.id); setMenuOpen(false) }}
                style={{
                  width: '100%', textAlign: 'left', padding: '6px 10px',
                  fontSize: 12.5, color: 'var(--oracle-red)', borderRadius: 5,
                  background: 'none', border: 'none', cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--red-light)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                Eliminar tarea
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h4 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--navy)', marginBottom: 6, lineHeight: 1.4 }}>
        {task.title}
      </h4>

      {/* Description */}
      {task.description && (
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10, lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: priority.color }} />
          <span style={{ fontSize: 11, color: priority.color, fontWeight: 500 }}>{priority.label}</span>
        </div>

        {task.assignee && (
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: 'var(--navy-light)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 600,
            title: task.assignee,
          }}>
            {task.assignee[0].toUpperCase()}
          </div>
        )}
      </div>
    </Card>
  )
}