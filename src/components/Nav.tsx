'use client'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { Search, Bell, LogOut, Menu, X, ChevronLeft, User } from 'lucide-react'
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
  const [isMobile, setIsMobile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [authPromptOpen, setAuthPromptOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [mobileSearchQuery, setMobileSearchQuery] = useState('')
  const [mobileResults, setMobileResults] = useState<any[]>([])
  const searchRef = useRef<HTMLInputElement>(null)
  const mobileSearchRef = useRef<HTMLInputElement>(null)
  const searchAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)

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
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', checkMobile) }
  }, [])

  // Desktop: escape to close search
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && searchOpen) closeSearch()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [searchOpen])

  // Desktop: focus input on open
  useEffect(() => {
    if (searchOpen && !isMobile) setTimeout(() => searchRef.current?.focus(), 50)
  }, [searchOpen, isMobile])

  // Desktop: click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!isMobile && searchAreaRef.current && !searchAreaRef.current.contains(e.target as Node)) {
        closeSearch()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isMobile])

  // Desktop search debounce
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

  // Mobile search debounce
  useEffect(() => {
    if (mobileSearchQuery.length >= 2) {
      const timer = setTimeout(() => {
        fetch('/api/posts/search?q=' + encodeURIComponent(mobileSearchQuery))
          .then(r => r.json())
          .then(d => setMobileResults(d.posts?.slice(0, 6) || []))
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setMobileResults([])
    }
  }, [mobileSearchQuery])

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

  // Desktop search dropdown content
  const desktopSearchPanel = (
    <div style={{ maxHeight: 360, overflowY: 'auto' }}>
      {searchQuery.length < 2 && (
        <div style={{ padding: '16px 0', textAlign: 'center' }}>
          <Search size={20} style={{ color: 'var(--t4)', opacity: 0.4, margin: '0 auto 6px', display: 'block' }} />
          <p style={{ fontSize: '.8rem', color: 'var(--t4)' }}>Search posts</p>
        </div>
      )}
      {searchQuery.length >= 2 && results.length > 0 && (
        <div>
          {results.map((post) => {
            const catSlug = post.categories?.slug || post.category_slug || ''
            const catColor = CATEGORY_COLORS[catSlug] || '#64748B'
            return (
              <a key={post.id} href={'/post/' + post.id} onClick={closeSearch}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--bd)', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: catColor, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--t1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{post.title}</p>
                  <p style={{ fontSize: '.72rem', color: 'var(--t3)', fontFamily: 'monospace', margin: 0 }}>{post.ghost_id} · {post.categories?.name || catSlug}</p>
                </div>
              </a>
            )
          })}
          <a href={'/search?q=' + encodeURIComponent(searchQuery)} onClick={closeSearch}
            style={{ display: 'block', padding: 10, textAlign: 'center', fontSize: '.75rem', fontWeight: 600, color: 'var(--blue)', textDecoration: 'none', borderTop: '1px solid var(--bd)' }}>
            See all results →
          </a>
        </div>
      )}
      {searchQuery.length >= 2 && results.length === 0 && (
        <div style={{ padding: '16px 0', textAlign: 'center' }}>
          <Search size={20} style={{ color: 'var(--t4)', margin: '0 auto 6px', display: 'block' }} />
          <p style={{ fontSize: '.8rem', color: 'var(--t3)', margin: 0 }}>No results for &quot;{searchQuery}&quot;</p>
        </div>
      )}
    </div>
  )

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
          .search-pill:hover { border-color: var(--blue) !important; box-shadow: 0 0 0 3px rgba(79,70,229,.1) !important; }
        `}</style>

        {/* DESKTOP NAV */}
        {!isMobile && (
          <>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #4F46E5, #7C3AED, #EC4899)' }} />

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

            <Link href="/trending" style={{
              fontSize: '.8rem', fontWeight: 500, color: 'var(--t3)',
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 'var(--r)',
              textDecoration: 'none', flexShrink: 0,
            }}>
              <span className="fire-nav" style={{ fontSize: 14, lineHeight: 1 }}>🔥</span>
              <span>Trending</span>
            </Link>

            <div ref={searchAreaRef} style={{ position: 'relative' }}>
              {!searchOpen ? (
                <button className="search-pill" onClick={() => setSearchOpen(true)}
                  style={{ width: 180, height: 32, borderRadius: 9999, background: 'var(--sur)', border: '1px solid var(--bd)', boxShadow: '0 1px 3px rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s ease' }}>
                  <Search size={13} style={{ color: 'var(--t4)', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '.8rem', color: 'var(--t4)', textAlign: 'left' }}>Search</span>
                </button>
              ) : (
                <div style={{ position: 'relative' }}>
                  <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--t4)', pointerEvents: 'none', zIndex: 1 }} />
                  <input ref={searchRef} type="text" placeholder="Search posts..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={handleSearchKeyDown}
                    style={{ width: 280, height: 32, borderRadius: 9999, background: 'var(--sur)', border: '1px solid var(--blue)', boxShadow: '0 0 0 3px rgba(79,70,229,.1)', paddingLeft: 30, paddingRight: searchQuery ? 30 : 10, fontSize: '.875rem', color: 'var(--t1)', outline: 'none', fontFamily: 'inherit' }} />
                  {searchQuery && (
                    <button onClick={() => { setSearchQuery(''); setResults([]); searchRef.current?.focus() }}
                      style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--bd)', color: 'var(--t3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
                      <X size={10} />
                    </button>
                  )}
                </div>
              )}
              <AnimatePresence>
                {searchOpen && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                    style={{ position: 'absolute', top: '100%', left: 0, marginTop: 8, width: 480, maxWidth: 'calc(100vw - 32px)', background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', boxShadow: '0 8px 32px rgba(0,0,0,.12)', overflow: 'hidden', zIndex: 200 }}>
                    {desktopSearchPanel}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span style={{ flex: 1 }} />

            <button onClick={toggleTheme} aria-label="Toggle theme"
              style={{ width: 76, height: 28, borderRadius: 99, background: 'var(--bd)', border: 'none', display: 'flex', alignItems: 'center', position: 'relative', cursor: 'pointer', padding: 3, flexShrink: 0, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
              <motion.div layout transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                style={{ width: 34, height: 22, borderRadius: 99, background: dark ? 'var(--sur)' : '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.18)', position: 'absolute', left: dark ? 39 : 3, top: 3 }} />
              <span style={{ flex: 1, textAlign: 'center', fontSize: '.68rem', fontWeight: 600, color: !dark ? 'var(--t1)' : 'var(--t4)', zIndex: 1, userSelect: 'none' }}>Light</span>
              <span style={{ flex: 1, textAlign: 'center', fontSize: '.68rem', fontWeight: 600, color: dark ? 'var(--t1)' : 'var(--t4)', zIndex: 1, userSelect: 'none' }}>Dark</span>
            </button>

            {user ? (
              <>
                <a href="/notifications" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: 'var(--r)',
                  border: '1px solid var(--bd)', color: 'var(--t2)',
                  background: 'none', cursor: 'pointer', position: 'relative', textDecoration: 'none'
                }}>
                  <Bell size={15} />
                  {unread > 0 && (
                    <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: 'var(--rose)', color: '#fff', fontSize: '.55rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread > 9 ? '9+' : unread}</span>
                  )}
                </a>
                <a href="/profile" style={{
                  fontSize: '.8rem', color: 'var(--t2)', fontWeight: 600,
                  padding: '5px 10px', borderRadius: 'var(--r)',
                  border: '1px solid var(--bd)', textDecoration: 'none', flexShrink: 0
                }}>{user.nickname}</a>
                <button onClick={signOut} style={{
                  display: 'flex', alignItems: 'center', width: 32, height: 32, justifyContent: 'center',
                  borderRadius: 'var(--r)', border: '1px solid var(--bd)', color: 'var(--t2)', background: 'none', cursor: 'pointer'
                }}>
                  <LogOut size={13} />
                </button>
              </>
            ) : (
              <button onClick={() => setAuthPromptOpen(true)}
                style={{ fontSize: '.8rem', fontWeight: 700, padding: '6px 14px', borderRadius: 'var(--r)', background: 'var(--blue)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
                Log in
              </button>
            )}
          </>
        )}

        {/* MOBILE NAV */}
        {isMobile && (
          <>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #4F46E5, #7C3AED, #EC4899)' }} />

            <Link href="/" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 7, color: 'var(--t1)', textDecoration: 'none', flexShrink: 0 }}>
              <span style={{ width: 7, height: 7, background: 'var(--blue)', borderRadius: '50%', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} />
              wiispr
            </Link>

            <Link href="/trending" style={{ display: 'flex', alignItems: 'center', flexShrink: 0, textDecoration: 'none' }}>
              <span className="fire-nav" style={{ fontSize: 18, lineHeight: 1 }}>🔥</span>
            </Link>

            <button onClick={() => { setMobileSearchOpen(true); setTimeout(() => mobileSearchRef.current?.focus(), 100) }}
              style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--bd)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--t3)', flexShrink: 0 }}>
              <Search size={16} />
            </button>

            <span style={{ flex: 1 }} />

            {user && (
              <a href="/notifications" style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--bd)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)', textDecoration: 'none', position: 'relative', flexShrink: 0 }}>
                <Bell size={16} />
                {unread > 0 && <span style={{ position: 'absolute', top: -3, right: -3, width: 15, height: 15, borderRadius: '50%', background: 'var(--rose)', color: '#fff', fontSize: '.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread > 9 ? '9+' : unread}</span>}
              </a>
            )}

            <button onClick={() => setMenuOpen(true)}
              style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--bd)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--t2)', flexShrink: 0 }}>
              <Menu size={18} />
            </button>
          </>
        )}
      </nav>

      {/* ══ MOBILE FULL SCREEN SEARCH ══ */}
      <AnimatePresence>
        {isMobile && mobileSearchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 300, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'var(--sur)', borderBottom: '1px solid var(--bd)', height: 56, flexShrink: 0 }}>
              <button onClick={() => { setMobileSearchOpen(false); setMobileSearchQuery(''); setMobileResults([]) }}
                style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--bd)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--t2)', flexShrink: 0 }}>
                <ChevronLeft size={18} />
              </button>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--t4)', pointerEvents: 'none' }} />
                <input ref={mobileSearchRef} type="text" placeholder="Search posts, topics..."
                  value={mobileSearchQuery} onChange={e => setMobileSearchQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && mobileSearchQuery.trim().length >= 2) { router.push('/search?q=' + encodeURIComponent(mobileSearchQuery.trim())); setMobileSearchOpen(false); setMobileSearchQuery(''); setMobileResults([]) } }}
                  style={{ width: '100%', height: 40, paddingLeft: 36, paddingRight: mobileSearchQuery ? 36 : 14, fontSize: '.95rem', color: 'var(--t1)', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 9999, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
                {mobileSearchQuery && (
                  <button onClick={() => { setMobileSearchQuery(''); setMobileResults([]) }}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t4)', display: 'flex', padding: 2 }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {mobileSearchQuery.length < 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', gap: 12 }}>
                  <Search size={32} style={{ color: 'var(--t4)', opacity: 0.3 }} />
                  <p style={{ fontSize: '.9rem', color: 'var(--t4)', textAlign: 'center' }}>Search posts, topics, Ghost IDs</p>
                </div>
              )}
              {mobileResults.map(post => (
                <a key={post.id} href={'/post/' + post.id}
                  onClick={() => { setMobileSearchOpen(false); setMobileSearchQuery(''); setMobileResults([]) }}
                  style={{ display: 'flex', flexDirection: 'column', padding: '14px 20px', borderBottom: '1px solid var(--bd)', textDecoration: 'none' }}>
                  <p style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 3 }}>{post.title}</p>
                  <p style={{ fontSize: '.72rem', color: 'var(--t4)', fontFamily: 'monospace' }}>{post.ghost_id} · {post.categories?.name}</p>
                </a>
              ))}
              {mobileSearchQuery.length >= 2 && mobileResults.length === 0 && (
                <p style={{ textAlign: 'center', padding: '60px 20px', fontSize: '.9rem', color: 'var(--t4)' }}>No results for &quot;{mobileSearchQuery}&quot;</p>
              )}
              {mobileResults.length > 0 && (
                <button onClick={() => { router.push('/search?q=' + encodeURIComponent(mobileSearchQuery)); setMobileSearchOpen(false); setMobileSearchQuery(''); setMobileResults([]) }}
                  style={{ width: '100%', padding: 14, textAlign: 'center', fontSize: '.875rem', color: 'var(--blue)', fontWeight: 600, background: 'none', border: 'none', borderTop: '1px solid var(--bd)', cursor: 'pointer', fontFamily: 'inherit' }}>
                  See all results →
                </button>
              )}
            </div>
            <div style={{ padding: '10px 20px', borderTop: '1px solid var(--bd)', textAlign: 'right', flexShrink: 0 }}>
              <span style={{ fontSize: '.65rem', color: 'var(--t4)' }}>Powered by wiispr</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ HAMBURGER BOTTOM SHEET ══ */}
      <AnimatePresence>
        {isMobile && menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 400 }} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 401, background: 'var(--sur)', borderTop: '1px solid var(--bd)', borderRadius: '20px 20px 0 0', paddingBottom: 'env(safe-area-inset-bottom)' }}>
              <div style={{ width: 36, height: 4, background: 'var(--bd2)', borderRadius: 9999, margin: '12px auto 8px' }} />

              {/* Theme row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--bd)' }}>
                <span style={{ fontSize: '.9rem', fontWeight: 500, color: 'var(--t2)' }}>Theme</span>
                <button onClick={toggleTheme} aria-label="Toggle theme"
                  style={{ width: 76, height: 28, borderRadius: 14, background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`, display: 'flex', alignItems: 'center', position: 'relative', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
                  <motion.div animate={{ x: dark ? 38 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    style={{ width: 34, height: 22, borderRadius: 11, background: dark ? 'rgba(255,255,255,0.15)' : '#fff', boxShadow: dark ? 'none' : '0 1px 3px rgba(0,0,0,0.1)', position: 'absolute', left: 2, top: 2 }} />
                  <span style={{ flex: 1, textAlign: 'center', fontSize: '.6rem', fontWeight: 700, color: !dark ? 'var(--t1)' : 'var(--t4)', zIndex: 1, letterSpacing: '.02em', textTransform: 'uppercase' }}>Light</span>
                  <span style={{ flex: 1, textAlign: 'center', fontSize: '.6rem', fontWeight: 700, color: dark ? 'var(--t1)' : 'var(--t4)', zIndex: 1, letterSpacing: '.02em', textTransform: 'uppercase' }}>Dark</span>
                </button>
              </div>

              {user ? (
                <>
                  <a href="/profile" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--bd)', textDecoration: 'none' }}>
                    <User size={18} style={{ color: 'var(--t3)', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--t1)' }}>{user.nickname}</p>
                      <p style={{ fontSize: '.72rem', color: 'var(--t4)' }}>Profile & settings</p>
                    </div>
                  </a>
                  <button onClick={() => { signOut(); setMenuOpen(false) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--rose)', textAlign: 'left' as const }}>
                    <LogOut size={18} />
                    <span style={{ fontSize: '.9rem', fontWeight: 600 }}>Sign out</span>
                  </button>
                </>
              ) : (
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button onClick={() => { setMenuOpen(false); setAuthPromptOpen(true) }}
                    style={{ width: '100%', height: 44, background: 'var(--blue)', color: '#fff', fontSize: '.9rem', fontWeight: 700, borderRadius: 'var(--r)', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Sign up
                  </button>
                  <button onClick={() => { window.location.href = '/auth?signin=1'; setMenuOpen(false) }}
                    style={{ width: '100%', height: 44, background: 'transparent', color: 'var(--t1)', fontSize: '.9rem', fontWeight: 600, borderRadius: 'var(--r)', border: '1.5px solid var(--bd)', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Log in
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══ AUTH PROMPT ══ */}
      <AnimatePresence>
        {authPromptOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setAuthPromptOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)', zIndex: 500 }} />
            <motion.div
              initial={{ y: isMobile ? '100%' : undefined, scale: isMobile ? 1 : 0.95, opacity: isMobile ? 1 : 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: isMobile ? '100%' : undefined, scale: isMobile ? 1 : 0.95, opacity: isMobile ? 1 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              style={{
                position: 'fixed', zIndex: 501, background: 'var(--sur)',
                ...(isMobile
                  ? { bottom: 0, left: 0, right: 0, borderRadius: '20px 20px 0 0', paddingBottom: 'env(safe-area-inset-bottom)' }
                  : { top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 360, borderRadius: 'var(--rm)', border: '1px solid var(--bd)', boxShadow: '0 20px 60px rgba(0,0,0,.2)' })
              }}>
              {isMobile && <div style={{ width: 36, height: 4, background: 'var(--bd2)', borderRadius: 9999, margin: '12px auto 4px' }} />}
              <div style={{ padding: '28px 28px 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700, fontSize: '1.5rem', color: 'var(--t1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ width: 8, height: 8, background: 'var(--blue)', borderRadius: '50%', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} />
                    wiispr
                  </div>
                  <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>Say what you actually think.</p>
                </div>
                <button onClick={() => { window.location.href = '/auth' }}
                  style={{ width: '100%', height: 44, background: 'var(--blue)', color: '#fff', fontSize: '.9rem', fontWeight: 700, borderRadius: 'var(--r)', border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10 }}>
                  Sign up — it&apos;s free
                </button>
                <button onClick={() => { window.location.href = '/auth?signin=1' }}
                  style={{ width: '100%', height: 44, background: 'transparent', color: 'var(--t1)', fontSize: '.9rem', fontWeight: 600, borderRadius: 'var(--r)', border: '1.5px solid var(--bd)', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Log in
                </button>
                <p style={{ fontSize: '.72rem', color: 'var(--t4)', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
                  By continuing you agree to our <a href="/terms" style={{ color: 'var(--blue)' }}>Terms</a> and <a href="/privacy" style={{ color: 'var(--blue)' }}>Privacy Policy</a>
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
