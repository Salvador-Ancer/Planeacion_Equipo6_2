import { useState, useEffect } from 'react'
import { sprintsApi, proyectosApi, tareasApi } from '../services/api'

const SPRINT_STATUS = {
  'Activo':    { bg: 'var(--oracle-red-light)', color: 'var(--oracle-red)' },
  'Pendiente': { bg: '#F1F5F9',                 color: '#374151' },
  'Cerrado':   { bg: '#F3F4F6',                 color: '#6B7280' },
}

const PROJECT_STATUS = {
  'En Progreso': { bg: '#F5ECEB', color: '#A85550' },
  'Planeado':    { bg: '#F1F5F9', color: '#374151' },
  'Completado':  { bg: '#F0F2EC', color: '#7A8C5A' },
  'Cancelado':   { bg: '#F3F4F6', color: '#6B7280' },
}

const CLOSED_STATUSES = ['Completado', 'Cancelado']

function datesOverlap(s, fechaInicio, fechaFin) {
  if (!s.fechaInicio || !s.fechaFin || !fechaInicio || !fechaFin) return false
  return s.fechaInicio.slice(0, 10) < fechaFin && s.fechaFin.slice(0, 10) > fechaInicio
}

// ── Sprint Modal ─────────────────────────────────────────────────────────────
function SprintModal({ sprint, proyectos, allSprints, projectLocked, onSave, onClose }) {
  const isEdit = !!sprint?.id
  const [form, setForm] = useState(
    isEdit
      ? {
          proyectoId:  sprint.proyectoId ? String(sprint.proyectoId) : '',
          nombre:      sprint.nombre      || '',
          objetivo:    sprint.objetivo    || '',
          fechaInicio: sprint.fechaInicio ? sprint.fechaInicio.slice(0, 10) : '',
          fechaFin:    sprint.fechaFin    ? sprint.fechaFin.slice(0, 10)    : '',
          estatus:     sprint.estatus     || 'Pendiente',
        }
      : { proyectoId: sprint?.proyectoId ? String(sprint.proyectoId) : '', nombre: '', objetivo: '', fechaInicio: '', fechaFin: '', estatus: 'Pendiente' }
  )
  const [saving, setSaving] = useState(false)
  const [err,    setErr]    = useState('')

  const set = (k, v) => {
    setErr('')
    setForm(f => ({ ...f, [k]: v }))
  }

  const selectedProject = proyectos.find(p => String(p.id) === String(form.proyectoId))

  // Validate on the fly
  const projectWarning = selectedProject && CLOSED_STATUSES.includes(selectedProject.estatus)
    ? `El proyecto "${selectedProject.nombre}" está ${selectedProject.estatus.toLowerCase()} — no se pueden agregar sprints.`
    : null

  const getOverlapWarning = () => {
    if (!form.proyectoId || !form.fechaInicio || !form.fechaFin) return null
    const conflict = allSprints.find(s =>
      String(s.proyectoId) === String(form.proyectoId) &&
      s.estatus === 'Activo' &&
      s.id !== sprint?.id &&
      datesOverlap(s, form.fechaInicio, form.fechaFin)
    )
    if (conflict) return `Ya existe un sprint activo "${conflict.nombre}" en ese rango de fechas para este proyecto.`
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')

    if (!form.proyectoId)     { setErr('Debes seleccionar un proyecto.'); return }
    if (projectWarning)       { setErr(projectWarning); return }
    if (!form.nombre.trim())  { setErr('El nombre del sprint es obligatorio.'); return }
    if (form.fechaInicio && form.fechaFin && form.fechaFin < form.fechaInicio) {
      setErr('La fecha de fin no puede ser anterior a la fecha de inicio.'); return
    }
    const overlap = getOverlapWarning()
    if (overlap) { setErr(overlap); return }

    setSaving(true)
    try {
      const payload = {
        ...form,
        proyectoId:  Number(form.proyectoId),
        fechaInicio: form.fechaInicio || null,
        fechaFin:    form.fechaFin    || null,
      }
      if (isEdit) {
        await sprintsApi.update(sprint.id, payload)
      } else {
        await sprintsApi.create(payload)
      }
      onSave()
    } catch (e) {
      setErr(e.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const inp = {
    width: '100%', padding: '8px 10px', border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 13, color: 'var(--navy)', outline: 'none',
    background: 'white', boxSizing: 'border-box', fontFamily: 'inherit',
  }
  const lbl = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.05em' }

  const overlapWarn = !err ? getOverlapWarning() : null

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: 14, width: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.2)', padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--navy)', margin: 0 }}>
            {isEdit ? 'Editar Sprint' : 'Nuevo Sprint'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--muted)' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Project selector */}
          <div>
            <label style={lbl}>Proyecto *</label>
            <select
              style={{ ...inp, cursor: projectLocked ? 'default' : 'pointer', background: projectLocked ? 'var(--bg)' : 'white', color: projectLocked ? 'var(--navy)' : 'var(--navy)' }}
              value={form.proyectoId}
              onChange={e => !projectLocked && set('proyectoId', e.target.value)}
              disabled={projectLocked}
            >
              <option value="">Selecciona un proyecto…</option>
              {proyectos.map(p => (
                <option key={p.id} value={p.id} disabled={CLOSED_STATUSES.includes(p.estatus)}>
                  {p.nombre}{CLOSED_STATUSES.includes(p.estatus) ? ` (${p.estatus})` : ''}
                </option>
              ))}
            </select>
            {projectWarning && (
              <div style={{ marginTop: 6, padding: '8px 10px', borderRadius: 7, background: '#F5ECEB', border: '1px solid #D4ABA8', fontSize: 11.5, color: '#A85550', display: 'flex', gap: 6 }}>
                <span>⚠</span> {projectWarning}
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label style={lbl}>Nombre *</label>
            <input style={inp} value={form.nombre} onChange={e => set('nombre', e.target.value)} />
          </div>

          {/* Objective */}
          <div>
            <label style={lbl}>Objetivo</label>
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 56 }} value={form.objetivo} onChange={e => set('objetivo', e.target.value)} placeholder="¿Qué queremos lograr?" />
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Fecha inicio</label>
              <input style={inp} type="date" value={form.fechaInicio} onChange={e => set('fechaInicio', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Fecha fin</label>
              <input style={inp} type="date" value={form.fechaFin}
                min={form.fechaInicio || undefined}
                onChange={e => set('fechaFin', e.target.value)} />
            </div>
          </div>

          {/* Overlap warning */}
          {overlapWarn && (
            <div style={{ padding: '8px 10px', borderRadius: 7, background: '#FFF8EC', border: '1px solid #E8D5A3', fontSize: 11.5, color: '#8A6A1A', display: 'flex', gap: 6 }}>
              <span>⚠</span> {overlapWarn}
            </div>
          )}

          {/* Status */}
          <div>
            <label style={lbl}>Estatus</label>
            <select style={{ ...inp, cursor: 'pointer' }} value={form.estatus} onChange={e => set('estatus', e.target.value)}>
              <option value="Pendiente">Pendiente</option>
              <option value="Activo">Activo</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </div>

          {/* Error */}
          {err && (
            <div style={{ padding: '9px 12px', borderRadius: 8, background: '#F5ECEB', border: '1px solid #D4ABA8', fontSize: 12, color: '#A85550', display: 'flex', gap: 6 }}>
              <span>⚠</span> {err}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 18px', borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving || !!projectWarning} style={{
              padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', fontFamily: 'inherit',
              background: saving || projectWarning ? 'var(--border)' : 'var(--accent)',
              color: saving || projectWarning ? 'var(--muted)' : 'white',
              cursor: saving || projectWarning ? 'not-allowed' : 'pointer',
            }}>
              {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear Sprint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Project Accordion Row ────────────────────────────────────────────────────
function ProjectAccordion({ project, sprints, tareas, onEdit, onDelete, onNewSprint }) {
  const [open, setOpen] = useState(sprints.some(s => s.estatus === 'Activo'))

  const totalSprints   = sprints.length
  const activeSprints  = sprints.filter(s => s.estatus === 'Activo').length
  const pc = PROJECT_STATUS[project.estatus] || PROJECT_STATUS['Planeado']
  const isClosed = CLOSED_STATUSES.includes(project.estatus)

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--white)' }}>
      {/* Project header — clickable */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', borderBottom: open ? '1px solid var(--border-light)' : 'none',
        }}
      >
        {/* Chevron */}
        <svg
          width="14" height="14" fill="none" stroke="var(--muted)" strokeWidth="2" viewBox="0 0 24 24"
          style={{ flexShrink: 0, transition: 'transform .2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--navy)' }}>{project.nombre}</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: pc.bg, color: pc.color }}>
              {project.estatus}
            </span>
            {activeSprints > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'var(--oracle-red-light)', color: 'var(--oracle-red)' }}>
                {activeSprints} activo{activeSprints > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {project.descripcion && (
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {project.descripcion}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>
            {totalSprints} sprint{totalSprints !== 1 ? 's' : ''}
          </span>
          {!isClosed && (
            <button
              onClick={e => { e.stopPropagation(); onNewSprint(project) }}
              style={{
                padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer',
              }}
            >
              + Sprint
            </button>
          )}
        </div>
      </button>

      {/* Sprint list */}
      {open && (
        <div style={{ padding: totalSprints === 0 ? '20px' : '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {totalSprints === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, padding: '8px 0' }}>
              {isClosed
                ? 'Proyecto cerrado — no se pueden crear más sprints.'
                : 'No hay sprints en este proyecto.'}
            </div>
          ) : (
            sprints
              .sort((a, b) => {
                const ord = { 'Activo': 0, 'Pendiente': 1, 'Cerrado': 2 }
                return (ord[a.estatus] ?? 3) - (ord[b.estatus] ?? 3)
              })
              .map(sprint => {
                const sc = SPRINT_STATUS[sprint.estatus] || SPRINT_STATUS['Pendiente']
                const sprintTareas = tareas.filter(t => t.sprintId === sprint.id)
                const total        = sprintTareas.length
                const completadas  = sprintTareas.filter(t => t.estatus === 'Completado').length
                const pct          = total > 0 ? Math.round((completadas / total) * 100) : 0
                const diasRestantes = sprint.fechaFin
                  ? Math.ceil((new Date(sprint.fechaFin) - new Date()) / (1000 * 60 * 60 * 24))
                  : null

                return (
                  <div key={sprint.id} style={{
                    background: 'var(--bg)', borderRadius: 'var(--radius)',
                    padding: '14px 16px', border: '1px solid var(--border-light)',
                    display: 'flex', gap: 16, alignItems: 'flex-start',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Name + badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--navy)' }}>{sprint.nombre}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: sc.bg, color: sc.color }}>
                          {sprint.estatus}
                        </span>
                        {diasRestantes !== null && sprint.estatus === 'Activo' && (
                          <span style={{ fontSize: 10.5, color: diasRestantes <= 3 ? '#A85550' : 'var(--muted)', fontWeight: diasRestantes <= 3 ? 700 : 400 }}>
                            {diasRestantes > 0 ? `${diasRestantes}d restantes` : 'Vencido'}
                          </span>
                        )}
                      </div>

                      {sprint.objetivo && (
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, lineHeight: 1.4 }}>{sprint.objetivo}</div>
                      )}

                      {/* Dates */}
                      <div style={{ display: 'flex', gap: 14, fontSize: 11.5, color: 'var(--muted)', marginBottom: 10 }}>
                        {sprint.fechaInicio && <span>Inicio: {new Date(sprint.fechaInicio).toLocaleDateString('es-MX')}</span>}
                        {sprint.fechaFin    && <span>Fin: {new Date(sprint.fechaFin).toLocaleDateString('es-MX')}</span>}
                        <span>{total} tareas</span>
                      </div>

                      {/* Progress */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11 }}>
                          <span style={{ color: 'var(--muted)' }}>{completadas}/{total} completadas</span>
                          <span style={{ fontWeight: 700, color: pct >= 70 ? '#7A8C5A' : pct >= 40 ? 'var(--accent)' : '#A85550' }}>{pct}%</span>
                        </div>
                        <div style={{ height: 5, background: 'var(--border-light)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 99, transition: 'width .6s ease',
                            width: `${pct}%`,
                            background: pct >= 70 ? '#7A8C5A' : pct >= 40 ? 'var(--accent)' : '#A85550',
                          }} />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
                      <button
                        onClick={() => onEdit(sprint)}
                        style={{ padding: '5px 12px', borderRadius: 6, background: 'var(--white)', border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer', color: 'var(--navy)', fontFamily: 'inherit' }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(sprint)}
                        style={{ padding: '5px 12px', borderRadius: 6, background: '#F5ECEB', border: '1px solid #D4ABA8', fontSize: 12, cursor: 'pointer', color: '#A85550', fontFamily: 'inherit' }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )
              })
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function Sprints() {
  const [sprints,   setSprints]   = useState([])
  const [proyectos, setProyectos] = useState([])
  const [tareas,    setTareas]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(null)   // null | { sprint?, preselectedProject? }
  const [delTarget, setDelTarget] = useState(null)

  const load = () => {
    setLoading(true)
    Promise.all([sprintsApi.getAll(), proyectosApi.getAll(), tareasApi.getAll()])
      .then(([s, p, t]) => {
        setSprints(Array.isArray(s) ? s : [])
        setProyectos(Array.isArray(p) ? p : [])
        setTareas(Array.isArray(t) ? t : [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    if (!delTarget) return
    try {
      await sprintsApi.delete(delTarget.id)
      setDelTarget(null)
      load()
    } catch (e) { console.error(e) }
  }

  // Summary counts
  const totalActivos   = sprints.filter(s => s.estatus === 'Activo').length
  const totalPendiente = sprints.filter(s => s.estatus === 'Pendiente').length
  const totalCerrados  = sprints.filter(s => s.estatus === 'Cerrado').length

  // When opening modal from "+ Sprint" button on project header, preselect project
  const openNewSprint = (project) => {
    setModal({ sprint: project ? { proyectoId: project.id } : null, preselected: !!project })
  }

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)', margin: 0 }}>Sprints</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: '3px 0 0' }}>{sprints.length} sprints en total · {proyectos.length} proyectos</p>
        </div>
        <button
          onClick={() => openNewSprint(null)}
          style={{ padding: '9px 18px', borderRadius: 8, background: 'var(--accent)', color: 'white', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          + Nuevo Sprint
        </button>
      </div>

      {/* Summary pills */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Activos',    value: totalActivos,   bg: 'var(--oracle-red-light)', color: 'var(--oracle-red)' },
          { label: 'Pendientes', value: totalPendiente, bg: '#F1F5F9',                 color: '#374151' },
          { label: 'Cerrados',   value: totalCerrados,  bg: '#F3F4F6',                 color: '#6B7280' },
        ].map(({ label, value, bg, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 20, background: bg, border: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: 15, fontWeight: 800, color }}>{value}</span>
            <span style={{ fontSize: 12, color, opacity: .8 }}>{label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
        </div>
      ) : proyectos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)', fontSize: 14, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          No hay proyectos disponibles.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {proyectos.map(project => (
            <ProjectAccordion
              key={project.id}
              project={project}
              sprints={sprints.filter(s => s.proyectoId === project.id)}
              tareas={tareas}
              onEdit={(sprint) => setModal({ sprint })}
              onDelete={setDelTarget}
              onNewSprint={openNewSprint}
            />
          ))}
        </div>
      )}

      {/* Sprints without project */}
      {(() => {
        const orphans = sprints.filter(s => !s.proyectoId || !proyectos.find(p => p.id === s.proyectoId))
        if (orphans.length === 0) return null
        return (
          <div style={{ marginTop: 10 }}>
            <ProjectAccordion
              project={{ id: null, nombre: 'Sin proyecto asignado', estatus: 'Planeado', descripcion: '' }}
              sprints={orphans}
              tareas={tareas}
              onEdit={(sprint) => setModal({ sprint })}
              onDelete={setDelTarget}
              onNewSprint={() => openNewSprint(null)}
            />
          </div>
        )
      })()}

      {/* Sprint modal */}
      {modal !== null && (
        <SprintModal
          sprint={modal.sprint?.id ? modal.sprint : (modal.sprint?.proyectoId ? { proyectoId: modal.sprint.proyectoId } : null)}
          proyectos={proyectos}
          allSprints={sprints}
          projectLocked={modal.preselected && !modal.sprint?.id}
          onSave={() => { setModal(null); load() }}
          onClose={() => setModal(null)}
        />
      )}

      {/* Delete confirmation */}
      {delTarget && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300,
        }} onClick={e => e.target === e.currentTarget && setDelTarget(null)}>
          <div style={{ background: 'white', borderRadius: 12, padding: 28, width: 400, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>Eliminar sprint</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>
              Vas a eliminar <strong style={{ color: 'var(--navy)' }}>{delTarget.nombre}</strong>.
            </p>
            <p style={{ fontSize: 12, color: '#A85550', marginBottom: 20, padding: '8px 10px', background: '#F5ECEB', borderRadius: 7, lineHeight: 1.5 }}>
              Esta acción eliminará el sprint <strong>y todas sus tareas asociadas</strong>. No se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setDelTarget(null)} style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancelar
              </button>
              <button onClick={handleDelete} style={{ padding: '8px 16px', borderRadius: 8, background: '#A85550', color: 'white', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
