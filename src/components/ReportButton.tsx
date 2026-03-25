'use client'
import { useState, useEffect } from 'react'
import { Flag } from 'lucide-react'
import { toast } from 'sonner'

export default function ReportButton({ postId }: { postId: string }) {
  const [reported, setReported] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(d => { if (d.user) setLoggedIn(true) })
  }, [])

  async function report() {
    if (reported) return
    if (!loggedIn) {
      toast.error('Sign in to report', { description: 'Join free to report inappropriate content' })
      return
    }
    setLoading(true)
    const res = await fetch('/api/posts/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, reason: 'inappropriate' })
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      setReported(true)
      toast.success('Post reported', { description: 'Our team will review it shortly' })
    }
  }

  return (
    <button
      onClick={report}
      disabled={reported || loading}
      style={{
        fontSize: '.75rem', fontWeight: 600, padding: '5px 10px',
        borderRadius: 'var(--rs)', border: '1px solid var(--bd)',
        background: 'none',
        color: reported ? 'var(--rose)' : 'var(--t3)',
        cursor: reported ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', gap: 4,
        transition: 'color .15s'
      }}
    >
      <Flag size={12} fill={reported ? 'currentColor' : 'none'} />
      {reported ? 'Reported' : loading ? '...' : 'Report'}
    </button>
  )
}