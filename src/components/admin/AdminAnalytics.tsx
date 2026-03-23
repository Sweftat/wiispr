import { FileText, Users, Flag } from 'lucide-react'

export default function AdminAnalytics({ stats }: { stats: { totalPosts: number, totalUsers: number, totalReports: number } }) {
  const max = Math.max(stats.totalPosts, stats.totalUsers, stats.totalReports, 1)
  const bars = [
    { label: 'Total Posts', value: stats.totalPosts, color: 'var(--blue)', bg: 'var(--blue-d)', icon: FileText },
    { label: 'Total Users', value: stats.totalUsers, color: 'var(--grn)', bg: 'var(--grn-d)', icon: Users },
    { label: 'Total Reports', value: stats.totalReports, color: 'var(--rose)', bg: 'var(--rose-d)', icon: Flag },
  ]

  return (
    <div style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Analytics</h1>
      <p style={{ fontSize: '.875rem', color: 'var(--t3)', marginBottom: 24 }}>Platform stats at a glance.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {bars.map(b => {
          const Icon = b.icon
          return (
            <div key={b.label} style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{b.label}</p>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: b.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={14} style={{ color: b.color }} />
                </div>
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--t1)', lineHeight: 1 }}>{b.value}</p>
            </div>
          )
        })}
      </div>

      <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '20px', marginBottom: 16 }}>
        <h2 style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 18 }}>Platform Overview</h2>
        {bars.map(bar => (
          <div key={bar.label} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '.8rem', fontWeight: 500, color: 'var(--t2)' }}>{bar.label}</span>
              <span style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--t1)' }}>{bar.value}</span>
            </div>
            <div style={{ height: 8, background: 'var(--bg)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.round((bar.value / max) * 100)}%`, background: bar.color, borderRadius: 99, transition: 'width .6s ease' }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Posts per user', value: stats.totalUsers > 0 ? (stats.totalPosts / stats.totalUsers).toFixed(1) : '0' },
          { label: 'Report rate', value: stats.totalPosts > 0 ? ((stats.totalReports / stats.totalPosts) * 100).toFixed(1) + '%' : '0%' },
          { label: 'Active categories', value: '8' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '16px 18px' }}>
            <p style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--t1)' }}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}