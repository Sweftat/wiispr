'use client'
import { useState } from 'react'
import { timeAgo } from '@/lib/time'
import FollowButton from './FollowButton'
import PostPanel from './PostPanel'
import CategoryFilter from './CategoryFilter'
import Compose from './Compose'
import { ArrowUp, MessageCircle, Ghost } from 'lucide-react'

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

export default function Feed({ initialPosts, categories }: { initialPosts: any[], categories: any[] }) {
  const [posts, setPosts] = useState<any[]>(initialPosts)
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
    setLoading(false)
  }

  function openPost(post: any) {
    setActivePost(post)
    window.history.pushState({}, '', '/post/' + post.id)
  }

  function closePost() {
    setActivePost(null)
    window.history.pushState({}, '', '/')
  }

  return (
    <div style={{ position: 'relative' }}>
      <Compose categories={categories} />
      <CategoryFilter categories={categories} onSelect={filterByCategory} />

      {loading && (
        <>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </>
      )}

      {!loading && posts.length > 0 && posts.map((post: any) => (
        <div key={post.id} className="post-card" style={{
          background: 'var(--sur)', border: '1px solid var(--bd)',
          borderRadius: 'var(--rm)', padding: '16px 18px', marginBottom: 10,
          cursor: 'pointer', transition: 'all .15s',
        }} onClick={() => openPost(post)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{
              fontSize: '.6rem', fontWeight: 700, letterSpacing: '.06em',
              textTransform: 'uppercase', color: 'var(--blue)', background: 'var(--blue-d)',
              padding: '2px 7px', borderRadius: 3
            }}>{post.categories?.name}</span>
            <span style={{ fontFamily: 'monospace', fontSize: '.7rem', color: 'var(--t4)' }}>{post.ghost_id}</span>
            {post.users?.trust_level && post.users.trust_level !== 'new' && (
              <span style={{
                fontSize: '.575rem', fontWeight: 700, letterSpacing: '.04em',
                textTransform: 'uppercase', padding: '2px 6px', borderRadius: 3,
                color: post.users.trust_level === 'top' ? '#D97706' :
                       post.users.trust_level === 'trusted' ? 'var(--grn)' : 'var(--blue)',
                background: post.users.trust_level === 'top' ? '#FFFBEB' :
                            post.users.trust_level === 'trusted' ? 'var(--grn-d)' : 'var(--blue-d)',
              }}>{post.users.trust_level}</span>
            )}
            <span onClick={e => e.stopPropagation()}>
              <FollowButton ghostId={post.ghost_id} />
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: '.65rem', color: 'var(--t4)', marginLeft: 'auto' }}>{timeAgo(post.created_at)}</span>
          </div>
          <h2 className="auto-dir" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>{post.title}</h2>
          {post.body && <p className="auto-dir" style={{ fontSize: '.875rem', color: 'var(--t2)', lineHeight: 1.7, marginBottom: 12 }}>{post.body}</p>}
          <div style={{ display: 'flex', gap: 6, paddingTop: 10, borderTop: '1px solid var(--bd)' }}>
            <button style={{
              fontSize: '.75rem', fontWeight: 600, padding: '5px 10px',
              borderRadius: 'var(--rs)', border: '1px solid var(--bd)',
              background: 'none', color: 'var(--t3)',
              display: 'flex', alignItems: 'center', gap: 4
            }}>
              <ArrowUp size={12} />
              {post.upvotes}
            </button>
            <button style={{
              fontSize: '.75rem', fontWeight: 600, padding: '5px 10px',
              borderRadius: 'var(--rs)', border: '1px solid var(--bd)',
              background: 'none', color: 'var(--t3)',
              display: 'flex', alignItems: 'center', gap: 4
            }}>
              <MessageCircle size={12} />
              {post.reply_count}
            </button>
          </div>
        </div>
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