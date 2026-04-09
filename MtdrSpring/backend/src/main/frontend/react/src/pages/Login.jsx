import { useState } from 'react'
import { useAuth } from '../App'
import { authApi } from '../services/api'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const validate = () => {
    if (!email) return 'Ingresa tu correo'
    if (!email.endsWith('@oracle.com')) return 'Debes usar un correo @oracle.com'
    if (!password) return 'Ingresa tu contraseña'
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
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
      if (data?.token) localStorage.setItem('opm_token', data.token)
      login(data?.user || { email, name: email.split('@')[0] })
    } catch (e) {
    //CAMBIAR!!! 
      // Dev mode: allow any @oracle.com login without backend
      if (email.endsWith('@oracle.com')) {
        login({ email, name: email.split('@')[0], role: 'DEVELOPER' })
      } else {
        setError(e.message || 'Credenciales incorrectas')
      }
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
      background: '#F4F6F9',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      {/* Left panel — branding */}
      <div style={{
        width: '42%',
        background: 'linear-gradient(160deg, #1B1F3B 0%, #2D3260 50%, #1B1F3B 100%)',
        display: 'flex', flexDirection: 'column',
        padding: '48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        {[['-60px', '-60px', 260], ['auto', '-80px', 180], ['60%', '70%', 140]].map(([t, r, s], i) => (
          <div key={i} style={{
            position: 'absolute', top: t, right: r,
            width: s, height: s, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,.07)',
            pointerEvents: 'none',
          }} />
        ))}

        {/* Oracle logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 60 }}>
          <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
            <ellipse cx="18" cy="14" rx="17" ry="13" stroke="#C74634" strokeWidth="2.5" />
            <ellipse cx="18" cy="14" rx="9" ry="13" stroke="#C74634" strokeWidth="2.5" />
            <line x1="1" y1="14" x2="35" y2="14" stroke="#C74634" strokeWidth="2.5" />
          </svg>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#C74634', letterSpacing: '-.5px' }}>ORACLE</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{
            fontSize: 36, fontWeight: 800,
            color: 'white', lineHeight: 1.2,
            marginBottom: 16,
          }}>
            Oracle Project<br />
            <span style={{ color: '#C74634' }}>Management</span>
          </h1>
        </div>
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
          <br></br>

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
                  placeholder="nombre@oracle.com"
                  style={{ ...inputStyle, paddingLeft: 38 }}
                  onFocus={(e) => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,.1)' }}
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
                  onFocus={(e) => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,.1)' }}
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
                <span style={{ fontSize: 12.5, color: '#DC2626' }}>{error}</span>
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