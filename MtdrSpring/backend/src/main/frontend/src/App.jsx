import { createContext, useContext, useState } from 'react'
import AppRouter from './routes/AppRouter'

export const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('opm_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })

  const login = (userData) => {
    localStorage.setItem('opm_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('opm_user')
    localStorage.removeItem('opm_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <AppRouter />
    </AuthContext.Provider>
  )
}