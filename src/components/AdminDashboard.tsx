'use client'
import { useState } from 'react'
import { timeAgo } from '@/lib/time'

export default function AdminDashboard({ flaggedPosts, recentUsers, activityLogs, stats }: {
  flaggedPosts: any[]
  recentUsers: any[]
  activityLogs: any[]
  stats: { totalPosts: number, totalUsers: number, totalReports: number }
}) {
  const [tab, setTab] = useState('flagged')
  const [posts, setPosts] = useState(flaggedPosts)
  const [users, setUsers] = useState(recentUsers)

  async function dismissPost(postId: string) {
    await fetch('/api/admin/post-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, action: 'unblur' })
    })
    setPosts(posts.filter(p => p.id !== postId))
  }

  async function deletePost(postId: string) {
    await fetch('/api/admin/post-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, action: 'delete' })
    })
    setPosts(posts.filter(p => p.id !== postId))
  }

  async function suspendUser(userId: string) {
    await fetch('/api/admin/user-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action: 'suspend' })
    })
    setUsers(users.map(u => u.id === userId ? { ...u, is_suspended: true } : u))
  }

  async function unsuspendUser(userId: string) {
    await fetch('/api/admin/user-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action: 'unsuspend' })
    })
    setUsers(users.map(u => u.id === userId ? { ...u, is_suspended: false } : u))
  }

  const actionColors: Record<string, string> = {
    post_created: 'var(--blue)',
    reply_created: 'var(--grn)',
    post_reported: 'var(--rose)',
    post_deleted: 'var(--rose)',
    user_suspended: 'var(--rose)',
    user_unsuspended: 'var(--grn)',
  }

  const tabStyle = (t: string) => ({
    fontSize: '.8rem', fontWeight: 600, padding: '7px 16px',
    borderRadius: 'var(--r)', border: 'none', cursor: 'pointer',
    background: tab === t ? '#18181B' : 'none',
    color: tab === t ? '#fff' : 'var(--t3)',
    fontFamily: 'inherit'
  })

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Admin Dashboard</h1>
        <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>Moderate content, manage users, view stats</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Posts', value: stats.totalPosts },
          { label: 'Total Users', value: stats.totalUsers },
          { label: 'Total Reports', value: stats.totalReports },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '16px 18px' }}>
            <p style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--t1)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', padding: 4, width: 'fit-content' }}>
        <button style={tabStyle('flagged')} onClick={() => setTab('flagged')}>Flagged ({posts.length})</button>
        <button style={tabStyle('users')} onClick={() => setTab('users')}>Users ({users.length})</button>
        <button style={tabStyle('logs')} onClick={() => setTab('logs')}>Logs ({activityLogs.length})</button>
      </div>

      {/* Flagged Posts */}
      {tab === 'flagged' && (
        <div>
          {posts.length === 0 ? (
            <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>No flagged posts</p>
              <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>All clear.</p>
            </div>
          ) : posts.map(post => (
            <div key={post.id} style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '16px 18px', marginBottom: 10, transition: 'opacity .3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--blue)', background: 'var(--blue-d)', padding: '2px 7px', borderRadius: 3 }}>{post.categories?.name}</span>
                <span style={{ fontFamily: 'monospace', fontSize: '.7rem', color: 'var(--t4)' }}>{post.ghost_id}</span>
                <span style={{ fontSize: '.6rem', fontWeight: 700, color: 'var(--rose)', background: 'var(--rose-d)', padding: '2px 6px', borderRadius: 3, marginLeft: 'auto' }}>{post.reports?.length || 0} REPORTS</span>
              </div>
              <h3 style={{ fontSize: '.9375rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>{post.title}</h3>
              {post.body && <p style={{ fontSize: '.875rem', color: 'var(--t2)', lineHeight: 1.6, marginBottom: 10 }}>{post.body}</p>}
              {post.reports && post.reports.length > 0 && (
                <div style={{ background: 'var(--bg)', borderRadius: 'var(--rs)', padding: '8px 12px', marginBottom: 12 }}>
                  {post.reports.map((r: any, i: number) => (
                    <p key={i} style={{ fontSize: '.75rem', color: 'var(--t3)', padding: '3px 0', borderBottom: i < post.reports.length - 1 ? '1px solid var(--bd)' : 'none' }}>
                      <span style={{ color: 'var(--t4)', fontFamily: 'monospace' }}>#{i+1}</span> {r.reason}
                    </p>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid var(--bd)' }}>
                <button onClick={() => dismissPost(post.id)} style={{ fontSize: '.8rem', fontWeight: 600, padding: '6px 14px', borderRadius: 'var(--r)', border: '1px solid var(--grn)', background: 'none', color: 'var(--grn)', cursor: 'pointer', fontFamily: 'inherit' }}>Dismiss — keep post</button>
                <button onClick={() => deletePost(post.id)} style={{ fontSize: '.8rem', fontWeight: 600, padding: '6px 14px', borderRadius: 'var(--r)', border: 'none', background: 'var(--rose)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>Delete post</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div>
          <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', overflow: 'hidden' }}>
            {users.map((user, i) => (
              <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < users.length - 1 ? '1px solid var(--bd)' : 'none' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--t1)' }}>{user.nickname}</p>
                  <p style={{ fontSize: '.75rem', color: 'var(--t4)', fontFamily: 'monospace' }}>{user.trust_level} · {user.age_range} · {user.gender}</p>
                </div>
                {user.is_admin && <span style={{ fontSize: '.6rem', fontWeight: 700, color: 'var(--blue)', background: 'var(--blue-d)', padding: '2px 6px', borderRadius: 3 }}>ADMIN</span>}
                {user.is_suspended && <span style={{ fontSize: '.6rem', fontWeight: 700, color: 'var(--rose)', background: 'var(--rose-d)', padding: '2px 6px', borderRadius: 3 }}>SUSPENDED</span>}
                {!user.is_admin && (
                  <button
                    onClick={() => user.is_suspended ? unsuspendUser(user.id) : suspendUser(user.id)}
                    style={{ fontSize: '.75rem', fontWeight: 600, padding: '5px 12px', borderRadius: 'var(--rs)', border: '1px solid var(--bd)', background: 'none', color: user.is_suspended ? 'var(--grn)' : 'var(--rose)', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    {user.is_suspended ? 'Unsuspend' : 'Suspend'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logs */}
      {tab === 'logs' && (
        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', overflow: 'hidden' }}>
          {activityLogs.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>No activity yet</p>
              <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>Actions will appear here.</p>
            </div>
          ) : activityLogs.map((log, i) => (
            <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: i < activityLogs.length - 1 ? '1px solid var(--bd)' : 'none' }}>
              <span style={{
                fontSize: '.6rem', fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase',
                color: actionColors[log.action] || 'var(--t3)',
                background: 'var(--bg)', padding: '2px 7px', borderRadius: 3, whiteSpace: 'nowrap'
              }}>{log.action.replace(/_/g, ' ')}</span>
              <span style={{ fontSize: '.8rem', color: 'var(--t2)', flex: 1 }}>
                {log.users?.nickname || 'Anonymous'}
              </span>
              <span style={{ fontSize: '.7rem', color: 'var(--t4)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                {timeAgo(log.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}