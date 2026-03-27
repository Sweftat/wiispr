'use client'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { Search, Bell, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function Nav() {
  const router = useRouter()
  const [user, setUser] = useState<{nickname: string} | null>(null)
  const [dark, setDark] = useState(false)
  const [unread, setUnread] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [online, setOnline] = useState(0)
  const [shrunk, setShrunk] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

    // Online count
    fetch('/api/online').then(r => r.json()).then(d => setOnline(d.online || 0))
    const interval = setInterval(() => {
      fetch('/api/online').then(r => r.json()).then(d => setOnline(d.online || 0))
    }, 60000)

    // Scroll-aware nav
    let lastY = 0
    function onScroll() {
      const y = window.scrollY
      if (y > 50 && y > lastY) setShrunk(true)
      else if (y < lastY) setShrunk(false)
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { clearInterval(interval); window.removeEventListener('scroll', onScroll) }
  }, [])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => {
        fetch('/api/posts/search?q=' + encodeURIComponent(searchQuery))
          .then(r => r.json())
          .then(d => setResults(d.posts?.slice(0, 5) || []))
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setResults([])
    }
  }, [searchQuery])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
        setSearchQuery('')
        setResults([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
      router.push('/search?q=' + encodeURIComponent(searchQuery.trim()))
      setSearchOpen(false)
      setSearchQuery('')
      setResults([])
    }
    if (e.key === 'Escape') {
      setSearchOpen(false)
      setSearchQuery('')
      setResults([])
    }
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
      `}</style>

      {/* Gradient top border */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, #2563EB, #7C3AED, #EC4899)',
      }} />

      {/* Logo + online count */}
      <Link href="/" style={{
        fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700,
        fontSize: shrunk ? '1.1rem' : '1.25rem', display: 'flex', alignItems: 'center', gap: 7,
        color: 'var(--t1)', textDecoration: 'none', marginRight: 4, flexShrink: 0,
        transition: 'font-size 0.2s ease',
      }}>
        <span style={{
          width: 7, height: 7, background: 'var(--blue)', borderRadius: '50%', display: 'inline-block',
          boxShadow: '0 0 0 2px rgba(37,99,235,0.2), 0 0 8px 2px rgba(37,99,235,0.35)',
          animation: 'pulse-dot 2s ease-in-out infinite',
        }} />
        wiispr
      </Link>

      {online > 0 && (
        <span style={{
          fontSize: '.65rem', color: 'var(--grn)', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0,
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%', background: 'var(--grn)',
            display: 'inline-block',
            animation: 'pulse-dot 2s ease-in-out infinite',
          }} />
          {online}
        </span>
      )}

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

      {/* Search */}
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button onClick={() => setSearchOpen(o => !o)} style={{
          fontSize: '.8rem', fontWeight: 500,
          color: searchOpen ? 'var(--blue)' : 'var(--t2)',
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 10px', borderRadius: 'var(--r)',
          background: searchOpen ? 'var(--blue-d)' : 'var(--bg)',
          border: '1px solid var(--bd)',
          cursor: 'pointer', fontFamily: 'inherit',
          transition: 'all .15s'
        }}>
          <Search size={14} strokeWidth={2.5} />
          <span className="nav-label">Search</span>
        </button>

        {searchOpen && (
          <div style={{
            position: 'fixed', top: navH, left: 16, right: 16,
            width: 'auto', maxWidth: 400,
            background: 'var(--sur)',
            border: '1px solid var(--bd)', borderRadius: 'var(--rm)',
            boxShadow: '0 8px 24px rgba(0,0,0,.12)', zIndex: 200, overflow: 'hidden'
          }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--bd)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--t4)', pointerEvents: 'none' }} />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search posts, topics..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{
                    width: '100%', height: 34, paddingLeft: 30, paddingRight: 12,
                    fontSize: '.8rem', color: 'var(--t1)',
                    background: 'var(--bg)', border: '1px solid var(--bd)',
                    borderRadius: 'var(--r)', outline: 'none', fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {results.length > 0 && (
              <div>
                {results.map(post => (
                  <a key={post.id} href={'/post/' + post.id}
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); setResults([]) }}
                    style={{ display: 'block', padding: '10px 14px', borderBottom: '1px solid var(--bd)', textDecoration: 'none', color: 'inherit' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <p style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--t1)', marginBottom: 2 }}>{post.title}</p>
                    <p style={{ fontSize: '.7rem', color: 'var(--t4)' }}>{post.categories?.name} · {post.ghost_id}</p>
                  </a>
                ))}
                <a href={'/search?q=' + encodeURIComponent(searchQuery)}
                  onClick={() => { setSearchOpen(false); setSearchQuery(''); setResults([]) }}
                  style={{ display: 'block', padding: '10px 14px', fontSize: '.75rem', color: 'var(--blue)', fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}
                >
                  See all results →
                </a>
              </div>
            )}

            {searchQuery.length >= 2 && results.length === 0 && (
              <div style={{ padding: '20px 14px', textAlign: 'center' }}>
                <p style={{ fontSize: '.8rem', color: 'var(--t4)' }}>No results for &quot;{searchQuery}&quot;</p>
              </div>
            )}

            {searchQuery.length < 2 && (
              <div style={{ padding: '14px', textAlign: 'center' }}>
                <p style={{ fontSize: '.75rem', color: 'var(--t4)' }}>Type to search posts</p>
              </div>
            )}
          </div>
        )}
      </div>

      <span style={{ flex: 1 }} />

      {/* Dark/Light pill toggle */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        style={{
          width: 76, height: 28, borderRadius: 14,
          background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
          border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
          display: 'flex', alignItems: 'center', position: 'relative',
          cursor: 'pointer', padding: 2, flexShrink: 0,
          transition: 'background 0.2s, border 0.2s',
        }}
      >
        <motion.div
          animate={{ x: dark ? 38 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            width: 34, height: 22, borderRadius: 11,
            background: dark ? 'rgba(255,255,255,0.15)' : '#fff',
            boxShadow: dark ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
            position: 'absolute', left: 2, top: 2,
          }}
        />
        <span style={{
          flex: 1, textAlign: 'center', fontSize: '.6rem', fontWeight: 700,
          color: !dark ? 'var(--t1)' : 'var(--t4)',
          zIndex: 1, letterSpacing: '.02em', textTransform: 'uppercase',
          transition: 'color 0.2s',
        }}>Light</span>
        <span style={{
          flex: 1, textAlign: 'center', fontSize: '.6rem', fontWeight: 700,
          color: dark ? 'var(--t1)' : 'var(--t4)',
          zIndex: 1, letterSpacing: '.02em', textTransform: 'uppercase',
          transition: 'color 0.2s',
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
