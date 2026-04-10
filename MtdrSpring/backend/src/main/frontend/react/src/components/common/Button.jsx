export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  style: extraStyle,
  ...props
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontFamily: 'inherit',
    fontWeight: 500,
    borderRadius: 'var(--radius)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all .15s ease',
    border: '1.5px solid transparent',
    whiteSpace: 'nowrap',
    width: fullWidth ? '100%' : undefined,
    opacity: disabled ? 0.55 : 1,
    ...(size === 'sm' && { fontSize: '12px', padding: '5px 12px', height: '30px' }),
    ...(size === 'md' && { fontSize: '13px', padding: '7px 16px', height: '36px' }),
    ...(size === 'lg' && { fontSize: '14px', padding: '10px 22px', height: '42px' }),
    ...(variant === 'primary' && {
      background: 'var(--oracle-red)',
      color: '#fff',
      boxShadow: '0 1px 3px rgba(199,70,52,.25)',
    }),
    ...(variant === 'secondary' && {
      background: 'var(--accent)',
      color: '#fff',
      boxShadow: '0 1px 3px rgba(37,99,235,.2)',
    }),
    ...(variant === 'danger' && {
      background: 'var(--red-alert)',
      color: '#fff',
    }),
    ...(variant === 'ghost' && {
      background: 'transparent',
      color: 'var(--slate)',
    }),
    ...(variant === 'outline' && {
      background: '#fff',
      color: 'var(--navy)',
      borderColor: 'var(--border)',
    }),
    ...extraStyle,
  }

  const hoverMap = {
    primary:   { background: 'var(--oracle-red-dark)' },
    secondary: { background: '#1d4ed8' },
    danger:    { background: '#dc2626' },
    ghost:     { background: 'var(--border-light)' },
    outline:   { borderColor: 'var(--accent)', color: 'var(--accent)' },
  }

  const resetMap = {
    primary:   { background: 'var(--oracle-red)' },
    secondary: { background: 'var(--accent)' },
    danger:    { background: 'var(--red-alert)' },
    ghost:     { background: 'transparent' },
    outline:   { borderColor: 'var(--border)', color: 'var(--navy)' },
  }

  const handleMouseEnter = (e) => {
    if (!disabled && !loading) Object.assign(e.currentTarget.style, hoverMap[variant] || {})
  }
  const handleMouseLeave = (e) => {
    if (!disabled && !loading) Object.assign(e.currentTarget.style, resetMap[variant] || {})
  }

  return (
    <button
      type={type}
      style={base}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {loading ? (
        <span style={{
          width: 14, height: 14,
          border: '2px solid rgba(255,255,255,.4)',
          borderTopColor: 'white',
          borderRadius: '50%',
          animation: 'spin .6s linear infinite',
          display: 'inline-block',
        }} />
      ) : icon}
      {children}
      {!loading && iconRight}
    </button>
  )
}