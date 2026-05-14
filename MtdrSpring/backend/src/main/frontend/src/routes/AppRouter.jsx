import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../App'
import Login        from '../pages/Login'
import Dashboard    from '../pages/Dashboard'
import SMDashboard  from '../pages/SMDashboard'
import DevDashboard from '../pages/DevDashboard'
import Projects     from '../pages/Projects'
import Tasks        from '../pages/Tasks'
import MisTareas    from '../pages/MisTareas'
import Desempeno    from '../pages/Desempeno'
import Kpis         from '../pages/Kpis'
import Analitica    from '../pages/Analitica'
import Sprints      from '../pages/Sprints'
import CargaDev     from '../pages/CargaDev'
import Sidebar      from '../components/layout/Sidebar'
import Navbar       from '../components/layout/Navbar'
import ChatWidget   from '../components/ai/ChatWidget'

const ADMIN_ROLES = ['Admin']
const SM_ROLES    = ['Scrum Master']

function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 'var(--sidebar-w)',
        minWidth: 0,
      }}>
        <Navbar />
        <main style={{
          flex: 1,
          padding: '24px 28px',
          marginTop: 'var(--navbar-h)',
          overflowY: 'auto',
        }}>
          {children}
        </main>
      </div>
      <ChatWidget />
    </div>
  )
}

// Requires authentication. If not logged in → /login
function Protected({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <AppLayout>{children}</AppLayout>
}

// Admin only
function AdminOnly({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!ADMIN_ROLES.includes(user.rol)) return <Navigate to="/dashboard" replace />
  return <AppLayout>{children}</AppLayout>
}

// Scrum Master only
function SMOnly({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!SM_ROLES.includes(user.rol)) return <Navigate to="/dashboard" replace />
  return <AppLayout>{children}</AppLayout>
}

// Admin + Scrum Master
function AdminOrSM({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!ADMIN_ROLES.includes(user.rol) && !SM_ROLES.includes(user.rol)) return <Navigate to="/dashboard" replace />
  return <AppLayout>{children}</AppLayout>
}

// /dashboard — Admin → Dashboard, SM → SMDashboard, others → DevDashboard
function DashboardRoute() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return (
    <AppLayout>
      {ADMIN_ROLES.includes(user.rol) ? <Dashboard />
        : SM_ROLES.includes(user.rol) ? <SMDashboard />
        : <DevDashboard />}
    </AppLayout>
  )
}

function DefaultRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to="/dashboard" replace />
}

export default function AppRouter() {
  const { user } = useAuth()
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={user ? <DefaultRedirect /> : <Login />} />

        {/* Dashboard — role-aware */}
        <Route path="/dashboard"  element={<DashboardRoute />} />

        {/* Admin-only routes */}
        <Route path="/kpis"       element={<AdminOnly><Kpis /></AdminOnly>} />
        <Route path="/desempeno"  element={<AdminOnly><Desempeno /></AdminOnly>} />

        {/* Admin + Scrum Master routes */}
        <Route path="/tareas"     element={<AdminOrSM><Tasks /></AdminOrSM>} />
        <Route path="/analitica"  element={<AdminOrSM><Analitica /></AdminOrSM>} />
        <Route path="/sprints"    element={<AdminOrSM><Sprints /></AdminOrSM>} />
        <Route path="/carga-dev"  element={<SMOnly><CargaDev /></SMOnly>} />

        {/* Shared routes (all authenticated users) */}
        <Route path="/proyectos"  element={<Protected><Projects /></Protected>} />
        <Route path="/mis-tareas" element={<Protected><MisTareas /></Protected>} />

        {/* Catch-all */}
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}
