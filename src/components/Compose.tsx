'use client'
import { useState, useEffect } from 'react'
import { Ghost } from 'lucide-react'

interface Category {
  id: number
  name: string
  slug: string
  women_only: boolean
}

export default function Compose({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const [user, setUser] = useState<{ id: string, nickname: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(d => { if (d.user) setUser(d.user) })
  }, [])

  async function submit() {
    if (!title.trim() || !categoryId) return
    setLoading(true)
    const res = await fetch('/api/posts/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, categoryId })
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      setTitle('')
      setBody('')
      setCategoryId('')
      setOpen(false)
      window.location.reload()
    }
  }

  const btnStyle = (active: boolean) => ({
    fontSize: '.8rem', fontWeight: 600, padding: '7px 16px',
    borderRadius: 'var(--r)', background: active ? 'var(--blue)' : 'var(--bd)',
    color: '#fff', border: 'none', cursor: active ? 'pointer' : 'not-allowed',
    fontFamily: 'inherit', opacity: active ? 1 : 0.6
  } as React.CSSProperties)

  if (!user) return (
    <div className="compose-box" style={{
      background: 'var(--sur)', border: '1px solid var(--bd)',
      borderRadius: 'var(--rm)', padding: '14px 18px', marginBottom: 16,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>Sign in to whisper something</p>
      <a href="/auth" style={{
        fontSize: '.8rem', fontWeight: 600, padding: '7px 16px',
        borderRadius: 'var(--r)', background: 'var(--blue)', color: '#fff',
        textDecoration: 'none'
      }}>Join free</a>
    </div>
  )

  return (
    <div
      className="compose-box"
      onFocus={() => setFocused(true)}
      onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false) }}
      style={{
        padding: focused ? 1.5 : 1,
        borderRadius: 'var(--rm)',
        background: focused
          ? 'linear-gradient(135deg, #2563EB 0%, #7C3AED 50%, #EC4899 100%)'
          : 'var(--bd)',
        transition: 'background .3s',
        marginBottom: 16,
      }}
    >
    <div style={{
      background: 'var(--sur)',
      borderRadius: 'calc(var(--rm) - 1px)', padding: '16px 18px',
    }}>
      {!open ? (
        <button onClick={() => setOpen(true)} style={{
          width: '100%', textAlign: 'left', fontSize: '.875rem',
          color: 'var(--t4)', background: 'var(--bg)',
          border: '1px solid var(--bd)', borderRadius: 'var(--r)',
          padding: '10px 14px', cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <Ghost size={14} style={{ color: 'var(--t4)' }} />
          Whisper something honest…
        </button>
      ) : (
        <>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            style={{
              width: '100%', fontSize: '.8125rem', color: 'var(--t1)',
              background: 'var(--bg)', border: '1px solid var(--bd)',
              borderRadius: 'var(--r)', padding: '8px 10px', outline: 'none',
              marginBottom: 10, cursor: 'pointer', fontFamily: 'inherit'
            }}
          >
            <option value="">Select category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Title"
            className="auto-dir"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={200}
            style={{
              width: '100%', fontSize: '.9375rem', fontWeight: 600,
              color: 'var(--t1)', background: 'none', border: 'none',
              outline: 'none', padding: '4px 0', marginBottom: 8,
              fontFamily: 'inherit'
            }}
          />
          <textarea
            placeholder="Add more detail… (optional)"
            className="auto-dir"
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={3}
            style={{
              width: '100%', fontSize: '.875rem', color: 'var(--t2)',
              background: 'none', border: 'none', outline: 'none',
              resize: 'none', lineHeight: 1.6, fontFamily: 'inherit',
              marginBottom: 12
            }}
          />
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--bd)'
          }}>
            <button onClick={() => setOpen(false)} style={{
              fontSize: '.8rem', color: 'var(--t4)', background: 'none',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit'
            }}>Cancel</button>
            <button
              onClick={submit}
              disabled={!title.trim() || !categoryId || loading}
              style={btnStyle(!!(title.trim() && categoryId) && !loading)}
            >
              {loading ? 'Posting...' : 'Post anonymously'}
            </button>
          </div>
        </>
      )}
    </div>
    </div>
  )
}