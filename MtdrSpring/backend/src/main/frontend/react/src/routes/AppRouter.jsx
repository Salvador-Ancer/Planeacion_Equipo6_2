import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../App'
import Login      from '../pages/Login'
import Dashboard  from '../pages/Dashboard'
import Projects   from '../pages/Projects'
import Tasks      from '../pages/Tasks'
import Reports    from '../pages/Reports'
import Sidebar    from '../components/layout/Sidebar'
import Navbar     from '../components/layout/Navbar'

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
          animation: 'fadeIn .3s ease both',
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}

function Protected({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <AppLayout>{children}</AppLayout>
}

export default function AppRouter() {
  const { user } = useAuth()
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"     element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/projects"  element={<Protected><Projects /></Protected>} />
        <Route path="/tasks"     element={<Protected><Tasks /></Protected>} />
        <Route path="/reports"   element={<Protected><Reports /></Protected>} />
        <Route path="*"          element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}