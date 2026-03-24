'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { timeAgo } from '@/lib/time'
import FollowButton from './FollowButton'
import PostPanel from './PostPanel'
import CategoryFilter from './CategoryFilter'
import Compose from './Compose'
import ShareButton from './ShareButton'
import { ArrowUp, MessageCircle, Ghost, Pin, Star, ShieldAlert } from 'lucide-react'

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

function PostCard({ post, onOpen }: { post: any, onOpen: () => void }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="post-card" style={{
      background: 'var(--sur)', border: '1px solid var(--bd)',
      borderRadius: 'var(--rm)', padding: '16px 18px', marginBottom: 10,
      cursor: 'pointer', transition: 'all .15s', position: 'relative', overflow: 'hidden',
    }} onClick={() => post.content_warning && !revealed ? undefined : onOpen()}>

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

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--blue)', background: 'var(--blue-d)', padding: '2px 7px', borderRadius: 3 }}>{post.categories?.name}</span>
        <span style={{ fontFamily: 'monospace', fontSize: '.7rem', color: 'var(--t4)' }}>{post.ghost_id}</span>
        {post.users?.trust_level && post.users.trust_level !== 'new' && (
          <span style={{
            fontSize: '.575rem', fontWeight: 700, letterSpacing: '.04em',
            textTransform: 'uppercase', padding: '2px 6px', borderRadius: 3,
            color: post.users.trust_level === 'top' ? '#D97706' : post.users.trust_level === 'trusted' ? 'var(--grn)' : 'var(--blue)',
            background: post.users.trust_level === 'top' ? '#FFFBEB' : post.users.trust_level === 'trusted' ? 'var(--grn-d)' : 'var(--blue-d)',
          }}>{post.users.trust_level}</span>
        )}
        <span onClick={e => e.stopPropagation()}>
          <FollowButton ghostId={post.ghost_id} />
        </span>
        <span style={{ fontFamily: 'monospace', fontSize: '.65rem', color: 'var(--t4)', marginLeft: 'auto' }}>{timeAgo(post.created_at)}</span>
      </div>
      <h2 className="auto-dir" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>{post.title}</h2>
      {post.body && <p className="auto-dir" style={{ fontSize: '.875rem', color: 'var(--t2)', lineHeight: 1.7, marginBottom: 12 }}>{post.body}</p>}
      <div style={{ display: 'flex', gap: 6, paddingTop: 10, borderTop: '1px solid var(--bd)', alignItems: 'center' }}>
        <button style={{ fontSize: '.75rem', fontWeight: 600, padding: '5px 10px', borderRadius: 'var(--rs)', border: '1px solid var(--bd)', background: 'none', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ArrowUp size={12} />{post.upvotes}
        </button>
        <button style={{ fontSize: '.75rem', fontWeight: 600, padding: '5px 10px', borderRadius: 'var(--rs)', border: '1px solid var(--bd)', background: 'none', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <MessageCircle size={12} />{post.reply_count}
        </button>
        <span style={{ marginLeft: 'auto' }} onClick={e => e.stopPropagation()}>
          <ShareButton postId={post.id} />
        </span>
      </div>
    </div>
  )
}

export default function Feed({ initialPosts, initialPinnedPost, initialPostOfDay, categories }: { initialPosts: any[], initialPinnedPost: any, initialPostOfDay: any, categories: any[] }) {
  const [posts, setPosts] = useState<any[]>(initialPosts)
  const [pinnedPost, setPinnedPost] = useState<any>(initialPinnedPost)
  const [postOfDay, setPostOfDay] = useState<any>(initialPostOfDay)
  const [loading, setLoading] = useState(false)
  const [activePost, setActivePost] = useState<any>(null)

  async function filterByCategory(categoryId: number | null | string) {
    setLoading(true)
    let url = '/api/posts/feed'
    if (categoryId === 'following') url = '/api/posts/following'
    else if (categoryId === 'trending') url = '/api/posts/trending'
    else if (categoryId) url = '/api/posts/feed?category=' + categoryId
    const res = await fetch(url)
    const data = await res.json()
    setPosts(data.posts || [])
    setPinnedPost(data.pinnedPost || null)
    setPostOfDay(data.postOfDay || null)
    setLoading(false)
  }

  useEffect(() => {
    function handleSidebarSelect(e: CustomEvent) {
      filterByCategory(e.detail)
    }
    window.addEventListener('sidebarCategorySelect', handleSidebarSelect as EventListener)
    return () => window.removeEventListener('sidebarCategorySelect', handleSidebarSelect as EventListener)
  }, [])

  function openPost(post: any) {
    setActivePost(post)
    window.history.pushState({}, '', '/post/' + post.id)
  }

  function closePost() {
    setActivePost(null)
    window.history.pushState({}, '', '/')
  }

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <Compose categories={categories} />
      <CategoryFilter categories={categories} onSelect={filterByCategory} />

      {/* Post of the Day */}
      {postOfDay && !loading && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
        <div className="post-card" style={{
          background: 'linear-gradient(135deg, #FFFBEB 0%, var(--sur) 100%)',
          border: '1px solid #D97706',
          borderRadius: 'var(--rm)', padding: '16px 18px', marginBottom: 10,
          cursor: 'pointer', transition: 'all .15s',
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
            <button style={{ fontSize: '.75rem', fontWeight: 600, padding: '5px 10px', borderRadius: 'var(--rs)', border: '1px solid #FDE68A', background: 'none', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ArrowUp size={12} />{postOfDay.upvotes}
            </button>
            <button style={{ fontSize: '.75rem', fontWeight: 600, padding: '5px 10px', borderRadius: 'var(--rs)', border: '1px solid #FDE68A', background: 'none', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <MessageCircle size={12} />{postOfDay.reply_count}
            </button>
          </div>
        </div>
        </motion.div>
      )}

      {/* Pinned post */}
      {pinnedPost && !loading && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.05, ease: 'easeOut' }}>
        <div className="post-card" style={{
          background: 'var(--sur)', border: '1px solid var(--blue)',
          borderRadius: 'var(--rm)', padding: '16px 18px', marginBottom: 10,
          cursor: 'pointer', transition: 'all .15s',
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
            <button style={{ fontSize: '.75rem', fontWeight: 600, padding: '5px 10px', borderRadius: 'var(--rs)', border: '1px solid var(--bd)', background: 'none', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ArrowUp size={12} />{pinnedPost.upvotes}
            </button>
            <button style={{ fontSize: '.75rem', fontWeight: 600, padding: '5px 10px', borderRadius: 'var(--rs)', border: '1px solid var(--bd)', background: 'none', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <MessageCircle size={12} />{pinnedPost.reply_count}
            </button>
          </div>
        </div>
        </motion.div>
      )}

      {loading && (
        <>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </>
      )}

      {!loading && posts.map((post: any, i: number) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.05, ease: 'easeOut' }}
        >
          <PostCard post={post} onOpen={() => openPost(post)} />
        </motion.div>
      ))}

      {!loading && posts.length === 0 && (
        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '56px 24px', textAlign: 'center' }}>
          <Ghost size={36} style={{ color: 'var(--t4)', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>Nothing here yet</p>
          <p style={{ fontSize: '.875rem', color: 'var(--t3)', marginBottom: 20 }}>Be the first to wiispr something honest.</p>
          <a href="/auth" style={{ fontSize: '.8rem', fontWeight: 600, padding: '8px 18px', borderRadius: 'var(--r)', background: 'var(--blue)', color: '#fff', textDecoration: 'none' }}>Join free</a>
        </div>
      )}

      {activePost && <PostPanel post={activePost} onClose={closePost} />}
    </div>
  )
}
