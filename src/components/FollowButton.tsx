'use client'
import { useState, useEffect } from 'react'
import { UserPlus, UserCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FollowButton({ ghostId }: { ghostId: string }) {
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [justFollowed, setJustFollowed] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(async d => {
        if (!d.user) return
        setLoggedIn(true)
        const res = await fetch('/api/follows')
        const data = await res.json()
        setFollowing(data.follows?.includes(ghostId))
      })
  }, [ghostId])

  async function toggle() {
    if (!loggedIn) { window.location.href = '/auth?signin=1'; return }
    setLoading(true)
    const wasFollowing = following
    await fetch('/api/follows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ghostId, action: following ? 'unfollow' : 'follow' })
    })
    setFollowing(!wasFollowing)
    setLoading(false)
    if (!wasFollowing) {
      setJustFollowed(true)
      setTimeout(() => setJustFollowed(false), 1200)
    }
  }

  return (
    <motion.button
      onClick={toggle}
      disabled={loading}
      whileTap={{ scale: 0.92 }}
      animate={justFollowed ? {
        scale: [1, 1.18, 1],
        transition: { duration: 0.35, ease: 'easeOut' }
      } : { scale: 1 }}
      style={{
        fontSize: '.75rem', fontWeight: 600, padding: '4px 10px',
        borderRadius: 'var(--rs)',
        border: following ? '1px solid var(--blue)' : '1px solid var(--bd)',
        background: following ? 'var(--blue)' : 'none',
        color: following ? '#fff' : 'var(--t3)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 4,
        position: 'relative', overflow: 'hidden'
      }}
    >
      {justFollowed && (
        <motion.span
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'absolute', inset: 0,
            background: 'var(--blue)',
            borderRadius: 'inherit',
            pointerEvents: 'none'
          }}
        />
      )}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            ...
          </motion.span>
        ) : following ? (
          <motion.span key="following" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <UserCheck size={11} /> Following
          </motion.span>
        ) : (
          <motion.span key="follow" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <UserPlus size={11} /> Follow
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}