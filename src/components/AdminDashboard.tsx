'use client'
import { useState } from 'react'

export default function AdminDashboard({ flaggedPosts, recentUsers, stats }: {
  flaggedPosts: any[]
  recentUsers: any[]
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
            <div key={post.id} style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '16px 18px', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--blue)', background: 'var(--blue-d)', padding: '2px 7px', borderRadius: 3 }}>{post.categories?.name}</span>
                <span style={{ fontFamily: 'monospace', fontSize: '.7rem', color: 'var(--t4)' }}>{post.ghost_id}</span>
                <span style={{ fontSize: '.6rem', fontWeight: 700, color: 'var(--rose)', background: 'var(--rose-d)', padding: '2px 6px', borderRadius: 3, marginLeft: 'auto' }}>FLAGGED</span>
              </div>
              <h3 style={{ fontSize: '.9375rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>{post.title}</h3>
              {post.body && <p style={{ fontSize: '.875rem', color: 'var(--t2)', lineHeight: 1.6, marginBottom: 12 }}>{post.body}</p>}
              <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid var(--bd)' }}>
                <button onClick={() => dismissPost(post.id)} style={{ fontSize: '.8rem', fontWeight: 600, padding: '6px 14px', borderRadius: 'var(--r)', border: '1px solid var(--bd)', background: 'none', color: 'var(--grn)', cursor: 'pointer', fontFamily: 'inherit' }}>Dismiss</button>
                <button onClick={() => deletePost(post.id)} style={{ fontSize: '.8rem', fontWeight: 600, padding: '6px 14px', borderRadius: 'var(--r)', border: 'none', background: 'var(--rose)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
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
    </div>
  )
}