'use client'
import { useState, useEffect } from 'react'
import { timeAgo } from '@/lib/time'
import UpvoteButton from './UpvoteButton'
import FollowButton from './FollowButton'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, Ghost, ArrowUp, Eye, Bookmark, Link2, Flag, ShieldOff } from 'lucide-react'
import { toast } from 'sonner'
import LinkifiedText from './LinkifiedText'

const REACTIONS = [
  { key: 'agree', emoji: '👍', label: 'Agree', color: '#2563EB' },
  { key: 'fire', emoji: '🔥', label: 'Fire', color: '#F97316' },
  { key: 'interesting', emoji: '👀', label: 'Interesting', color: '#8B5CF6' },
  { key: 'facts', emoji: '💯', label: 'Facts', color: '#16A34A' },
  { key: 'funny', emoji: '😂', label: 'Funny', color: '#EAB308' },
]

function CompactReactionBar({ postId }: { postId: string }) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [userReaction, setUserReaction] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/posts/reactions?postId=' + postId).then(r => r.json()).then(d => {
      setCounts(d.counts || {})
      setUserReaction(d.userReaction || null)
    }).catch(() => {})
  }, [postId])

  async function react(key: string) {
    const wasSelected = userReaction === key
    const oldReaction = userReaction
    if (wasSelected) {
      setUserReaction(null)
      setCounts(prev => ({ ...prev, [key]: Math.max(0, (prev[key] || 0) - 1) }))
    } else {
      setUserReaction(key)
      setCounts(prev => {
        const next = { ...prev, [key]: (prev[key] || 0) + 1 }
        if (oldReaction) next[oldReaction] = Math.max(0, (next[oldReaction] || 0) - 1)
        return next
      })
    }
    await fetch('/api/posts/reactions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, reaction: key })
    })
  }

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {REACTIONS.map(r => {
        const selected = userReaction === r.key
        const count = counts[r.key] || 0
        return (
          <motion.button
            key={r.key}
            whileTap={{ scale: 0.85 }}
            title={r.label}
            onClick={() => react(r.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 3,
              padding: '3px 8px', borderRadius: 'var(--rs)',
              border: `1px solid ${selected ? r.color : 'var(--bd)'}`,
              background: selected ? r.color + '15' : 'none',
              cursor: 'pointer', fontSize: '.75rem', fontFamily: 'inherit',
              color: selected ? r.color : 'var(--t3)', fontWeight: 600,
              transition: 'all .15s',
            }}
          >
            <span style={{ fontSize: '14px', lineHeight: 1 }}>{r.emoji}</span>
            <span className="reaction-label">{r.label}</span>
            {count > 0 && <span>{count}</span>}
          </motion.button>
        )
      })}
    </div>
  )
}

function RelatedPosts({ postId, categoryId, categoryName, onOpen }: { postId: string, categoryId: number, categoryName?: string, onOpen: (p: any) => void }) {
  const [related, setRelated] = useState<any[]>([])

  useEffect(() => {
    fetch(`/api/posts/related?postId=${postId}&categoryId=${categoryId}`)
      .then(r => r.json())
      .then(d => setRelated(d.posts || []))
      .catch(() => {})
  }, [postId, categoryId])

  if (related.length === 0) return null

  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>More from {categoryName || 'this category'}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {related.map(p => (
          <div key={p.id} onClick={() => onOpen(p)} style={{
            background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--r)',
            padding: '10px 12px', cursor: 'pointer', transition: 'border-color .15s',
          }}>
            <p style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--t1)', marginBottom: 4, lineHeight: 1.4 }}>{p.title}</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: '.65rem', color: 'var(--t4)' }}>{p.upvotes} upvotes</span>
              <span style={{ fontSize: '.65rem', color: 'var(--t4)' }}>{p.reply_count} replies</span>
              <span style={{ fontSize: '.65rem', color: 'var(--t4)', marginLeft: 'auto' }}>{timeAgo(p.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const actionBtnStyle = (active?: boolean): React.CSSProperties => ({
  fontSize: '.72rem', fontWeight: 600, padding: '4px 9px',
  borderRadius: 'var(--rs)',
  border: `1px solid ${active ? 'var(--blue)' : 'var(--bd)'}`,
  background: active ? 'var(--blue-d)' : 'none',
  color: active ? 'var(--blue)' : 'var(--t3)',
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
  fontFamily: 'inherit', transition: 'all .15s',
})

export default function PostPanel({ post: initialPost, onClose }: { post: any, onClose: () => void }) {
  const [post, setPost] = useState(initialPost)
  const [replies, setReplies] = useState<any[]>([])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [replyUpvotes, setReplyUpvotes] = useState<Record<string, number>>({})
  const [votedReplies, setVotedReplies] = useState<Set<string>>(new Set())
  const [viewCount, setViewCount] = useState(post.view_count || 0)
  const [bookmarked, setBookmarked] = useState(false)
  const [reported, setReported] = useState(false)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(d => { if (d.user) setUser(d.user) })
    fetch('/api/posts/replies?postId=' + post.id).then(r => r.json()).then(d => {
      const reps = d.replies || []
      setReplies(reps)
      const init: Record<string, number> = {}
      reps.forEach((r: any) => { init[r.id] = r.upvotes || 0 })
      setReplyUpvotes(init)
      // Check which replies user already voted on
      const replyIds = reps.map((r: any) => r.id).join(',')
      if (replyIds) {
        fetch('/api/posts/upvote?replyIds=' + replyIds).then(r => r.json()).then(v => {
          if (v.voted) setVotedReplies(new Set(v.voted))
        }).catch(() => {})
      }
    })
    fetch('/api/posts/view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: post.id }) })
      .then(r => r.json()).then(d => { if (d.viewCount) setViewCount(d.viewCount) })
    fetch('/api/bookmarks?postId=' + post.id).then(r => r.json()).then(d => {
      if (d.bookmarked) setBookmarked(true)
    }).catch(() => {})
  }, [post.id])

  async function toggleBookmark() {
    const res = await fetch('/api/bookmarks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id, action: bookmarked ? 'remove' : 'add' })
    })
    const data = await res.json()
    if (data.success) { setBookmarked(!bookmarked); toast(bookmarked ? 'Removed from saved' : 'Post saved') }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.origin + '/post/' + post.id)
    toast('Link copied!')
  }

  async function report() {
    if (reported) return
    const res = await fetch('/api/posts/report', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id, reason: 'inappropriate' })
    })
    const data = await res.json()
    if (data.success) { setReported(true); toast.success('Post reported') }
  }

  async function block() {
    if (blocked) return
    const res = await fetch('/api/blocks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ghostId: post.ghost_id, action: 'block' })
    })
    const data = await res.json()
    if (data.success) { setBlocked(true); toast.success('Ghost ID blocked') }
  }

  async function upvoteReply(replyId: string) {
    if (votedReplies.has(replyId)) return
    setVotedReplies(prev => new Set(prev).add(replyId))
    setReplyUpvotes(u => ({ ...u, [replyId]: (u[replyId] || 0) + 1 }))
    const res = await fetch('/api/posts/upvote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ replyId }) })
    if (res.status === 409) {
      setReplyUpvotes(u => ({ ...u, [replyId]: (u[replyId] || 0) - 1 }))
    }
  }

  async function submitReply() {
    if (!body.trim()) return
    setLoading(true)
    const res = await fetch('/api/posts/reply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: post.id, body }) })
    const data = await res.json()
    if (data.success) {
      setBody('')
      const r = await fetch('/api/posts/replies?postId=' + post.id)
      const d = await r.json()
      setReplies(d.replies || [])
    }
    setLoading(false)
  }

  function openRelated(p: any) {
    setPost(p); setReplies([]); setReplyUpvotes({}); setBody(''); setViewCount(0); setBookmarked(false); setReported(false); setBlocked(false)
    window.history.pushState({}, '', '/post/' + p.id)
  }

  return (
    <AnimatePresence>
      <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, backdropFilter: 'blur(2px)' }}
      />
      <motion.div key="panel" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 560,
          background: 'var(--bg)', borderLeft: '1px solid var(--bd)', zIndex: 201, overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid var(--bd)',
          position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 1
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MessageCircle size={14} style={{ color: 'var(--t4)' }} />
              <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--t3)' }}>
                {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Eye size={13} style={{ color: 'var(--t2)' }} />
              <span style={{ fontSize: '.75rem', color: 'var(--t2)' }}>{viewCount >= 1000 ? (viewCount / 1000).toFixed(1) + 'k' : viewCount}</span>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: '1px solid var(--bd)', cursor: 'pointer',
            color: 'var(--t3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28, borderRadius: 'var(--r)'
          }}><X size={14} /></button>
        </div>

        <div style={{ padding: '16px 20px' }}>
          {/* Post content card */}
          <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '18px', marginBottom: 12 }}>
            {/* Post meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--blue)', background: 'var(--blue-d)', padding: '2px 7px', borderRadius: 3 }}>{post.categories?.name}</span>
              <span style={{
                fontFamily: 'monospace', fontSize: '.68rem', color: 'var(--t3)',
                background: 'var(--bg)', padding: '2px 8px', borderRadius: 4,
                border: '1px solid var(--bd)', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Ghost size={10} />{post.ghost_id}
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: '.65rem', color: 'var(--t4)', marginLeft: 'auto' }}>{timeAgo(post.created_at)}</span>
            </div>

            {/* Post body */}
            <h1 className="auto-dir post-title" style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--t1)', marginBottom: 10, lineHeight: 1.35, letterSpacing: '-.02em' }}>{post.title}</h1>
            {post.body && <LinkifiedText text={post.body} className="auto-dir" style={{ fontSize: '.9rem', color: 'var(--t2)', lineHeight: 1.8, marginBottom: 0 }} />}

            {/* Row 1: Compact reactions */}
            <div style={{ paddingTop: 14, marginTop: 14, borderTop: '1px solid var(--bd)' }}>
              <CompactReactionBar postId={post.id} />
            </div>

            {/* Row 2: Action bar */}
            <div style={{ display: 'flex', gap: 5, paddingTop: 10, marginTop: 10, borderTop: '1px solid var(--bd)', alignItems: 'center', flexWrap: 'wrap' }}>
              <UpvoteButton postId={post.id} upvotes={post.upvotes} />

              <motion.button whileTap={{ scale: 0.95 }} onClick={toggleBookmark} style={actionBtnStyle(bookmarked)}>
                <Bookmark size={12} fill={bookmarked ? 'currentColor' : 'none'} />
                <span className="action-label">{bookmarked ? 'Saved' : 'Save'}</span>
              </motion.button>

              <motion.button whileTap={{ scale: 0.95 }} onClick={copyLink} style={actionBtnStyle()}>
                <Link2 size={12} />
                <span className="action-label">Copy link</span>
              </motion.button>

              <FollowButton ghostId={post.ghost_id} />

              <motion.button whileTap={{ scale: 0.95 }} onClick={report} disabled={reported} style={actionBtnStyle()}>
                <Flag size={12} fill={reported ? 'currentColor' : 'none'} style={reported ? { color: 'var(--rose)' } : undefined} />
                <span className="action-label">{reported ? 'Reported' : 'Report'}</span>
              </motion.button>

              <motion.button whileTap={{ scale: 0.95 }} onClick={block} disabled={blocked} style={actionBtnStyle()}>
                <ShieldOff size={12} />
                <span className="action-label">{blocked ? 'Blocked' : 'Block'}</span>
              </motion.button>
            </div>
          </div>

          {/* Reply composer */}
          {user ? (
            <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '14px', marginBottom: 12 }}>
              <textarea placeholder="Write a reply…" value={body} onChange={e => setBody(e.target.value)} rows={3} className="auto-dir"
                style={{ width: '100%', fontSize: '.875rem', color: 'var(--t1)', background: 'none', border: 'none', outline: 'none', resize: 'none', lineHeight: 1.6, fontFamily: 'inherit', marginBottom: 8 }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--bd)' }}>
                <button onClick={submitReply} disabled={!body.trim() || loading} style={{
                  fontSize: '.8rem', fontWeight: 600, padding: '7px 16px', borderRadius: 'var(--r)',
                  background: body.trim() ? 'var(--blue)' : 'var(--bd)', color: '#fff', border: 'none',
                  cursor: body.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'background .15s'
                }}>{loading ? '...' : 'Reply anonymously'}</button>
              </div>
            </div>
          ) : (
            <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '14px', marginBottom: 12, textAlign: 'center' }}>
              <a href="/auth" style={{ fontSize: '.875rem', color: 'var(--blue)', fontWeight: 600 }}>Sign in to reply</a>
            </div>
          )}

          {/* Replies */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {replies.length > 0 ? replies.map((reply: any, i: number) => (
              <motion.div key={reply.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.25 }}
                style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', padding: '13px 15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                  <Ghost size={11} style={{ color: 'var(--t4)' }} />
                  <span style={{ fontFamily: 'monospace', fontSize: '.7rem', color: 'var(--t4)' }}>{reply.ghost_id}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '.65rem', color: 'var(--t4)', marginLeft: 'auto' }}>{timeAgo(reply.created_at)}</span>
                </div>
                <p className="auto-dir" style={{ fontSize: '.875rem', color: 'var(--t2)', lineHeight: 1.7, marginBottom: 10 }}>{reply.body}</p>
                <button onClick={() => upvoteReply(reply.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '4px 9px',
                  borderRadius: 'var(--rs)',
                  border: `1px solid ${votedReplies.has(reply.id) ? 'var(--blue)' : 'var(--bd)'}`,
                  background: votedReplies.has(reply.id) ? 'var(--blue)' : 'none',
                  color: votedReplies.has(reply.id) ? '#fff' : 'var(--t4)',
                  fontSize: '.75rem', fontWeight: 600,
                  cursor: votedReplies.has(reply.id) ? 'default' : 'pointer',
                  fontFamily: 'inherit'
                }}>
                  <ArrowUp size={11} />{replyUpvotes[reply.id] ?? reply.upvotes ?? 0}
                </button>
              </motion.div>
            )) : (
              <p style={{ textAlign: 'center', color: 'var(--t4)', fontSize: '.875rem', padding: '24px 0' }}>No replies yet. Be the first.</p>
            )}
          </div>

          {post.category_id && <RelatedPosts postId={post.id} categoryId={post.category_id} categoryName={post.categories?.name} onOpen={openRelated} />}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
