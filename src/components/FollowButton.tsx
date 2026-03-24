'use client'
import { useState, useEffect } from 'react'
import { UserPlus, UserCheck } from 'lucide-react'

export default function FollowButton({ ghostId }: { ghostId: string }) {
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

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
    await fetch('/api/follows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ghostId, action: following ? 'unfollow' : 'follow' })
    })
    setFollowing(!following)
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        fontSize: '.75rem', fontWeight: 600, padding: '4px 10px',
        borderRadius: 'var(--rs)',
        border: '1px solid var(--bd)',
        background: following ? 'var(--blue)' : 'none',
        color: following ? '#fff' : 'var(--t3)',
        cursor: 'pointer', transition: 'all .15s',
        display: 'flex', alignItems: 'center', gap: 4
      }}
    >
      {loading ? '...' : following ? (
        <><UserCheck size={11} /> Following</>
      ) : (
        <><UserPlus size={11} /> Follow</>
      )}
    </button>
  )
}