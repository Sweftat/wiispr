'use client'
import { useState, useEffect, useRef } from 'react'
import { ShieldAlert, Search, X, Check } from 'lucide-react'
import { timeAgo } from '@/lib/time'

const PRESETS = ['Sensitive content', 'Mature themes', 'Violence', 'Mental health', 'Spoilers']

export default function AdminContentWarnings() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [acting, setActing] = useState<string | null>(null)
  const [customWarning, setCustomWarning] = useState<Record<string, string>>({})
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Also load posts that already have a warning
  const [warned, setWarned] = useState<any[]>([])
  const [loadingWarned, setLoadingWarned] = useState(true)

  useEffect(() => { loadWarned() }, [])

  async function loadWarned() {
    setLoadingWarned(true)
    const res = await fetch('/api/admin/content-warnings')
    const d = await res.json()
    setWarned(d.posts || [])
    setLoadingWarned(false)
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

  async function setWarning(postId: string, warning: string) {
    setActing(postId)
    await fetch('/api/admin/post-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, action: 'set_warning', warning }),
    })
    await loadWarned()
    setResults(r => r.map(p => p.id === postId ? { ...p, content_warning: warning } : p))
    setActing(null)
  }

  async function clearWarning(postId: string) {
    setActing(postId)
    await fetch('/api/admin/post-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, action: 'clear_warning' }),
    })
    setWarned(w => w.filter(p => p.id !== postId))
    setResults(r => r.map(p => p.id === postId ? { ...p, content_warning: null } : p))
    setActing(null)
  }

  function PostRow({ post, showClear }: { post: any, showClear?: boolean }) {
    const warning = customWarning[post.id] ?? ''
    return (
      <div style={{ padding: '14px 16px', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
              <span style={{ fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--blue)', background: 'var(--blue-d)', padding: '2px 6px', borderRadius: 3 }}>{post.categories?.name}</span>
              <span style={{ fontFamily: 'monospace', fontSize: '.65rem', color: 'var(--t4)' }}>{timeAgo(post.created_at)}</span>
              {post.content_warning && (
                <span style={{ fontSize: '.6rem', fontWeight: 700, color: '#D97706', background: '#FFFBEB', padding: '2px 7px', borderRadius: 3, border: '1px solid #FDE68A' }}>⚠ {post.content_warning}</span>
              )}
            </div>
            <p style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--t1)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{post.title}</p>
          </div>
          {showClear && (
            <button
              onClick={() => clearWarning(post.id)}
              disabled={acting === post.id}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 'var(--r)', border: '1px solid var(--rose)', background: 'none', color: 'var(--rose)', fontSize: '.775rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
            >
              <X size={12} /> Remove
            </button>
          )}
        </div>

        {!showClear && (
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {PRESETS.map(p => (
                <button
                  key={p}
                  onClick={() => setWarning(post.id, p)}
                  disabled={acting === post.id}
                  style={{ padding: '4px 10px', borderRadius: 99, border: '1px solid var(--bd)', background: post.content_warning === p ? '#D97706' : 'none', color: post.content_warning === p ? '#fff' : 'var(--t2)', fontSize: '.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .12s' }}
                >
                  {p}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                value={warning}
                onChange={e => setCustomWarning(c => ({ ...c, [post.id]: e.target.value }))}
                placeholder="Custom warning..."
                style={{ flex: 1, height: 32, padding: '0 10px', fontSize: '.8rem', color: 'var(--t1)', background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', outline: 'none', fontFamily: 'inherit' }}
              />
              <button
                onClick={() => warning.trim() && setWarning(post.id, warning.trim())}
                disabled={!warning.trim() || acting === post.id}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 12px', borderRadius: 'var(--r)', border: 'none', background: warning.trim() ? '#D97706' : 'var(--bd)', color: '#fff', fontSize: '.775rem', fontWeight: 600, cursor: warning.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}
              >
                <Check size={12} /> Apply
              </button>
              {post.content_warning && (
                <button
                  onClick={() => clearWarning(post.id)}
                  disabled={acting === post.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 12px', borderRadius: 'var(--r)', border: '1px solid var(--rose)', background: 'none', color: 'var(--rose)', fontSize: '.775rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  <X size={12} /> Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Content Warnings</h1>
        <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>Add warning labels to sensitive posts. Users see a blur overlay before reading.</p>
      </div>

      {/* Currently warned posts */}
      <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '18px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <ShieldAlert size={15} style={{ color: '#D97706' }} />
          <p style={{ fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--t4)' }}>Posts with warnings</p>
        </div>
        {loadingWarned && <p style={{ fontSize: '.875rem', color: 'var(--t4)' }}>Loading...</p>}
        {!loadingWarned && warned.length === 0 && <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>No posts have warnings yet.</p>}
        {warned.map(p => <PostRow key={p.id} post={p} showClear />)}
      </div>

      {/* Search */}
      <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '18px 20px' }}>
        <p style={{ fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--t4)', marginBottom: 12 }}>Add a warning to a post</p>
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
        {!searching && results.map(post => <PostRow key={post.id} post={post} />)}
        {!searching && query.trim().length >= 2 && results.length === 0 && (
          <p style={{ fontSize: '.8rem', color: 'var(--t4)', padding: '8px 0' }}>No posts found.</p>
        )}
      </div>
    </div>
  )
}
