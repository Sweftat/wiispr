'use client'
import { useEffect, useState } from 'react'
import { BarChart3, Users, FileText } from 'lucide-react'

export default function StatsWidget() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {})
  }, [])

  if (!stats) return null

  const items = [
    { icon: <FileText size={12} />, label: 'Posts today', value: stats.postsToday },
    { icon: <Users size={12} />, label: 'Total users', value: stats.totalUsers },
    { icon: <BarChart3 size={12} />, label: 'Total posts', value: stats.totalPosts },
  ]

  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: '.625rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--t4)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
        <BarChart3 size={11} />Stats
      </p>
      <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', padding: '12px' }}>
        {items.map((item, i) => (
          <div key={item.label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '6px 0',
            borderBottom: i < items.length - 1 ? '1px solid var(--bd)' : 'none',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.72rem', color: 'var(--t3)' }}>
              {item.icon}{item.label}
            </span>
            <span style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--t1)', fontFamily: 'monospace' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
