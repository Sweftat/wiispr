'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'

export default function AdminOnboarding() {
  const [slides, setSlides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/onboarding')
      const data = await res.json()
      const loaded = data.slides || []
      if (loaded.length === 0) {
        // Seed defaults
        const defaults = [
          { emoji: '👻', title: 'Welcome to wiispr', body: 'The anonymous forum where you can speak your truth. No real names. No judgement.', color: '#4F46E5' },
          { emoji: '🔮', title: 'Your Ghost ID', body: 'Every post gets a unique Ghost ID. Nobody knows it\'s you — not even us.', color: '#7C3AED' },
          { emoji: '⚡', title: 'Build Your Rep', body: 'Post honest content, earn upvotes, and level up from New → Active → Trusted → Top.', color: '#D97706' },
          { emoji: '🌸', title: "Women's Space", body: 'A dedicated safe space for women only. Access is granted based on trust level.', color: '#EC4899' },
          { emoji: '📜', title: 'Community Rules', body: 'Be honest. Be kind. No personal info. No hate. Saudi law applies.', color: '#16A34A' },
        ]
        for (const d of defaults) {
          await fetch('/api/onboarding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
        }
        const res2 = await fetch('/api/onboarding')
        const data2 = await res2.json()
        setSlides(data2.slides || [])
      } else {
        setSlides(loaded)
      }
    } catch { setSlides([]) }
    setLoading(false)
  }

  function update(id: string, field: string, value: string) {
    setSlides(slides.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  async function save(slide: any) {
    setSaving(slide.id)
    await fetch('/api/onboarding', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: slide.id, title: slide.title, body: slide.body, emoji: slide.emoji, color: slide.color })
    })
    setSaving(null)
    setSaved(slide.id)
    setTimeout(() => setSaved(null), 2000)
  }

  async function addSlide() {
    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Slide', body: '', emoji: '👋', color: '#4F46E5' })
    })
    const data = await res.json()
    if (data.slide) setSlides([...slides, data.slide])
    else load()
  }

  async function deleteSlide(id: string) {
    await fetch('/api/onboarding', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    setSlides(slides.filter(s => s.id !== id))
  }

  if (loading) return <p style={{ color: 'var(--t4)', fontSize: '.875rem' }}>Loading slides...</p>

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Onboarding Slides</h1>
          <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>Edit slides shown to new users. Auto-saves on blur.</p>
        </div>
        <button onClick={addSlide} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '7px 14px', borderRadius: 'var(--r)',
          background: 'var(--blue)', color: '#fff', border: 'none',
          fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <Plus size={14} /> Add Slide
        </button>
      </div>

      {slides.length === 0 ? (
        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '40px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '.875rem', color: 'var(--t3)', marginBottom: 12 }}>No slides yet</p>
          <button onClick={addSlide} style={{
            padding: '7px 16px', borderRadius: 'var(--r)',
            background: 'var(--blue)', color: '#fff', border: 'none',
            fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>Add your first slide</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {slides.map((slide, idx) => (
            <div key={slide.id} style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--bd)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg)' }}>
                <span style={{
                  fontSize: '.65rem', fontWeight: 700, color: 'var(--blue)', background: 'var(--blue-d)',
                  padding: '2px 8px', borderRadius: 9999,
                }}>#{idx + 1}</span>
                <span style={{ fontSize: '1.1rem' }}>{slide.emoji}</span>
                <p style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--t1)', flex: 1 }}>{slide.title || 'Untitled'}</p>
                {saved === slide.id && <span style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--grn)' }}>✓ Saved</span>}
                {saving === slide.id && <span style={{ fontSize: '.7rem', color: 'var(--t4)' }}>Saving...</span>}
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: slide.color, border: '2px solid var(--bd)' }} />
                <button onClick={() => deleteSlide(slide.id)} style={{
                  display: 'flex', alignItems: 'center', padding: 4, borderRadius: 'var(--rs)',
                  background: 'none', border: 'none', color: 'var(--rose)', cursor: 'pointer',
                }}>
                  <Trash2 size={14} />
                </button>
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--t4)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.05em' }}>Emoji</label>
                    <input value={slide.emoji} onChange={e => update(slide.id, 'emoji', e.target.value)} onBlur={() => save(slide)} style={{ width: '100%', height: 36, padding: '0 10px', fontSize: '1.1rem', color: 'var(--t1)', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--rs)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--t4)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.05em' }}>Color</label>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="color" value={slide.color} onChange={e => update(slide.id, 'color', e.target.value)} onBlur={() => save(slide)} style={{ width: 36, height: 36, padding: 2, border: '1px solid var(--bd)', borderRadius: 'var(--rs)', cursor: 'pointer', background: 'var(--bg)' }} />
                      <input value={slide.color} onChange={e => update(slide.id, 'color', e.target.value)} onBlur={() => save(slide)} style={{ flex: 1, height: 36, padding: '0 10px', fontSize: '.78rem', color: 'var(--t1)', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--rs)', outline: 'none', fontFamily: 'monospace' }} />
                    </div>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--t4)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.05em' }}>Title</label>
                  <input value={slide.title} onChange={e => update(slide.id, 'title', e.target.value)} onBlur={() => save(slide)} style={{ width: '100%', height: 36, padding: '0 10px', fontSize: '.875rem', color: 'var(--t1)', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--rs)', outline: 'none', fontFamily: 'inherit' }} />
                </div>
                <div>
                  <label style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--t4)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.05em' }}>Body</label>
                  <textarea value={slide.body} onChange={e => update(slide.id, 'body', e.target.value)} onBlur={() => save(slide)} rows={2} style={{ width: '100%', padding: '8px 10px', fontSize: '.875rem', color: 'var(--t1)', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--rs)', outline: 'none', fontFamily: 'inherit', resize: 'none', lineHeight: 1.6 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
