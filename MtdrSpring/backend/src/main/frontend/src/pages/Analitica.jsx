import { useState, useEffect } from 'react'
import Card from '../components/common/Card'
import { tareasApi, sprintsApi, proyectosApi, usuariosApi } from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'

//colores
const DEV_COLORS = [
  '#C74634', '#374151', '#7A8C5A', '#A85550',
  '#64748B', '#9E3527', '#4B5563', '#5A6E3E',
]

const SECTION = ({ title, subtitle, children }) => (
  <Card style={{ marginBottom: 0 }}>
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', marginBottom: 3 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.4 }}>{subtitle}</div>}
    </div>
    {children}
  </Card>
)

const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,.1)', fontSize: 12 }}>
      <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.fill, flexShrink: 0 }} />
          <span style={{ color: '#6B7280' }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{p.value}{unit}</span>
        </div>
      ))}
    </div>
  )
}

const median = (arr) => {
  if (!arr.length) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : +((sorted[mid - 1] + sorted[mid]) / 2).toFixed(1)
}

export default function Analitica() {
  const [tareas,         setTareas]         = useState([])
  const [sprints,        setSprints]        = useState([])
  const [proyectos,      setProyectos]      = useState([])
  const [usuarios,       setUsuarios]       = useState([])
  const [loading,        setLoading]        = useState(true)
  const [refreshKey,     setRefreshKey]     = useState(0)
  const [filterProyecto, setFilterProyecto] = useState('ALL')
  const [filterSprint,   setFilterSprint]   = useState('ALL')
  const [filterDev,      setFilterDev]      = useState('ALL')

  useEffect(() => {
    setLoading(true)
    Promise.all([tareasApi.getAll(), sprintsApi.getAll(), proyectosApi.getAll(), usuariosApi.getAll()])
      .then(([t, s, p, u]) => { setTareas(t); setSprints(s); setProyectos(p); setUsuarios(u) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [refreshKey])

  const allDevs = usuarios.filter(u => ['Developer', 'Scrum Master', 'Product Owner'].includes(u.rol))
  const getName = (u) => (u.fullName || u.email || `Dev ${u.id}`).split(' ')[0]

  // scope por proyecto
  const sprintsScope = (filterProyecto === 'ALL'
    ? sprints
    : sprints.filter(s => String(s.proyectoId) === filterProyecto)
  ).slice().sort((a, b) => new Date(a.fechaInicio || 0) - new Date(b.fechaInicio || 0))

  const tareasScope = filterProyecto === 'ALL'
    ? tareas
    : tareas.filter(t => String(t.proyectoId) === filterProyecto)

  // scope por sprint y dev (para KPIs y gráficas)
  const tareasFiltered = tareasScope
    .filter(t => filterSprint === 'ALL' || String(t.sprintId) === filterSprint)
    .filter(t => filterDev    === 'ALL' || String(t.asignadoA) === filterDev)

  // solo usuarios con al menos una tarea en el scope actual
  const devsScope = allDevs.filter(dev =>
    tareasScope.some(t => Number(t.asignadoA) === Number(dev.id))
  ).slice(0, 8)

  // ── 6 KPIs mandatory ──────────────────────────────────────────
  const total       = tareasFiltered.length
  const completadas = tareasFiltered.filter(t => t.estatus === 'Completado').length
  const bloqueadas  = tareasFiltered.filter(t => t.estatus === 'Bloqueado').length
  const tasaComp    = total > 0 ? Math.round((completadas / total) * 100) : 0

  const totalRealHours = tareasFiltered.reduce((s, t) => s + (t.horasReales || 0), 0)

  const devsConTareas = allDevs.filter(dev =>
    tareasFiltered.some(t => Number(t.asignadoA) === Number(dev.id))
  )
  const numDevs = devsConTareas.length || 1

  const avgTaskDev  = +(completadas / numDevs).toFixed(1)
  const avgHoursDev = +(totalRealHours / numDevs).toFixed(1)

  const tasksPerDev = devsConTareas.map(dev =>
    tareasFiltered.filter(t => Number(t.asignadoA) === Number(dev.id) && t.estatus === 'Completado').length
  )
  const hoursPerDev = devsConTareas.map(dev =>
    tareasFiltered.filter(t => Number(t.asignadoA) === Number(dev.id))
                  .reduce((s, t) => s + (t.horasReales || 0), 0)
  )
  const medianTaskDev  = median(tasksPerDev)
  const medianHoursDev = median(hoursPerDev)

  const avgHoras = total > 0 ? (totalRealHours / total).toFixed(1) : 0

  //tareas completadas por usuario/sprint
  const tareasCompletadasData = sprintsScope.map(sprint => {
    const row = { sprint: sprint.nombre }
    devsScope.forEach(dev => {
      row[getName(dev)] = tareasFiltered.filter(
        t => t.sprintId === sprint.id &&
             Number(t.asignadoA) === Number(dev.id) &&
             t.estatus === 'Completado'
      ).length
    })
    return row
  }).filter(row => devsScope.some(d => row[getName(d)] > 0))

  // story points completados por developer/sprint
  const spData = sprintsScope.map(sprint => {
    const row = { sprint: sprint.nombre }
    devsScope.forEach(dev => {
      row[getName(dev)] = tareasFiltered
        .filter(t => t.sprintId === sprint.id &&
                     Number(t.asignadoA) === Number(dev.id) &&
                     t.estatus === 'Completado')
        .reduce((s, t) => s + (t.storyPoints || 0), 0)
    })
    return row
  }).filter(row => devsScope.some(d => row[getName(d)] > 0))

  //grafica de pie - estado de tareas
  const statusPie = [
    { name: 'Completado',  value: tareasFiltered.filter(t => t.estatus === 'Completado').length,  color: '#7A8C5A' },
    { name: 'En Progreso', value: tareasFiltered.filter(t => t.estatus === 'En Progreso').length, color: '#374151' },
    { name: 'Backlog',     value: tareasFiltered.filter(t => t.estatus === 'Backlog').length,     color: '#94A3B8' },
    { name: 'Bloqueado',   value: tareasFiltered.filter(t => t.estatus === 'Bloqueado').length,   color: '#A85550' },
  ].filter(d => d.value > 0)

  // horas reales por usuario — respeta todos los filtros
  const devsAllKeys = devsScope.map(getName)
  const horasXSprintData = sprintsScope.map(sprint => {
    const row = { sprint: sprint.nombre }
    devsScope.forEach(dev => {
      row[getName(dev)] = tareasFiltered
        .filter(t => t.sprintId === sprint.id && Number(t.asignadoA) === Number(dev.id))
        .reduce((s, t) => s + (t.horasReales || 0), 0)
    })
    return row
  })

  //grafica - avance por proyecto
  const proyectosScope = filterProyecto === 'ALL'
    ? proyectos
    : proyectos.filter(p => String(p.id) === filterProyecto)

  const proyectoData = proyectosScope.map(p => {
    const pTasks = tareas.filter(t => t.proyectoId === p.id)
    const done   = pTasks.filter(t => t.estatus === 'Completado').length
    return {
      proyecto: p.nombre.length > 18 ? p.nombre.slice(0, 16) + '…' : p.nombre,
      Completadas: done,
      Restantes: pTasks.length - done,
      total: pTasks.length,
    }
  }).filter(p => p.total > 0)

  const devKeys = devsScope.map(getName)
  const hasSprintData = tareasCompletadasData.length > 0

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)', margin: 0 }}>Analítica</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: '4px 0 0' }}>
            Análisis comparativo del equipo por sprint — productividad, horas y avance de proyectos.
          </p>
        </div>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
            border: '1px solid var(--border)', background: 'white', color: 'var(--navy)',
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
            transition: 'all .15s',
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--bg)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white' }}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M1 4v6h6M23 20v-6h-6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {loading ? 'Cargando…' : 'Actualizar datos'}
        </button>
      </div>

      {/* ── Dashboard 1 KPI — formato mandatory ── */}
      <Card style={{ marginBottom: 24, padding: '16px 20px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginBottom: 14 }}>
          Análisis de Tasks / Hours
        </div>

        {/* fila de 6 métricas + 2 filtros */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr) auto auto', gap: 0, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          {[
            { label: 'Completed Tasks',   value: completadas,      color: 'var(--navy)' },
            { label: 'Total Real Hours',  value: `${totalRealHours}h`, color: 'var(--navy)' },
            { label: 'Avg Task/Dev',      value: avgTaskDev,       color: 'var(--navy)' },
            { label: 'Avg Hours/Dev',     value: `${avgHoursDev}h`, color: 'var(--navy)' },
            { label: 'Median Task/Dev',   value: medianTaskDev,    color: 'var(--navy)' },
            { label: 'Median Hours/Dev',  value: `${medianHoursDev}h`, color: 'var(--navy)' },
          ].map(({ label, value, color }, i) => (
            <div key={label} style={{
              padding: '12px 14px', textAlign: 'center',
              borderRight: '1px solid var(--border)',
              background: i % 2 === 0 ? 'white' : '#FAFAFA',
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4, whiteSpace: 'nowrap' }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
            </div>
          ))}

          {/* Filtro 1: All Sprints */}
          <div style={{ padding: '10px 12px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, background: '#F8F9FB' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Sprint</div>
            <select
              value={filterSprint}
              onChange={e => setFilterSprint(e.target.value)}
              style={{ height: 28, padding: '0 6px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11.5, cursor: 'pointer', outline: 'none', background: 'white', color: 'var(--navy)', minWidth: 100 }}
            >
              <option value="ALL">All Sprints</option>
              {sprintsScope.map(s => <option key={s.id} value={String(s.id)}>{s.nombre}</option>)}
            </select>
          </div>

          {/* Filtro 2: All Devs */}
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, background: '#F8F9FB' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Dev</div>
            <select
              value={filterDev}
              onChange={e => setFilterDev(e.target.value)}
              style={{ height: 28, padding: '0 6px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11.5, cursor: 'pointer', outline: 'none', background: 'white', color: 'var(--navy)', minWidth: 100 }}
            >
              <option value="ALL">All Devs</option>
              {devsScope.map(d => <option key={d.id} value={String(d.id)}>{getName(d)}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {loading && (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>Cargando datos…</div>
      )}

      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* filtro de proyecto para las dos primeras graficas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Proyecto
            </span>
            <select
              value={filterProyecto}
              onChange={e => setFilterProyecto(e.target.value)}
              style={{ height: 32, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12.5, cursor: 'pointer', outline: 'none', background: 'white', color: 'var(--navy)' }}
            >
              <option value="ALL">Todos los proyectos</option>
              {proyectos.map(p => <option key={p.id} value={String(p.id)}>{p.nombre}</option>)}
            </select>
            {filterProyecto !== 'ALL' && (
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                {sprintsScope.length} sprint{sprintsScope.length !== 1 ? 's' : ''} · {devsScope.length} desarrollador{devsScope.length !== 1 ? 'es' : ''}
              </span>
            )}
          </div>

          {/* fila 1 — Tasks y Story Points */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            <SECTION
              title="Tareas completadas por desarrollador / sprint"
              subtitle="Análisis comparativo: cuántas tareas terminó cada developer en cada sprint."
            >
              {!hasSprintData ? (
                <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, padding: '30px 0' }}>Sin datos de sprints completados</div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={tareasCompletadasData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="sprint" tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip unit=" tareas" />} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    {devKeys.map((name, i) => (
                      <Bar key={name} dataKey={name} fill={DEV_COLORS[i % DEV_COLORS.length]} radius={[3, 3, 0, 0]} maxBarSize={28} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </SECTION>

            <SECTION
              title="Story Points completados por desarrollador / sprint"
              subtitle="Contribución individual: cuántos story points completó cada developer en cada sprint."
            >
              {spData.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, padding: '30px 0' }}>Sin story points completados</div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={spData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="sprint" tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip unit=" pts" />} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    {devKeys.map((name, i) => (
                      <Bar key={name} dataKey={name} fill={DEV_COLORS[i % DEV_COLORS.length]} radius={[3, 3, 0, 0]} maxBarSize={28} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </SECTION>
          </div>

          {/* fila 2 — Horas y distribución */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            <SECTION
              title="Horas reales por desarrollador / sprint"
              subtitle="Total de horas reales registradas por cada desarrollador en todos los sprints."
            >
              {horasXSprintData.every(row => devsScope.every(d => !row[getName(d)])) ? (
                <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, padding: '30px 0' }}>Sin horas registradas</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={horasXSprintData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="sprint" tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip unit=" h" />} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    {devsAllKeys.map((name, i) => (
                      <Bar key={name} dataKey={name} fill={DEV_COLORS[i % DEV_COLORS.length]} radius={[3, 3, 0, 0]} maxBarSize={28} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </SECTION>

            {/* distribución de estados - pie */}
            <SECTION
              title="Distribución de tareas por estado"
              subtitle="Proporción actual de tareas en cada etapa del flujo de trabajo."
            >
              {statusPie.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, padding: '30px 0' }}>Sin tareas</div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <ResponsiveContainer width="55%" height={220}>
                    <PieChart>
                      <Pie data={statusPie} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                        dataKey="value" paddingAngle={3}>
                        {statusPie.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [`${v} tareas`, n]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {statusPie.map(d => (
                      <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: 'var(--navy)', flex: 1 }}>{d.name}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{d.value}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 6, marginTop: 2 }}>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>Total: <strong style={{ color: 'var(--navy)' }}>{tareasFiltered.length}</strong> tareas</div>
                    </div>
                  </div>
                </div>
              )}
            </SECTION>
          </div>

          {/* avance por proyecto - barras horizontales */}
          {proyectoData.length > 0 && (
            <SECTION
              title="Avance por proyecto"
              subtitle="Tareas completadas vs. pendientes en cada proyecto — barra completa = 100% terminado."
            >
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={proyectoData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} allowDecimals={false} />
                  <YAxis type="category" dataKey="proyecto" tick={{ fontSize: 11, fill: '#6B7280' }} width={120} />
                  <Tooltip content={<CustomTooltip unit=" tareas" />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Completadas" stackId="a" fill="#7A8C5A" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Restantes"   stackId="a" fill="#E5E7EB" radius={[3, 3, 3, 3]} />
                </BarChart>
              </ResponsiveContainer>
            </SECTION>
          )}

          

        </div>
      )}
    </div>
  )
}
