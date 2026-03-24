'use client'
import { FileText, Users, Flag, AlertTriangle } from 'lucide-react'

export default function AdminOverview({ stats, recentPosts, flaggedCount }: {
  stats: { totalPosts: number, totalUsers: number, totalReports: number }
  recentPosts: any[]
  flaggedCount: number
}) {
  const cards = [
    { label: 'Total Posts', value: stats.totalPosts, icon: FileText, color: 'var(--blue)', bg: 'var(--blue-d)' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'var(--grn)', bg: 'var(--grn-d)' },
    { label: 'Total Reports', value: stats.totalReports, icon: Flag, color: 'var(--rose)', bg: 'var(--rose-d)' },
    { label: 'Flagged Now', value: flaggedCount, icon: AlertTriangle, color: '#D97706', bg: '#FFFBEB' },
  ]

  return (
    <div style={{ width: "100%" }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Overview</h1>
      <p style={{ fontSize: '.875rem', color: 'var(--t3)', marginBottom: 24 }}>Welcome back. Here's what's happening on wiispr.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {cards.map(c => {
          const Icon = c.icon
          return (
            <div key={c.label} style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{c.label}</p>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={15} style={{ color: c.color }} />
                </div>
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--t1)', lineHeight: 1 }}>{c.value}</p>
            </div>
          )
        })}
      </div>

      <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--bd)' }}>
          <h2 style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--t1)' }}>Recent Posts</h2>
        </div>
        {recentPosts.length === 0 ? (
          <p style={{ padding: '24px', textAlign: 'center', fontSize: '.875rem', color: 'var(--t4)' }}>No posts yet.</p>
        ) : recentPosts.map((post, i) => (
          <div key={post.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', borderBottom: i < recentPosts.length - 1 ? '1px solid var(--bd)' : 'none' }}>
            <span style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--blue)', background: 'var(--blue-d)', padding: '2px 7px', borderRadius: 3, flexShrink: 0 }}>{post.categories?.name}</span>
            <p style={{ fontSize: '.8rem', fontWeight: 500, color: 'var(--t1)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</p>
            <span style={{ fontSize: '.7rem', color: 'var(--t4)', fontFamily: 'monospace', flexShrink: 0 }}>{post.ghost_id}</span>
          </div>
        ))}
      </div>
    </div>
  )
}