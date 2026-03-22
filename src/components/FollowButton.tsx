'use client'
import { useState, useEffect } from 'react'

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

  if (!loggedIn) return null

  async function toggle() {
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
        fontSize: '.75rem', fontWeight: 600, padding: '5px 10px',
        borderRadius: 'var(--rs)', border: '1px solid var(--bd)',
        background: following ? '#18181B' : 'none',
        color: following ? '#fff' : 'var(--t3)',
        cursor: 'pointer', transition: 'all .12s'
      }}
    >
      {loading ? '...' : following ? 'Following' : '+ Follow'}
    </button>
  )
}