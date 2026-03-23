import { FileText, Users, Flag, TrendingUp } from 'lucide-react'

export default function AdminOverview({ stats, recentPosts, flaggedCount }: {
  stats: { totalPosts: number, totalUsers: number, totalReports: number }
  recentPosts: any[]
  flaggedCount: number
}) {
  return (
    <div>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Overview</h1>
      <p style={{ fontSize: '.875rem', color: 'var(--t3)', marginBottom: 24 }}>Welcome back. Here's what's happening on wiispr.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Total Posts', value: stats.totalPosts, icon: <FileText size={18} />, color: 'var(--blue)' },
          { label: 'Total Users', value: stats.totalUsers, icon: <Users size={18} />, color: 'var(--grn)' },
          { label: 'Total Reports', value: stats.totalReports, icon: <Flag size={18} />, color: 'var(--rose)' },
          { label: 'Flagged Now', value: flaggedCount, icon: <TrendingUp size={18} />, color: '#D97706' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.label}</p>
              <span style={{ color: s.color }}>{s.icon}</span>
            </div>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--t1)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bd)' }}>
          <h2 style={{ fontSize: '.9375rem', fontWeight: 700, color: 'var(--t1)' }}>Recent Posts</h2>
        </div>
        {recentPosts.map((post, i) => (
          <div key={post.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: i < recentPosts.length - 1 ? '1px solid var(--bd)' : 'none' }}>
            <span style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--blue)', background: 'var(--blue-d)', padding: '2px 7px', borderRadius: 3, flexShrink: 0 }}>{post.categories?.name}</span>
            <p style={{ fontSize: '.8375rem', color: 'var(--t1)', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</p>
            <span style={{ fontSize: '.7rem', color: 'var(--t4)', fontFamily: 'monospace', flexShrink: 0 }}>{post.ghost_id}</span>
          </div>
        ))}
      </div>
    </div>
  )
}