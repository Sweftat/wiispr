export default function AdminAnalytics({ stats }: { stats: { totalPosts: number, totalUsers: number, totalReports: number } }) {
  const bars = [
    { label: 'Posts', value: stats.totalPosts, color: 'var(--blue)', max: Math.max(stats.totalPosts, stats.totalUsers, stats.totalReports, 1) },
    { label: 'Users', value: stats.totalUsers, color: 'var(--grn)', max: Math.max(stats.totalPosts, stats.totalUsers, stats.totalReports, 1) },
    { label: 'Reports', value: stats.totalReports, color: 'var(--rose)', max: Math.max(stats.totalPosts, stats.totalUsers, stats.totalReports, 1) },
  ]

  return (
    <div>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Analytics</h1>
      <p style={{ fontSize: '.875rem', color: 'var(--t3)', marginBottom: 24 }}>Platform stats at a glance.</p>

      <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '24px', marginBottom: 16 }}>
        <h2 style={{ fontSize: '.9375rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 20 }}>Platform Overview</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {bars.map(bar => (
            <div key={bar.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--t2)' }}>{bar.label}</span>
                <span style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--t1)' }}>{bar.value}</span>
              </div>
              <div style={{ height: 8, background: 'var(--bg)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.round((bar.value / bar.max) * 100)}%`, background: bar.color, borderRadius: 99, transition: 'width .6s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Posts per user', value: stats.totalUsers > 0 ? (stats.totalPosts / stats.totalUsers).toFixed(1) : '0' },
          { label: 'Report rate', value: stats.totalPosts > 0 ? ((stats.totalReports / stats.totalPosts) * 100).toFixed(1) + '%' : '0%' },
          { label: 'Active categories', value: '8' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '16px 18px' }}>
            <p style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--t1)' }}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}