import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Card from '../common/Card'
import { tareasApi } from '../../services/api'

const STATUS_CONFIG = {
  'Backlog':     { label: 'Backlog',     color: 'var(--muted)',      bg: 'var(--border-light)' },
  'En Progreso': { label: 'En progreso', color: 'var(--accent)',     bg: 'var(--accent-light)' },
  'Completado':  { label: 'Completado',  color: '#7A8C5A',           bg: '#F0F2EC' },
  'Bloqueado':   { label: 'Bloqueada',   color: 'var(--oracle-red)', bg: '#FEE2E2' },
}

const PRIORITY_CONFIG = {
  'Alta':  { label: 'Alta',  color: 'var(--oracle-red)' },
  'Media': { label: 'Media', color: 'var(--amber)' },
  'Baja':  { label: 'Baja',  color: '#7A8C5A' },
}

const MENU_EVENT = 'taskCardMenuOpen'

export default function TaskCard({ task, onUpdate, onDelete, onEdit }) {
  const [menuPos,  setMenuPos]  = useState(null)
  const [updating, setUpdating] = useState(false)
  const btnRef = useRef(null)

  const closeMenu = () => setMenuPos(null)

  // Close when another card opens its menu
  useEffect(() => {
    const handler = (e) => { if (e.detail !== task.id) closeMenu() }
    window.addEventListener(MENU_EVENT, handler)
    return () => window.removeEventListener(MENU_EVENT, handler)
  }, [task.id])

  // Close on outside click
  useEffect(() => {
    if (!menuPos) return
    const handler = (e) => {
      if (btnRef.current && btnRef.current.contains(e.target)) return
      closeMenu()
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [menuPos])

  const toggleMenu = (e) => {
    e.stopPropagation()
    if (menuPos) { closeMenu(); return }
    const rect = btnRef.current.getBoundingClientRect()
    setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    window.dispatchEvent(new CustomEvent(MENU_EVENT, { detail: task.id }))
  }

  const status   = STATUS_CONFIG[task.estatus]    || STATUS_CONFIG['Backlog']
  const priority = PRIORITY_CONFIG[task.prioridad] || PRIORITY_CONFIG['Media']

  const handleStatusChange = async (newEstatus) => {
    closeMenu()
    setUpdating(true)
    try {
      const updated = await tareasApi.update(task.id, { ...task, estatus: newEstatus })
      onUpdate?.(updated || { ...task, estatus: newEstatus })
    } catch {
      onUpdate?.({ ...task, estatus: newEstatus })
    } finally {
      setUpdating(false)
    }
  }

  const dropdown = menuPos && createPortal(
    <div
      onMouseDown={e => e.stopPropagation()}
      style={{
        position: 'fixed', top: menuPos.top, right: menuPos.right,
        background: 'white', border: '1px solid #E5E7EB',
        borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,.12)',
        padding: 4, zIndex: 9999, minWidth: 160,
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
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
            display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'inherit',
          }}
          onMouseEnter={e => e.currentTarget.style.background = cfg.bg}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
          {cfg.label}
        </button>
      ))}
      <div style={{ height: 1, background: '#F3F4F6', margin: '4px 0' }} />
      <button
        onClick={() => { onEdit?.(task); closeMenu() }}
        style={{ width: '100%', textAlign: 'left', padding: '6px 10px', fontSize: 12.5, color: '#1B1F3B', borderRadius: 5, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        Editar tarea
      </button>
      <button
        onClick={() => { onDelete?.(task.id); closeMenu() }}
        style={{ width: '100%', textAlign: 'left', padding: '6px 10px', fontSize: 12.5, color: '#A85550', borderRadius: 5, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        Eliminar tarea
      </button>
    </div>,
    document.body
  )

  return (
    <Card style={{ position: 'relative' }} hoverable>
      {dropdown}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '3px 8px',
          borderRadius: 20, background: status.bg, color: status.color,
          textTransform: 'uppercase', letterSpacing: '.04em',
        }}>
          {updating ? '…' : status.label}
        </span>
        <button
          ref={btnRef}
          onClick={toggleMenu}
          style={{
            color: '#9CA3AF', padding: '2px 4px', borderRadius: 4,
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
      </div>

      {/* Title */}
      <h4 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--navy)', marginBottom: 6, lineHeight: 1.4 }}>
        {task.nombre}
      </h4>

      {/* Description */}
      {task.descripcion && (
        <p style={{
          fontSize: 12, color: 'var(--muted)', marginBottom: 10, lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {task.descripcion}
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: priority.color }} />
          <span style={{ fontSize: 11, color: priority.color, fontWeight: 500 }}>{priority.label}</span>
        </div>
        {task.fechaVencimiento && (
          <span style={{ fontSize: 10.5, color: 'var(--muted)' }}>
            {new Date(task.fechaVencimiento).toLocaleDateString('es-MX')}
          </span>
        )}
      </div>
    </Card>
  )
}
