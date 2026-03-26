'use client'
import { useState, useEffect } from 'react'
import { timeAgo } from '@/lib/time'
import UpvoteButton from './UpvoteButton'
import ReportButton from './ReportButton'
import ShareButton from './ShareButton'
import FollowButton from './FollowButton'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, Ghost, ArrowUp, Eye, Bookmark } from 'lucide-react'
import { toast } from 'sonner'
import BlockButton from './BlockButton'

function ReactionBar({ postId }: { postId: string }) {
  const REACTIONS = [
    { key: 'eyes', emoji: '👀' },
    { key: 'fire', emoji: '🔥' },
    { key: 'hundred', emoji: '💯' },
  ]
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [userReactions, setUserReactions] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch('/api/posts/reactions?postId=' + postId).then(r => r.json()).then(d => {
      setCounts(d.counts || {})
      setUserReactions(d.userReactions || {})
    }).catch(() => {})
  }, [postId])

  async function react(key: string) {
    const removing = userReactions[key]
    setUserReactions(prev => ({ ...prev, [key]: !removing }))
    setCounts(prev => ({ ...prev, [key]: (prev[key] || 0) + (removing ? -1 : 1) }))
    await fetch('/api/posts/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, reaction: key, action: removing ? 'remove' : 'add' })
    })
  }

  return (
    <div style={{ display: 'flex', gap: 6, paddingTop: 8 }}>
      {REACTIONS.map(r => (
        <button
          key={r.key}
          onClick={() => react(r.key)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '5px 10px', borderRadius: 'var(--rs)',
            border: `1px solid ${userReactions[r.key] ? 'var(--blue)' : 'var(--bd)'}`,
            background: userReactions[r.key] ? 'var(--blue-d)' : 'none',
            cursor: 'pointer', fontSize: '.8rem', fontFamily: 'inherit',
            color: 'var(--t3)', fontWeight: 600, transition: 'all .15s',
          }}
        >
          <span>{r.emoji}</span>
          {(counts[r.key] || 0) > 0 && <span style={{ fontSize: '.72rem' }}>{counts[r.key]}</span>}
        </button>
      ))}
    </div>
  )
}

function RelatedPosts({ postId, categoryId, onOpen }: { postId: string, categoryId: number, onOpen: (p: any) => void }) {
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
      <p style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Related posts</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {related.map(p => (
          <div
            key={p.id}
            onClick={() => onOpen(p)}
            style={{
              background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--r)',
              padding: '10px 12px', cursor: 'pointer', transition: 'border-color .15s',
            }}
          >
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

export default function PostPanel({ post: initialPost, onClose }: { post: any, onClose: () => void }) {
  const [post, setPost] = useState(initialPost)
  const [replies, setReplies] = useState<any[]>([])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [replyUpvotes, setReplyUpvotes] = useState<Record<string, number>>({})
  const [viewCount, setViewCount] = useState(post.view_count || 0)
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(d => { if (d.user) setUser(d.user) })
    fetch('/api/posts/replies?postId=' + post.id).then(r => r.json()).then(d => {
      const replies = d.replies || []
      setReplies(replies)
      const init: Record<string, number> = {}
      replies.forEach((r: any) => { init[r.id] = r.upvotes || 0 })
      setReplyUpvotes(init)
    })
    fetch('/api/posts/view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: post.id }) })
      .then(r => r.json()).then(d => { if (d.viewCount) setViewCount(d.viewCount) })
    fetch('/api/bookmarks?postId=' + post.id).then(r => r.json()).then(d => {
      if (d.bookmarked) setBookmarked(true)
    }).catch(() => {})
  }, [post.id])

  async function toggleBookmark() {
    const res = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id, action: bookmarked ? 'remove' : 'add' })
    })
    const data = await res.json()
    if (data.success) {
      setBookmarked(!bookmarked)
      toast(bookmarked ? 'Removed from saved' : 'Post saved')
    }
  }

  async function upvoteReply(replyId: string) {
    setReplyUpvotes(u => ({ ...u, [replyId]: (u[replyId] || 0) + 1 }))
    await fetch('/api/posts/upvote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ replyId }) })
  }

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

  function openRelated(p: any) {
    setPost(p)
    setReplies([])
    setReplyUpvotes({})
    setBody('')
    setViewCount(0)
    setBookmarked(false)
    window.history.pushState({}, '', '/post/' + p.id)
  }

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, backdropFilter: 'blur(2px)' }}
      />

      <motion.div
        key="panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '100%', maxWidth: 560,
          background: 'var(--bg)', borderLeft: '1px solid var(--bd)',
          zIndex: 201, overflowY: 'auto'
        }}
      >
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
              <Eye size={13} style={{ color: 'var(--t4)' }} />
              <span style={{ fontSize: '.75rem', color: 'var(--t4)' }}>{viewCount}</span>
            </div>
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
          <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '18px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--blue)', background: 'var(--blue-d)', padding: '2px 7px', borderRadius: 3 }}>{post.categories?.name}</span>
              <span style={{ fontFamily: 'monospace', fontSize: '.7rem', color: 'var(--t4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Ghost size={11} />
                {post.ghost_id}
              </span>
              <FollowButton ghostId={post.ghost_id} />
              <span style={{ fontFamily: 'monospace', fontSize: '.65rem', color: 'var(--t4)', marginLeft: 'auto' }}>{timeAgo(post.created_at)}</span>
            </div>
            <h1 className="auto-dir post-title" style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--t1)', marginBottom: 10, lineHeight: 1.35, letterSpacing: '-.02em' }}>{post.title}</h1>
            {post.body && <p className="auto-dir" style={{ fontSize: '.9rem', color: 'var(--t2)', lineHeight: 1.8, marginBottom: 14 }}>{post.body}</p>}

            <ReactionBar postId={post.id} />

            <div style={{ display: 'flex', gap: 6, paddingTop: 12, borderTop: '1px solid var(--bd)', marginTop: 10, alignItems: 'center' }}>
              <UpvoteButton postId={post.id} upvotes={post.upvotes} />
              <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                <button onClick={toggleBookmark} style={{
                  background: 'none', border: '1px solid var(--bd)', borderRadius: 'var(--rs)',
                  padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  color: bookmarked ? 'var(--blue)' : 'var(--t4)', transition: 'color .15s',
                }}>
                  <Bookmark size={12} fill={bookmarked ? 'var(--blue)' : 'none'} />
                </button>
                <ShareButton postId={post.id} />
                <ReportButton postId={post.id} />
                <BlockButton ghostId={post.ghost_id} />
              </span>
            </div>
          </div>

          {user ? (
            <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '14px', marginBottom: 12 }}>
              <textarea
                placeholder="Write a reply…"
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={3}
                className="auto-dir"
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {replies.length > 0 ? replies.map((reply: any, i: number) => (
              <motion.div
                key={reply.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', padding: '13px 15px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                  <Ghost size={11} style={{ color: 'var(--t4)' }} />
                  <span style={{ fontFamily: 'monospace', fontSize: '.7rem', color: 'var(--t4)' }}>{reply.ghost_id}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '.65rem', color: 'var(--t4)', marginLeft: 'auto' }}>{timeAgo(reply.created_at)}</span>
                </div>
                <p className="auto-dir" style={{ fontSize: '.875rem', color: 'var(--t2)', lineHeight: 1.7, marginBottom: 10 }}>{reply.body}</p>
                <button
                  onClick={() => upvoteReply(reply.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 'var(--rs)', border: '1px solid var(--bd)', background: 'none', color: 'var(--t4)', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  <ArrowUp size={11} />
                  {replyUpvotes[reply.id] ?? reply.upvotes ?? 0}
                </button>
              </motion.div>
            )) : (
              <p style={{ textAlign: 'center', color: 'var(--t4)', fontSize: '.875rem', padding: '24px 0' }}>No replies yet. Be the first.</p>
            )}
          </div>

          {post.category_id && (
            <RelatedPosts postId={post.id} categoryId={post.category_id} onOpen={openRelated} />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
