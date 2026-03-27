'use client'
import Link from 'next/link'
import { useEffect, useState, useRef, useCallback } from 'react'
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
  const [highlightIdx, setHighlightIdx] = useState(-1)
  const [trending, setTrending] = useState<{keyword: string, count: number}[]>([])
  const searchRef = useRef<HTMLInputElement>(null)

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

  // ⌘K / Ctrl+K to open search
  useEffect(() => {
    function handleGlobal(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(o => !o)
      }
      if (e.key === 'Escape' && searchOpen) {
        closeSearch()
      }
    }
    document.addEventListener('keydown', handleGlobal)
    return () => document.removeEventListener('keydown', handleGlobal)
  }, [searchOpen])

  // Focus input when overlay opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 50)
      // Fetch trending topics
      fetch('/api/trending-topics')
        .then(r => r.json())
        .then(d => setTrending(d.topics || []))
        .catch(() => {})
    } else {
      setHighlightIdx(-1)
    }
  }, [searchOpen])

  // Search debounce
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => {
        fetch('/api/posts/search?q=' + encodeURIComponent(searchQuery))
          .then(r => r.json())
          .then(d => { setResults(d.posts?.slice(0, 8) || []); setHighlightIdx(-1) })
      }, 250)
      return () => clearTimeout(timer)
    } else {
      setResults([])
      setHighlightIdx(-1)
    }
  }, [searchQuery])

  const closeSearch = useCallback(() => {
    setSearchOpen(false)
    setSearchQuery('')
    setResults([])
    setHighlightIdx(-1)
  }, [])

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIdx(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIdx(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      if (highlightIdx >= 0 && results[highlightIdx]) {
        router.push('/post/' + results[highlightIdx].id)
        closeSearch()
      } else if (searchQuery.trim().length >= 2) {
        router.push('/search?q=' + encodeURIComponent(searchQuery.trim()))
        closeSearch()
      }
    } else if (e.key === 'Escape') {
      closeSearch()
    }
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
    <>
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
          .search-trigger:hover { border-color: var(--blue) !important; box-shadow: 0 1px 4px rgba(0,0,0,.06), 0 0 0 3px rgba(79,70,229,.12) !important; }
          @media (max-width: 640px) { .search-desktop { display: none !important; } .search-mobile { display: flex !important; } }
          @media (min-width: 641px) { .search-desktop { display: flex !important; } .search-mobile { display: none !important; } }
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

        {/* Search trigger — Desktop: pill input look, Mobile: icon only */}
        <button
          className="search-trigger search-desktop"
          onClick={() => setSearchOpen(true)}
          style={{
            width: 200, height: 34, borderRadius: 9999,
            background: 'var(--sur)', border: '1px solid var(--bd)',
            boxShadow: '0 1px 4px rgba(0,0,0,.06)',
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0 10px', cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 0.2s ease',
          }}
        >
          <Search size={14} style={{ color: 'var(--t4)', flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: '.8rem', color: 'var(--t4)', textAlign: 'left' }}>Search...</span>
          <span style={{
            fontSize: '.65rem', color: 'var(--t4)', background: 'var(--bg)',
            border: '1px solid var(--bd)', borderRadius: 4, padding: '1px 5px',
            fontFamily: 'monospace', flexShrink: 0,
          }}>⌘K</span>
        </button>
        <button
          className="search-trigger search-mobile"
          onClick={() => setSearchOpen(true)}
          style={{
            width: 36, height: 34, borderRadius: 9999,
            background: 'var(--sur)', border: '1px solid var(--bd)',
            boxShadow: '0 1px 4px rgba(0,0,0,.06)',
            display: 'none', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', padding: 0,
            transition: 'all 0.2s ease',
          }}
        >
          <Search size={14} style={{ color: 'var(--t4)' }} />
        </button>

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

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={closeSearch}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,.4)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 300,
              }}
            />
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
                width: 'min(600px, calc(100vw - 32px))',
                background: 'var(--sur)', border: '1px solid var(--bd)',
                borderRadius: 'var(--rm)',
                boxShadow: '0 20px 60px rgba(0,0,0,.15)',
                overflow: 'hidden', zIndex: 301,
              }}
            >
              {/* Search input */}
              <div style={{ position: 'relative', borderBottom: '1px solid var(--bd)' }}>
                <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--t4)', pointerEvents: 'none' }} />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search posts, topics, Ghost IDs..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  style={{
                    width: '100%', height: 52, paddingLeft: 44, paddingRight: 44,
                    fontSize: '1rem', color: 'var(--t1)',
                    background: 'transparent', border: 'none', outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setResults([]); searchRef.current?.focus() }}
                    style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      width: 24, height: 24, borderRadius: '50%',
                      background: 'var(--bg)', border: '1px solid var(--bd)',
                      color: 'var(--t3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', padding: 0,
                    }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Results area */}
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {/* Empty state: trending topics */}
                {searchQuery.length < 2 && (
                  <div>
                    {trending.length > 0 && (
                      <>
                        <div style={{
                          fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: '.08em', color: 'var(--t4)', padding: '12px 16px 6px',
                        }}>Trending topics</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 16px 12px' }}>
                          {trending.map(t => (
                            <button
                              key={t.keyword}
                              onClick={() => setSearchQuery(t.keyword)}
                              style={{
                                background: 'var(--bg)', border: '1px solid var(--bd)',
                                borderRadius: 9999, fontSize: '.75rem', padding: '4px 12px',
                                color: 'var(--t2)', cursor: 'pointer', fontFamily: 'inherit',
                                transition: 'all .15s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'var(--blue-d)'; e.currentTarget.style.color = 'var(--blue)'; e.currentTarget.style.borderColor = 'rgba(79,70,229,.2)' }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--t2)'; e.currentTarget.style.borderColor = 'var(--bd)' }}
                            >
                              {t.keyword}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    {trending.length === 0 && (
                      <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                        <Search size={20} style={{ color: 'var(--t4)', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '.8rem', color: 'var(--t4)' }}>Type to search posts</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Search results */}
                {searchQuery.length >= 2 && results.length > 0 && (
                  <div>
                    {results.map((post, i) => {
                      const catSlug = post.categories?.slug || post.category_slug || ''
                      const catColor = CATEGORY_COLORS[catSlug] || '#64748B'
                      return (
                        <a
                          key={post.id}
                          href={'/post/' + post.id}
                          onClick={closeSearch}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '0 16px', height: 56,
                            borderBottom: '1px solid var(--bd)',
                            textDecoration: 'none', color: 'inherit',
                            background: highlightIdx === i ? 'var(--bg)' : 'transparent',
                            transition: 'background .1s',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={() => setHighlightIdx(i)}
                        >
                          <span style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: catColor, flexShrink: 0,
                          }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              fontSize: '.875rem', fontWeight: 600, color: 'var(--t1)',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>{post.title}</p>
                            <p style={{ fontSize: '.72rem', color: 'var(--t4)', fontFamily: 'monospace' }}>
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
                        display: 'block', padding: '12px 16px', textAlign: 'center',
                        fontSize: '.78rem', fontWeight: 600, color: 'var(--blue)',
                        textDecoration: 'none',
                      }}
                    >
                      See all results →
                    </a>
                  </div>
                )}

                {/* No results */}
                {searchQuery.length >= 2 && results.length === 0 && (
                  <div style={{ padding: '32px 0', textAlign: 'center' }}>
                    <Ghost size={24} style={{ color: 'var(--t4)', margin: '0 auto 8px' }} />
                    <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>No results for &quot;{searchQuery}&quot;</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{
                height: 36, borderTop: '1px solid var(--bd)',
                display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16,
              }}>
                <span style={{ fontSize: '.65rem', color: 'var(--t4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <kbd style={{ fontSize: '.6rem', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 3, padding: '0px 4px', fontFamily: 'monospace' }}>↑↓</kbd> navigate
                </span>
                <span style={{ fontSize: '.65rem', color: 'var(--t4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <kbd style={{ fontSize: '.6rem', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 3, padding: '0px 4px', fontFamily: 'monospace' }}>↵</kbd> open
                </span>
                <span style={{ fontSize: '.65rem', color: 'var(--t4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <kbd style={{ fontSize: '.6rem', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 3, padding: '0px 4px', fontFamily: 'monospace' }}>esc</kbd> close
                </span>
                <span style={{ flex: 1 }} />
                <span style={{ fontSize: '.65rem', color: 'var(--t4)' }}>Powered by wiispr</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
