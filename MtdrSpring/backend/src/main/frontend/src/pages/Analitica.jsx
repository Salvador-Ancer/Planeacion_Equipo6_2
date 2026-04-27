import { useState, useEffect } from 'react'
import Card from '../components/common/Card'
import { tareasApi, sprintsApi, proyectosApi } from '../services/api'

function Bar({ label, value, max, color, subtitle }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <span style={{ fontSize: 13, color: 'var(--navy)', fontWeight: 600 }}>{label}</span>
          {subtitle && <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 6 }}>{subtitle}</span>}
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>{value}</span>
      </div>
      <div style={{ height: 8, borderRadius: 99, background: 'var(--border-light)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width .8s ease' }} />
      </div>
    </div>
  )
}

function KpiCard({ value, label, sublabel, color }) {
  return (
    <Card style={{ textAlign: 'center', padding: '18px 14px' }}>
      <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--navy)', marginTop: 6 }}>{label}</div>
      {sublabel && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, lineHeight: 1.4 }}>{sublabel}</div>}
    </Card>
  )
}

export default function Analitica() {
  const [tareas,    setTareas]    = useState([])
  const [sprints,   setSprints]   = useState([])
  const [proyectos, setProyectos] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([tareasApi.getAll(), sprintsApi.getAll(), proyectosApi.getAll()])
      .then(([t, s, p]) => { setTareas(t); setSprints(s); setProyectos(p) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const total        = tareas.length
  const completadas  = tareas.filter(t => t.estatus === 'Completado').length
  const enProgreso   = tareas.filter(t => t.estatus === 'En Progreso').length
  const bloqueadas   = tareas.filter(t => t.estatus === 'Bloqueado').length
  const backlog      = tareas.filter(t => t.estatus === 'Backlog').length
  const tasaComp     = total > 0 ? Math.round((completadas / total) * 100) : 0
  const avgHoras     = total > 0 ? (tareas.reduce((s, t) => s + (t.horasReales || 0), 0) / total).toFixed(1) : 0

  const maxEstatus   = Math.max(completadas, enProgreso, bloqueadas, backlog, 1)

  const priorityCounts = {
    Alta:  tareas.filter(t => t.prioridad === 'Alta').length,
    Media: tareas.filter(t => t.prioridad === 'Media').length,
    Baja:  tareas.filter(t => t.prioridad === 'Baja').length,
  }
  const maxPriority = Math.max(...Object.values(priorityCounts), 1)

  const sprintVelocity = sprints.map(sprint => {
    const pts = tareas
      .filter(t => t.sprintId === sprint.id && t.estatus === 'Completado')
      .reduce((s, t) => s + (t.storyPoints || 0), 0)
    const cnt = tareas.filter(t => t.sprintId === sprint.id && t.estatus === 'Completado').length
    return { nombre: sprint.nombre, pts, cnt }
  }).filter(s => s.cnt > 0)
  const maxPts = Math.max(...sprintVelocity.map(s => s.pts), 1)

  const projectCompletion = proyectos.map(p => {
    const pTasks   = tareas.filter(t => t.proyectoId === p.id)
    const done     = pTasks.filter(t => t.estatus === 'Completado').length
    const pct      = pTasks.length > 0 ? Math.round((done / pTasks.length) * 100) : 0
    return { nombre: p.nombre, done, total: pTasks.length, pct }
  }).filter(p => p.total > 0)

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)', margin: 0 }}>Analítica</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '4px 0 0' }}>
          Resumen del estado general del proyecto — distribución de tareas, avance por sprint y rendimiento por proyecto.
        </p>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        <KpiCard value={total}        label="Tareas totales"      sublabel="Todas las tareas registradas en el sistema"    color="var(--navy)" />
        <KpiCard value={`${tasaComp}%`} label="Completadas"       sublabel={`${completadas} de ${total} tareas finalizadas`} color="#7A8C5A"   />
        <KpiCard value={sprints.length} label="Sprints totales"   sublabel="Sprints creados en todos los proyectos"         color="var(--accent)" />
        <KpiCard value={`${avgHoras}h`} label="Horas prom. por tarea" sublabel="Promedio de horas reales registradas"      color="#A85550"   />
      </div>

      {loading && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Cargando datos…</div>
      )}

      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* Estado de tareas */}
          <Card>
            <Card.Header
              title="Estado de las tareas"
              subtitle="¿En qué etapa está cada tarea? Muestra cuántas están pendientes, avanzando o terminadas."
            />
            {total === 0
              ? <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '20px 0' }}>Sin datos</div>
              : <>
                  <Bar label="Completado"  value={completadas} max={maxEstatus} color="#7A8C5A" subtitle="Finalizadas" />
                  <Bar label="En Progreso" value={enProgreso}  max={maxEstatus} color="var(--accent)" subtitle="En desarrollo activo" />
                  <Bar label="Bloqueado"   value={bloqueadas}  max={maxEstatus} color="#A85550" subtitle="Requieren atención" />
                  <Bar label="Backlog"     value={backlog}     max={maxEstatus} color="#94A3B8" subtitle="Aún sin iniciar" />
                </>
            }
          </Card>

          {/* Prioridad */}
          <Card>
            <Card.Header
              title="Distribución por prioridad"
              subtitle="¿Qué tan urgentes son las tareas? Ayuda a identificar si hay demasiadas tareas críticas acumuladas."
            />
            {total === 0
              ? <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '20px 0' }}>Sin datos</div>
              : <>
                  <Bar label="Alta"  value={priorityCounts.Alta}  max={maxPriority} color="#A85550" subtitle="Urgentes o críticas" />
                  <Bar label="Media" value={priorityCounts.Media} max={maxPriority} color="var(--accent)" subtitle="Importantes pero no urgentes" />
                  <Bar label="Baja"  value={priorityCounts.Baja}  max={maxPriority} color="#7A8C5A" subtitle="Pueden esperar" />
                </>
            }
          </Card>

          {/* Velocidad por sprint */}
          <Card>
            <Card.Header
              title="Velocidad por sprint"
              subtitle="Story points completados en cada sprint. Indica qué tan productivo fue el equipo en cada ciclo de trabajo."
            />
            {sprintVelocity.length === 0
              ? <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '20px 0' }}>No hay sprints con tareas completadas aún</div>
              : sprintVelocity.map(s => (
                  <Bar key={s.nombre} label={s.nombre} value={s.pts} max={maxPts} color="var(--accent)"
                    subtitle={`${s.cnt} tarea${s.cnt !== 1 ? 's' : ''} completada${s.cnt !== 1 ? 's' : ''}`} />
                ))
            }
          </Card>

          {/* Avance por proyecto */}
          <Card>
            <Card.Header
              title="Avance por proyecto"
              subtitle="Porcentaje de tareas completadas en cada proyecto. 100% significa que todas sus tareas están finalizadas."
            />
            {projectCompletion.length === 0
              ? <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '20px 0' }}>Sin datos de proyectos</div>
              : projectCompletion.map(p => (
                  <Bar
                    key={p.nombre}
                    label={p.nombre}
                    value={`${p.pct}%`}
                    max={100}
                    color={p.pct >= 70 ? '#7A8C5A' : p.pct >= 40 ? 'var(--accent)' : '#A85550'}
                    subtitle={`${p.done} de ${p.total} tareas`}
                  />
                ))
            }
          </Card>

          {/* Tareas bloqueadas */}
          {bloqueadas > 0 && (
            <Card style={{ gridColumn: '1 / -1', borderLeft: '3px solid #A85550' }}>
              <Card.Header
                title="Tareas bloqueadas"
                subtitle={`${bloqueadas} tarea${bloqueadas > 1 ? 's están' : ' está'} bloqueada${bloqueadas > 1 ? 's' : ''} — alguien las reportó como impedidas para avanzar. Requieren revisión inmediata.`}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {tareas.filter(t => t.estatus === 'Bloqueado').map(t => (
                  <div key={t.id} style={{ fontSize: 12, padding: '5px 14px', borderRadius: 20, background: '#F5ECEB', color: '#A85550', fontWeight: 500, border: '1px solid #D4ABA8' }}>
                    {t.nombre}
                  </div>
                ))}
              </div>
            </Card>
          )}

        </div>
      )}
    </div>
  )
}
