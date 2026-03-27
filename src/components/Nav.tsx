'use client'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { Search, Bell, LogOut, X, Ghost } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const CATEGORY_COLORS: Record<string, string> = {
  technology: '#4F46E5', sports: '#F97316', lifestyle: '#16A34A',
  business: '#7C3AED', gaming: '#E11D48', family: '#D97706',
  women: '#EC4899', open: '#64748B', entertainment: '#0891B2',
  health: '#EF4444', food: '#EA580C', religion: '#4F46E5',
  relationships: '#BE185D', career: '#0369A1', travel: '#059669',
  finance: '#CA8A04',
}

export default function Nav() {
  const router = useRouter()
  const [user, setUser] = useState<{nickname: string} | null>(null)
  const [dark, setDark] = useState(false)
  const [unread, setUnread] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [shrunk, setShrunk] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const searchAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setUser(d.user)
          fetch('/api/notifications')
            .then(r => r.json())
            .then(d => setUnread(d.unread || 0))
        }
      })
    const theme = localStorage.getItem('theme')
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
      setDark(true)
    }

    let lastY = 0
    function onScroll() {
      const y = window.scrollY
      if (y > 50 && y > lastY) setShrunk(true)
      else if (y < lastY) setShrunk(false)
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Escape to close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && searchOpen) closeSearch()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [searchOpen])

  // Focus input when open
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50)
  }, [searchOpen])

  // Click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchAreaRef.current && !searchAreaRef.current.contains(e.target as Node)) {
        closeSearch()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Search debounce
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => {
        fetch('/api/posts/search?q=' + encodeURIComponent(searchQuery))
          .then(r => r.json())
          .then(d => setResults(d.posts?.slice(0, 6) || []))
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setResults([])
    }
  }, [searchQuery])

  function closeSearch() {
    setSearchOpen(false)
    setSearchQuery('')
    setResults([])
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
      router.push('/search?q=' + encodeURIComponent(searchQuery.trim()))
      closeSearch()
    }
    if (e.key === 'Escape') closeSearch()
  }

  async function signOut() {
    await fetch('/api/auth/session', { method: 'DELETE' })
    setUser(null)
    window.location.href = '/'
  }

  function toggleTheme() {
    const isDark = !dark
    setDark(isDark)
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }

  const navH = shrunk ? 44 : 52

  return (
    <nav className="main-nav" style={{
      height: navH,
      background: dark ? 'rgba(24,24,27,0.85)' : 'rgba(255,255,255,0.8)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
      display: 'flex', alignItems: 'center', padding: '0 20px', gap: 8,
      position: 'sticky', top: 0, zIndex: 100,
      transition: 'all 0.2s ease',
      boxShadow: shrunk ? '0 1px 8px rgba(0,0,0,0.06)' : 'none',
    }}>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.4); }
        }
        @keyframes fireFlicker {
          0%, 100% { transform: scale(1) rotate(-3deg); }
          25% { transform: scale(1.15) rotate(3deg); }
          50% { transform: scale(0.95) rotate(-2deg); }
          75% { transform: scale(1.1) rotate(2deg); }
        }
        .fire-nav { display: inline-block; animation: fireFlicker 1.2s ease-in-out infinite; }
        .search-pill:hover { border-color: var(--blue) !important; box-shadow: 0 0 0 3px rgba(79,70,229,.1) !important; }
        @media (max-width: 640px) { .search-pill-text { display: none !important; } .search-pill { width: 36px !important; padding: 0 !important; justify-content: center !important; } }
      `}</style>

      {/* Gradient top border */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, #4F46E5, #7C3AED, #EC4899)',
      }} />

      {/* Logo */}
      <Link href="/" style={{
        fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700,
        fontSize: shrunk ? '1.1rem' : '1.25rem', display: 'flex', alignItems: 'center', gap: 7,
        color: 'var(--t1)', textDecoration: 'none', marginRight: 4, flexShrink: 0,
        transition: 'font-size 0.2s ease',
      }}>
        <span style={{
          width: 7, height: 7, background: 'var(--blue)', borderRadius: '50%', display: 'inline-block',
          boxShadow: '0 0 0 2px rgba(79,70,229,0.2), 0 0 8px 2px rgba(79,70,229,0.35)',
          animation: 'pulse-dot 2s ease-in-out infinite',
        }} />
        wiispr
      </Link>

      {/* Trending */}
      <Link href="/trending" style={{
        fontSize: '.8rem', fontWeight: 500, color: 'var(--t3)',
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '5px 10px', borderRadius: 'var(--r)',
        textDecoration: 'none', flexShrink: 0,
      }}>
        <span className="fire-nav" style={{ fontSize: 14, lineHeight: 1 }}>🔥</span>
        <span className="nav-label">Trending</span>
      </Link>

      {/* Search — inline with dropdown */}
      <div ref={searchAreaRef} style={{ position: 'relative' }}>
        {!searchOpen ? (
          <button
            className="search-pill"
            onClick={() => setSearchOpen(true)}
            style={{
              width: 180, height: 32, borderRadius: 9999,
              background: 'var(--sur)', border: '1px solid var(--bd)',
              boxShadow: '0 1px 3px rgba(0,0,0,.06)',
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0 10px', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.2s ease',
            }}
          >
            <Search size={13} style={{ color: 'var(--t4)', flexShrink: 0 }} />
            <span className="search-pill-text" style={{ flex: 1, fontSize: '.8rem', color: 'var(--t4)', textAlign: 'left' }}>Search</span>
          </button>
        ) : (
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--t4)', pointerEvents: 'none', zIndex: 1 }} />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              style={{
                width: 280, height: 32, borderRadius: 9999,
                background: 'var(--sur)',
                border: '1px solid var(--blue)',
                boxShadow: '0 0 0 3px rgba(79,70,229,.1)',
                paddingLeft: 30, paddingRight: searchQuery ? 30 : 10,
                fontSize: '.875rem', color: 'var(--t1)',
                outline: 'none', fontFamily: 'inherit',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setResults([]); searchRef.current?.focus() }}
                style={{
                  position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'var(--bg)', border: '1px solid var(--bd)',
                  color: 'var(--t3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', padding: 0,
                }}
              >
                <X size={10} />
              </button>
            )}
          </div>
        )}

        {/* Dropdown panel — inline below nav, NO overlay/backdrop */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute', top: '100%', left: 0,
                marginTop: 8,
                width: 480, maxWidth: 'calc(100vw - 32px)',
                background: 'var(--sur)', border: '1px solid var(--bd)',
                borderRadius: 'var(--rm)',
                boxShadow: '0 8px 32px rgba(0,0,0,.12)',
                overflow: 'hidden', zIndex: 200,
              }}
            >
              {/* Empty state */}
              {searchQuery.length < 2 && (
                <div style={{ padding: 20, textAlign: 'center' }}>
                  <Search size={28} style={{ color: 'var(--t4)', opacity: 0.4, margin: '0 auto 8px', display: 'block' }} />
                  <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>Type to search posts</p>
                </div>
              )}

              {/* Results */}
              {searchQuery.length >= 2 && results.length > 0 && (
                <div>
                  {results.map((post) => {
                    const catSlug = post.categories?.slug || post.category_slug || ''
                    const catColor = CATEGORY_COLORS[catSlug] || '#64748B'
                    return (
                      <a
                        key={post.id}
                        href={'/post/' + post.id}
                        onClick={closeSearch}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 14px',
                          borderBottom: '1px solid var(--bd)',
                          textDecoration: 'none', color: 'inherit',
                          cursor: 'pointer', transition: 'background .1s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: catColor, flexShrink: 0,
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: '.875rem', fontWeight: 600, color: 'var(--t1)',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            margin: 0,
                          }}>{post.title}</p>
                          <p style={{ fontSize: '.7rem', color: 'var(--t4)', fontFamily: 'monospace', margin: 0 }}>
                            {post.ghost_id} · {post.categories?.name || catSlug}
                          </p>
                        </div>
                      </a>
                    )
                  })}
                  <a
                    href={'/search?q=' + encodeURIComponent(searchQuery)}
                    onClick={closeSearch}
                    style={{
                      display: 'block', padding: 10, textAlign: 'center',
                      fontSize: '.75rem', fontWeight: 600, color: 'var(--blue)',
                      textDecoration: 'none', borderTop: '1px solid var(--bd)',
                    }}
                  >
                    See all results →
                  </a>
                </div>
              )}

              {/* No results */}
              {searchQuery.length >= 2 && results.length === 0 && (
                <div style={{ padding: 20, textAlign: 'center' }}>
                  <Ghost size={20} style={{ color: 'var(--t4)', margin: '0 auto 8px', display: 'block' }} />
                  <p style={{ fontSize: '.875rem', color: 'var(--t3)', margin: 0 }}>No results for &quot;{searchQuery}&quot;</p>
                </div>
              )}

              {/* Footer */}
              <div style={{
                borderTop: '1px solid var(--bd)', padding: '8px 14px',
                display: 'flex', justifyContent: 'flex-end',
              }}>
                <span style={{ fontSize: '.65rem', color: 'var(--t4)' }}>Powered by wiispr</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <span style={{ flex: 1 }} />

      {/* Dark/Light pill toggle */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        style={{
          width: 88, height: 30, borderRadius: 99,
          background: 'var(--bd)',
          border: 'none',
          display: 'flex', alignItems: 'center', position: 'relative',
          cursor: 'pointer', padding: 3, flexShrink: 0,
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{
            width: 40, height: 24, borderRadius: 99,
            background: dark ? 'var(--sur)' : '#fff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
            position: 'absolute', left: dark ? 45 : 3, top: 3,
          }}
        />
        <span style={{
          flex: 1, textAlign: 'center', fontSize: '.72rem', fontWeight: 600,
          color: !dark ? 'var(--t1)' : 'var(--t4)',
          zIndex: 1, transition: 'color 0.2s', userSelect: 'none',
        }}>Light</span>
        <span style={{
          flex: 1, textAlign: 'center', fontSize: '.72rem', fontWeight: 600,
          color: dark ? 'var(--t1)' : 'var(--t4)',
          zIndex: 1, transition: 'color 0.2s', userSelect: 'none',
        }}>Dark</span>
      </button>

      {user ? (
        <>
          <a href="/notifications" className="nav-signin" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: 'var(--r)',
            border: '1px solid var(--bd)', color: 'var(--t2)',
            background: 'none', cursor: 'pointer', position: 'relative',
            textDecoration: 'none'
          }}>
            <Bell size={15} />
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                width: 16, height: 16, borderRadius: '50%',
                background: 'var(--rose)', color: '#fff',
                fontSize: '.55rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{unread > 9 ? '9+' : unread}</span>
            )}
          </a>
          <a href="/profile" className="nav-signin" style={{
            fontSize: '.8rem', color: 'var(--t2)', fontWeight: 600,
            padding: '5px 10px', borderRadius: 'var(--r)',
            border: '1px solid var(--bd)', textDecoration: 'none', flexShrink: 0
          }}>{user.nickname}</a>
          <button onClick={signOut} className="nav-signin" style={{
            display: 'flex', alignItems: 'center',
            width: 32, height: 32, justifyContent: 'center',
            borderRadius: 'var(--r)', border: '1px solid var(--bd)',
            color: 'var(--t2)', background: 'none', cursor: 'pointer'
          }}>
            <LogOut size={13} />
          </button>
        </>
      ) : (
        <>
          <Link href="/auth?signin=1" className="nav-signin" style={{
            fontSize: '.8rem', fontWeight: 600, padding: '6px 14px',
            borderRadius: 'var(--r)', border: '1px solid var(--bd)',
            color: 'var(--t2)', textDecoration: 'none'
          }}>Sign in</Link>
          <Link href="/auth" className="nav-join" style={{
            fontSize: '.8rem', fontWeight: 600, padding: '6px 14px',
            borderRadius: 'var(--r)', background: 'var(--blue)',
            color: '#fff', textDecoration: 'none'
          }}>Join free</Link>
        </>
      )}
    </nav>
  )
}
