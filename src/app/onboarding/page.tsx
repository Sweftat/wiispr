'use client'
import { useState, useEffect } from 'react'
import { ArrowRight, ArrowLeft } from 'lucide-react'

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0)
  const [slides, setSlides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/onboarding')
      .then(r => r.json())
      .then(d => { setSlides(d.slides || []); setLoading(false) })
  }, [])

  if (loading) return (
    <main style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--t4)', fontSize: '.875rem' }}>Loading...</p>
    </main>
  )

  const slide = slides[current]
  const isLast = current === slides.length - 1

  function next(e: React.MouseEvent) {
    if (!isLast) { e.preventDefault(); setCurrent(c => c + 1) }
  }

  const btnStyle: React.CSSProperties = {
    flex: 1, padding: '11px', borderRadius: 'var(--r)',
    background: slide.color, color: '#fff',
    fontWeight: 600, fontSize: '.875rem',
    cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '6px', transition: 'background .3s'
  }

  return (
    <main style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700, fontSize: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '7px', color: 'var(--t1)' }}>
          <span style={{ width: 7, height: 7, background: 'var(--blue)', borderRadius: '50%', display: 'inline-block' }}></span>
          wiispr
        </span>
      </div>

      <div style={{ width: '100%', maxWidth: 400, background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '40px 32px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: slide.color + '18', border: '1px solid ' + slide.color + '40', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '2.5rem', transition: 'all .3s' }}>
          {slide.emoji}
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 12, letterSpacing: '-.02em' }}>{slide.title}</h2>
        <p style={{ fontSize: '.9375rem', color: 'var(--t3)', lineHeight: 1.7, marginBottom: 32 }}>{slide.body}</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: 28 }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{
              width: i === current ? 20 : 7, height: 7,
              borderRadius: 4, border: 'none', cursor: 'pointer',
              background: i === current ? slide.color : 'var(--bd)',
              transition: 'all .2s', padding: 0
            }} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {current > 0 && (
            <button onClick={() => setCurrent(c => c - 1)} style={{
              flex: 1, padding: '11px', borderRadius: 'var(--r)',
              border: '1px solid var(--bd)', background: 'none',
              color: 'var(--t2)', fontWeight: 600, fontSize: '.875rem',
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}>
              <ArrowLeft size={15} />
              Back
            </button>
          )}
          <a href={isLast ? '/auth' : '#'} onClick={next} style={btnStyle}>
            {isLast ? 'Get started' : 'Continue'}
            <ArrowRight size={15} />
          </a>
        </div>

        {!isLast && (
          <a href="/auth" style={{ display: 'block', marginTop: 14, fontSize: '.8rem', color: 'var(--t4)', textDecoration: 'none' }}>
            Skip intro
          </a>
        )}
      </div>

      <p style={{ marginTop: 24, fontSize: '.75rem', color: 'var(--t4)' }}>Made in Saudi Arabia</p>
    </main>
  )
}
