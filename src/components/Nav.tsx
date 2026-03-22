'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Search, Moon, Sun, Bell, LogOut } from 'lucide-react'

export default function Nav() {
  const [user, setUser] = useState<{nickname: string} | null>(null)
  const [dark, setDark] = useState(false)
  const [unread, setUnread] = useState(0)

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

  return (
    <nav style={{
      height: 52, background: 'var(--sur)', borderBottom: '1px solid var(--bd)',
      display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12,
      position: 'sticky', top: 0, zIndex: 100
    }}>
      <Link href="/" style={{
        fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700,
        fontSize: '1.0625rem', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--t1)'
      }}>
        <span style={{ width: 6, height: 6, background: 'var(--blue)', borderRadius: '50%', display: 'inline-block' }}></span>
        wiispr
      </Link>

      <Link href="/search" style={{
        fontSize: '.8rem', fontWeight: 500, color: 'var(--t3)',
        display: 'flex', alignItems: 'center', gap: 5
      }}>
        <Search size={14} />
        Search
      </Link>

      <span style={{ flex: 1 }}></span>

      <button onClick={toggleTheme} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 32, height: 32, borderRadius: 'var(--r)',
        border: '1px solid var(--bd)', color: 'var(--t2)',
        background: 'none', cursor: 'pointer'
      }}>
        {dark ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      {user ? (
        <>
          <a href="/notifications" style={{
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
          <span style={{ fontSize: '.8rem', color: 'var(--t3)', fontWeight: 500 }}>{user.nickname}</span>
          <button onClick={signOut} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: '.8rem', fontWeight: 600, padding: '6px 12px',
            borderRadius: 'var(--r)', border: '1px solid var(--bd)',
            color: 'var(--t2)', background: 'none', cursor: 'pointer'
          }}>
            <LogOut size={13} />
            Sign out
          </button>
        </>
      ) : (
        <>
          <Link href="/auth?signin=1" style={{
            fontSize: '.8rem', fontWeight: 600, padding: '6px 14px',
            borderRadius: 'var(--r)', border: '1px solid var(--bd)', color: 'var(--t2)'
          }}>Sign in</Link>
          <Link href="/auth" style={{
            fontSize: '.8rem', fontWeight: 600, padding: '6px 14px',
            borderRadius: 'var(--r)', background: '#18181B', color: '#fff'
          }}>Join free</Link>
        </>
      )}
    </nav>
  )
}