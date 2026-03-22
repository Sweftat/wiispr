'use client'
import { useState, useEffect } from 'react'

export default function ReportButton({ postId }: { postId: string }) {
  const [reported, setReported] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(d => { if (d.user) setLoggedIn(true) })
  }, [])

  if (!loggedIn) return null

  async function report() {
    if (reported) return
    setLoading(true)
    const res = await fetch('/api/posts/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, reason: 'inappropriate' })
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) setReported(true)
  }

  return (
    <button
      onClick={report}
      disabled={reported || loading}
      style={{
        fontSize: '.75rem', fontWeight: 600, padding: '5px 10px',
        borderRadius: 'var(--rs)', border: '1px solid var(--bd)',
        background: 'none', color: reported ? 'var(--t4)' : 'var(--t3)',
        cursor: reported ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', gap: 4
      }}
    >
      <svg width="12" height="12" fill="none" viewBox="0 0 16 16">
        <path d="M3 2h8l-2 4 2 4H3V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M3 2v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      {reported ? 'Reported' : loading ? '...' : 'Report'}
    </button>
  )
}