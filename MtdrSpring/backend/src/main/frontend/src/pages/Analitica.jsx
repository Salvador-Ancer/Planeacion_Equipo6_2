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

export default function Analitica() {
  const [tareas,         setTareas]         = useState([])
  const [sprints,        setSprints]        = useState([])
  const [proyectos,      setProyectos]      = useState([])
  const [usuarios,       setUsuarios]       = useState([])
  const [loading,        setLoading]        = useState(true)
  const [refreshKey,     setRefreshKey]     = useState(0)
  const [filterProyecto, setFilterProyecto] = useState('ALL')

  useEffect(() => {
    setLoading(true)
    Promise.all([tareasApi.getAll(), sprintsApi.getAll(), proyectosApi.getAll(), usuariosApi.getAll()])
      .then(([t, s, p, u]) => { setTareas(t); setSprints(s); setProyectos(p); setUsuarios(u) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [refreshKey])

  const allDevs = usuarios.filter(u => ['Developer', 'Scrum Master', 'Product Owner'].includes(u.rol))
  const getName = (u) => (u.fullName || u.email || `Dev ${u.id}`).split(' ')[0]

  // KPI summary (global)
  const total       = tareas.length
  const completadas = tareas.filter(t => t.estatus === 'Completado').length
  const bloqueadas  = tareas.filter(t => t.estatus === 'Bloqueado').length
  const tasaComp    = total > 0 ? Math.round((completadas / total) * 100) : 0
  const avgHoras    = total > 0
    ? (tareas.reduce((s, t) => s + (t.horasReales || 0), 0) / total).toFixed(1)
    : 0

  // graficas 1 y 2
  const sprintsScope = (filterProyecto === 'ALL'
    ? sprints
    : sprints.filter(s => String(s.proyectoId) === filterProyecto)
  ).slice().sort((a, b) => new Date(a.fechaInicio || 0) - new Date(b.fechaInicio || 0))

  const tareasScope = filterProyecto === 'ALL'
    ? tareas
    : tareas.filter(t => String(t.proyectoId) === filterProyecto)

  // solo usuarios con al menos una tarea en el scope actual
  const devsScope = allDevs.filter(dev =>
    tareasScope.some(t => Number(t.asignadoA) === Number(dev.id))
  ).slice(0, 8)

  //tareas completadas por usuario/sprint
  const tareasCompletadasData = sprintsScope.map(sprint => {
    const row = { sprint: sprint.nombre }
    devsScope.forEach(dev => {
      row[getName(dev)] = tareasScope.filter(
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
      row[getName(dev)] = tareasScope
        .filter(t => t.sprintId === sprint.id &&
                     Number(t.asignadoA) === Number(dev.id) &&
                     t.estatus === 'Completado')
        .reduce((s, t) => s + (t.storyPoints || 0), 0)
    })
    return row
  }).filter(row => devsScope.some(d => row[getName(d)] > 0))

  //grafica de pie - estado de tareas 
  const statusPie = [
    { name: 'Completado',  value: tareasScope.filter(t => t.estatus === 'Completado').length,  color: '#7A8C5A' },
    { name: 'En Progreso', value: tareasScope.filter(t => t.estatus === 'En Progreso').length, color: '#374151' },
    { name: 'Backlog',     value: tareasScope.filter(t => t.estatus === 'Backlog').length,     color: '#94A3B8' },
    { name: 'Bloqueado',   value: tareasScope.filter(t => t.estatus === 'Bloqueado').length,   color: '#A85550' },
  ].filter(d => d.value > 0)

  // horas reales por usuario — respeta el filtro de proyecto
  const devsAllKeys = devsScope.map(getName)
  const horasXSprintData = sprintsScope.map(sprint => {
    const row = { sprint: sprint.nombre }
    devsScope.forEach(dev => {
      row[getName(dev)] = tareasScope
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

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { value: total,          label: 'Tareas totales',       sub: 'Registradas en el sistema',              color: 'var(--navy)' },
          { value: `${tasaComp}%`, label: 'Tasa de completitud',  sub: `${completadas} de ${total} finalizadas`, color: '#7A8C5A' },
          { value: sprints.length, label: 'Sprints totales',      sub: 'En todos los proyectos',                 color: 'var(--accent)' },
          { value: `${avgHoras}h`, label: 'Horas prom./tarea',    sub: 'Promedio de horas reales',               color: '#A85550' },
        ].map(({ value, label, sub, color }) => (
          <Card key={label} style={{ textAlign: 'center', padding: '18px 14px' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--navy)', marginTop: 6 }}>{label}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{sub}</div>
          </Card>
        ))}
      </div>

      {loading && (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>Cargando datos…</div>
      )}

      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Filtro de proyecto para las dos primeras gráficas */}
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

          {/* primera columna */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* tareas completadas por dev/sprint */}
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

            {/* Story Points completados por dev/sprint */}
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

          {/* segunda columna */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Horas reales por usuario/sprint - todos los sprints */}
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

            {/* Distribución de estados - pie */}
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
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>Total: <strong style={{ color: 'var(--navy)' }}>{tareasScope.length}</strong> tareas</div>
                    </div>
                  </div>
                </div>
              )}
            </SECTION>
          </div>

          {/* Avance por proyecto - barras apiladas */}
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
