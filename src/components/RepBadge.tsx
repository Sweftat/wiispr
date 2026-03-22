'use client'

const levels = {
  new:     { label: 'New',     color: '#71717A', bg: '#F4F4F5' },
  active:  { label: 'Active',  color: '#2563EB', bg: '#EFF6FF' },
  trusted: { label: 'Trusted', color: '#16A34A', bg: '#F0FDF4' },
  top:     { label: 'Top',     color: '#D97706', bg: '#FFFBEB' },
}

export default function RepBadge({ level }: { level: string }) {
  const l = levels[level as keyof typeof levels] || levels.new
  return (
    <span style={{
      fontSize: '.575rem', fontWeight: 700, letterSpacing: '.04em',
      textTransform: 'uppercase', color: l.color, background: l.bg,
      padding: '2px 6px', borderRadius: 3
    }}>{l.label}</span>
  )
}
