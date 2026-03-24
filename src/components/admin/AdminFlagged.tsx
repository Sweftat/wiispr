'use client'
import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

export default function AdminFlagged({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState(initialPosts)

  async function dismissPost(postId: string) {
    await fetch('/api/admin/post-action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId, action: 'unblur' }) })
    setPosts(posts.filter(p => p.id !== postId))
  }

  async function deletePost(postId: string) {
    await fetch('/api/admin/post-action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId, action: 'delete' }) })
    setPosts(posts.filter(p => p.id !== postId))
  }

  return (
    <div style={{ width: "100%" }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Flagged Posts</h1>
      <p style={{ fontSize: '.875rem', color: 'var(--t3)', marginBottom: 24 }}>{posts.length} post{posts.length !== 1 ? 's' : ''} awaiting review.</p>

      {posts.length === 0 ? (
        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '56px 24px', textAlign: 'center' }}>
          <CheckCircle2 size={36} style={{ color: 'var(--grn)', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>All clear</p>
          <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>No flagged posts right now.</p>
        </div>
      ) : posts.map(post => (
        <div key={post.id} style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '18px 20px', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--blue)', background: 'var(--blue-d)', padding: '2px 7px', borderRadius: 3 }}>{post.categories?.name}</span>
            <span style={{ fontFamily: 'monospace', fontSize: '.7rem', color: 'var(--t4)' }}>{post.ghost_id}</span>
            <span style={{ marginLeft: 'auto', fontSize: '.6rem', fontWeight: 700, color: 'var(--rose)', background: 'var(--rose-d)', padding: '2px 7px', borderRadius: 3 }}>{post.reports?.length || 0} REPORTS</span>
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>{post.title}</h3>
          {post.body && <p style={{ fontSize: '.875rem', color: 'var(--t2)', lineHeight: 1.7, marginBottom: 12 }}>{post.body}</p>}
          {post.reports?.length > 0 && (
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--rs)', padding: '10px 14px', marginBottom: 14 }}>
              {post.reports.map((r: any, i: number) => (
                <p key={i} style={{ fontSize: '.75rem', color: 'var(--t3)', padding: '3px 0', borderBottom: i < post.reports.length - 1 ? '1px solid var(--bd)' : 'none' }}>
                  <span style={{ color: 'var(--t4)', fontFamily: 'monospace' }}>#{i + 1}</span> {r.reason}
                </p>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid var(--bd)' }}>
            <button onClick={() => dismissPost(post.id)} style={{ padding: '7px 16px', borderRadius: 'var(--r)', border: '1px solid var(--grn)', background: 'none', color: 'var(--grn)', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Dismiss — keep post</button>
            <button onClick={() => deletePost(post.id)} style={{ padding: '7px 16px', borderRadius: 'var(--r)', border: 'none', background: 'var(--rose)', color: '#fff', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Delete post</button>
          </div>
        </div>
      ))}
    </div>
  )
}