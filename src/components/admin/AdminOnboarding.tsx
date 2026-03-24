'use client'
import { useState, useEffect } from 'react'

export default function AdminOnboarding() {
  const [slides, setSlides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [saved, setSaved] = useState<number | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const res = await fetch('/api/onboarding')
    const data = await res.json()
    setSlides(data.slides || [])
    setLoading(false)
  }

  function update(id: number, field: string, value: string) {
    setSlides(slides.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  async function save(slide: any) {
    setSaving(slide.id)
    await fetch('/api/onboarding', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slide)
    })
    setSaving(null)
    setSaved(slide.id)
    setTimeout(() => setSaved(null), 2000)
  }

  if (loading) return <p style={{ color: 'var(--t4)', fontSize: '.875rem' }}>Loading...</p>

  return (
    <div style={{ width: "100%" }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Onboarding Slides</h1>
      <p style={{ fontSize: '.875rem', color: 'var(--t3)', marginBottom: 24 }}>Edit the 5 onboarding slides shown to new users.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {slides.map(slide => (
          <div key={slide.id} style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', overflow: 'hidden' }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--bd)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg)' }}>
              <span style={{ fontSize: '1.25rem' }}>{slide.emoji}</span>
              <p style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--t1)' }}>Slide {slide.id}</p>
              <div style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', background: slide.color, border: '2px solid var(--bd)' }} />
            </div>
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>Emoji</label>
                  <input value={slide.emoji} onChange={e => update(slide.id, 'emoji', e.target.value)} style={{ width: '100%', height: 38, padding: '0 12px', fontSize: '1.25rem', color: 'var(--t1)', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', outline: 'none', fontFamily: 'inherit' }} />
                </div>
                <div>
                  <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>Color</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={slide.color} onChange={e => update(slide.id, 'color', e.target.value)} style={{ width: 38, height: 38, padding: 2, border: '1px solid var(--bd)', borderRadius: 'var(--r)', cursor: 'pointer', background: 'var(--bg)' }} />
                    <input value={slide.color} onChange={e => update(slide.id, 'color', e.target.value)} style={{ flex: 1, height: 38, padding: '0 12px', fontSize: '.8rem', color: 'var(--t1)', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', outline: 'none', fontFamily: 'monospace' }} />
                  </div>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>Title</label>
                <input value={slide.title} onChange={e => update(slide.id, 'title', e.target.value)} style={{ width: '100%', height: 38, padding: '0 12px', fontSize: '.875rem', color: 'var(--t1)', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', outline: 'none', fontFamily: 'inherit' }} />
              </div>
              <div>
                <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>Body</label>
                <textarea value={slide.body} onChange={e => update(slide.id, 'body', e.target.value)} rows={2} style={{ width: '100%', padding: '10px 12px', fontSize: '.875rem', color: 'var(--t1)', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', outline: 'none', fontFamily: 'inherit', resize: 'none', lineHeight: 1.6 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ background: slide.color + '20', border: '1px solid ' + slide.color + '40', borderRadius: 'var(--r)', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{slide.emoji}</span>
                  <div>
                    <p style={{ fontSize: '.8rem', fontWeight: 700, color: slide.color }}>{slide.title}</p>
                    <p style={{ fontSize: '.75rem', color: 'var(--t3)' }}>{slide.body}</p>
                  </div>
                </div>
                <button onClick={() => save(slide)} disabled={saving === slide.id} style={{
                  padding: '8px 18px', borderRadius: 'var(--r)', border: 'none',
                  background: saved === slide.id ? 'var(--grn)' : 'var(--blue)',
                  color: '#fff', fontSize: '.8rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'background .2s'
                }}>
                  {saved === slide.id ? 'Saved!' : saving === slide.id ? 'Saving...' : 'Save slide'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
