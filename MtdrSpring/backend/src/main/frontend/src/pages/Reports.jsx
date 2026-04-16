import { useState, useEffect } from 'react'
import Card from '../components/common/Card'
import { reportsApi, kpisApi } from '../services/api'

//Bar chart 
function BarChart({ data, height = 160, color = 'var(--accent)' }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height, paddingTop: 10 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--navy)' }}>{d.value}</span>
          <div style={{
            width: '100%', borderRadius: '4px 4px 0 0',
            background: color,
            height: `${(d.value / max) * (height - 30)}px`,
            opacity: i === data.length - 1 ? 1 : 0.5 + (i / data.length) * 0.5,
            transition: 'height .6s ease',
            minHeight: 4,
          }} />
          <span style={{ fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

//Donut chart (SVG)
function DonutChart({ segments, size = 100 }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1
  const r = 36, cx = 50, cy = 50, stroke = 10
  let offset = 0

  const circles = segments.map((s, i) => {
    const pct = s.value / total
    const dash = pct * 2 * Math.PI * r
    const gap = 2 * Math.PI * r - dash
    const el = (
      <circle key={i} cx={cx} cy={cy} r={r}
        fill="none" stroke={s.color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset}
        strokeLinecap="butt"
        style={{ transition: 'stroke-dasharray .6s ease' }}
      />
    )
    offset += dash
    return el
  })

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border-light)" strokeWidth={stroke} />
      {circles}
    </svg>
  )
}

//INFORMACION DE REFERENCIA
// velocity data (mock)
const VELOCITY_DATA = [
  { label: 'S-1', value: 28 },
  { label: 'S-2', value: 34 },
  { label: 'S-3', value: 30 },
  { label: 'S-4', value: 42 },
  { label: 'S-5', value: 38 },
  { label: 'S-6', value: 45 },
]

const BURNDOWN_DATA = [
  { label: 'D1', value: 18 },
  { label: 'D2', value: 16 },
  { label: 'D3', value: 15 },
  { label: 'D4', value: 14 },
  { label: 'D5', value: 12 },
  { label: 'D6', value: 10 },
  { label: 'D7', value: 9 },
  { label: 'D8', value: 6 },
  { label: 'D9', value: 6 },
  { label: 'D10', value: 3 },
]

const TEAM_MEMBERS = [
  { name: 'Salvador Ancer', role: 'Dev', tasks: 12, done: 10, velocity: 42, score: 95 },
  { name: 'Perla Reyes', role: 'Scrum Master', tasks: 8, done: 7, velocity: 38, score: 91 },
  { name: 'Rogiero De La Torre', role: 'Dev', tasks: 10, done: 7, velocity: 35, score: 82 },
  { name: 'Silvana Farías', role: 'Dev', tasks: 9, done: 5, velocity: 30, score: 74 },
  { name: 'María Cavada', role: 'Dev', tasks: 7, done: 6, velocity: 33, score: 88 },
]

function ScoreBar({ value, max = 100 }) {
  const pct = (value / max) * 100
  const color = pct >= 85 ? 'var(--green)' : pct >= 65 ? 'var(--accent)' : 'var(--amber)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: 'var(--border-light)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width .7s ease' }} />
      </div>
      <span style={{ fontSize: 11.5, fontWeight: 600, color, minWidth: 28 }}>{value}</span>
    </div>
  )
}

export default function Reports() {
  const [period, setPeriod] = useState('sprint')

  const taskDistrib = [
    { label: 'Hecho', value: 12, color: 'var(--green)' },
    { label: 'En prog.', value: 4, color: 'var(--accent)' },
    { label: 'Bloqueadas', value: 2, color: 'var(--oracle-red)' },
    { label: 'Pendientes', value: 0, color: 'var(--border)' },
  ]
  const totalTasks = taskDistrib.reduce((a, d) => a + d.value, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn .3s ease' }}>
      {/* Period selector */}
      <div style={{ display: 'flex', gap: 8 }}>
        {['sprint', 'month', 'quarter'].map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{
            padding: '6px 16px', borderRadius: 20, fontSize: 12.5, fontWeight: 500,
            border: '1px solid var(--border)', cursor: 'pointer',
            background: period === p ? 'var(--accent)' : 'white',
            color: period === p ? 'white' : 'var(--slate)',
            transition: 'all .15s',
          }}>
            {p === 'sprint' ? 'Sprint actual' : p === 'month' ? 'Este mes' : 'Trimestre'}
          </button>
        ))}
      </div>

      {/* Top metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Tareas completadas', value: '12', sub: 'de 18 en sprint', color: 'var(--green)' },
          { label: 'Velocidad del equipo', value: '42', sub: 'story points/sprint', color: 'var(--accent)' },
          { label: 'Tasa de completitud', value: '68%', sub: '+5% vs sprint ant.', color: 'var(--navy)' },
          { label: 'Tareas bloqueadas', value: '2', sub: '⚠ requieren atención', color: 'var(--oracle-red)' },
        ].map(({ label, value, sub, color }) => (
          <Card key={label} style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -16, right: -16, width: 64, height: 64, borderRadius: '50%', background: color, opacity: .07 }} />
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{sub}</div>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 16 }}>
        {/* Velocity chart */}
        <Card>
          <Card.Header title="Velocidad del equipo" subtitle="Story points por sprint" />
          <BarChart data={VELOCITY_DATA} color="var(--accent)" />
        </Card>

        {/* Task distribution donut */}
        <Card>
          <Card.Header title="Distribución de tareas" subtitle="Sprint actual" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <DonutChart segments={taskDistrib} size={110} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              {taskDistrib.filter(d => d.value > 0).map(d => (
                <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--muted)', flex: 1 }}>{d.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{d.value}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>({Math.round(d.value / totalTasks * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Burndown chart */}
      <Card>
        <Card.Header
          title="Burndown del Sprint"
          subtitle="Tareas pendientes por día"
          action={
            <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>
              Ideal: <strong style={{ color: 'var(--oracle-red)' }}>1.8 tareas/día</strong>
            </span>
          }
        />
        <BarChart data={BURNDOWN_DATA} height={140} color="var(--oracle-red)" />
      </Card>

      {/* Team performance */}
      <Card>
        <Card.Header title="Performance del equipo" subtitle="Métricas individuales del sprint" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1.5fr 80px 80px 100px 140px',
            padding: '6px 10px', borderBottom: '1px solid var(--border-light)',
            fontSize: 10.5, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em',
          }}>
            {['Miembro', 'Tareas', 'Completo', 'Velocidad', 'Score KPI'].map(h => <span key={h}>{h}</span>)}
          </div>
          {TEAM_MEMBERS.map((m, i) => (
            <div key={m.name} style={{
              display: 'grid', gridTemplateColumns: '1.5fr 80px 80px 100px 140px',
              padding: '12px 10px', borderRadius: 6,
              animation: `fadeIn .2s ease ${i * 0.06}s both`,
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: ['var(--oracle-red)', 'var(--accent)', 'var(--navy-light)', 'var(--amber)', 'var(--green)'][i],
                  color: 'white', fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {m.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{m.role}</div>
                </div>
              </div>
              <span style={{ fontSize: 13, color: 'var(--navy)', alignSelf: 'center' }}>{m.tasks}</span>
              <div style={{ alignSelf: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>{m.done}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}> / {m.tasks}</span>
              </div>
              <span style={{ fontSize: 13, color: 'var(--navy)', alignSelf: 'center' }}>{m.velocity} pts</span>
              <div style={{ alignSelf: 'center' }}>
                <ScoreBar value={m.score} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}