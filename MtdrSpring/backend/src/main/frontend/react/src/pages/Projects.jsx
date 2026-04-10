import { useState, useEffect } from 'react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { projectsApi } from '../services/api'

const MOCK_PROJECTS = [
  { id: 1, name: 'Portal Web OPM', description: 'Portal web para gestión de proyectos y tareas con dashboard en tiempo real.', status: 'ACTIVE', progress: 68, tasksTotal: 18, tasksDone: 12, team: ['S', 'P', 'R'], startDate: '2026-04-01', endDate: '2026-06-15' },
  { id: 2, name: 'ChatBot Telegram', description: 'Integración con Telegram Bot para consulta de tareas y KPIs vía chat.', status: 'ACTIVE', progress: 35, tasksTotal: 10, tasksDone: 3, team: ['R', 'M'], startDate: '2026-04-08', endDate: '2026-05-20' },
  { id: 3, name: 'Módulo IA & RAG', description: 'Base de conocimiento con RAG para detección de riesgos y priorización inteligente.', status: 'PLANNED', progress: 10, tasksTotal: 8, tasksDone: 1, team: ['S', 'P'], startDate: '2026-05-01', endDate: '2026-06-30' },
  { id: 4, name: 'OCI Infrastructure', description: 'Configuración de OKE, ATP, VCN y políticas de seguridad en Oracle Cloud.', status: 'ACTIVE', progress: 80, tasksTotal: 12, tasksDone: 9, team: ['S', 'R'], startDate: '2026-03-15', endDate: '2026-04-30' },
]

const STATUS_CONFIG = {
  ACTIVE: { label: 'Activo', color: '#16a34a', bg: '#DCFCE7' },
  PLANNED: { label: 'Planeado', color: '#2563EB', bg: '#DBEAFE' },
  PAUSED: { label: 'Pausado', color: '#D97706', bg: '#FEF3C7' },
  DONE: { label: 'Completado', color: '#6B7280', bg: '#F1F5F9' },
}

function ProjectCard({ project, onEdit, onDelete }) {
  const st = STATUS_CONFIG[project.status] || STATUS_CONFIG.PLANNED
  return (
    <Card hoverable style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--navy)' }}>{project.name}</h3>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: st.bg, color: st.color, flexShrink: 0 }}>
              {st.label}
            </span>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5 }}>{project.description}</p>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11.5 }}>
          <span style={{ color: 'var(--muted)' }}>{project.tasksDone}/{project.tasksTotal} tareas</span>
          <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{project.progress}%</span>
        </div>
        <div style={{ height: 6, background: 'var(--border-light)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            width: `${project.progress}%`,
            background: project.progress >= 70 ? 'var(--green)' : project.progress >= 40 ? 'var(--accent)' : 'var(--amber)',
            transition: 'width .8s ease',
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Team avatars */}
        <div style={{ display: 'flex', gap: -4 }}>
          {project.team.map((initial, i) => (
            <div key={i} style={{
              width: 26, height: 26, borderRadius: '50%',
              background: ['var(--oracle-red)', 'var(--accent)', 'var(--navy-light)', 'var(--amber)'][i % 4],
              color: 'white', fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid white', marginLeft: i > 0 ? -8 : 0,
              zIndex: project.team.length - i,
            }}>{initial}</div>
          ))}
        </div>

        {/* Dates */}
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>
          {project.startDate} → {project.endDate}
        </span>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6 }}>
          <Button size="sm" variant="outline" onClick={() => onEdit(project)}>Editar</Button>
        </div>
      </div>
    </Card>
  )
}

function ProjectModal({ project, onClose, onSave }) {
  const [form, setForm] = useState(project || { name: '', description: '', status: 'PLANNED', startDate: '', endDate: '' })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) return
    setLoading(true)
    try {
      const saved = project?.id ? await projectsApi.update(project.id, form) : await projectsApi.create(form)
      onSave(saved || form)
    } catch {
      onSave(form) // optimistic
    } finally { setLoading(false) }
  }

  const input = { width: '100%', height: 36, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, outline: 'none', fontFamily: 'inherit' }
  const label = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--slate)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.06em' }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 300, animation: 'fadeIn .2s ease',
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: 16, padding: 24, width: 440, boxShadow: 'var(--shadow-lg)', animation: 'fadeIn .2s ease' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>{project?.id ? 'Editar' : 'Nuevo'} proyecto</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label style={label}>Nombre *</label><input style={input} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nombre del proyecto" onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
          <div><label style={label}>Descripción</label><textarea style={{ ...input, height: 72, padding: '8px 10px', resize: 'none' }} value={form.description} onChange={e => set('description', e.target.value)} onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={label}>Estado</label><select style={{ ...input, cursor: 'pointer' }} value={form.status} onChange={e => set('status', e.target.value)}><option value="PLANNED">Planeado</option><option value="ACTIVE">Activo</option><option value="PAUSED">Pausado</option><option value="DONE">Completado</option></select></div>
            <div><label style={label}>Fecha inicio</label><input type="date" style={input} value={form.startDate} onChange={e => set('startDate', e.target.value)} onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
          </div>
          <div><label style={label}>Fecha fin</label><input type="date" style={input} value={form.endDate} onChange={e => set('endDate', e.target.value)} onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" loading={loading} onClick={handleSave}>Guardar proyecto</Button>
        </div>
      </div>
    </div>
  )
}

export default function Projects() {
  const [projects, setProjects] = useState(MOCK_PROJECTS)
  const [modal, setModal] = useState(null) // null | 'create' | project object

  useEffect(() => {
    projectsApi.getAll().then(setProjects).catch(() => {})
  }, [])

  const handleSave = (saved) => {
    setProjects(prev => modal?.id ? prev.map(p => p.id === saved.id ? { ...p, ...saved } : p) : [...prev, { ...saved, id: Date.now(), progress: 0, tasksTotal: 0, tasksDone: 0, team: [] }])
    setModal(null)
  }

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>{projects.length} proyectos en total</p>
        </div>
        <Button variant="primary" icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>} onClick={() => setModal({})}>
          Nuevo proyecto
        </Button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total', value: projects.length, color: 'var(--navy)' },
          { label: 'Activos', value: projects.filter(p => p.status === 'ACTIVE').length, color: 'var(--green)' },
          { label: 'Planeados', value: projects.filter(p => p.status === 'PLANNED').length, color: 'var(--accent)' },
          { label: 'Completados', value: projects.filter(p => p.status === 'DONE').length, color: 'var(--muted)' },
        ].map(({ label, value, color }) => (
          <Card key={label} style={{ textAlign: 'center', padding: '16px 12px' }}>
            <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{label}</div>
          </Card>
        ))}
      </div>

      {/* Projects grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {projects.map((project, i) => (
          <div key={project.id} style={{ animation: `fadeIn .25s ease ${i * 0.06}s both` }}>
            <ProjectCard project={project} onEdit={setModal} onDelete={(id) => setProjects(p => p.filter(x => x.id !== id))} />
          </div>
        ))}
      </div>

      {modal !== null && (
        <ProjectModal project={modal?.id ? modal : null} onClose={() => setModal(null)} onSave={handleSave} />
      )}
    </div>
  )
}