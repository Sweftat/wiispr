'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Nav() {
  const [user, setUser] = useState<{nickname: string} | null>(null)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(d => { if (d.user) setUser(d.user) })
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

  const moonIcon = <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M13.5 10A6 6 0 0 1 6 2.5a6 6 0 1 0 7.5 7.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  const sunIcon = <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.1 3.1l1.1 1.1M11.8 11.8l1.1 1.1M11.8 4.2l-1.1 1.1M4.2 11.8l-1.1 1.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>

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
      <span style={{ flex: 1 }}></span>
      <button onClick={toggleTheme} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 32, height: 32, borderRadius: 'var(--r)',
        border: '1px solid var(--bd)', color: 'var(--t2)',
        background: 'none', cursor: 'pointer'
      }}>{dark ? sunIcon : moonIcon}</button>
      {user ? (
        <>
          <span style={{ fontSize: '.8rem', color: 'var(--t3)', fontWeight: 500 }}>{user.nickname}</span>
          <button onClick={signOut} style={{
            fontSize: '.8rem', fontWeight: 600, padding: '6px 14px',
            borderRadius: 'var(--r)', border: '1px solid var(--bd)',
            color: 'var(--t2)', background: 'none', cursor: 'pointer'
          }}>Sign out</button>
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
