'use client'
import { useState, useEffect } from 'react'
import CategoryIcon from './CategoryIcon'
import { ShieldX } from 'lucide-react'

export default function SidebarCategories({ categories }: { categories: any[] }) {
  const [gender, setGender] = useState<string | null>(null)
  const [showGate, setShowGate] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(d => { if (d.user) setGender(d.user.gender) })
  }, [])

  function handleClick(cat: any) {
    if (cat.women_only && gender !== 'female') {
      setShowGate(true)
      return
    }
  }

  return (
    <>
      <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', overflow: 'hidden' }}>
        {categories.map((cat: any, i: number) => (
          <div
            key={cat.id}
            onClick={() => handleClick(cat)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: i < categories.length - 1 ? '1px solid var(--bd)' : 'none', cursor: 'pointer', transition: 'background .15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <CategoryIcon slug={cat.icon} />
            <span style={{ fontSize: '.8375rem', color: 'var(--t2)', fontWeight: 500 }}>{cat.name}</span>
            {cat.women_only && <span style={{ marginLeft: 'auto', fontSize: '.55rem', fontWeight: 700, color: 'var(--rose)', background: 'var(--rose-d)', padding: '1px 5px', borderRadius: 3 }}>Women</span>}
          </div>
        ))}
      </div>

      {showGate && (
        <>
          <div onClick={() => setShowGate(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, backdropFilter: 'blur(2px)' }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 201, width: '90%', maxWidth: 360, background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--rose-d)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <ShieldX size={24} style={{ color: 'var(--rose)' }} />
            </div>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>Women's Space</h2>
            <p style={{ fontSize: '.875rem', color: 'var(--t3)', lineHeight: 1.7, marginBottom: 12 }}>This space is reserved for female members only. A safe space for women to speak freely.</p>
            <p style={{ fontSize: '.8rem', color: 'var(--t4)', marginBottom: 20 }}>If you registered as female and are seeing this, contact support.</p>
            <button onClick={() => setShowGate(false)} style={{ width: '100%', padding: '10px', borderRadius: 'var(--r)', background: 'var(--blue)', color: '#fff', border: 'none', fontWeight: 600, fontSize: '.875rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              Got it
            </button>
          </div>
        </>
      )}
    </>
  )
}
