'use client'
import { useEffect, useState } from 'react'
import { Ghost } from 'lucide-react'

export default function ActiveGhostsWidget() {
  const [ghosts, setGhosts] = useState<{ ghost_id: string, count: number }[]>([])

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(d => {
      setGhosts(d.activeGhosts || [])
    }).catch(() => {})
  }, [])

  if (ghosts.length === 0) return null

  return (
    <div style={{ marginTop: 20 }}>
      <p style={{ fontSize: '.625rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--t4)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
        <Ghost size={11} />Active This Week
      </p>
      <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
        {ghosts.map((g, i) => (
          <div key={g.ghost_id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '7px 12px',
            borderBottom: i < ghosts.length - 1 ? '1px solid var(--bd)' : 'none',
          }}>
            <span style={{ fontFamily: 'monospace', fontSize: '.72rem', color: 'var(--t2)' }}>{g.ghost_id}</span>
            <span style={{ fontSize: '.65rem', color: 'var(--t4)' }}>{g.count} {g.count === 1 ? 'post' : 'posts'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
