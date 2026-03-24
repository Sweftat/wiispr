'use client'
import { useState, useEffect } from 'react'
import CategoryIcon from './CategoryIcon'
import { Users, ShieldX } from 'lucide-react'

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

  const chipStyle = (isActive: boolean): React.CSSProperties => ({
    fontSize: '.8rem',
    fontWeight: isActive ? 700 : 500,
    padding: '4px 10px',
    borderRadius: 'var(--rs)',
    border: isActive ? '1px solid var(--blue)' : '1px solid var(--bd)',
    background: isActive ? 'var(--blue)' : 'transparent',
    color: isActive ? '#fff' : 'var(--t3)',
    cursor: 'pointer',
    transition: 'background .2s, color .2s, border-color .2s',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    flexShrink: 0,
    whiteSpace: 'nowrap',
    outline: 'none',
    WebkitAppearance: 'none',
  })

  return (
    <>
      <style>{`
        @keyframes fireFlicker {
          0%, 100% { transform: scale(1) rotate(-3deg); }
          25% { transform: scale(1.15) rotate(3deg); }
          50% { transform: scale(0.95) rotate(-2deg); }
          75% { transform: scale(1.1) rotate(2deg); }
        }
        .fire-icon {
          display: inline-block;
          animation: fireFlicker 1.2s ease-in-out infinite;
          font-size: 14px;
          line-height: 1;
        }
        .category-scroll::-webkit-scrollbar { display: none; }
        .chip-btn { -webkit-tap-highlight-color: transparent; }
        .chip-btn:focus { outline: none; }
      `}</style>

      <div className="category-scroll" style={{
        display: 'flex', gap: 6, marginBottom: 14,
        flexWrap: 'nowrap', overflowX: 'auto',
        WebkitOverflowScrolling: 'touch' as any,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      } as React.CSSProperties}>

        <button className="chip-btn" onClick={() => select('following')} style={chipStyle(selected === 'following')}>
          <Users size={12} />Following
        </button>

        <button className="chip-btn" onClick={() => select(null)} style={chipStyle(selected === null)}>
          All
        </button>

        <button className="chip-btn" onClick={() => select('trending')} style={chipStyle(selected === 'trending')}>
          <span className="fire-icon" style={{ color: selected === 'trending' ? '#fff' : '#F97316' }}>🔥</span>
          Trending
        </button>

        {categories.map(cat => (
          <button className="chip-btn" key={cat.id} onClick={() => select(cat.id)} style={chipStyle(selected === cat.id)}>
            <CategoryIcon slug={cat.icon} />{cat.name}
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