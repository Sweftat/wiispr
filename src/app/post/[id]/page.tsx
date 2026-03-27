'use client'
import { useState, useEffect } from 'react'
import { timeAgo } from '@/lib/time'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import UpvoteButton from '@/components/UpvoteButton'
import ReportButton from '@/components/ReportButton'
import ShareButton from '@/components/ShareButton'
import FollowButton from '@/components/FollowButton'
import BlockButton from '@/components/BlockButton'
import { motion } from 'framer-motion'
import { Ghost, ArrowUp, Eye, Bookmark, Link2, MessageCircle, ArrowLeft, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'

const REACTIONS = [
  { key: 'agree', emoji: '👍', label: 'Agree', color: '#2563EB' },
  { key: 'fire', emoji: '🔥', label: 'Fire', color: '#F97316' },
  { key: 'interesting', emoji: '👀', label: 'Interesting', color: '#8B5CF6' },
  { key: 'facts', emoji: '💯', label: 'Facts', color: '#16A34A' },
  { key: 'funny', emoji: '😂', label: 'Funny', color: '#EAB308' },
]

export default function PostPage() {
  const params = useParams()
  const id = params.id as string
  const [post, setPost] = useState<any>(null)
  const [replies, setReplies] = useState<any[]>([])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [viewCount, setViewCount] = useState(0)
  const [bookmarked, setBookmarked] = useState(false)
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({})
  const [userReaction, setUserReaction] = useState<string | null>(null)
  const [replyUpvotes, setReplyUpvotes] = useState<Record<string, number>>({})
  const [votedReplies, setVotedReplies] = useState<Set<string>>(new Set())
  const [related, setRelated] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/session').then(r => r.json()),
      fetch(`/api/posts/feed?offset=0&limit=1`).then(() =>
        fetch(`/api/posts/replies?postId=${id}`).then(r => r.json())
      ),
      fetch('/api/posts/view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: id }) }).then(r => r.json()),
      fetch('/api/bookmarks?postId=' + id).then(r => r.json()),
      fetch('/api/posts/reactions?postId=' + id).then(r => r.json()),
    ]).then(([session, repliesData, viewData, bookmarkData, reactionData]) => {
      if (session.user) setUser(session.user)
      setReplies(repliesData.replies || [])
      const init: Record<string, number> = {}
      ;(repliesData.replies || []).forEach((r: any) => { init[r.id] = r.upvotes || 0 })
      setReplyUpvotes(init)
      const rIds = (repliesData.replies || []).map((r: any) => r.id).join(',')
      if (rIds && session.user) {
        fetch('/api/posts/upvote?replyIds=' + rIds).then(r => r.json()).then(v => {
          if (v.voted) setVotedReplies(new Set(v.voted))
        }).catch(() => {})
      }
      setViewCount(viewData.viewCount || 0)
      if (bookmarkData.bookmarked) setBookmarked(true)
      setReactionCounts(reactionData.counts || {})
      setUserReaction(reactionData.userReaction || null)
    })

    // Fetch post data
    fetch(`/api/posts/replies?postId=${id}`).then(r => r.json()).then(d => {
      setReplies(d.replies || [])
    })

    // We need a way to get the post. Use a simple fetch approach
    fetchPost()
  }, [id])

  async function fetchPost() {
    // Fetch the post directly from feed by searching
    const res = await fetch(`/api/posts/related?postId=none&categoryId=0`)
    // Actually, let's just get the post from supabase via a simple endpoint approach
    // We can use the search endpoint or create a direct fetch
    const searchRes = await fetch(`/api/posts/feed?offset=0&limit=100`)
    const data = await searchRes.json()
    const allPosts = [...(data.posts || []), data.pinnedPost, data.postOfDay].filter(Boolean)
    const found = allPosts.find((p: any) => p.id === id)
    if (found) {
      setPost(found)
      setLoading(false)
      if (found.category_id) {
        fetch(`/api/posts/related?postId=${id}&categoryId=${found.category_id}`)
          .then(r => r.json()).then(d => setRelated(d.posts || []))
      }
    } else {
      // Fallback: try to get via view endpoint
      setLoading(false)
    }
  }

  async function toggleBookmark() {
    const res = await fetch('/api/bookmarks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: id, action: bookmarked ? 'remove' : 'add' })
    })
    const data = await res.json()
    if (data.success) { setBookmarked(!bookmarked); toast(bookmarked ? 'Removed from saved' : 'Post saved') }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    toast('Link copied!')
  }

  async function react(key: string) {
    if (!user) { toast.error('Sign in to react'); return }
    const wasSelected = userReaction === key
    const oldReaction = userReaction
    if (wasSelected) {
      setUserReaction(null)
      setReactionCounts(prev => ({ ...prev, [key]: Math.max(0, (prev[key] || 0) - 1) }))
    } else {
      setUserReaction(key)
      setReactionCounts(prev => {
        const next = { ...prev, [key]: (prev[key] || 0) + 1 }
        if (oldReaction) next[oldReaction] = Math.max(0, (next[oldReaction] || 0) - 1)
        return next
      })
    }
    await fetch('/api/posts/reactions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: id, reaction: key })
    })
  }

  async function upvoteReply(replyId: string) {
    if (!user) { toast.error('Sign in to upvote'); return }
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
    setSubmitting(true)
    const res = await fetch('/api/posts/reply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: id, body }) })
    const data = await res.json()
    if (data.success) {
      setBody('')
      const r = await fetch('/api/posts/replies?postId=' + id)
      const d = await r.json()
      setReplies(d.replies || [])
    }
    setSubmitting(false)
  }

  if (loading) return (
    <main style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <Nav />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px' }}>
        <p style={{ color: 'var(--t4)', fontSize: '.875rem', textAlign: 'center', padding: '40px 0' }}>Loading...</p>
      </div>
    </main>
  )

  if (!post) return (
    <main style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <Nav />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--t2)', fontSize: '.875rem', padding: '40px 0' }}>Post not found. <a href="/" style={{ color: 'var(--blue)' }}>Go back</a></p>
      </div>
    </main>
  )

  return (
    <main style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div style={{ flex: 1, maxWidth: 680, margin: '0 auto', padding: '20px', width: '100%' }}>
        <a href="/" style={{ fontSize: '.8rem', color: 'var(--blue)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 16, textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to feed
        </a>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '20px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--blue)', background: 'var(--blue-d)', padding: '2px 7px', borderRadius: 3 }}>{post.categories?.name}</span>
              <span style={{
                fontFamily: 'monospace', fontSize: '.68rem', color: 'var(--t3)',
                background: 'var(--bg)', padding: '2px 8px', borderRadius: 4,
                border: '1px solid var(--bd)', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Ghost size={10} />{post.ghost_id}
              </span>
              <FollowButton ghostId={post.ghost_id} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Eye size={12} style={{ color: 'var(--t4)' }} />
                  <span style={{ fontSize: '.7rem', color: 'var(--t4)' }}>{viewCount}</span>
                </div>
                <span style={{ fontFamily: 'monospace', fontSize: '.65rem', color: 'var(--t4)' }}>{timeAgo(post.created_at)}</span>
              </div>
            </div>

            <h1 className="auto-dir" style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--t1)', marginBottom: 10, lineHeight: 1.35, letterSpacing: '-.02em' }}>{post.title}</h1>
            {post.body && <p className="auto-dir" style={{ fontSize: '.9375rem', color: 'var(--t2)', lineHeight: 1.8, marginBottom: 16 }}>{post.body}</p>}

            {/* Reactions */}
            <div style={{ display: 'flex', gap: 6, paddingTop: 10, flexWrap: 'wrap' }}>
              {REACTIONS.map(r => {
                const selected = userReaction === r.key
                return (
                  <motion.button key={r.key} whileTap={{ scale: 0.88 }} onClick={() => react(r.key)} style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 'var(--rs)',
                    border: `1px solid ${selected ? r.color : 'var(--bd)'}`,
                    background: selected ? r.color + '15' : 'none',
                    cursor: 'pointer', fontSize: '.78rem', fontFamily: 'inherit',
                    color: selected ? r.color : 'var(--t3)', fontWeight: 600, transition: 'all .15s',
                  }}>
                    <span>{r.emoji}</span><span>{r.label}</span>
                    {(reactionCounts[r.key] || 0) > 0 && <span style={{ fontSize: '.68rem', opacity: 0.7 }}>{reactionCounts[r.key]}</span>}
                  </motion.button>
                )
              })}
            </div>

            {/* Action bar */}
            <div style={{ display: 'flex', gap: 6, paddingTop: 14, borderTop: '1px solid var(--bd)', marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <UpvoteButton postId={post.id} upvotes={post.upvotes} />
              <span style={{ fontSize: '.75rem', color: 'var(--t4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MessageCircle size={12} />{replies.length}
              </span>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginLeft: 'auto' }}>
                <motion.button whileTap={{ scale: 0.95 }} onClick={toggleBookmark} style={{
                  fontSize: '.72rem', fontWeight: 600, padding: '6px 10px', borderRadius: 'var(--rs)',
                  border: `1px solid ${bookmarked ? 'var(--blue)' : 'var(--bd)'}`,
                  background: bookmarked ? 'var(--blue-d)' : 'none',
                  color: bookmarked ? 'var(--blue)' : 'var(--t3)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit',
                }}>
                  <Bookmark size={11} fill={bookmarked ? 'currentColor' : 'none'} />{bookmarked ? 'Saved' : 'Save'}
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={copyLink} style={{
                  fontSize: '.72rem', fontWeight: 600, padding: '6px 10px', borderRadius: 'var(--rs)',
                  border: '1px solid var(--bd)', background: 'none', color: 'var(--t3)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit',
                }}>
                  <Link2 size={11} />Copy link
                </motion.button>
                <ShareButton postId={post.id} />
                <ReportButton postId={post.id} />
                <BlockButton ghostId={post.ghost_id} />
                {user && post.user_id === user.id && (
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => {
                    toast('Delete this post?', {
                      action: { label: 'Yes, delete', onClick: async () => {
                        const res = await fetch('/api/posts/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: post.id }) })
                        const data = await res.json()
                        if (data.success) {
                          toast.success('Post deleted')
                          window.location.href = '/'
                        }
                      }},
                      cancel: { label: 'Cancel', onClick: () => {} },
                    })
                  }} style={{
                    fontSize: '.72rem', fontWeight: 600, padding: '6px 10px', borderRadius: 'var(--rs)',
                    border: '1px solid var(--rose)', background: 'var(--rose-d)', color: 'var(--rose)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit',
                  }}>
                    <Trash2 size={11} />Delete
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Reply composer */}
        {user ? (
          <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '14px', marginBottom: 16 }}>
            <textarea placeholder="Write a reply…" value={body} onChange={e => setBody(e.target.value)} rows={3} className="auto-dir"
              style={{ width: '100%', fontSize: '.875rem', color: 'var(--t1)', background: 'none', border: 'none', outline: 'none', resize: 'none', lineHeight: 1.6, fontFamily: 'inherit', marginBottom: 8 }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--bd)' }}>
              <button onClick={submitReply} disabled={!body.trim() || submitting} style={{
                fontSize: '.8rem', fontWeight: 600, padding: '7px 16px', borderRadius: 'var(--r)',
                background: body.trim() ? 'var(--blue)' : 'var(--bd)', color: '#fff', border: 'none',
                cursor: body.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
              }}>{submitting ? '...' : 'Reply anonymously'}</button>
            </div>
          </div>
        ) : (
          <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '14px', marginBottom: 16, textAlign: 'center' }}>
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
                display: 'flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 'var(--rs)',
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

        {/* Related posts */}
        {related.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Related posts</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {related.map(p => (
                <a key={p.id} href={'/post/' + p.id} style={{
                  background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--r)',
                  padding: '10px 12px', textDecoration: 'none', display: 'block',
                }}>
                  <p style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--t1)', marginBottom: 4, lineHeight: 1.4 }}>{p.title}</p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: '.65rem', color: 'var(--t4)' }}>{p.upvotes} upvotes</span>
                    <span style={{ fontSize: '.65rem', color: 'var(--t4)' }}>{p.reply_count} replies</span>
                    <span style={{ fontSize: '.65rem', color: 'var(--t4)', marginLeft: 'auto' }}>{timeAgo(p.created_at)}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
