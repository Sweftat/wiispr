'use client'
import { useState } from 'react'
import { timeAgo } from '@/lib/time'
import FollowButton from './FollowButton'
import PostPanel from './PostPanel'
import CategoryFilter from './CategoryFilter'
import Compose from './Compose'
import { ArrowUp, MessageCircle } from 'lucide-react'

export default function Feed({ initialPosts, categories }: { initialPosts: any[], categories: any[] }) {
  const [posts, setPosts] = useState<any[]>(initialPosts)
  const [loading, setLoading] = useState(false)
  const [activePost, setActivePost] = useState<any>(null)

  async function filterByCategory(categoryId: number | null | string) {
    setLoading(true)
    let url = '/api/posts/feed'
    if (categoryId === 'following') url = '/api/posts/following'
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
      {loading && <p style={{ fontSize: '.875rem', color: 'var(--t4)', textAlign: 'center', padding: '20px 0' }}>Loading...</p>}
      {!loading && posts.length > 0 ? posts.map((post: any) => (
        <div key={post.id} style={{
          background: 'var(--sur)', border: '1px solid var(--bd)',
          borderRadius: 'var(--rm)', padding: '16px 18px', marginBottom: 10,
          cursor: 'pointer', transition: 'border-color .15s',
        }}
          onClick={() => openPost(post)}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--bd2)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--bd)')}
        >
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
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>{post.title}</h2>
          {post.body && <p style={{ fontSize: '.875rem', color: 'var(--t2)', lineHeight: 1.7, marginBottom: 12 }}>{post.body}</p>}
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
      )) : !loading && (
        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>Nothing here yet</p>
          <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>Be the first to whisper.</p>
        </div>
      )}

      {activePost && <PostPanel post={activePost} onClose={closePost} />}
    </div>
  )
}