'use client'
import { useState, useEffect, useRef } from 'react'
import { Pin, PinOff, Search, X } from 'lucide-react'
import { timeAgo } from '@/lib/time'

export default function AdminPinnedPost() {
  const [pinned, setPinned] = useState<any>(null)
  const [loadingPinned, setLoadingPinned] = useState(true)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [acting, setActing] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { loadPinned() }, [])

  async function loadPinned() {
    setLoadingPinned(true)
    const res = await fetch('/api/admin/pinned-post')
    const d = await res.json()
    setPinned(d.post || null)
    setLoadingPinned(false)
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const res = await fetch('/api/posts/search?q=' + encodeURIComponent(query))
      const d = await res.json()
      setResults(d.posts || [])
      setSearching(false)
    }, 300)
  }, [query])

  async function pin(postId: string) {
    setActing(true)
    await fetch('/api/admin/post-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, action: 'pin' }),
    })
    setQuery('')
    setResults([])
    await loadPinned()
    setActing(false)
  }

  async function unpin() {
    if (!pinned) return
    setActing(true)
    await fetch('/api/admin/post-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: pinned.id, action: 'unpin' }),
    })
    setPinned(null)
    setActing(false)
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Pinned Post</h1>
        <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>One post shown at the top of the feed for all users.</p>
      </div>

      {/* Currently pinned */}
      <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '18px 20px', marginBottom: 20 }}>
        <p style={{ fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--t4)', marginBottom: 12 }}>Currently pinned</p>

        {loadingPinned && <p style={{ fontSize: '.875rem', color: 'var(--t4)' }}>Loading...</p>}

        {!loadingPinned && !pinned && (
          <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>No post is pinned. Search below to pin one.</p>
        )}

        {!loadingPinned && pinned && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                <span style={{ fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--blue)', background: 'var(--blue-d)', padding: '2px 7px', borderRadius: 3 }}>
                  {pinned.categories?.name}
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: '.7rem', color: 'var(--t4)' }}>{pinned.ghost_id}</span>
                <span style={{ fontFamily: 'monospace', fontSize: '.65rem', color: 'var(--t4)', marginLeft: 'auto' }}>{timeAgo(pinned.created_at)}</span>
              </div>
              <p style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--t1)', marginBottom: pinned.body ? 4 : 0 }}>{pinned.title}</p>
              {pinned.body && (
                <p style={{ fontSize: '.8rem', color: 'var(--t3)', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{pinned.body}</p>
              )}
            </div>
            <button
              onClick={unpin}
              disabled={acting}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 'var(--r)', border: '1px solid var(--rose)', background: 'none', color: 'var(--rose)', fontSize: '.8rem', fontWeight: 600, cursor: acting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              <PinOff size={13} />
              Unpin
            </button>
          </div>
        )}
      </div>

      {/* Search to pin */}
      <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '18px 20px' }}>
        <p style={{ fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--t4)', marginBottom: 12 }}>Search &amp; pin a post</p>
        <div style={{ position: 'relative', marginBottom: results.length > 0 || searching ? 10 : 0 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--t4)', pointerEvents: 'none' }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by title or content..."
            style={{ width: '100%', height: 38, padding: '0 32px 0 34px', fontSize: '.875rem', color: 'var(--t1)', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', outline: 'none', fontFamily: 'inherit' }}
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults([]) }} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t4)', display: 'flex' }}>
              <X size={13} />
            </button>
          )}
        </div>

        {searching && <p style={{ fontSize: '.8rem', color: 'var(--t4)', padding: '8px 0' }}>Searching...</p>}

        {!searching && results.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {results.map(post => (
              <div key={post.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                    <span style={{ fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--blue)', background: 'var(--blue-d)', padding: '2px 6px', borderRadius: 3 }}>{post.categories?.name}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '.65rem', color: 'var(--t4)' }}>{timeAgo(post.created_at)}</span>
                  </div>
                  <p style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--t1)', marginBottom: post.body ? 3 : 0 }}>{post.title}</p>
                  {post.body && <p style={{ fontSize: '.775rem', color: 'var(--t3)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{post.body}</p>}
                </div>
                <button
                  onClick={() => pin(post.id)}
                  disabled={acting || pinned?.id === post.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 13px', borderRadius: 'var(--r)', border: 'none', background: pinned?.id === post.id ? 'var(--bd)' : 'var(--blue)', color: '#fff', fontSize: '.775rem', fontWeight: 600, cursor: (acting || pinned?.id === post.id) ? 'not-allowed' : 'pointer', fontFamily: 'inherit', flexShrink: 0, whiteSpace: 'nowrap' }}
                >
                  <Pin size={12} />
                  {pinned?.id === post.id ? 'Pinned' : 'Pin'}
                </button>
              </div>
            ))}
          </div>
        )}

        {!searching && query.trim().length >= 2 && results.length === 0 && (
          <p style={{ fontSize: '.8rem', color: 'var(--t4)', padding: '8px 0' }}>No posts found.</p>
        )}
      </div>
    </div>
  )
}
