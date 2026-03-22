'use client'
import { useState } from 'react'
import Nav from '@/components/Nav'
import { timeAgo } from '@/lib/time'
import { Search, ArrowUp, MessageCircle, Ghost, SearchX } from 'lucide-react'

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

        {/* Search bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--t4)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search posts..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              style={{
                width: '100%', height: 40, paddingLeft: 36, paddingRight: 12,
                fontSize: '.875rem', color: 'var(--t1)',
                background: 'var(--sur)', border: '1px solid var(--bd)',
                borderRadius: 'var(--r)', outline: 'none', fontFamily: 'inherit'
              }}
            />
          </div>
          <button
            onClick={search}
            disabled={loading || query.length < 2}
            style={{
              height: 40, padding: '0 20px',
              fontSize: '.875rem', fontWeight: 600,
              borderRadius: 'var(--r)', whiteSpace: 'nowrap', flexShrink: 0,
              background: query.length >= 2 ? 'var(--blue)' : 'var(--bd)',
              color: '#fff', border: 'none',
              cursor: query.length >= 2 ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit', transition: 'background .15s',
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <Search size={14} />
            {loading ? '...' : 'Search'}
          </button>
        </div>

        {/* No results */}
        {!loading && searched && posts.length === 0 && (
          <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '48px 24px', textAlign: 'center' }}>
            <SearchX size={28} style={{ color: 'var(--t4)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>No results for "{query}"</p>
            <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>Try different keywords.</p>
          </div>
        )}

        {/* Results */}
        {!loading && posts.map(post => (
          <a key={post.id} href={'/post/' + post.id} style={{ display: 'block', textDecoration: 'none', color: 'inherit', marginBottom: 10 }}>
            <div style={{
              background: 'var(--sur)', border: '1px solid var(--bd)',
              borderRadius: 'var(--rm)', padding: '16px 18px', cursor: 'pointer',
              transition: 'border-color .15s'
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--bd2)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--bd)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--blue)', background: 'var(--blue-d)', padding: '2px 7px', borderRadius: 3 }}>{post.categories?.name}</span>
                <span style={{ fontFamily: 'monospace', fontSize: '.7rem', color: 'var(--t4)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Ghost size={11} />
                  {post.ghost_id}
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: '.65rem', color: 'var(--t4)', marginLeft: 'auto' }}>{timeAgo(post.created_at)}</span>
              </div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>{post.title}</h2>
              {post.body && <p style={{ fontSize: '.875rem', color: 'var(--t2)', lineHeight: 1.7, marginBottom: 12 }}>{post.body}</p>}
              <div style={{ display: 'flex', gap: 6, paddingTop: 10, borderTop: '1px solid var(--bd)' }}>
                <span style={{ fontSize: '.75rem', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ArrowUp size={12} /> {post.upvotes}
                </span>
                <span style={{ fontSize: '.75rem', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MessageCircle size={12} /> {post.reply_count}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </main>
  )
}