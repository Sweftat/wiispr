'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import confetti from 'canvas-confetti'

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
      window.location.href = '/'
    }
  }, [])

  useEffect(() => {
    if (!revealed || !ghostId) return
    if (charIndex < ghostId.length) {
      const t = setTimeout(() => setCharIndex(i => i + 1), 55)
      return () => clearTimeout(t)
    } else {
      // Fire confetti when reveal completes
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'],
      })
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#2563EB', '#3B82F6'],
        })
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#2563EB', '#3B82F6'],
        })
      }, 300)
    }
  }, [revealed, charIndex, ghostId])

  if (!ghostId) return null

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', maxWidth: 420, width: '100%' }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          style={{ marginBottom: 32 }}
        >
          <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700, fontSize: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--t1)' }}>
            <span style={{ width: 7, height: 7, background: 'var(--blue)', borderRadius: '50%', display: 'inline-block' }} />
            wiispr
          </span>
        </motion.div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '40px 32px', textAlign: 'center' }}
        >
          <AnimatePresence mode="wait">
            {!revealed ? (
              <motion.div
                key="pre-reveal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ fontSize: '3rem', marginBottom: 20 }}
                >
                  👻
                </motion.div>
                <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 12, letterSpacing: '-.02em' }}>
                  Welcome to wiispr
                </h1>
                <p style={{ fontSize: '.9375rem', color: 'var(--t3)', lineHeight: 1.7, marginBottom: 28 }}>
                  Your identity is protected. You&apos;ve been assigned a Ghost ID — a random anonymous identity that appears on your posts.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setRevealed(true)}
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--r)', background: 'var(--blue)', color: '#fff', border: 'none', fontSize: '.9375rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  Reveal my Ghost ID
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="post-reveal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  style={{ fontSize: '3rem', marginBottom: 24 }}
                >
                  👻
                </motion.div>
                <p style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>Your Ghost ID</p>

                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
                  style={{
                    background: 'var(--blue-d)', border: '1px solid var(--blue)',
                    borderRadius: 'var(--r)', padding: '18px 24px', marginBottom: 24,
                    boxShadow: '0 0 32px 8px rgba(59,130,246,0.15)',
                  }}
                >
                  <span style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 800, color: 'var(--blue)', letterSpacing: '.04em' }}>
                    {ghostId.slice(0, charIndex)}
                    {charIndex < ghostId.length && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.7, repeat: Infinity }}
                      >|</motion.span>
                    )}
                  </span>
                </motion.div>

                {charIndex >= ghostId.length && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <p style={{ fontSize: '.875rem', color: 'var(--t3)', lineHeight: 1.6, marginBottom: 24 }}>
                      This ID will appear on your posts. Each post gets a fresh Ghost ID, keeping you truly anonymous.
                    </p>
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href="/onboarding"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '12px', borderRadius: 'var(--r)', background: 'var(--blue)', color: '#fff', textDecoration: 'none', fontSize: '.9375rem', fontWeight: 700, fontFamily: 'inherit' }}
                    >
                      Continue <ArrowRight size={16} />
                    </motion.a>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ marginTop: 20, fontSize: '.75rem', color: 'var(--t4)' }}
        >
          Made in Saudi Arabia 🇸🇦
        </motion.p>
      </motion.div>
    </main>
  )
}
