'use client'
import { useEffect, useState } from 'react'
import { ArrowUp, Flame } from 'lucide-react'

export default function TrendingWidget() {
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/posts/trending')
      .then(r => r.json())
      .then(d => setPosts((d.posts || []).slice(0, 5)))
  }, [])

  if (posts.length === 0) return null

  return (
    <div style={{ marginTop: 20 }}>
      <a href="/trending" style={{ textDecoration: 'none' }}>
        <p style={{ fontSize: '.625rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--t4)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
          <Flame size={11} />Trending
        </p>
      </a>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {posts.map((post, i) => (
          <a
            key={post.id}
            href={'/post/' + post.id}
            style={{ display: 'block', background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', padding: '10px 12px', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--blue)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--bd)')}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ fontSize: '.7rem', fontWeight: 800, color: i < 3 ? 'var(--blue)' : 'var(--t4)', fontFamily: 'monospace', flexShrink: 0, marginTop: 1 }}>#{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="auto-dir" style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--t1)', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 4 }}>
                  {post.title}
                </p>
                <span style={{ fontSize: '.68rem', color: 'var(--t4)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <ArrowUp size={10} />{post.upvotes || 0}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
      <a href="/trending" style={{ display: 'block', textAlign: 'center', fontSize: '.75rem', color: 'var(--blue)', fontWeight: 600, marginTop: 10, textDecoration: 'none' }}>
        See all trending →
      </a>
    </div>
  )
}
