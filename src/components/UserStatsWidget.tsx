'use client'
import { useState, useEffect } from 'react'

const TRUST_COLORS: Record<string, { color: string, bg: string }> = {
  active: { color: 'var(--blue)', bg: 'var(--blue-d)' },
  trusted: { color: 'var(--grn)', bg: 'var(--grn-d)' },
  top: { color: '#D97706', bg: '#FFFBEB' },
}

function getProgress(rep: number): { pct: number, next: string } {
  if (rep < 10) return { pct: (rep / 10) * 100, next: 'Active' }
  if (rep < 50) return { pct: ((rep - 10) / 40) * 100, next: 'Trusted' }
  if (rep < 200) return { pct: ((rep - 50) / 150) * 100, next: 'Top' }
  return { pct: 100, next: 'Max' }
}

export default function UserStatsWidget() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(d => {
      if (d.user) setUser(d.user)
    }).catch(() => {})
  }, [])

  if (!user) return null

  const trust = user.trust_level || 'new'
  const rep = user.rep_score || 0
  const streak = user.streak_days || 0
  const { pct, next } = getProgress(rep)
  const tc = TRUST_COLORS[trust]

  return (
    <div style={{
      background: 'var(--sur)', border: '1px solid var(--bd)',
      borderRadius: 'var(--rm)', padding: '14px 16px', marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--t1)' }}>{user.nickname || 'Anonymous'}</span>
        {tc && (
          <span style={{
            fontSize: '.55rem', fontWeight: 700, letterSpacing: '.04em',
            textTransform: 'uppercase', padding: '2px 6px', borderRadius: 3,
            color: tc.color, background: tc.bg,
          }}>{trust}</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
        <span style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--t2)' }}>{rep} pts</span>
        {streak > 0 && <span style={{ fontSize: '.8rem', color: 'var(--t2)' }}>🔥 {streak} day streak</span>}
      </div>
      <div style={{ height: 4, background: 'var(--bd)', borderRadius: 9999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: 'var(--blue)', borderRadius: 9999, transition: 'width .3s ease' }} />
      </div>
      {next !== 'Max' && (
        <p style={{ fontSize: '.6rem', color: 'var(--t4)', marginTop: 4 }}>Progress to {next}</p>
      )}
    </div>
  )
}
