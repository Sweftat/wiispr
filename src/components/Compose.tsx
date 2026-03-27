'use client'
import { useState, useEffect } from 'react'
import { Ghost, Image, X } from 'lucide-react'
import { toast } from 'sonner'
import GifPicker from './GifPicker'

interface Category {
  id: number
  name: string
  slug: string
  women_only: boolean
}

export default function Compose({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<{ id: string, nickname: string } | null>(null)
  const [gifUrl, setGifUrl] = useState('')
  const [gifPickerOpen, setGifPickerOpen] = useState(false)

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
      body: JSON.stringify({ title, body, categoryId, gifUrl: gifUrl || undefined })
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      setTitle('')
      setBody('')
      setCategoryId('')
      setGifUrl('')
      setOpen(false)
      window.location.reload()
    } else if (res.status === 403) {
      toast.error('Your account is suspended')
    } else if (res.status === 429) {
      toast.error('Post limit reached — try again in an hour')
    } else if (data.error) {
      toast.error(data.error)
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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--sur)',
        border: `2px solid ${hovered ? '#2563EB' : 'var(--bd)'}`,
        boxShadow: hovered ? '0 0 0 4px rgba(37,99,235,0.15)' : 'none',
        transition: 'border-color .2s, box-shadow .2s',
        borderRadius: 'var(--rm)', padding: '16px 18px', marginBottom: 16,
      }}
    >
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
            placeholder="Add more detail… (optional). Use #hashtags for topics"
            className="auto-dir"
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={3}
            style={{
              width: '100%', fontSize: '.875rem', color: 'var(--t2)',
              background: 'none', border: 'none', outline: 'none',
              resize: 'none', lineHeight: 1.6, fontFamily: 'inherit',
              marginBottom: 8
            }}
          />

          {/* GIF preview */}
          {gifUrl && (
            <div style={{ position: 'relative', marginBottom: 10, display: 'inline-block' }}>
              <img src={gifUrl} alt="GIF" style={{ maxHeight: 140, borderRadius: 'var(--rs)', display: 'block' }} />
              <button onClick={() => setGifUrl('')} style={{
                position: 'absolute', top: 4, right: 4,
                width: 20, height: 20, borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <X size={12} style={{ color: '#fff' }} />
              </button>
            </div>
          )}

          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--bd)',
            position: 'relative',
          }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button onClick={() => setOpen(false)} style={{
                fontSize: '.8rem', color: 'var(--t4)', background: 'none',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit'
              }}>Cancel</button>
              <button onClick={() => setGifPickerOpen(!gifPickerOpen)} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: '.75rem', fontWeight: 600, color: gifPickerOpen ? 'var(--blue)' : 'var(--t3)',
                background: gifPickerOpen ? 'var(--blue-d)' : 'none',
                border: '1px solid var(--bd)', borderRadius: 'var(--rs)',
                padding: '4px 8px', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <Image size={12} /> GIF
              </button>
            </div>
            <button
              onClick={submit}
              disabled={!title.trim() || !categoryId || loading}
              style={btnStyle(!!(title.trim() && categoryId) && !loading)}
            >
              {loading ? 'Posting...' : 'Post anonymously'}
            </button>
            <GifPicker open={gifPickerOpen} onClose={() => setGifPickerOpen(false)} onSelect={setGifUrl} />
          </div>
        </>
      )}
    </div>
  )
}
