'use client'
import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function UpvoteButton({ postId, upvotes }: { postId: string, upvotes: number }) {
  const [count, setCount] = useState(upvotes)
  const [voted, setVoted] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [particles, setParticles] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(d => {
      if (d.user) setLoggedIn(true)
    })
  }, [])

  async function upvote() {
    if (voted) return
    if (!loggedIn) { window.location.href = '/auth?signin=1'; return }
    setVoted(true)
    setCount(c => c + 1)
    setParticles(true)
    setTimeout(() => setParticles(false), 600)
    await fetch('/api/posts/upvote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId })
    })
  }

  return (
    <motion.button
      onClick={upvote}
      whileTap={!voted ? { scale: 0.88 } : {}}
      animate={voted ? {
        scale: [1, 1.25, 0.95, 1.08, 1],
        transition: { duration: 0.4, ease: 'easeOut' }
      } : {}}
      style={{
        fontSize: '.75rem', fontWeight: 600, padding: '5px 10px',
        borderRadius: 'var(--rs)', border: voted ? '1px solid var(--blue)' : '1px solid var(--bd)',
        background: voted ? 'var(--blue)' : 'none',
        color: voted ? '#fff' : 'var(--t3)',
        cursor: voted ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', gap: 4,
        position: 'relative', overflow: 'visible'
      }}
    >
      {/* Ripple effect */}
      {particles && (
        <motion.span
          initial={{ scale: 0.5, opacity: 0.6 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'absolute', inset: 0,
            background: 'var(--blue)',
            borderRadius: 'inherit',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      )}

      <motion.span
        animate={voted ? { y: [0, -3, 0], rotate: [0, -10, 10, 0] } : {}}
        transition={{ duration: 0.35 }}
        style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center' }}
      >
        <ArrowUp size={12} strokeWidth={voted ? 2.5 : 1.75} />
      </motion.span>

      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.18 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          {count}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}