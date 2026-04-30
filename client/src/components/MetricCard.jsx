export default function MetricCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '0.5px solid var(--border)',
      borderRadius: 12,
      padding: '20px 24px',
      height: 100,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      transition: 'border-color 0.2s, background 0.2s',
      cursor: 'default',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = 'var(--border-bright)';
      e.currentTarget.style.background = 'var(--bg-card-hover)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.background = 'var(--bg-card)';
    }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace",
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--text-tertiary)',
        }}>
          {title}
        </span>
        {Icon && <Icon size={16} style={{ color: 'var(--accent)', opacity: 0.2 }} />}
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
      {subtitle && (
        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{subtitle}</div>
      )}
    </div>
  );
}
