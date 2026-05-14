import { useState, useEffect } from 'react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { proyectosApi, tareasApi } from '../services/api'
import { useAuth } from '../App'

// estatus values from DB: 'Planeado' | 'En Progreso' | 'Completado' | 'Cancelado'
const STATUS_CONFIG = {
  'Planeado':    { label: 'Planeado',    color: '#374151', bg: '#F1F5F9' },
  'En Progreso': { label: 'En progreso', color: '#A85550', bg: '#F5ECEB' },
  'Completado':  { label: 'Completado',  color: '#7A8C5A', bg: '#F0F2EC' },
  'Cancelado':   { label: 'Cancelado',   color: '#A85550', bg: '#FEE2E2' },
}

function ProjectCard({ project, taskStats, onEdit, canEdit }) {
  const st = STATUS_CONFIG[project.estatus] || STATUS_CONFIG['Planeado']
  const done  = taskStats?.completadas ?? 0
  const total = taskStats?.total       ?? 0
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <Card hoverable style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--navy)' }}>{project.nombre}</h3>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: st.bg, color: st.color, flexShrink: 0 }}>
              {st.label}
            </span>
          </div>
          {project.descripcion && (
            <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5 }}>{project.descripcion}</p>
          )}
        </div>
      </div>

      {/* Progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11.5 }}>
          <span style={{ color: 'var(--muted)' }}>{done}/{total} tareas</span>
          <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{pct}%</span>
        </div>
        <div style={{ height: 6, background: 'var(--border-light)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #9E3527, #C74634, #E8614A)',
            transition: 'width .8s ease',
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>
          {project.fechaInicio ? new Date(project.fechaInicio).toLocaleDateString('es-MX') : '—'}
          {' → '}
          {project.fechaFin ? new Date(project.fechaFin).toLocaleDateString('es-MX') : '—'}
        </span>
        {canEdit && <Button size="sm" variant="outline" onClick={() => onEdit(project)}>Editar</Button>}
      </div>
    </Card>
  )
}

function ProjectModal({ project, onClose, onSave }) {
  const [form, setForm] = useState(project
    ? { nombre: project.nombre || '', descripcion: project.descripcion || '', estatus: project.estatus || 'Planeado', fechaInicio: project.fechaInicio?.slice(0,10) || '', fechaFin: project.fechaFin?.slice(0,10) || '' }
    : { nombre: '', descripcion: '', estatus: 'Planeado', fechaInicio: '', fechaFin: '' }
  )
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.nombre.trim()) { setErr('El nombre es requerido'); return }
    setLoading(true)
    setErr('')
    try {
      const saved = project?.id
        ? await proyectosApi.update(project.id, form)
        : await proyectosApi.create(form)
      onSave(saved)
    } catch (e) {
      setErr(e.message || 'Error al guardar el proyecto')
    } finally { setLoading(false) }
  }

  const input = { width: '100%', height: 36, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--slate)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.06em' }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 300, animation: 'fadeIn .2s ease',
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: 16, padding: 24, width: 440, boxShadow: 'var(--shadow-lg)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>{project?.id ? 'Editar' : 'Nuevo'} proyecto</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Nombre *</label>
            <input style={input} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Nombre del proyecto"
              onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea style={{ ...input, height: 72, padding: '8px 10px', resize: 'none' }} value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Estado</label>
              <select style={{ ...input, cursor: 'pointer' }} value={form.estatus} onChange={e => set('estatus', e.target.value)}>
                <option value="Planeado">Planeado</option>
                <option value="En Progreso">En Progreso</option>
                <option value="Completado">Completado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Fecha inicio</label>
              <input type="date" style={input} value={form.fechaInicio} onChange={e => set('fechaInicio', e.target.value)}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Fecha fin</label>
            <input type="date" style={input} value={form.fechaFin} onChange={e => set('fechaFin', e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
        </div>
        {err && (
          <div style={{ padding: '8px 12px', borderRadius: 8, background: '#FEF2F2', border: '1px solid #FECACA', fontSize: 12, color: '#A85550', marginTop: 8 }}>
            {err}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" loading={loading} onClick={handleSave}>Guardar proyecto</Button>
        </div>
      </div>
    </div>
  )
}

export default function Projects() {
  const { user } = useAuth()
  const isDev = user?.rol === 'Developer'

  const [projects, setProjects]   = useState([])
  const [taskStats, setTaskStats] = useState({})
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [allProjects, myTasks] = await Promise.all([
          proyectosApi.getAll(),
          isDev && user?.userId ? tareasApi.getByAsignado(user.userId) : Promise.resolve([]),
        ])

        // Developers only see projects where they have tasks
        const myProjectIds = isDev
          ? new Set((myTasks || []).map(t => t.proyectoId).filter(Boolean))
          : null
        const visible = isDev
          ? allProjects.filter(p => myProjectIds.has(p.id))
          : allProjects

        setProjects(visible)

        const stats = {}
        await Promise.all(visible.map(async (p) => {
          try {
            const tareas = await tareasApi.getByProyecto(p.id)
            stats[p.id] = {
              total:       tareas.length,
              completadas: tareas.filter(t => t.estatus === 'Completado').length,
            }
          } catch { stats[p.id] = { total: 0, completadas: 0 } }
        }))
        setTaskStats(stats)
      } catch {
        setProjects([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isDev, user?.userId])

  const handleSave = (saved) => {
    setProjects(prev =>
      modal?.id
        ? prev.map(p => p.id === saved.id ? { ...p, ...saved } : p)
        : [...prev, saved]
    )
    setModal(null)
  }

  const enProgreso  = projects.filter(p => p.estatus === 'En Progreso').length
  const planeados   = projects.filter(p => p.estatus === 'Planeado').length
  const completados = projects.filter(p => p.estatus === 'Completado').length

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          {isDev ? 'Proyectos en los que participas' : `${projects.length} proyectos en total`}
        </p>
        {!isDev && (
          <Button variant="primary"
            icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
            onClick={() => setModal({})}>
            Nuevo proyecto
          </Button>
        )}
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total',       value: projects.length, color: 'var(--navy)' },
          { label: 'En progreso', value: enProgreso,       color: '#A85550' },
          { label: 'Planeados',   value: planeados,        color: 'var(--accent)' },
          { label: 'Completados', value: completados,      color: 'var(--muted)' },
        ].map(({ label, value, color }) => (
          <Card key={label} style={{ textAlign: 'center', padding: '16px 12px' }}>
            <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{label}</div>
          </Card>
        ))}
      </div>

      {loading && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Cargando proyectos…</div>
      )}

      {!loading && projects.length === 0 && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
          No hay proyectos disponibles
        </div>
      )}

      {/* Projects grid */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {projects.map((project, i) => (
            <div key={project.id} style={{ animation: `fadeIn .25s ease ${i * 0.06}s both` }}>
              <ProjectCard project={project} taskStats={taskStats[project.id]} onEdit={setModal} canEdit={!isDev} />
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <ProjectModal project={modal?.id ? modal : null} onClose={() => setModal(null)} onSave={handleSave} />
      )}
    </div>
  )
}
