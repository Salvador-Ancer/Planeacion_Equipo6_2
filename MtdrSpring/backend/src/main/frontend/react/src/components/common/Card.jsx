export default function Card({ children, style, padding = 20, hoverable = false, onClick, className }) {
  const base = {
    background: 'var(--white)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow)',
    border: '1px solid var(--border-light)',
    padding,
    transition: hoverable ? 'box-shadow .2s ease, transform .2s ease' : undefined,
    cursor: onClick ? 'pointer' : undefined,
    ...style,
  }

  const handleMouseEnter = (e) => {
    if (hoverable) {
      e.currentTarget.style.boxShadow = 'var(--shadow-md)'
      e.currentTarget.style.transform = 'translateY(-2px)'
    }
  }
  const handleMouseLeave = (e) => {
    if (hoverable) {
      e.currentTarget.style.boxShadow = 'var(--shadow)'
      e.currentTarget.style.transform = 'translateY(0)'
    }
  }

  return (
    <div
      style={base}
      className={className}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}

// ── Card.Header ───────────────────────────────────────────────────────────────
Card.Header = function CardHeader({ title, subtitle, action, icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon && (
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'var(--accent-light)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
          }}>
            {icon}
          </div>
        )}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--navy)' }}>{title}</h3>
          {subtitle && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ── Card.Divider ──────────────────────────────────────────────────────────────
Card.Divider = function CardDivider() {
  return <div style={{ height: 1, background: 'var(--border-light)', margin: '16px -20px' }} />
}