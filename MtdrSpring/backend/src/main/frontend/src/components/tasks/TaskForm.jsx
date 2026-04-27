import { useState, useEffect } from 'react'
import Button from '../common/Button'
import { tareasApi, proyectosApi, sprintsApi, usuariosApi } from '../../services/api'

const DEVELOPER_ROLES = ['Developer']

const INITIAL_TASK = {
  nombre:           '',
  descripcion:      '',
  estatus:          'Backlog',
  prioridad:        'Media',
  asignadoA:        '',
  fechaVencimiento: '',
  storyPoints:      '',
  horasEstimadas:   '',
}

const fieldStyle = {
  width: '100%', height: 36,
  padding: '0 10px',
  border: '1px solid var(--border)',
  borderRadius: 7,
  fontSize: 13, color: 'var(--navy)',
  outline: 'none', background: 'var(--white)',
  transition: 'border-color .15s',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const labelStyle = {
  display: 'block', fontSize: 11.5, fontWeight: 600,
  color: 'var(--slate)', marginBottom: 5,
  textTransform: 'uppercase', letterSpacing: '.05em',
}

function StepBar({ step, isEdit }) {
  if (isEdit) return null
  const steps = ['Proyecto', 'Sprint', 'Tarea']
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 0 }}>
      {steps.map((label, i) => {
        const num   = i + 1
        const done  = step > num
        const active = step === num
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                background: done ? '#16A34A' : active ? 'var(--accent)' : 'var(--bg)',
                color: done || active ? 'white' : 'var(--muted)',
                border: `2px solid ${done ? '#16A34A' : active ? 'var(--accent)' : 'var(--border)'}`,
                transition: 'all .2s',
              }}>
                {done ? '✓' : num}
              </div>
              <span style={{ fontSize: 10.5, fontWeight: active ? 700 : 400, color: active ? 'var(--accent)' : 'var(--muted)', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? '#16A34A' : 'var(--border)', margin: '0 6px', marginBottom: 18, transition: 'background .2s' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function TaskForm({ task, onSuccess, onCancel }) {
  const isEdit = !!task?.id

  // Step state (only for new tasks)
  const [step, setStep] = useState(1)

  // Step 1 — project
  const [proyectos,      setProyectos]      = useState([])
  const [selectedProyecto, setSelectedProyecto] = useState(task?.proyectoId ? String(task.proyectoId) : '')

  // Step 2 — sprint
  const [sprints,        setSprints]        = useState([])
  const [selectedSprint, setSelectedSprint] = useState(task?.sprintId ? String(task.sprintId) : '')
  const [loadingSprints, setLoadingSprints] = useState(false)

  // Step 3 — task fields
  const [form, setForm]     = useState({ ...INITIAL_TASK, ...(task || {}) })
  const [developers, setDevelopers] = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  // Load projects and developers on mount
  useEffect(() => {
    proyectosApi.getAll().then(p => setProyectos(Array.isArray(p) ? p : [])).catch(() => setProyectos([]))
    usuariosApi.getAll()
      .then(u => setDevelopers((Array.isArray(u) ? u : []).filter(u => DEVELOPER_ROLES.includes(u.rol))))
      .catch(() => setDevelopers([]))
  }, [])

  // Load sprints when project is selected
  useEffect(() => {
    if (!selectedProyecto) { setSprints([]); return }
    setLoadingSprints(true)
    sprintsApi.getByProyecto(Number(selectedProyecto))
      .then(s => setSprints(Array.isArray(s) ? s : []))
      .catch(() => setSprints([]))
      .finally(() => setLoadingSprints(false))
  }, [selectedProyecto])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  // Step navigation
  const goStep2 = () => {
    if (!selectedProyecto) { setError('Selecciona un proyecto'); return }
    setError('')
    setStep(2)
  }

  const goStep3 = () => {
    setError('')
    setStep(3)
  }

  const handleSubmit = async () => {
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    setLoading(true)
    setError('')
    try {
      const payload = {
        ...form,
        proyectoId:      selectedProyecto ? Number(selectedProyecto)  : null,
        sprintId:        selectedSprint   ? Number(selectedSprint)    : null,
        asignadoA:       form.asignadoA   ? Number(form.asignadoA)    : null,
        storyPoints:     form.storyPoints     ? Number(form.storyPoints)     : null,
        horasEstimadas:  form.horasEstimadas  ? Number(form.horasEstimadas)  : null,
        fechaVencimiento: form.fechaVencimiento || null,
      }
      const saved = isEdit
        ? await tareasApi.update(task.id, payload)
        : await tareasApi.create(payload)
      onSuccess?.(saved)
    } catch (e) {
      setError(e.message || 'Error al guardar la tarea')
    } finally {
      setLoading(false)
    }
  }

  const proyectoNombre = proyectos.find(p => String(p.id) === selectedProyecto)?.nombre || ''
  const sprintNombre   = sprints.find(s => String(s.id) === selectedSprint)?.nombre || ''

  // ── EDIT MODE: skip wizard, show full form ──────────────────────────────────
  if (isEdit) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Nombre *</label>
          <input style={fieldStyle} value={form.nombre} onChange={e => set('nombre', e.target.value)}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
        <div>
          <label style={labelStyle}>Descripción</label>
          <textarea style={{ ...fieldStyle, height: 72, padding: '8px 10px', resize: 'vertical' }} value={form.descripcion}
            onChange={e => set('descripcion', e.target.value)}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Estado</label>
            <select style={{ ...fieldStyle, cursor: 'pointer' }} value={form.estatus} onChange={e => set('estatus', e.target.value)}>
              <option>Backlog</option><option>En Progreso</option><option>Completado</option><option>Bloqueado</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Prioridad</label>
            <select style={{ ...fieldStyle, cursor: 'pointer' }} value={form.prioridad} onChange={e => set('prioridad', e.target.value)}>
              <option>Alta</option><option>Media</option><option>Baja</option>
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Asignado a</label>
          <select style={{ ...fieldStyle, cursor: 'pointer' }} value={form.asignadoA || ''} onChange={e => set('asignadoA', e.target.value)}>
            <option value="">Sin asignar</option>
            {developers.map(u => <option key={u.id} value={u.id}>{u.fullName || u.email}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Fecha límite</label>
            <input type="date" style={fieldStyle} value={form.fechaVencimiento ? form.fechaVencimiento.slice(0,10) : ''}
              onChange={e => set('fechaVencimiento', e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div>
            <label style={labelStyle}>Story Points</label>
            <input type="number" min="0" max="21" style={fieldStyle} placeholder="1–21" value={form.storyPoints || ''}
              onChange={e => set('storyPoints', e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Horas estimadas</label>
          <input type="number" min="0" style={{ ...fieldStyle, maxWidth: 160 }} placeholder="0" value={form.horasEstimadas || ''}
            onChange={e => set('horasEstimadas', e.target.value)}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
        {error && <p style={{ fontSize: 12, color: '#A85550', padding: '8px 10px', background: '#FEE2E2', borderRadius: 6 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button variant="primary" loading={loading} onClick={handleSubmit}>Actualizar tarea</Button>
        </div>
      </div>
    )
  }

  // ── NEW TASK WIZARD ─────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <StepBar step={step} isEdit={false} />

      {/* STEP 1: Select Project */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Selecciona el proyecto *</label>
            <select
              style={{ ...fieldStyle, height: 40, cursor: 'pointer' }}
              value={selectedProyecto}
              onChange={e => { setSelectedProyecto(e.target.value); setSelectedSprint(''); setError('') }}
            >
              <option value="">— Elige un proyecto —</option>
              {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          {selectedProyecto && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--accent-light)', border: '1px solid #BFDBFE', fontSize: 12.5, color: 'var(--accent)' }}>
              Proyecto seleccionado: <strong>{proyectoNombre}</strong>
            </div>
          )}

          {error && <p style={{ fontSize: 12, color: '#A85550', padding: '8px 10px', background: '#FEE2E2', borderRadius: 6 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button variant="primary" onClick={goStep2} disabled={!selectedProyecto}>Siguiente →</Button>
          </div>
        </div>
      )}

      {/* STEP 2: Select Sprint */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--bg)', fontSize: 12.5, color: 'var(--muted)' }}>
            Proyecto: <strong style={{ color: 'var(--navy)' }}>{proyectoNombre}</strong>
          </div>

          <div>
            <label style={labelStyle}>Selecciona el sprint</label>
            {loadingSprints ? (
              <div style={{ fontSize: 12.5, color: 'var(--muted)', padding: '8px 0' }}>Cargando sprints…</div>
            ) : (
              <select
                style={{ ...fieldStyle, height: 40, cursor: 'pointer' }}
                value={selectedSprint}
                onChange={e => setSelectedSprint(e.target.value)}
              >
                <option value="">— Sin sprint (opcional) —</option>
                {sprints.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} ({s.estatus})
                  </option>
                ))}
              </select>
            )}
            {sprints.length === 0 && !loadingSprints && (
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                No hay sprints para este proyecto. Puedes continuar sin sprint.
              </p>
            )}
          </div>

          {selectedSprint && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--accent-light)', border: '1px solid #BFDBFE', fontSize: 12.5, color: 'var(--accent)' }}>
              Sprint seleccionado: <strong>{sprintNombre}</strong>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="outline" onClick={() => setStep(1)}>← Atrás</Button>
            <Button variant="primary" onClick={goStep3}>Siguiente →</Button>
          </div>
        </div>
      )}

      {/* STEP 3: Task details */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Context bar */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ padding: '4px 10px', borderRadius: 20, background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 11.5, color: 'var(--navy)' }}>
              {proyectoNombre}
            </span>
            {selectedSprint && (
              <span style={{ padding: '4px 10px', borderRadius: 20, background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 11.5, color: 'var(--navy)' }}>
                {sprintNombre}
              </span>
            )}
          </div>

          <div>
            <label style={labelStyle}>Nombre *</label>
            <input style={fieldStyle} placeholder="Nombre de la tarea" value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>

          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea style={{ ...fieldStyle, height: 72, padding: '8px 10px', resize: 'vertical' }}
              placeholder="Describe la tarea..." value={form.descripcion}
              onChange={e => set('descripcion', e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Estado</label>
              <select style={{ ...fieldStyle, cursor: 'pointer' }} value={form.estatus} onChange={e => set('estatus', e.target.value)}>
                <option>Backlog</option><option>En Progreso</option><option>Completado</option><option>Bloqueado</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Prioridad</label>
              <select style={{ ...fieldStyle, cursor: 'pointer' }} value={form.prioridad} onChange={e => set('prioridad', e.target.value)}>
                <option>Alta</option><option>Media</option><option>Baja</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Asignado a</label>
            <select style={{ ...fieldStyle, cursor: 'pointer' }} value={form.asignadoA} onChange={e => set('asignadoA', e.target.value)}>
              <option value="">Sin asignar</option>
              {developers.map(u => <option key={u.id} value={u.id}>{u.fullName || u.email}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Fecha límite</label>
              <input type="date" style={fieldStyle} value={form.fechaVencimiento ? form.fechaVencimiento.slice(0,10) : ''}
                onChange={e => set('fechaVencimiento', e.target.value)}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <label style={labelStyle}>Story Points</label>
              <input type="number" min="0" max="21" style={fieldStyle} placeholder="1–21" value={form.storyPoints}
                onChange={e => set('storyPoints', e.target.value)}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Horas estimadas</label>
            <input type="number" min="0" style={{ ...fieldStyle, maxWidth: 160 }} placeholder="0" value={form.horasEstimadas}
              onChange={e => set('horasEstimadas', e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>

          {error && <p style={{ fontSize: 12, color: '#A85550', padding: '8px 10px', background: '#FEE2E2', borderRadius: 6 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <Button variant="outline" onClick={() => setStep(2)}>← Atrás</Button>
            <Button variant="primary" loading={loading} onClick={handleSubmit}>Crear tarea</Button>
          </div>
        </div>
      )}
    </div>
  )
}
