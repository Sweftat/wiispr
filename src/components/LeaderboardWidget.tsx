'use client'
import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'

export default function LeaderboardWidget() {
  const [leaderboard, setLeaderboard] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(d => setLeaderboard(d.leaderboard || []))
      .catch(() => {})
  }, [])

  if (leaderboard.length === 0) return null

  const trustColors: Record<string, string> = {
    new: 'var(--t4)', active: 'var(--blue)', trusted: 'var(--grn)', top: '#D97706'
  }

  return (
    <div style={{ marginTop: 20 }}>
      <p style={{ fontSize: '.625rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--t4)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
        <Trophy size={11} />Leaderboard
      </p>
      <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
        {leaderboard.map((entry, i) => (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px',
              borderBottom: i < leaderboard.length - 1 ? '1px solid var(--bd)' : 'none',
            }}
          >
            <span style={{
              fontSize: '.72rem', fontWeight: 800, fontFamily: 'monospace',
              color: i < 3 ? (i === 0 ? '#D97706' : i === 1 ? 'var(--t3)' : '#CD7F32') : 'var(--t4)',
              width: 20, textAlign: 'center', flexShrink: 0,
            }}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
            </span>
            <span style={{ flex: 1, fontFamily: 'monospace', fontSize: '.72rem', color: 'var(--t2)' }}>
              {entry.ghost_id}
            </span>
            {entry.trust_level !== 'new' && (
              <span style={{
                fontSize: '.55rem', fontWeight: 700, textTransform: 'uppercase',
                padding: '1px 4px', borderRadius: 2,
                color: trustColors[entry.trust_level] || 'var(--t4)',
                background: entry.trust_level === 'top' ? '#FFFBEB' : entry.trust_level === 'trusted' ? 'var(--grn-d)' : 'var(--blue-d)',
              }}>
                {entry.trust_level}
              </span>
            )}
            <span style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--t3)', fontFamily: 'monospace' }}>
              {entry.rep_score}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
