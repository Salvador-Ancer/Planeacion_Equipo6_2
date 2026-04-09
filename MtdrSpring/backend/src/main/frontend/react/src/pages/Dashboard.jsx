import { useState, useEffect } from 'react'
import SprintOverview from '../components/dashboard/SprintOverview'
import KPIBox from '../components/dashboard/KPIBox'
import ChatWidget from '../components/ai/ChatWidget'
import Card from '../components/common/Card'
import { kpisApi, tasksApi } from '../services/api'

// Mock KPI data
const MOCK_KPIS = {
  tasksDelivered: 26,
  activeSprints: 8,
  riskAlerts: 7,
  teamVelocity: 42,
  completionRate: 68,
  blockedTasks: 3,
}

const MOCK_RECENT_TASKS = [
  { id: 1, title: 'Diseño de arquitectura OCI', status: 'DONE', priority: 'HIGH', assignee: 'Salvador' },
  { id: 2, title: 'Implementación del portal web', status: 'IN_PROGRESS', priority: 'HIGH', assignee: 'Perla' },
  { id: 3, title: 'Integración con Telegram Bot', status: 'IN_PROGRESS', priority: 'HIGH', assignee: 'Rogiero' },
  { id: 4, title: 'Implementación de KPIs', status: 'TODO', priority: 'MEDIUM', assignee: 'María' },
  { id: 5, title: 'Módulo de IA – ChatBot', status: 'BLOCKED', priority: 'MEDIUM', assignee: 'Silvana' },
]

const STATUS_BADGE = {
  DONE: { bg: '#DCFCE7', color: '#16a34a', label: 'Hecho' },
  IN_PROGRESS: { bg: '#DBEAFE', color: '#2563EB', label: 'En progreso' },
  TODO: { bg: '#F1F5F9', color: '#64748B', label: 'Por hacer' },
  BLOCKED: { bg: '#FEE2E2', color: '#DC2626', label: 'Bloqueada' },
  REVIEW: { bg: '#FEF3C7', color: '#D97706', label: 'En revisión' },
}

export default function Dashboard() {
  const [kpis, setKpis] = useState(MOCK_KPIS)
  const [recentTasks, setRecentTasks] = useState(MOCK_RECENT_TASKS)

  useEffect(() => {
    kpisApi.getDashboard().then(setKpis).catch(() => {})
    tasksApi.getAll({ limit: 5, sort: 'updatedAt' }).then(setRecentTasks).catch(() => {})
  }, [])

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

      {/*Left / Main column*/}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Sprint overview */}
        <div style={{ animation: 'fadeIn .3s ease .05s both' }}>
          <SprintOverview />
        </div>

        {/* KPI grid */}
        <div style={{ animation: 'fadeIn .3s ease .1s both' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)', marginBottom: 12 }}>
            Métricas de productividad
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <KPIBox
              title="Productividad"
              value={kpis.tasksDelivered}
              subtitle="Tareas entregadas esta semana"
              trend={48}
              trendLabel="vs semana pasada"
              color="var(--green)"
              icon={
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              }
            />
            <KPIBox
              title="Accountability"
              value={kpis.activeSprints}
              subtitle="Sprints activos"
              trend={12}
              trendLabel="este mes"
              color="var(--accent)"
              icon={
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              }
            />
            <KPIBox
              title="Alertas de riesgo"
              value={kpis.riskAlerts}
              subtitle={`+${kpis.blockedTasks} tareas bloqueadas`}
              trend={-15}
              trendLabel="esta semana"
              color="var(--oracle-red)"
              icon={
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              }
            />
          </div>
        </div>

        {/* Recent tasks table */}
        <div style={{ animation: 'fadeIn .3s ease .15s both' }}>
          <Card>
            <Card.Header
              title="Tareas recientes"
              subtitle="Actividad del sprint actual"
              action={
                <a href="/tasks" style={{
                  fontSize: 12, color: 'var(--accent)', fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  Ver todas
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              }
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* Header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 100px 80px 80px',
                padding: '6px 10px',
                fontSize: 10.5, fontWeight: 600, color: 'var(--muted)',
                textTransform: 'uppercase', letterSpacing: '.06em',
                borderBottom: '1px solid var(--border-light)',
              }}>
                <span>Tarea</span><span>Estado</span><span>Prioridad</span><span>Asignado</span>
              </div>
              {recentTasks.map((task, i) => {
                const s = STATUS_BADGE[task.status] || STATUS_BADGE.TODO
                return (
                  <div
                    key={task.id}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 100px 80px 80px',
                      padding: '10px 10px',
                      borderRadius: 6,
                      transition: 'background .15s',
                      animation: `fadeIn .2s ease ${i * 0.05}s both`,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: 13, color: 'var(--navy)', fontWeight: 500 }}>{task.title}</span>
                    <span>
                      <span style={{
                        fontSize: 10.5, padding: '2px 8px', borderRadius: 20,
                        background: s.bg, color: s.color, fontWeight: 600,
                      }}>{s.label}</span>
                    </span>
                    <span style={{
                      fontSize: 11, color:
                        task.priority === 'HIGH' ? 'var(--oracle-red)'
                        : task.priority === 'MEDIUM' ? 'var(--amber)'
                        : 'var(--green)',
                      fontWeight: 600,
                    }}>
                      {task.priority === 'HIGH' ? '● Alta' : task.priority === 'MEDIUM' ? '● Media' : '● Baja'}
                    </span>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: 'var(--navy-light)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700,
                    }}>
                      {task.assignee?.[0]?.toUpperCase() || '?'}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Right / Chat column ──────────────────────────────────────────── */}
      <div style={{
        width: 300, flexShrink: 0,
        animation: 'slideIn .35s ease .1s both',
      }}>
        <ChatWidget sprintData={null} projectData={null} />
      </div>
    </div>
  )
}