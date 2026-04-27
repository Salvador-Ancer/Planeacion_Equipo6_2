import { useState, useRef, useEffect } from 'react'
import { aiApi } from '../../services/api'

const QUICK_OPTIONS = [
  { label: 'Resumen del sprint', prompt: '¿Cuál es el resumen del sprint actual?' },
  { label: 'Tareas bloqueadas', prompt: '¿Cuáles son las tareas bloqueadas y por qué?' },
  { label: 'Riesgos actuales', prompt: '¿Qué riesgos detectas en el proyecto actual?' },
  { label: 'Prioridades recomendadas', prompt: '¿Qué tareas deberíamos priorizar esta semana?' },
]


function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 10,
      animation: 'fadeIn .2s ease both',
    }}>
      {!isUser && (
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: 'var(--accent)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, flexShrink: 0, marginRight: 7, marginTop: 2,
        }}>IA</div>
      )}
      <div style={{
        maxWidth: '85%',
        padding: '9px 12px',
        borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        background: isUser ? 'var(--accent)' : 'var(--bg)',
        color: isUser ? 'white' : 'var(--navy)',
        fontSize: 12.5,
        lineHeight: 1.55,
        border: isUser ? 'none' : '1px solid var(--border)',
        whiteSpace: 'pre-wrap',
      }}>
        {msg.content}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', marginBottom: 8 }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%',
        background: 'var(--accent)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        color: 'white', fontSize: 11, fontWeight: 700,
      }}>IA</div>
      <div style={{ display: 'flex', gap: 4, padding: '8px 12px', background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--muted)',
            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            display: 'inline-block',
          }} />
        ))}
      </div>
    </div>
  )
}

export default function ChatWidget({ sprintData, projectData }) {
  const [open, setOpen] = useState(true)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // System prompt con contexto real del sprint/proyecto cuando estén disponibles
  const systemContext = `Eres el Asistente IA de OPM (Oracle Project Management), una herramienta de gestión de proyectos de software para equipos de desarrollo. Eres conciso, útil y experto en metodologías ágiles, Scrum, gestión de sprints y KPIs de productividad.

Contexto del sistema actual:
${sprintData ? `Sprint activo: ${JSON.stringify(sprintData)}` : 'No hay sprint activo disponible.'}
${projectData ? `Proyectos: ${JSON.stringify(projectData)}` : ''}

Instrucciones:
- Responde SIEMPRE en español
- Sé conciso y directo (máximo 3-4 párrafos o una lista clara)
- Usa emojis ocasionalmente para resaltar puntos clave
- Cuando no tengas datos reales del contexto, dalo a entender y ofrece recomendaciones generales basadas en buenas prácticas ágiles
- Nunca inventes métricas específicas como si fueran reales si no te las proporcionaron`

  const sendMessage = async (text) => {
    const userMsg = text || input.trim()
    if (!userMsg || loading) return
    setInput('')

    const newMessages = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const apiMessages = newMessages.map(({ role, content }) => ({ role, content }))
      const data = await aiApi.chat(apiMessages, systemContext)
      const reply = data?.content || ''
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      console.error('ChatWidget error:', e)
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: e.message || 'No pude conectarme al asistente. Verifica tu conexión e intenta de nuevo.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => setMessages([])

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--navy-light) 100%)',
          color: 'white', border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(199,70,52,.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200,
          transition: 'transform .2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M12 2a2 2 0 012 2v1h3a2 2 0 012 2v7a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h3V4a2 2 0 012-2z" strokeLinejoin="round"/>
          <circle cx="9" cy="10" r="1" fill="currentColor"/>
          <circle cx="15" cy="10" r="1" fill="currentColor"/>
          <path d="M9 14s1 1.5 3 1.5 3-1.5 3-1.5" strokeLinecap="round"/>
          <path d="M8 5V3M16 5V3" strokeLinecap="round"/>
        </svg>
      </button>
    )
  }

  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-md)',
      display: 'flex',
      flexDirection: 'column',
      height: minimized ? 'auto' : 480,
      overflow: 'hidden',
      transition: 'height .25s ease',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(135deg, #7A1F13 0%, #C74634 100%)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: 'rgba(255,255,255,.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white',
        }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M12 2a2 2 0 012 2v1h3a2 2 0 012 2v7a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h3V4a2 2 0 012-2z" strokeLinejoin="round"/>
            <circle cx="9" cy="10" r="1" fill="currentColor"/>
            <circle cx="15" cy="10" r="1" fill="currentColor"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>IA Asistente</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.7)' }}>
            {loading ? 'Escribiendo…' : '● En línea'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              title="Limpiar chat"
              style={{ color: 'rgba(255,255,255,.7)', cursor: 'pointer', background: 'none', border: 'none', padding: '2px 4px', borderRadius: 4, fontSize: 12 }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,.7)'}
            >
              ↺
            </button>
          )}
          <button
            onClick={() => setMinimized(!minimized)}
            style={{ color: 'rgba(255,255,255,.7)', cursor: 'pointer', background: 'none', border: 'none', padding: '2px 6px', borderRadius: 4, fontSize: 16, lineHeight: 1 }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,.7)'}
          >
            {minimized ? '▲' : '▼'}
          </button>
          <button
            onClick={() => setOpen(false)}
            style={{ color: 'rgba(255,255,255,.7)', cursor: 'pointer', background: 'none', border: 'none', padding: '2px 6px', borderRadius: 4, fontSize: 16, lineHeight: 1 }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,.7)'}
          >
            ×
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Messages area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 12px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {messages.length === 0 ? (
              <div style={{ animation: 'fadeIn .3s ease' }}>
                <div style={{
                  textAlign: 'center', marginBottom: 16,
                  padding: '12px', borderRadius: 10,
                  background: 'var(--accent-light)',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--accent)', marginBottom: 3 }}>
                    Asistente IA
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                    Puedo ayudarte a analizar tu sprint, detectar riesgos y priorizar tareas.
                  </div>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    ● Opciones rápidas
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {QUICK_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => sendMessage(opt.prompt)}
                      style={{
                        textAlign: 'left',
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        fontSize: 12.5,
                        color: 'var(--navy)',
                        cursor: 'pointer',
                        transition: 'all .15s',
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--accent-light)'
                        e.currentTarget.style.borderColor = 'var(--accent)'
                        e.currentTarget.style.color = 'var(--accent)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--bg)'
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.color = 'var(--navy)'
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)
            )}

            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: 8,
            background: 'var(--white)',
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pregunta algo al asistente…"
              rows={1}
              style={{
                flex: 1,
                padding: '8px 10px',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12.5,
                color: 'var(--navy)',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
                lineHeight: 1.4,
                maxHeight: 72,
                overflowY: 'auto',
                transition: 'border-color .15s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                width: 34, height: 34,
                borderRadius: 8,
                background: input.trim() && !loading ? 'var(--accent)' : 'var(--border-light)',
                color: input.trim() && !loading ? 'white' : 'var(--muted)',
                border: 'none',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'all .15s',
                alignSelf: 'flex-end',
              }}
            >
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2 21L23 12 2 3v7l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  )
}