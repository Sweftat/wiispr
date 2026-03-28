'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { timeAgo } from '@/lib/time'
import FollowButton from './FollowButton'
import PostPanel from './PostPanel'
import CategoryFilter from './CategoryFilter'
import Compose from './Compose'
import ShareButton from './ShareButton'
import { ArrowUp, MessageCircle, Ghost, Pin, Star, ShieldAlert, Bookmark, RefreshCw, Flame, Link2, Share2, Flag, ShieldOff, Trash2, Image, X } from 'lucide-react'
import UpvoteButton from './UpvoteButton'
import GifPicker from './GifPicker'
import { useInView } from 'react-intersection-observer'
import { toast } from 'sonner'
import LinkifiedText from './LinkifiedText'

function StickyCategories({ categories, onSelect }: { categories: any[], onSelect: (id: any) => void }) {
  const [navH, setNavH] = useState(52)

  useEffect(() => {
    let lastY = 0
    function handleScroll() {
      const y = window.scrollY
      if (y > 50 && y > lastY) setNavH(44)
      else if (y < lastY) setNavH(52)
      lastY = y
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={{
      position: 'sticky',
      top: navH,
      zIndex: 90,
      background: 'var(--bg)',
      paddingTop: 8,
      paddingBottom: 6,
      marginLeft: -20,
      marginRight: -20,
      paddingLeft: 20,
      paddingRight: 20,
      borderBottom: '1px solid var(--bd)',
      transition: 'top 0.2s ease',
    }}>
      <CategoryFilter categories={categories} onSelect={onSelect} />
    </div>
  )
}

function Skeleton() {
  return (
    <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '16px 18px', marginBottom: 10 }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }`}</style>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <div style={{ width: 64, height: 16, borderRadius: 4, background: 'var(--bd)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ width: 80, height: 14, borderRadius: 4, background: 'var(--bd)', animation: 'pulse 1.5s ease-in-out infinite .2s' }} />
      </div>
      <div style={{ width: '70%', height: 18, borderRadius: 4, background: 'var(--bd)', marginBottom: 10, animation: 'pulse 1.5s ease-in-out infinite .1s' }} />
      <div style={{ width: '100%', height: 13, borderRadius: 4, background: 'var(--bd)', marginBottom: 6, animation: 'pulse 1.5s ease-in-out infinite .15s' }} />
      <div style={{ width: '55%', height: 13, borderRadius: 4, background: 'var(--bd)', marginBottom: 14, animation: 'pulse 1.5s ease-in-out infinite .25s' }} />
      <div style={{ display: 'flex', gap: 6, paddingTop: 10, borderTop: '1px solid var(--bd)' }}>
        <div style={{ width: 48, height: 26, borderRadius: 'var(--rs)', background: 'var(--bd)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ width: 64, height: 26, borderRadius: 'var(--rs)', background: 'var(--bd)', animation: 'pulse 1.5s ease-in-out infinite .1s' }} />
      </div>
    </div>
  )
}

const CATEGORY_COLORS: Record<string, string> = {
  technology: '#2563EB',
  sports: '#F97316',
  lifestyle: '#16A34A',
  business: '#7C3AED',
  gaming: '#E11D48',
  family: '#D97706',
  "women's space": '#EC4899',
  open: '#64748B',
  entertainment: '#0891B2',
  health: '#EF4444',
  food: '#EA580C',
  religion: '#4F46E5',
  relationships: '#BE185D',
  career: '#0369A1',
  travel: '#059669',
  finance: '#CA8A04',
}
function categoryAccent(name: string) {
  return CATEGORY_COLORS[name?.toLowerCase()] || 'var(--blue)'
}

const REACTIONS = [
  { key: 'agree', emoji: '👍', label: 'Agree' },
  { key: 'fire', emoji: '🔥', label: 'Fire' },
  { key: 'interesting', emoji: '👀', label: 'Interesting' },
  { key: 'facts', emoji: '💯', label: 'Facts' },
  { key: 'funny', emoji: '😂', label: 'Funny' },
]

function CompactReactions({ postId, showAll = false }: { postId: string, showAll?: boolean }) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [userReaction, setUserReaction] = useState<string | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    fetch('/api/posts/reactions?postId=' + postId).then(r => r.json()).then(d => {
      setCounts(d.counts || {})
      setUserReaction(d.userReaction || null)
      if (d.userReaction) setLoggedIn(true)
    }).catch(() => {})
    // Check login via cookie
    setLoggedIn(!!document.cookie.match(/wiispr_user_id=/))
  }, [postId])

  async function react(e: React.MouseEvent, key: string) {
    e.stopPropagation()
    if (!loggedIn) { toast.error('Sign in to react'); return }
    const wasSelected = userReaction === key
    const oldReaction = userReaction

    // Optimistic update
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, reaction: key })
    })
  }

  const totalReactions = Object.values(counts).reduce((a, b) => a + b, 0)
  if (totalReactions === 0 && !userReaction && !showAll) return null

  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
      {REACTIONS.filter(r => showAll || (counts[r.key] || 0) > 0 || userReaction === r.key).map(r => (
        <motion.button
          key={r.key}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => react(e, r.key)}
          style={{
            display: 'flex', alignItems: 'center', gap: 3,
            padding: '3px 7px', borderRadius: 'var(--rs)',
            border: `1px solid ${userReaction === r.key ? 'var(--blue)' : 'var(--bd)'}`,
            background: userReaction === r.key ? 'var(--blue-d)' : 'none',
            cursor: 'pointer', fontSize: '.7rem', fontFamily: 'inherit',
            color: 'var(--t3)', fontWeight: 600, transition: 'all .15s',
          }}
        >
          <span style={{ fontSize: '.75rem' }}>{r.emoji}</span>
          <span>{counts[r.key] || 0}</span>
        </motion.button>
      ))}
    </div>
  )
}

function BookmarkButton({ postId }: { postId: string }) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/bookmarks?postId=' + postId).then(r => r.json()).then(d => {
      if (d.bookmarked) setSaved(true)
    }).catch(() => {})
  }, [postId])

  async function toggle(e: React.MouseEvent) {
    e.stopPropagation()
    if (loading) return
    setLoading(true)
    const res = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, action: saved ? 'remove' : 'add' })
    })
    const data = await res.json()
    if (data.success) {
      setSaved(!saved)
      toast(saved ? 'Removed from saved' : 'Post saved')
    }
    setLoading(false)
  }

  return (
    <button onClick={toggle} style={{
      background: 'none', border: '1px solid var(--bd)', borderRadius: 'var(--rs)',
      padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center',
      color: saved ? 'var(--blue)' : 'var(--t4)', transition: 'color .15s',
    }}>
      <Bookmark size={12} fill={saved ? 'var(--blue)' : 'none'} />
    </button>
  )
}

function PostCard({ post, onOpen, onTagClick, followedGhosts, currentUserId }: { post: any, onOpen: () => void, onTagClick?: (tag: string) => void, followedGhosts?: Set<string>, currentUserId?: string | null }) {
  const [revealed, setRevealed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const accent = categoryAccent(post.categories?.name)

  return (
    <div
      className="post-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--sur)',
        border: '1px solid var(--bd)',
        borderLeft: `3px solid ${hovered ? accent : accent + '40'}`,
        borderRadius: 'var(--rm)', padding: '16px 16px 16px 15px', marginBottom: 10,
        cursor: 'pointer', transition: 'box-shadow .18s, border-left-color .18s',
        position: 'relative', overflow: 'hidden',
      }}
      onClick={() => post.content_warning && !revealed ? undefined : onOpen()}
    >
      {/* Subtle category gradient at top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 60,
        background: `linear-gradient(180deg, ${accent}08 0%, transparent 100%)`,
        pointerEvents: 'none',
      }} />

      {/* Content warning overlay */}
      {post.content_warning && !revealed && (
        <div
          onClick={e => { e.stopPropagation(); setRevealed(true) }}
          style={{
            position: 'absolute', inset: 0, zIndex: 2,
            backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.35)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
            borderRadius: 'var(--rm)', cursor: 'pointer',
          }}
        >
          <ShieldAlert size={22} style={{ color: '#FDE68A' }} />
          <p style={{ fontSize: '.8rem', fontWeight: 700, color: '#fff' }}>⚠ {post.content_warning}</p>
          <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,0.7)' }}>Click to reveal</p>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, position: 'relative' }}>
        <span style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: accent, background: accent + '15', padding: '2px 7px', borderRadius: 3 }}>{post.categories?.name}</span>
        <span style={{
          fontFamily: 'monospace', fontSize: '.68rem', color: 'var(--t3)',
          background: 'var(--bg)', padding: '2px 8px', borderRadius: 4,
          border: '1px solid var(--bd)', fontWeight: 600,
        }}>
          <Ghost size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
          {post.ghost_id}
        </span>
        {followedGhosts?.has(post.ghost_id) && (
          <span style={{ fontSize: '.6rem', fontWeight: 600, color: 'var(--grn)', background: 'var(--grn-d)', padding: '1px 8px', borderRadius: 9999, border: '1px solid rgba(22,163,74,.2)' }}>Following</span>
        )}
        {post.users?.trust_level && post.users.trust_level !== 'new' && (
          <span style={{
            fontSize: '.55rem', fontWeight: 700, letterSpacing: '.04em',
            textTransform: 'uppercase', padding: '2px 6px', borderRadius: 3,
            color: post.users.trust_level === 'top' ? '#D97706' : post.users.trust_level === 'trusted' ? 'var(--grn)' : 'var(--blue)',
            background: post.users.trust_level === 'top' ? '#FFFBEB' : post.users.trust_level === 'trusted' ? 'var(--grn-d)' : 'var(--blue-d)',
          }}>{post.users.trust_level}</span>
        )}
        {(post.upvotes || 0) >= 100 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '.6rem', fontWeight: 700, color: '#F97316', background: '#FFF7ED', padding: '2px 6px', borderRadius: 3 }}>
            <Flame size={10} /> Hot
          </span>
        )}
        {post.user_id !== currentUserId && <span className="nav-follow" onClick={e => e.stopPropagation()}>
          <FollowButton ghostId={post.ghost_id} />
        </span>}
        <span style={{ fontFamily: 'monospace', fontSize: '.65rem', color: 'var(--t4)', marginLeft: 'auto' }}>{timeAgo(post.created_at)}</span>
      </div>
      <h2 className="auto-dir" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6, position: 'relative' }}>{post.title}</h2>
      {post.body && <LinkifiedText text={post.body} className="auto-dir" style={{ fontSize: '.875rem', color: 'var(--t2)', lineHeight: 1.7, marginBottom: 8, position: 'relative' }} />}
      {post.gif_url && (
        <img src={post.gif_url} alt="" loading="lazy" style={{ maxHeight: 200, borderRadius: 'var(--rs)', objectFit: 'cover', marginBottom: 8, display: 'block' }} />
      )}
      {(() => {
        const tags: string[] = (post.tags || []).slice(0, 3)
        if (tags.length === 0) return null
        const allTags: string[] = post.tags || []
        return (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
            {tags.map((t: string, i: number) => (
              <span key={i} onClick={(e) => { e.stopPropagation(); onTagClick?.(t) }}
                style={{ fontSize: '.68rem', color: 'var(--t3)', background: 'var(--bd)', padding: '2px 8px', borderRadius: 99, cursor: 'pointer', fontWeight: 600 }}>
                #{t}
              </span>
            ))}
            {allTags.length > 3 && <span style={{ fontSize: '.65rem', color: 'var(--t4)' }}>+{allTags.length - 3}</span>}
          </div>
        )
      })()}

      <CompactReactions postId={post.id} />

      <div style={{ display: 'flex', gap: 6, paddingTop: 10, borderTop: '1px solid var(--bd)', alignItems: 'center', marginTop: 8, position: 'relative' }}>
        <button style={{ fontSize: '.75rem', fontWeight: 600, padding: '5px 10px', borderRadius: 'var(--rs)', border: '1px solid var(--bd)', background: 'none', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ArrowUp size={12} />{post.upvotes}
        </button>
        <button onClick={(e) => { e.stopPropagation(); setShowReplies(!showReplies) }} style={{ fontSize: '.75rem', fontWeight: 600, padding: '5px 10px', borderRadius: 'var(--rs)', border: `1px solid ${showReplies ? 'var(--blue)' : 'var(--bd)'}`, background: showReplies ? 'var(--blue-d)' : 'none', color: showReplies ? 'var(--blue)' : 'var(--t3)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontFamily: 'inherit' }}>
          <MessageCircle size={12} />{post.reply_count}
        </button>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
          <BookmarkButton postId={post.id} />
          <ShareButton postId={post.id} />
        </span>
      </div>

      {/* Inline reply drawer */}
      <AnimatePresence>
        {showReplies && <InlineReplyDrawer postId={post.id} onOpenPanel={onOpen} />}
      </AnimatePresence>
    </div>
  )
}

function SortTabs({ active, onSelect }: { active: string, onSelect: (m: 'new' | 'top' | 'trending' | 'following') => void }) {
  const tabs = [
    { key: 'new', label: 'New' },
    { key: 'top', label: 'Top' },
    { key: 'trending', label: 'Trending' },
    { key: 'following', label: 'Following' },
  ] as const
  return (
    <div style={{
      display: 'inline-flex', background: 'var(--bg)', border: '1px solid var(--bd)',
      borderRadius: 'var(--r)', padding: 2, marginBottom: 12, gap: 2,
    }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onSelect(t.key as any)} style={{
          fontSize: '.75rem', fontWeight: active === t.key ? 600 : 500,
          padding: '4px 12px', borderRadius: 'var(--rs)', border: 'none',
          background: active === t.key ? 'var(--sur)' : 'transparent',
          color: active === t.key ? 'var(--t1)' : 'var(--t3)',
          cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: active === t.key ? '0 1px 3px rgba(0,0,0,.07)' : 'none',
          transition: 'all .15s',
        }}>{t.label}</button>
      ))}
    </div>
  )
}

function InlineReplyDrawer({ postId, onOpenPanel }: { postId: string, onOpenPanel: () => void }) {
  const [replies, setReplies] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)
  const [replyBody, setReplyBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(d => { setLoggedIn(!!d.user); setSessionChecked(true) }).catch(() => setSessionChecked(true))
    fetch('/api/posts/replies?postId=' + postId + '&limit=3').then(r => r.json()).then(d => {
      setReplies((d.replies || []).slice(0, 3))
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [postId])

  async function submitReply() {
    if (!replyBody.trim() || submitting) return
    setSubmitting(true)
    const res = await fetch('/api/posts/reply', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, body: replyBody })
    })
    const data = await res.json()
    if (data.success) {
      setReplyBody('')
      toast.success('Reply posted!')
      const r = await fetch('/api/posts/replies?postId=' + postId + '&limit=3')
      const d = await r.json()
      setReplies((d.replies || []).slice(0, 3))
    } else if (res.status === 401) {
      toast.error('Sign in to reply')
    }
    setSubmitting(false)
  }

  const remaining = 280 - replyBody.length

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      style={{ overflow: 'hidden' }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ padding: '10px 16px 14px', borderTop: '1px solid var(--bd)' }}>
        {!loaded && <p style={{ fontSize: '.78rem', color: 'var(--t4)' }}>Loading...</p>}
        {loaded && replies.length === 0 && <p style={{ fontSize: '.78rem', color: 'var(--t4)', marginBottom: 8 }}>No replies yet</p>}
        {replies.map(r => (
          <div key={r.id} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 3 }}>
              <span style={{ fontFamily: 'monospace', fontSize: '.65rem', color: 'var(--t4)' }}>{r.ghost_id}</span>
              <span style={{ fontSize: '.6rem', color: 'var(--t4)' }}>{timeAgo(r.created_at)}</span>
            </div>
            <p className="auto-dir" style={{ fontSize: '.8rem', color: 'var(--t2)', lineHeight: 1.6 }}>{r.body}</p>
          </div>
        ))}
        {replies.length > 3 && (
          <button onClick={onOpenPanel} style={{
            fontSize: '.72rem', color: 'var(--blue)', background: 'none', border: 'none',
            cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, marginBottom: 10, padding: 0,
          }}>Show all replies →</button>
        )}

        {loggedIn ? (
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                placeholder="Quick reply..."
                className="auto-dir"
                value={replyBody}
                onChange={e => setReplyBody(e.target.value.slice(0, 280))}
                rows={2}
                style={{
                  width: '100%', fontSize: '.8rem', color: 'var(--t1)', background: 'var(--bg)',
                  border: '1px solid var(--bd)', borderRadius: 'var(--rs)', padding: '6px 8px',
                  outline: 'none', resize: 'none', fontFamily: 'inherit',
                }}
              />
              <span style={{
                position: 'absolute', bottom: 4, right: 6,
                fontSize: '.65rem', fontFamily: 'monospace',
                color: remaining <= 20 ? 'var(--rose)' : 'var(--t4)',
              }}>{remaining}</span>
            </div>
            <button onClick={submitReply} disabled={!replyBody.trim() || submitting} style={{
              fontSize: '.75rem', fontWeight: 600, padding: '6px 12px', borderRadius: 'var(--rs)',
              background: replyBody.trim() ? 'var(--blue)' : 'var(--bd)',
              color: '#fff', border: 'none', cursor: replyBody.trim() ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}>Reply</button>
          </div>
        ) : sessionChecked ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <a href="/auth?signin=1" style={{ border: '1px solid var(--bd)', color: 'var(--t2)', background: 'none', padding: '5px 14px', borderRadius: 'var(--rs)', fontSize: '.75rem', fontWeight: 600, textDecoration: 'none' }}>Log in</a>
              <a href="/auth" style={{ background: 'var(--blue)', color: '#fff', padding: '5px 14px', borderRadius: 'var(--rs)', fontSize: '.75rem', fontWeight: 600, textDecoration: 'none', border: 'none' }}>Sign up</a>
            </div>
          </div>
        ) : null}
      </div>
    </motion.div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Feed({ initialPosts, initialPinnedPost, initialPostOfDay, categories }: { initialPosts: any[], initialPinnedPost: any, initialPostOfDay: any, categories: any[] }) {
  const [posts, setPosts] = useState<any[]>(initialPosts)
  const [pinnedPost, setPinnedPost] = useState<any>(initialPinnedPost)
  const [postOfDay, setPostOfDay] = useState<any>(initialPostOfDay)
  const [loading, setLoading] = useState(false)
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null)
  const [repliesCache, setRepliesCache] = useState<Record<string, any[]>>({})
  const [replyBody, setReplyBody] = useState<Record<string, string>>({})
  const [replyLoading, setReplyLoading] = useState<Record<string, boolean>>({})
  const [replySort, setReplySort] = useState<Record<string, 'best' | 'new'>>({})
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({})
  const [reported, setReported] = useState<Record<string, boolean>>({})
  const [blocked, setBlocked] = useState<Record<string, boolean>>({})
  const [replyGifUrl, setReplyGifUrl] = useState<Record<string, string>>({})
  const [gifPickerOpen, setGifPickerOpen] = useState<Record<string, boolean>>({})
  const [sessionUserId, setSessionUserId] = useState<string | null>(null)
  const [newPostCount, setNewPostCount] = useState(0)
  const [hasMore, setHasMore] = useState(initialPosts.length >= 20)
  const [loadingMore, setLoadingMore] = useState(false)
  const [sortMode, setSortMode] = useState<'new' | 'top' | 'trending' | 'following'>('new')
  const [followedGhosts, setFollowedGhosts] = useState<Set<string>>(new Set())
  const savedScrollY = useRef(0)
  const activeCategoryRef = useRef<number | string | null>(null)
  const latestPostTime = useRef<string>(initialPosts[0]?.created_at || new Date().toISOString())
  const isMobileRef = useRef(false)

  const { ref: sentinelRef, inView } = useInView({ threshold: 0 })

  useEffect(() => {
    const check = () => { isMobileRef.current = window.innerWidth < 768 }
    check()
    window.addEventListener('resize', check)
    // Fetch session + followed ghost IDs
    fetch('/api/auth/session').then(r => r.json()).then(d => { if (d.user?.id) setSessionUserId(d.user.id) }).catch(() => {})
    fetch('/api/follows').then(r => r.json()).then(d => {
      if (d.following) setFollowedGhosts(new Set(d.following.map((f: any) => f.ghost_id)))
    }).catch(() => {})
    // Listen for post deletions
    function onPostDeleted(e: Event) {
      const id = (e as CustomEvent).detail
      setPosts(prev => prev.filter(p => p.id !== id))
    }
    window.addEventListener('postDeleted', onPostDeleted)
    return () => { window.removeEventListener('resize', check); window.removeEventListener('postDeleted', onPostDeleted) }
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      if (activeCategoryRef.current) return
      try {
        const res = await fetch('/api/posts/feed?since=' + encodeURIComponent(latestPostTime.current))
        const data = await res.json()
        if (data.newCount > 0) setNewPostCount(data.newCount)
      } catch {}
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!inView || !hasMore || loadingMore || loading) return
    loadMore()
  }, [inView, hasMore, loadingMore, loading])

  async function loadMore() {
    setLoadingMore(true)
    const cat = activeCategoryRef.current
    let url = `/api/posts/feed?offset=${posts.length}&limit=20`
    if (cat && cat !== 'following' && cat !== 'trending') url += `&category=${cat}`
    try {
      const res = await fetch(url)
      const data = await res.json()
      const newPosts = data.posts || []
      setPosts(prev => [...prev, ...newPosts])
      if (newPosts.length < 20) setHasMore(false)
    } catch {}
    setLoadingMore(false)
  }

  async function refreshFeed() {
    setLoading(true)
    setNewPostCount(0)
    const res = await fetch('/api/posts/feed')
    const data = await res.json()
    setPosts(data.posts || [])
    setPinnedPost(data.pinnedPost || null)
    setPostOfDay(data.postOfDay || null)
    if (data.posts?.length > 0) latestPostTime.current = data.posts[0].created_at
    setHasMore((data.posts || []).length >= 20)
    setLoading(false)
  }

  async function filterByCategory(categoryId: number | null | string) {
    setLoading(true)
    activeCategoryRef.current = categoryId
    setNewPostCount(0)
    let url = '/api/posts/feed'
    if (categoryId === 'following') url = '/api/posts/following'
    else if (categoryId === 'trending') url = '/api/posts/trending'
    else if (categoryId) url = '/api/posts/feed?category=' + categoryId
    const res = await fetch(url)
    const data = await res.json()
    setPosts(data.posts || [])
    setPinnedPost(data.pinnedPost || null)
    setPostOfDay(data.postOfDay || null)
    setHasMore((data.posts || []).length >= 20)
    setLoading(false)
  }

  async function sortFeed(mode: 'new' | 'top' | 'trending' | 'following') {
    setSortMode(mode)
    setLoading(true)
    setNewPostCount(0)
    let url = '/api/posts/feed'
    if (mode === 'top') url = '/api/posts/feed?sort=top'
    else if (mode === 'trending') url = '/api/posts/trending'
    else if (mode === 'following') url = '/api/posts/following'
    const cat = activeCategoryRef.current
    if (cat && mode !== 'trending' && mode !== 'following' && typeof cat === 'number') {
      url += (url.includes('?') ? '&' : '?') + 'category=' + cat
    }
    try {
      const res = await fetch(url)
      const data = await res.json()
      setPosts(data.posts || [])
      setHasMore((data.posts || []).length >= 20)
    } catch {}
    setLoading(false)
  }

  async function filterByTag(tag: string) {
    setLoading(true)
    setNewPostCount(0)
    const res = await fetch('/api/posts/feed?tag=' + encodeURIComponent(tag))
    const data = await res.json()
    setPosts(data.posts || [])
    setPinnedPost(null)
    setPostOfDay(null)
    setHasMore(false)
    setLoading(false)
  }

  useEffect(() => {
    function handleSidebarSelect(e: CustomEvent) { filterByCategory(e.detail) }
    function handleTagFilter(e: CustomEvent) { filterByTag(e.detail) }
    window.addEventListener('sidebarCategorySelect', handleSidebarSelect as EventListener)
    window.addEventListener('filterByTag', handleTagFilter as EventListener)
    return () => {
      window.removeEventListener('sidebarCategorySelect', handleSidebarSelect as EventListener)
      window.removeEventListener('filterByTag', handleTagFilter as EventListener)
    }
  }, [])

  function openPost(post: any) {
    if (isMobileRef.current) {
      window.location.href = '/post/' + post.id
      return
    }
    // Desktop: toggle inline expansion
    if (expandedPostId === post.id) {
      setExpandedPostId(null)
    } else {
      setExpandedPostId(post.id)
      // Fetch replies if not cached
      if (!repliesCache[post.id]) {
        fetch('/api/posts/replies?postId=' + post.id).then(r => r.json()).then(d => {
          setRepliesCache(prev => ({ ...prev, [post.id]: d.replies || [] }))
        }).catch(() => {})
      }
      // Increment view
      fetch('/api/posts/view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: post.id }) }).catch(() => {})
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Greeting header */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 2 }}>
          {getGreeting()} 👋
        </h1>
        <p style={{ fontSize: '.8rem', color: 'var(--t4)' }}>What&apos;s happening on wiispr</p>
      </div>

      <Compose categories={categories} />
      <StickyCategories categories={categories} onSelect={filterByCategory} />
      <SortTabs active={sortMode} onSelect={sortFeed} />

      <AnimatePresence>
        {newPostCount > 0 && (
          <motion.button
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            onClick={refreshFeed}
            style={{
              width: '100%', padding: '10px 16px', marginBottom: 10,
              background: 'var(--blue-d)', border: '1px solid var(--blue)',
              borderRadius: 'var(--r)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: '.8rem', fontWeight: 600, color: 'var(--blue)', fontFamily: 'inherit',
            }}
          >
            <RefreshCw size={13} />
            {newPostCount} new {newPostCount === 1 ? 'post' : 'posts'} — tap to refresh
          </motion.button>
        )}
      </AnimatePresence>

      {postOfDay && !loading && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
          <div className="post-card" style={{
            background: 'linear-gradient(135deg, #FFFBEB 0%, var(--sur) 100%)',
            border: '1px solid #D97706', borderRadius: 'var(--rm)', padding: '16px 18px', marginBottom: 10,
            cursor: 'pointer',
          }} onClick={() => openPost(postOfDay)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Star size={11} style={{ color: '#D97706' }} fill="#D97706" />
              <span style={{ fontSize: '.65rem', fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '.05em' }}>Post of the Day</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#D97706', background: '#FFFBEB', padding: '2px 7px', borderRadius: 3, border: '1px solid #FDE68A' }}>{postOfDay.categories?.name}</span>
              <span style={{ fontFamily: 'monospace', fontSize: '.7rem', color: 'var(--t4)' }}>{postOfDay.ghost_id}</span>
              <span style={{ fontFamily: 'monospace', fontSize: '.65rem', color: 'var(--t4)', marginLeft: 'auto' }}>{timeAgo(postOfDay.created_at)}</span>
            </div>
            <h2 className="auto-dir" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>{postOfDay.title}</h2>
            {postOfDay.body && <p className="auto-dir" style={{ fontSize: '.875rem', color: 'var(--t2)', lineHeight: 1.7, marginBottom: 12 }}>{postOfDay.body}</p>}
            <div style={{ display: 'flex', gap: 6, paddingTop: 10, borderTop: '1px solid #FDE68A', alignItems: 'center' }}>
              <span style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 4 }}><ArrowUp size={12} />{postOfDay.upvotes}</span>
              <span style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 4 }}><MessageCircle size={12} />{postOfDay.reply_count}</span>
            </div>
          </div>
        </motion.div>
      )}

      {pinnedPost && !loading && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.05, ease: 'easeOut' }}>
          <div className="post-card" style={{
            background: 'var(--sur)', border: '1px solid var(--blue)',
            borderRadius: 'var(--rm)', padding: '16px 18px', marginBottom: 10, cursor: 'pointer',
          }} onClick={() => openPost(pinnedPost)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Pin size={11} style={{ color: 'var(--blue)' }} />
              <span style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Pinned</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--blue)', background: 'var(--blue-d)', padding: '2px 7px', borderRadius: 3 }}>{pinnedPost.categories?.name}</span>
              <span style={{ fontFamily: 'monospace', fontSize: '.7rem', color: 'var(--t4)' }}>{pinnedPost.ghost_id}</span>
              <span style={{ fontFamily: 'monospace', fontSize: '.65rem', color: 'var(--t4)', marginLeft: 'auto' }}>{timeAgo(pinnedPost.created_at)}</span>
            </div>
            <h2 className="auto-dir" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>{pinnedPost.title}</h2>
            {pinnedPost.body && <p className="auto-dir" style={{ fontSize: '.875rem', color: 'var(--t2)', lineHeight: 1.7, marginBottom: 12 }}>{pinnedPost.body}</p>}
            <div style={{ display: 'flex', gap: 6, paddingTop: 10, borderTop: '1px solid var(--bd)', alignItems: 'center' }}>
              <span style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 4 }}><ArrowUp size={12} />{pinnedPost.upvotes}</span>
              <span style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 4 }}><MessageCircle size={12} />{pinnedPost.reply_count}</span>
            </div>
          </div>
        </motion.div>
      )}

      {loading && <><Skeleton /><Skeleton /><Skeleton /></>}

      {!loading && posts.map((post: any, i: number) => (
        <div key={post.id}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(i, 10) * 0.05, ease: 'easeOut' }}>
            <PostCard post={post} onOpen={() => openPost(post)} onTagClick={filterByTag} followedGhosts={followedGhosts} currentUserId={sessionUserId} />
          </motion.div>
          <AnimatePresence>
            {expandedPostId === post.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                  background: 'var(--sur)', border: '1px solid var(--bd)', borderTop: 'none',
                  borderRadius: '0 0 var(--rm) var(--rm)', padding: '0 18px 18px',
                  marginBottom: 10, marginTop: -10, overflow: 'hidden',
                }}
              >
                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid var(--bd)', borderBottom: '1px solid var(--bd)', padding: '12px 0', margin: '14px 0' }}>
                  {[
                    { value: post.upvotes || 0, label: 'Upvotes' },
                    { value: repliesCache[post.id]?.length ?? post.reply_count ?? 0, label: 'Replies' },
                    { value: post.view_count || 0, label: 'Views' },
                    { value: timeAgo(post.created_at), label: 'Posted' },
                  ].map((s, si) => (
                    <div key={s.label} style={{ textAlign: 'center', borderRight: si < 3 ? '1px solid var(--bd)' : 'none' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', display: 'block' }}>{s.value}</span>
                      <span style={{ fontSize: '.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', display: 'block', marginTop: 2 }}>{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* Reactions — hidden on own posts */}
                {sessionUserId !== post.user_id && <CompactReactions postId={post.id} showAll />}

                {/* Action bar */}
                {(() => {
                  const isOwner = sessionUserId === post.user_id
                  const gb: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 5, fontSize: '.75rem', fontWeight: 600, padding: '5px 10px', borderRadius: 'var(--rs)', border: '1px solid var(--bd)', background: 'none', color: 'var(--t3)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }
                  return (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--bd)', marginTop: 10 }}>
                      {!isOwner && <UpvoteButton postId={post.id} upvotes={post.upvotes} />}
                      <span style={{ fontSize: '.75rem', color: 'var(--t4)', display: 'flex', alignItems: 'center', gap: 4 }}><MessageCircle size={12} />{repliesCache[post.id]?.length ?? post.reply_count ?? 0}</span>
                      <span style={{ flex: 1 }} />
                      <button onClick={async () => {
                        const isSaved = bookmarked[post.id]
                        setBookmarked(prev => ({ ...prev, [post.id]: !isSaved }))
                        await fetch('/api/bookmarks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: post.id, action: isSaved ? 'remove' : 'add' }) })
                      }} style={{ ...gb, color: bookmarked[post.id] ? 'var(--blue)' : 'var(--t3)', borderColor: bookmarked[post.id] ? 'rgba(79,70,229,.25)' : 'var(--bd)' }}>
                        <Bookmark size={13} fill={bookmarked[post.id] ? 'currentColor' : 'none'} />
                      </button>
                      <button onClick={() => { navigator.clipboard.writeText(window.location.origin + '/post/' + post.id); toast.success('Link copied!') }} style={gb}>
                        <Link2 size={13} /><span className="action-label">Copy link</span>
                      </button>
                      <button onClick={() => {
                        if (navigator.share) navigator.share({ title: post.title, url: window.location.origin + '/post/' + post.id }).catch(() => {})
                        else { navigator.clipboard.writeText(window.location.origin + '/post/' + post.id); toast.success('Link copied!') }
                      }} style={gb}><Share2 size={13} /><span className="action-label">Share</span></button>
                      {!isOwner && <FollowButton ghostId={post.ghost_id} />}
                      {!isOwner && (
                        <button onClick={async () => {
                          if (reported[post.id]) return
                          await fetch('/api/posts/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: post.id, reason: 'user_report' }) })
                          setReported(prev => ({ ...prev, [post.id]: true })); toast.success('Reported')
                        }} style={{ ...gb, color: reported[post.id] ? 'var(--rose)' : 'var(--t3)', borderColor: reported[post.id] ? 'rgba(225,29,72,.2)' : 'var(--bd)', background: reported[post.id] ? 'var(--rose-d)' : 'none' }}>
                          <Flag size={13} fill={reported[post.id] ? 'currentColor' : 'none'} /><span className="action-label">Report</span>
                        </button>
                      )}
                      {!isOwner && (
                        <button onClick={async () => {
                          if (blocked[post.id]) return
                          await fetch('/api/blocks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ghostId: post.ghost_id }) })
                          setBlocked(prev => ({ ...prev, [post.id]: true })); toast.success('Ghost blocked')
                        }} style={{ ...gb, opacity: blocked[post.id] ? 0.5 : 1, cursor: blocked[post.id] ? 'default' : 'pointer', color: blocked[post.id] ? 'var(--t4)' : 'var(--t3)' }}>
                          <ShieldOff size={13} /><span className="action-label">Block</span>
                        </button>
                      )}
                      {isOwner && (
                        <button onClick={() => {
                          toast('Delete this post?', {
                            action: { label: 'Yes, delete', onClick: async () => {
                              const res = await fetch('/api/posts/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: post.id }) })
                              if (res.ok) { toast.success('Post deleted'); setExpandedPostId(null); setPosts(prev => prev.filter(p => p.id !== post.id)) }
                            }},
                            cancel: 'Cancel',
                          })
                        }} style={{
                          color: 'var(--rose)', border: '1px solid rgba(225,29,72,.25)', background: 'var(--rose-d)',
                          borderRadius: 'var(--rs)', padding: '5px 8px', cursor: 'pointer', fontFamily: 'inherit',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}><Trash2 size={13} /></button>
                      )}
                    </div>
                  )
                })()}

                {/* Reply sort */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 10 }}>
                  <span style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--t1)' }}>Replies</span>
                  <div style={{ display: 'flex', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', padding: 2 }}>
                    {(['best', 'new'] as const).map(s => (
                      <button key={s} onClick={() => setReplySort(prev => ({ ...prev, [post.id]: s }))} style={{
                        fontSize: '.72rem', padding: '3px 10px', borderRadius: 'calc(var(--r) - 2px)',
                        border: 'none', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize',
                        background: (replySort[post.id] || 'best') === s ? 'var(--sur)' : 'transparent',
                        color: (replySort[post.id] || 'best') === s ? 'var(--t1)' : 'var(--t3)',
                        fontWeight: (replySort[post.id] || 'best') === s ? 600 : 400,
                        boxShadow: (replySort[post.id] || 'best') === s ? '0 1px 3px rgba(0,0,0,.07)' : 'none',
                      }}>{s}</button>
                    ))}
                  </div>
                </div>

                {/* Replies list */}
                {(() => {
                  const replies = [...(repliesCache[post.id] || [])]
                  const sorted = (replySort[post.id] || 'best') === 'best'
                    ? replies.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
                    : replies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                  if (sorted.length === 0) return (
                    <p style={{ fontSize: '.8rem', color: 'var(--t4)', textAlign: 'center', padding: '16px 0' }}>No replies yet. Be the first.</p>
                  )
                  return sorted.map((r: any, ri: number) => (
                    <div key={r.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: ri < sorted.length - 1 ? '1px solid var(--bd)' : 'none' }}>
                      <Ghost size={12} style={{ color: 'var(--t4)', marginTop: 3, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '.7rem', color: 'var(--t3)' }}>{r.ghost_id}</span>
                          <span style={{ fontSize: '.65rem', color: 'var(--t4)' }}>{timeAgo(r.created_at)}</span>
                        </div>
                        <p className="auto-dir" style={{ fontSize: '.875rem', color: 'var(--t2)', lineHeight: 1.7, margin: '4px 0' }}>{r.body}</p>
                        <span style={{ fontSize: '.7rem', color: 'var(--t4)', display: 'flex', alignItems: 'center', gap: 3 }}><ArrowUp size={10} />{r.upvotes || 0}</span>
                      </div>
                    </div>
                  ))
                })()}

                {/* Reply composer */}
                {sessionUserId ? (
                  <div style={{ background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', padding: 12, marginTop: 12, position: 'relative' }}>
                    <textarea
                      placeholder="Write a reply…"
                      className="auto-dir"
                      value={replyBody[post.id] || ''}
                      onChange={e => setReplyBody(prev => ({ ...prev, [post.id]: e.target.value.slice(0, 1000) }))}
                      style={{ width: '100%', fontSize: '.875rem', color: 'var(--t1)', background: 'transparent', border: 'none', outline: 'none', resize: 'none', minHeight: 64, lineHeight: 1.6, fontFamily: 'inherit' }}
                    />
                    {replyGifUrl[post.id] && (
                      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
                        <img src={replyGifUrl[post.id]} alt="" style={{ maxHeight: 120, borderRadius: 'var(--rs)', display: 'block' }} />
                        <button onClick={() => setReplyGifUrl(prev => { const n = { ...prev }; delete n[post.id]; return n })} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <X size={11} style={{ color: '#fff' }} />
                        </button>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--bd)', marginTop: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '.65rem', fontFamily: 'monospace', color: (1000 - (replyBody[post.id]?.length || 0)) <= 20 ? 'var(--rose)' : 'var(--t4)' }}>{1000 - (replyBody[post.id]?.length || 0)}</span>
                        <button onClick={() => setGifPickerOpen(prev => ({ ...prev, [post.id]: !prev[post.id] }))} style={{
                          display: 'flex', alignItems: 'center', gap: 3, fontSize: '.72rem', fontWeight: 600,
                          color: gifPickerOpen[post.id] ? 'var(--blue)' : 'var(--t3)',
                          background: gifPickerOpen[post.id] ? 'var(--blue-d)' : 'none',
                          border: '1px solid var(--bd)', borderRadius: 'var(--rs)', padding: '3px 8px',
                          cursor: 'pointer', fontFamily: 'inherit',
                        }}><Image size={13} /> GIF</button>
                      </div>
                      <button
                        disabled={!(replyBody[post.id]?.trim()) || replyLoading[post.id]}
                        onClick={async () => {
                          setReplyLoading(prev => ({ ...prev, [post.id]: true }))
                          const res = await fetch('/api/posts/reply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: post.id, body: replyBody[post.id], gifUrl: replyGifUrl[post.id] || undefined }) })
                          const data = await res.json()
                          setReplyLoading(prev => ({ ...prev, [post.id]: false }))
                          if (data.success) {
                            toast.success('Reply posted')
                            setReplyBody(prev => ({ ...prev, [post.id]: '' }))
                            setReplyGifUrl(prev => { const n = { ...prev }; delete n[post.id]; return n })
                            if (data.reply) {
                              setRepliesCache(prev => ({ ...prev, [post.id]: [...(prev[post.id] || []), data.reply] }))
                            } else {
                              fetch('/api/posts/replies?postId=' + post.id).then(r => r.json()).then(d => setRepliesCache(prev => ({ ...prev, [post.id]: d.replies || [] })))
                            }
                          } else if (res.status === 401) { toast.error('Sign in to reply') }
                        }}
                        style={{
                          background: (replyBody[post.id]?.trim()) ? 'var(--blue)' : 'var(--bd)',
                          color: '#fff', fontSize: '.75rem', fontWeight: 600, padding: '5px 14px',
                          borderRadius: 'var(--r)', border: 'none',
                          cursor: (replyBody[post.id]?.trim()) ? 'pointer' : 'not-allowed',
                          fontFamily: 'inherit',
                        }}
                      >Reply anonymously</button>
                    </div>
                    <GifPicker open={!!gifPickerOpen[post.id]} onClose={() => setGifPickerOpen(prev => ({ ...prev, [post.id]: false }))} onSelect={url => { setReplyGifUrl(prev => ({ ...prev, [post.id]: url })); setGifPickerOpen(prev => ({ ...prev, [post.id]: false })) }} />
                  </div>
                ) : (
                  <a href="/auth?signin=1" style={{ display: 'block', textAlign: 'center', padding: 16, fontSize: '.875rem', color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>Sign in to reply →</a>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {!loading && hasMore && (
        <div ref={sentinelRef} style={{ padding: '20px 0', textAlign: 'center' }}>
          {loadingMore && <Skeleton />}
        </div>
      )}

      {!loading && !hasMore && posts.length > 0 && (
        <p style={{ textAlign: 'center', color: 'var(--t4)', fontSize: '.8rem', padding: '16px 0' }}>You&apos;ve reached the end</p>
      )}

      {!loading && posts.length === 0 && (
        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '56px 24px', textAlign: 'center' }}>
          <Ghost size={36} style={{ color: 'var(--t4)', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>Nothing here yet</p>
          <p style={{ fontSize: '.875rem', color: 'var(--t3)', marginBottom: 20 }}>Be the first to wiispr something honest.</p>
          <a href="/auth" style={{ fontSize: '.8rem', fontWeight: 600, padding: '8px 18px', borderRadius: 'var(--r)', background: 'var(--blue)', color: '#fff', textDecoration: 'none' }}>Join free</a>
        </div>
      )}

    </div>
  )
}
