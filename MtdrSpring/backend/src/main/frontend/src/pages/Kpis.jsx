import { useState, useEffect } from 'react'
import Card from '../components/common/Card'
import { kpisApi, proyectosApi, sprintsApi } from '../services/api'

const METRIC_COLOR = (actual, meta) => {
  if (!meta || meta === 0) return { text: 'var(--muted)', bg: 'var(--border-light)' }
  const pct = (actual / meta) * 100
  if (pct >= 90) return { text: '#7A8C5A', bg: '#F0F2EC' }
  if (pct >= 60) return { text: '#374151', bg: '#F1F5F9' }
  return { text: '#A85550', bg: '#F5ECEB' }
}

export default function Kpis() {
  const [kpis, setKpis]           = useState([])
  const [proyectos, setProyectos] = useState([])
  const [sprints, setSprints]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [filterProyecto, setFilterProyecto] = useState('ALL')
  const [filterSprint, setFilterSprint]     = useState('ALL')

  useEffect(() => {
    Promise.all([kpisApi.getAll(), proyectosApi.getAll(), sprintsApi.getAll()])
      .then(([k, p, s]) => { setKpis(k); setProyectos(p); setSprints(s) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = kpis.filter(k => {
    if (filterProyecto !== 'ALL' && String(k.proyectoId) !== filterProyecto) return false
    if (filterSprint   !== 'ALL' && String(k.sprintId)   !== filterSprint)   return false
    return true
  })

  const proyNom   = (id) => proyectos.find(p => p.id === id)?.nombre || `Proyecto ${id}`
  const sprintNom = (id) => sprints.find(s => s.id === id)?.nombre   || `Sprint ${id}`

  const avgActual  = filtered.length > 0
    ? (filtered.reduce((s, k) => s + (k.valorActual || 0), 0) / filtered.length).toFixed(1)
    : 0
  const enObjetivo = filtered.filter(k => k.valorMeta && k.valorActual >= k.valorMeta * 0.9).length

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy)', marginBottom: 4 }}>Métricas</h2>
        <p style={{ fontSize: 12.5, color: 'var(--muted)' }}>
          Seguimiento de indicadores clave de desempeño del equipo y los proyectos.
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        <Card style={{ padding: '18px 16px' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--navy)', lineHeight: 1 }}>{filtered.length}</div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--navy)', marginTop: 6 }}>Total KPIs</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>Indicadores registrados en el sistema</div>
        </Card>
        <Card style={{ padding: '18px 16px' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{avgActual}</div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--navy)', marginTop: 6 }}>Valor promedio</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>Promedio del valor actual entre todos los KPIs mostrados</div>
        </Card>
        <Card style={{ padding: '18px 16px' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#7A8C5A', lineHeight: 1 }}>{enObjetivo}</div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--navy)', marginTop: 6 }}>En objetivo</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>KPIs cuyo valor actual es ≥ 90% del valor objetivo</div>
        </Card>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={filterProyecto} onChange={e => setFilterProyecto(e.target.value)}
          style={{ height: 34, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12.5, cursor: 'pointer', outline: 'none', background: 'white' }}>
          <option value="ALL">Todos los proyectos</option>
          {proyectos.map(p => <option key={p.id} value={String(p.id)}>{p.nombre}</option>)}
        </select>
        <select value={filterSprint} onChange={e => setFilterSprint(e.target.value)}
          style={{ height: 34, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12.5, cursor: 'pointer', outline: 'none', background: 'white' }}>
          <option value="ALL">Todos los sprints</option>
          {sprints.map(s => <option key={s.id} value={String(s.id)}>{s.nombre}</option>)}
        </select>

        {/* Color legend */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 14, alignItems: 'center' }}>
          {[
            { color: '#7A8C5A', bg: '#F0F2EC', label: '≥ 90% meta' },
            { color: '#374151', bg: '#F1F5F9', label: '60–89% meta' },
            { color: '#A85550', bg: '#F5ECEB', label: '< 60% meta' },
          ].map(({ color, bg, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: bg, border: `1.5px solid ${color}`, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Cargando KPIs…</div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
          No hay KPIs disponibles
        </div>
      )}

      {/* KPI grid */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {filtered.map((kpi, i) => {
            const { text, bg } = METRIC_COLOR(kpi.valorActual || 0, kpi.valorMeta)
            const pct = kpi.valorMeta && kpi.valorMeta > 0
              ? Math.min(100, Math.round((kpi.valorActual || 0) / kpi.valorMeta * 100))
              : 0
            return (
              <Card key={kpi.id} style={{ animation: `fadeIn .25s ease ${i * 0.05}s both` }}>
                {/* Name + description */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>
                    {kpi.nombre || `KPI #${kpi.id}`}
                  </div>
                  {kpi.descripcion && (
                    <div style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.4 }}>{kpi.descripcion}</div>
                  )}
                </div>

                {/* Value row */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 26, fontWeight: 800, color: text, lineHeight: 1 }}>
                    {kpi.valorActual ?? '—'}{kpi.unidad ? ` ${kpi.unidad}` : ''}
                  </span>
                  {kpi.valorMeta != null && (
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                      de {kpi.valorMeta}{kpi.unidad ? ` ${kpi.unidad}` : ''} objetivo
                    </span>
                  )}
                  <span style={{
                    marginLeft: 'auto', fontSize: 11, fontWeight: 700,
                    padding: '3px 10px', borderRadius: 20, background: bg, color: text,
                  }}>
                    {kpi.valorMeta ? `${pct}%` : 'Sin meta'}
                  </span>
                </div>

                {/* Progress bar */}
                {kpi.valorMeta != null && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ height: 6, borderRadius: 99, background: 'var(--border-light)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${pct}%`,
                        background: text, borderRadius: 99, transition: 'width .8s ease',
                      }} />
                    </div>
                  </div>
                )}

                {/* Footer tags */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {kpi.proyectoId && (
                    <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 20, background: 'var(--border-light)', color: 'var(--muted)' }}>
                      {proyNom(kpi.proyectoId)}
                    </span>
                  )}
                  {kpi.sprintId && (
                    <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 20, background: 'var(--border-light)', color: 'var(--muted)' }}>
                      {sprintNom(kpi.sprintId)}
                    </span>
                  )}
                  {kpi.fechaMedicion && (
                    <span style={{ fontSize: 10.5, color: 'var(--muted)', marginLeft: 'auto' }}>
                      {new Date(kpi.fechaMedicion).toLocaleDateString('es-MX')}
                    </span>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
