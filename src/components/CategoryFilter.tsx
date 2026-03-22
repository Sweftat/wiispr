'use client'
import { useState, useEffect } from 'react'
import CategoryIcon from './CategoryIcon'
import { Users, TrendingUp, ShieldX } from 'lucide-react'

interface Category {
  id: number
  name: string
  icon: string
  women_only: boolean
}

export default function CategoryFilter({ categories, onSelect }: { categories: Category[], onSelect: (id: number | null | string) => void }) {
  const [selected, setSelected] = useState<number | null | string>(null)
  const [gender, setGender] = useState<string | null>(null)
  const [showGate, setShowGate] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(d => { if (d.user) setGender(d.user.gender) })
  }, [])

  function select(id: number | null | string) {
    const cat = categories.find(c => c.id === id)
    if (cat?.women_only && gender !== 'female') {
      setShowGate(true)
      return
    }
    setSelected(id)
    onSelect(id)
  }

  const chipStyle = (isActive: boolean) => ({
    fontSize: '.8rem', fontWeight: 600, padding: '6px 12px',
    borderRadius: 'var(--rs)',
    border: isActive ? '1px solid var(--blue)' : '1px solid var(--bd)',
    background: isActive ? 'var(--blue)' : 'var(--sur)',
    color: isActive ? '#fff' : 'var(--t3)',
    cursor: 'pointer', transition: 'all .15s',
    display: 'flex', alignItems: 'center', gap: 5
  } as React.CSSProperties)

  return (
    <>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={() => select('following')} style={chipStyle(selected === 'following')}>
          <Users size={12} />
          Following
        </button>
        <button onClick={() => select(null)} style={chipStyle(selected === null)}>
          All
        </button>
        <button onClick={() => select('trending')} style={chipStyle(selected === 'trending')}>
          <TrendingUp size={12} />
          Trending
        </button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => select(cat.id)} style={chipStyle(selected === cat.id)}>
            <CategoryIcon slug={cat.icon} />
            {cat.name}
          </button>
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
            <p style={{ fontSize: '.875rem', color: 'var(--t3)', lineHeight: 1.7, marginBottom: 12 }}>This space is reserved for female members only. It's a safe space for women to speak freely without interference.</p>
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