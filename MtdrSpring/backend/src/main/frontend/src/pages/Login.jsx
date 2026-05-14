import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import { authApi } from '../services/api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const validate = () => {
    if (!email) return 'Ingresa tu correo'
    if (!password) return 'Ingresa tu contraseña'
    return null
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const err = validate()
    if (err) { setError(err); return }

    setLoading(true)
    setError('')

    try {
      const data = await authApi.login(email, password)

      if (!data?.exito) {
        setError(data?.mensaje || 'Credenciales incorrectas')
        return
      }

      const userData = {
        userId:   data.userId,
        fullName: data.fullName || email.split('@')[0],
        email:    data.email,
        rol:      data.rol,
      }

      login(userData)

      navigate('/dashboard', { replace: true })
    } catch (e) {
      setError(e.message || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', height: 44,
    padding: '0 12px',
    border: '1.5px solid #E5E7EB',
    borderRadius: 10, fontSize: 14,
    color: '#111827', outline: 'none',
    background: 'white',
    transition: 'border-color .2s, box-shadow .2s',
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#F7F5F4',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      {/* Left panel — branding */}
      <div style={{
        width: '42%',
        background: 'linear-gradient(175deg, #7A1F13 0%, #C74634 55%, #A83828 100%)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '52px 48px',
      }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.55)', letterSpacing: '.12em', textTransform: 'uppercase' }}>
            Oracle
          </span>
        </div>

        <div>
          <div style={{ width: 40, height: 3, background: 'rgba(255,255,255,.35)', borderRadius: 2, marginBottom: 28 }} />
          <h1 style={{ fontSize: 38, fontWeight: 800, color: 'white', lineHeight: 1.15, margin: 0 }}>
            Project<br />Management
          </h1>
        </div>

        <div />
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
      }}>
        <div style={{
          width: '100%', maxWidth: 380,
          animation: 'fadeIn .4s ease',
        }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: '#1B1F3B', marginBottom: 6 }}>
            Iniciar sesión
          </h2>
          <br />

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                Correo electrónico
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  style={{ ...inputStyle, paddingLeft: 38 }}
                  onFocus={(e) => { e.target.style.borderColor = '#C74634'; e.target.style.boxShadow = '0 0 0 3px rgba(199,70,52,.1)' }}
                  onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingLeft: 38, paddingRight: 40 }}
                  onFocus={(e) => { e.target.style.borderColor = '#C74634'; e.target.style.boxShadow = '0 0 0 3px rgba(199,70,52,.1)' }}
                  onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                  }}
                >
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    {showPass
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: '10px 12px', borderRadius: 8,
                background: '#FEF2F2', border: '1px solid #FECACA',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <svg width="14" height="14" fill="#EF4444" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span style={{ fontSize: 12.5, color: '#A85550' }}>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                height: 44, borderRadius: 10,
                background: loading ? '#9CA3AF' : '#C74634',
                color: 'white', border: 'none',
                fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all .2s',
                fontFamily: 'inherit',
                marginTop: 4,
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#9E3527' }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#C74634' }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 16, height: 16, border: '2px solid rgba(255,255,255,.4)',
                    borderTopColor: 'white', borderRadius: '50%',
                    animation: 'spin .6s linear infinite',
                  }} />
                  Verificando…
                </>
              ) : 'Ingresar al sistema'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
