'use client'
import { useState, useEffect } from 'react'
import { timeAgo } from '@/lib/time'
import UpvoteButton from './UpvoteButton'
import ReportButton from './ReportButton'
import ShareButton from './ShareButton'
import FollowButton from './FollowButton'
import RepBadge from './RepBadge'
import { X, MessageCircle, Ghost } from 'lucide-react'

export default function PostPanel({ post, onClose }: { post: any, onClose: () => void }) {
  const [replies, setReplies] = useState<any[]>([])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(d => { if (d.user) setUser(d.user) })
    fetch('/api/posts/replies?postId=' + post.id).then(r => r.json()).then(d => setReplies(d.replies || []))
  }, [post.id])

  async function submitReply() {
    if (!body.trim()) return
    setLoading(true)
    const res = await fetch('/api/posts/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id, body })
    })
    const data = await res.json()
    if (data.success) {
      setBody('')
      const r = await fetch('/api/posts/replies?postId=' + post.id)
      const d = await r.json()
      setReplies(d.replies || [])
    }
    setLoading(false)
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, backdropFilter: 'blur(2px)' }} />

      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '100%', maxWidth: 560,
        background: 'var(--bg)', borderLeft: '1px solid var(--bd)',
        zIndex: 201, overflowY: 'auto',
        animation: 'slideIn .2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid var(--bd)',
          position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 1
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MessageCircle size={14} style={{ color: 'var(--t4)' }} />
            <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--t3)' }}>
              {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </span>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: '1px solid var(--bd)', cursor: 'pointer',
            color: 'var(--t3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28, borderRadius: 'var(--r)'
          }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: '16px 20px' }}>
          {/* Post */}
          <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '18px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--blue)', background: 'var(--blue-d)', padding: '2px 7px', borderRadius: 3 }}>{post.categories?.name}</span>
              <span style={{ fontFamily: 'monospace', fontSize: '.7rem', color: 'var(--t4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Ghost size={11} />
                {post.ghost_id}
              </span>
              {post.users?.trust_level && <RepBadge level={post.users.trust_level} />}
              <FollowButton ghostId={post.ghost_id} />
              <span style={{ fontFamily: 'monospace', fontSize: '.65rem', color: 'var(--t4)', marginLeft: 'auto' }}>{timeAgo(post.created_at)}</span>
            </div>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 10, lineHeight: 1.35 }}>{post.title}</h1>
            {post.body && <p style={{ fontSize: '.9rem', color: 'var(--t2)', lineHeight: 1.8, marginBottom: 14 }}>{post.body}</p>}
            <div style={{ display: 'flex', gap: 6, paddingTop: 12, borderTop: '1px solid var(--bd)', alignItems: 'center' }}>
              <UpvoteButton postId={post.id} upvotes={post.upvotes} />
              <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                <ShareButton postId={post.id} />
                <ReportButton postId={post.id} />
              </span>
            </div>
          </div>

          {/* Reply composer */}
          {user ? (
            <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '14px', marginBottom: 12 }}>
              <textarea
                placeholder="Write a reply…"
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={3}
                style={{ width: '100%', fontSize: '.875rem', color: 'var(--t1)', background: 'none', border: 'none', outline: 'none', resize: 'none', lineHeight: 1.6, fontFamily: 'inherit', marginBottom: 8 }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--bd)' }}>
                <button
                  onClick={submitReply}
                  disabled={!body.trim() || loading}
                  style={{
                    fontSize: '.8rem', fontWeight: 600, padding: '7px 16px',
                    borderRadius: 'var(--r)',
                    background: body.trim() ? 'var(--blue)' : 'var(--bd)',
                    color: '#fff', border: 'none', cursor: body.trim() ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit', transition: 'background .15s'
                  }}
                >
                  {loading ? '...' : 'Reply anonymously'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '14px', marginBottom: 12, textAlign: 'center' }}>
              <a href="/auth" style={{ fontSize: '.875rem', color: 'var(--blue)', fontWeight: 600 }}>Sign in to reply</a>
            </div>
          )}

          {/* Replies */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {replies.length > 0 ? replies.map((reply: any) => (
              <div key={reply.id} style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', padding: '13px 15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                  <Ghost size={11} style={{ color: 'var(--t4)' }} />
                  <span style={{ fontFamily: 'monospace', fontSize: '.7rem', color: 'var(--t4)' }}>{reply.ghost_id}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '.65rem', color: 'var(--t4)', marginLeft: 'auto' }}>{timeAgo(reply.created_at)}</span>
                </div>
                <p style={{ fontSize: '.875rem', color: 'var(--t2)', lineHeight: 1.7 }}>{reply.body}</p>
              </div>
            )) : (
              <p style={{ textAlign: 'center', color: 'var(--t4)', fontSize: '.875rem', padding: '24px 0' }}>No replies yet. Be the first.</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}