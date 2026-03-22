'use client'
import { useState } from 'react'
import Nav from '@/components/Nav'
import { timeAgo } from '@/lib/time'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function search() {
    if (!query.trim() || query.length < 2) return
    setLoading(true)
    setSearched(true)
    const res = await fetch('/api/posts/search?q=' + encodeURIComponent(query))
    const data = await res.json()
    setPosts(data.posts || [])
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <input
            type="text"
            placeholder="Search posts..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            style={{ flex: 1, fontSize: '.9375rem', color: 'var(--t1)', background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', padding: '10px 14px', outline: 'none', fontFamily: 'inherit' }}
          />
          <button onClick={search} disabled={loading} style={{ fontSize: '.875rem', fontWeight: 600, padding: '10px 20px', borderRadius: 'var(--r)', background: '#18181B', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            {loading ? '...' : 'Search'}
          </button>
        </div>

        {!loading && searched && posts.length === 0 && (
          <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>No results for "{query}"</p>
            <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>Try different keywords.</p>
          </div>
        )}

        {!loading && posts.map((post) => (
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
                <span style={{ fontSize: '.75rem', color: 'var(--t3)' }}>up {post.upvotes}</span>
                <span style={{ fontSize: '.75rem', color: 'var(--t3)' }}>{post.reply_count} replies</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </main>
  )
}
