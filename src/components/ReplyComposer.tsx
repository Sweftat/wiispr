'use client'
import { useState, useEffect } from 'react'

export default function ReplyComposer({ postId }: { postId: string }) {
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<{ id: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(d => { if (d.user) setUser(d.user) })
  }, [])

  async function submit() {
    if (!body.trim()) return
    setLoading(true)
    const res = await fetch('/api/posts/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, body })
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      setBody('')
      window.location.reload()
    }
  }

  if (!user) return (
    <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '14px 16px', textAlign: 'center' }}>
      <a href="/auth" style={{ fontSize: '.875rem', color: 'var(--blue)', fontWeight: 600 }}>Sign in to reply</a>
    </div>
  )

  return (
    <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '14px 16px' }}>
      <textarea
        placeholder="Write a reply…"
        value={body}
        onChange={e => setBody(e.target.value)}
        rows={3}
        style={{ width: '100%', fontSize: '.875rem', color: 'var(--t1)', background: 'none', border: 'none', outline: 'none', resize: 'none', lineHeight: 1.6, fontFamily: 'inherit', marginBottom: 10 }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10, borderTop: '1px solid var(--bd)' }}>
        <button
          onClick={submit}
          disabled={!body.trim() || loading}
          style={{ fontSize: '.8rem', fontWeight: 600, padding: '7px 16px', borderRadius: 'var(--r)', background: body.trim() ? '#18181B' : '#D4D4D8', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          {loading ? 'Posting...' : 'Reply anonymously'}
        </button>
      </div>
    </div>
  )
}