'use client'
import { useState, useEffect } from 'react'
import CategoryIcon from './CategoryIcon'
import { ShieldX, Bell } from 'lucide-react'
import { toast } from 'sonner'

const CATEGORY_COLORS: Record<string, string> = {
  technology: '#2563EB', sports: '#F97316', lifestyle: '#16A34A',
  business: '#7C3AED', gaming: '#E11D48', family: '#D97706',
  "women's space": '#EC4899', open: '#64748B', entertainment: '#0891B2',
  health: '#EF4444', food: '#EA580C', religion: '#4F46E5',
  relationships: '#BE185D', career: '#0369A1', travel: '#059669',
  finance: '#CA8A04',
}

export default function SidebarCategories({ categories }: { categories: any[] }) {
  const [gender, setGender] = useState<string | null>(null)
  const [showGate, setShowGate] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [followedCats, setFollowedCats] = useState<number[]>([])

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setGender(d.user.gender)
          fetch('/api/follows').then(r => r.json()).then(f => setFollowedCats(f.categoryIds || []))
        }
      })
  }, [])

  function handleClick(cat: any) {
    if (cat.women_only && gender !== 'female') {
      setShowGate(true)
      return
    }
    setSelected(cat.id)
    window.dispatchEvent(new CustomEvent('sidebarCategorySelect', { detail: cat.id }))
  }

  async function toggleFollow(e: React.MouseEvent, cat: any) {
    e.stopPropagation()
    const isFollowed = followedCats.includes(cat.id)
    if (isFollowed) {
      setFollowedCats(prev => prev.filter(id => id !== cat.id))
      toast('Unfollowed ' + cat.name)
      await fetch('/api/follows', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ categoryId: cat.id }) })
    } else {
      setFollowedCats(prev => [...prev, cat.id])
      toast.success('Following ' + cat.name)
      await fetch('/api/follows', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ categoryId: cat.id }) })
    }
  }

  return (
    <>
      <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', overflow: 'hidden' }}>
        {categories.map((cat: any, i: number) => {
          const isFollowed = followedCats.includes(cat.id)
          const accent = CATEGORY_COLORS[cat.name?.toLowerCase()] || 'var(--blue)'
          return (
            <div
              key={cat.id}
              onClick={() => handleClick(cat)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                borderBottom: i < categories.length - 1 ? '1px solid var(--bd)' : 'none',
                cursor: 'pointer', transition: 'background .15s',
                background: selected === cat.id ? 'var(--blue-d)' : 'none',
                borderLeft: selected === cat.id ? '2px solid var(--blue)' : '2px solid transparent'
              }}
              onMouseEnter={e => { if (selected !== cat.id) e.currentTarget.style.background = 'var(--bg)' }}
              onMouseLeave={e => { if (selected !== cat.id) e.currentTarget.style.background = 'none' }}
            >
              <CategoryIcon slug={cat.icon} />
              <span style={{ fontSize: '.8375rem', color: selected === cat.id ? 'var(--blue)' : 'var(--t2)', fontWeight: selected === cat.id ? 600 : 500, flex: 1 }}>{cat.name}</span>
              {cat.women_only && <span style={{ fontSize: '.55rem', fontWeight: 700, color: 'var(--rose)', background: 'var(--rose-d)', padding: '1px 5px', borderRadius: 3 }}>Women</span>}
              <button
                onClick={(e) => toggleFollow(e, cat)}
                title={isFollowed ? 'Unfollow category' : 'Follow category'}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                  color: isFollowed ? accent : 'var(--t4)',
                  display: 'flex', alignItems: 'center', flexShrink: 0,
                  transition: 'color .15s',
                }}
              >
                <Bell size={13} fill={isFollowed ? 'currentColor' : 'none'} />
              </button>
            </div>
          )
        })}
      </div>

      {showGate && (
        <>
          <div onClick={() => setShowGate(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, backdropFilter: 'blur(2px)' }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 201, width: '90%', maxWidth: 360, background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--rose-d)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <ShieldX size={24} style={{ color: 'var(--rose)' }} />
            </div>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>Women&apos;s Space</h2>
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
