'use client'
import { useState } from 'react'
import { CheckCircle2, Trash2, Eye, XCircle, User } from 'lucide-react'
import { timeAgo } from '@/lib/time'

export default function AdminFlagged({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState(initialPosts)
  const [actioned, setActioned] = useState<Set<string>>(new Set())

  async function dismissPost(postId: string) {
    await fetch('/api/admin/post-action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId, action: 'unblur' }) })
    setActioned(s => new Set(s).add(postId))
  }

  async function deletePost(postId: string) {
    await fetch('/api/admin/post-action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId, action: 'delete' }) })
    setActioned(s => new Set(s).add(postId))
  }

  async function blurPost(postId: string) {
    await fetch('/api/admin/post-action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId, action: 'blur' }) })
    setActioned(s => new Set(s).add(postId))
  }

  const reportCount = (post: any) => post.reports?.length || 0
  const isPending = (post: any) => !post.is_blurred && !post.is_deleted
  const borderColor = (post: any) => isPending(post) ? '#D97706' : 'var(--rose)'
  const statusLabel = (post: any) => isPending(post) ? 'PENDING' : 'AUTO-BLURRED'
  const statusColor = (post: any) => isPending(post) ? '#D97706' : 'var(--rose)'
  const statusBg = (post: any) => isPending(post) ? '#FFFBEB' : 'var(--rose-d)'

  return (
    <div style={{ width: '100%' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Flagged Posts</h1>
      <p style={{ fontSize: '.875rem', color: 'var(--t3)', marginBottom: 24 }}>{posts.length} post{posts.length !== 1 ? 's' : ''} awaiting review.</p>

      {posts.length === 0 ? (
        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '56px 24px', textAlign: 'center' }}>
          <CheckCircle2 size={36} style={{ color: 'var(--grn)', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>All clear</p>
          <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>No flagged posts right now.</p>
        </div>
      ) : posts.map(post => (
        <div key={post.id} style={{
          background: 'var(--sur)', border: '1px solid var(--bd)',
          borderLeft: `3px solid ${borderColor(post)}`,
          borderRadius: 'var(--rm)', padding: '14px 16px', marginBottom: 10,
          opacity: actioned.has(post.id) ? 0.35 : 1,
          pointerEvents: actioned.has(post.id) ? 'none' as const : 'auto' as const,
          transition: 'opacity .3s',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '.6rem', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase',
              color: statusColor(post), background: statusBg(post),
              padding: '2px 7px', borderRadius: 3,
            }}>{statusLabel(post)}</span>
            <span style={{ fontFamily: 'monospace', fontSize: '.7rem', color: 'var(--t3)' }}>{post.ghost_id}</span>
            {post.users?.trust_level && post.users.trust_level !== 'new' && (
              <span style={{
                fontSize: '.55rem', fontWeight: 700, padding: '1px 6px', borderRadius: 9999,
                color: post.users.trust_level === 'top' ? '#D97706' : post.users.trust_level === 'trusted' ? 'var(--grn)' : 'var(--blue)',
                background: post.users.trust_level === 'top' ? '#FFFBEB' : post.users.trust_level === 'trusted' ? 'var(--grn-d)' : 'var(--blue-d)',
              }}>{post.users.trust_level}</span>
            )}
            <span style={{ fontSize: '.7rem', color: 'var(--t4)' }}>{post.categories?.name} · {timeAgo(post.created_at)}</span>
            <span style={{
              marginLeft: 'auto', fontSize: '.75rem', fontWeight: 700,
              color: statusColor(post),
            }}>{reportCount(post)} report{reportCount(post) !== 1 ? 's' : ''}</span>
          </div>

          {/* Content */}
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>{post.title}</h3>
          {post.body && (
            <p style={{ fontSize: '.875rem', color: 'var(--t2)', lineHeight: 1.7, marginBottom: 10, fontStyle: 'italic' }}>
              &ldquo;{post.body}&rdquo;
            </p>
          )}

          {/* Report reasons */}
          {post.reports?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: '.7rem', color: 'var(--t4)', fontWeight: 600 }}>Reported for: </span>
              <span style={{ fontSize: '.7rem', color: 'var(--t2)', fontWeight: 700 }}>
                {[...new Set(post.reports.map((r: any) => r.reason))].join(', ')}
              </span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid var(--bd)', flexWrap: 'wrap' }}>
            <button onClick={() => deletePost(post.id)} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 12px', borderRadius: 'var(--r)',
              background: 'var(--rose-d)', color: 'var(--rose)',
              border: '1px solid rgba(225,29,72,.25)',
              fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <Trash2 size={12} /> Delete
            </button>
            <button onClick={() => isPending(post) ? blurPost(post.id) : dismissPost(post.id)} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 12px', borderRadius: 'var(--r)',
              background: '#FFFBEB', color: '#D97706',
              border: '1px solid rgba(217,119,6,.25)',
              fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <Eye size={12} /> {isPending(post) ? 'Blur' : 'Restore'}
            </button>
            <button onClick={() => dismissPost(post.id)} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 12px', borderRadius: 'var(--r)',
              background: 'var(--sur)', color: 'var(--t2)',
              border: '1px solid var(--bd)',
              fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <XCircle size={12} /> Dismiss
            </button>
            <a href={`/admin?tab=users&user=${post.user_id}`} style={{
              display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto',
              padding: '5px 12px', borderRadius: 'var(--r)',
              background: 'var(--sur)', color: 'var(--t3)',
              border: '1px solid var(--bd)',
              fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              textDecoration: 'none',
            }}>
              <User size={12} /> View user
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}
