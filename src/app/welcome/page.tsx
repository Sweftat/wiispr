'use client'
import { useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'

export default function WelcomePage() {
  const [ghostId, setGhostId] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    const id = sessionStorage.getItem('wiispr_new_ghost_id')
    if (id) {
      setGhostId(id)
      sessionStorage.removeItem('wiispr_new_ghost_id')
    } else {
      // No ghost ID stored — redirect to home
      window.location.href = '/'
    }
  }, [])

  useEffect(() => {
    if (!revealed || !ghostId) return
    if (charIndex < ghostId.length) {
      const t = setTimeout(() => setCharIndex(i => i + 1), 55)
      return () => clearTimeout(t)
    }
  }, [revealed, charIndex, ghostId])

  if (!ghostId) return null

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,0)} 50%{box-shadow:0 0 32px 8px rgba(59,130,246,0.18)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>

      <div style={{ animation: 'fadeUp .5s ease both', textAlign: 'center', maxWidth: 420, width: '100%' }}>
        <div style={{ marginBottom: 32 }}>
          <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700, fontSize: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--t1)' }}>
            <span style={{ width: 7, height: 7, background: 'var(--blue)', borderRadius: '50%', display: 'inline-block' }} />
            wiispr
          </span>
        </div>

        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '40px 32px', textAlign: 'center' }}>
          {!revealed ? (
            <>
              <div style={{ fontSize: '3rem', marginBottom: 20 }}>👻</div>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 12, letterSpacing: '-.02em' }}>
                Welcome to wiispr
              </h1>
              <p style={{ fontSize: '.9375rem', color: 'var(--t3)', lineHeight: 1.7, marginBottom: 28 }}>
                Your identity is protected. You&apos;ve been assigned a Ghost ID — a random anonymous identity that appears on your posts.
              </p>
              <button
                onClick={() => setRevealed(true)}
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--r)', background: 'var(--blue)', color: '#fff', border: 'none', fontSize: '.9375rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                Reveal my Ghost ID
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: '3rem', marginBottom: 24 }}>👻</div>
              <p style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>Your Ghost ID</p>

              <div style={{
                background: 'var(--blue-d)', border: '1px solid var(--blue)',
                borderRadius: 'var(--r)', padding: '18px 24px', marginBottom: 24,
                animation: 'glowPulse 2s ease-in-out 3',
              }}>
                <span style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 800, color: 'var(--blue)', letterSpacing: '.04em' }}>
                  {ghostId.slice(0, charIndex)}
                  {charIndex < ghostId.length && (
                    <span style={{ animation: 'blink 0.7s step-end infinite', opacity: 1 }}>|</span>
                  )}
                </span>
              </div>

              {charIndex >= ghostId.length && (
                <div style={{ animation: 'fadeUp .4s ease both' }}>
                  <p style={{ fontSize: '.875rem', color: 'var(--t3)', lineHeight: 1.6, marginBottom: 24 }}>
                    This ID will appear on your posts. Each post gets a fresh Ghost ID, keeping you truly anonymous.
                  </p>
                  <a
                    href="/onboarding"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '12px', borderRadius: 'var(--r)', background: 'var(--blue)', color: '#fff', textDecoration: 'none', fontSize: '.9375rem', fontWeight: 700, fontFamily: 'inherit' }}
                  >
                    Continue <ArrowRight size={16} />
                  </a>
                </div>
              )}
            </>
          )}
        </div>

        <p style={{ marginTop: 20, fontSize: '.75rem', color: 'var(--t4)' }}>Made in Saudi Arabia 🇸🇦</p>
      </div>
    </main>
  )
}
