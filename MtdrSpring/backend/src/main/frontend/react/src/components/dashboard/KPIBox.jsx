import Card from '../common/Card'

//KPIBox — single metric display card

export default function KPIBox({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  color = 'var(--accent)',
  icon,
  variant = 'default',
}) {
  const trendUp = trend > 0
  const trendColor = trendUp ? 'var(--green)' : 'var(--oracle-red)'
  const trendBg = trendUp ? 'var(--green-light)' : 'var(--red-light)'

  return (
    <Card hoverable style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: color, opacity: .07,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
          {title}
        </span>
        {icon && (
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: color, opacity: .12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color, opacity: 1 / 0.12, display: 'flex' }}>
              {icon}
            </span>
          </div>
        )}
      </div>

      <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--navy)', lineHeight: 1, marginBottom: 6 }}>
        {value}
      </div>

      {subtitle && (
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
          {subtitle}
        </div>
      )}

      {trend !== undefined && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, background: trendBg }}>
          <svg
            width="11" height="11"
            fill="none" stroke={trendColor} strokeWidth="2.2" viewBox="0 0 24 24"
            style={{ transform: trendUp ? 'none' : 'rotate(180deg)' }}
          >
            <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 11, fontWeight: 600, color: trendColor }}>
            {Math.abs(trend)}% {trendLabel}
          </span>
        </div>
      )}
    </Card>
  )
}