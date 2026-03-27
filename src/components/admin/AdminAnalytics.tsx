'use client'
import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'

interface Stats {
  totalPosts: number
  totalUsers: number
  totalReplies: number
  activeToday: number
  postsPerDay: { date: string, count: number }[]
  topCategories: { name: string, slug: string, count: number }[]
}

export default function AdminAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  async function load() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      setStats(data)
    } catch {
      setError(true)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  if (loading) {
    return (
      <div style={{ width: '100%' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 24 }}>Analytics</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: 16 }}>
              <div style={{ width: '40%', height: 28, background: 'var(--bd)', borderRadius: 4, marginBottom: 8 }} />
              <div style={{ width: '60%', height: 12, background: 'var(--bd)', borderRadius: 3 }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div style={{ width: '100%', textAlign: 'center', padding: '40px 0' }}>
        <p style={{ fontSize: '.875rem', color: 'var(--t3)', marginBottom: 12 }}>Failed to load analytics</p>
        <button onClick={load} style={{
          padding: '7px 16px', borderRadius: 'var(--r)', background: 'var(--blue)',
          color: '#fff', border: 'none', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}>Retry</button>
      </div>
    )
  }

  const metrics = [
    { label: 'TOTAL POSTS', value: stats.totalPosts },
    { label: 'TOTAL USERS', value: stats.totalUsers },
    { label: 'TOTAL REPLIES', value: stats.totalReplies },
    { label: 'ACTIVE TODAY', value: stats.activeToday },
  ]

  const maxCatCount = Math.max(...stats.topCategories.map(c => c.count), 1)

  return (
    <div style={{ width: '100%' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 24 }}>Analytics</h1>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {metrics.map(m => (
          <div key={m.label} style={{
            background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: 16,
          }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>{m.value.toLocaleString()}</p>
            <p style={{ fontSize: '.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)' }}>{m.label}</p>
          </div>
        ))}
      </div>

      {/* Posts chart */}
      <div style={{
        background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: 16, marginBottom: 20,
      }}>
        <p style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 12 }}>Posts last 7 days</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats.postsPerDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--bd)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--t4)' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 8, fontSize: '.78rem' }}
              labelStyle={{ color: 'var(--t1)', fontWeight: 700 }}
              itemStyle={{ color: 'var(--t2)' }}
            />
            <Bar dataKey="count" fill="var(--blue)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top categories */}
      <div style={{
        background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: 16,
      }}>
        <p style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 12 }}>Top categories</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {stats.topCategories.map(cat => (
            <div key={cat.slug || cat.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--t1)' }}>{cat.name}</span>
                <span style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t3)', fontFamily: 'monospace' }}>{cat.count}</span>
              </div>
              <div style={{ width: '100%', height: 4, background: 'var(--bd)', borderRadius: 9999 }}>
                <div style={{ width: `${(cat.count / maxCatCount) * 100}%`, height: '100%', background: 'var(--blue)', borderRadius: 9999, transition: 'width .3s' }} />
              </div>
            </div>
          ))}
          {stats.topCategories.length === 0 && (
            <p style={{ fontSize: '.8rem', color: 'var(--t4)' }}>No category data yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
