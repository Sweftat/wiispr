'use client'
import { timeAgo } from '@/lib/time'
import { useState } from 'react'
import Compose from './Compose'
import CategoryFilter from './CategoryFilter'

export default function Feed({ initialPosts, categories }: { initialPosts: any[], categories: any[] }) {
  const [posts, setPosts] = useState<any[]>(initialPosts)
  const [loading, setLoading] = useState(false)

  async function filterByCategory(categoryId: number | null) {
    setLoading(true)
    const url = categoryId ? '/api/posts/feed?category=' + categoryId : '/api/posts/feed'
    const res = await fetch(url)
    const data = await res.json()
    setPosts(data.posts || [])
    setLoading(false)
  }

  return (
    <>
      <Compose categories={categories} />
      <CategoryFilter categories={categories} onSelect={filterByCategory} />
      {loading && (
        <p style={{ fontSize: '.875rem', color: 'var(--t4)', textAlign: 'center', padding: '20px 0' }}>Loading...</p>
      )}
      {!loading && posts.length > 0 ? posts.map((post: any) => (
        <a key={post.id} href={'/post/' + post.id} style={{ display: 'block', textDecoration: 'none', color: 'inherit', marginBottom: 10 }}>
          <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '16px 18px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--blue)', background: 'var(--blue-d)', padding: '2px 7px', borderRadius: 3 }}>{post.categories?.name}</span>
              <span style={{ fontFamily: 'monospace', fontSize: '.7rem', color: 'var(--t4)' }}>{post.ghost_id}</span>
              <span style={{ fontFamily: 'monospace', fontSize: '.65rem', color: 'var(--t4)', marginLeft: 'auto' }}>{timeAgo(post.created_at)}</span>
            </div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>{post.title}</h2>
            {post.body && <p style={{ fontSize: '.875rem', color: 'var(--t2)', lineHeight: 1.7, marginBottom: 12 }}>{post.body}</p>}
            <div style={{ display: 'flex', gap: 6, paddingTop: 10, borderTop: '1px solid var(--bd)' }}>
              <button style={{ fontSize: '.75rem', fontWeight: 600, padding: '5px 10px', borderRadius: 'var(--rs)', border: '1px solid var(--bd)', background: 'none', color: 'var(--t3)' }}>up {post.upvotes}</button>
              <button style={{ fontSize: '.75rem', fontWeight: 600, padding: '5px 10px', borderRadius: 'var(--rs)', border: '1px solid var(--bd)', background: 'none', color: 'var(--t3)' }}>{post.reply_count} replies</button>
            </div>
          </div>
        </a>
      )) : !loading && (
        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>Nothing here yet</p>
          <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>Be the first to whisper.</p>
        </div>
      )}
    </>
  )
}
