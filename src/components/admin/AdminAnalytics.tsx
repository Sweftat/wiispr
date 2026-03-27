'use client'
import { useState, useEffect } from 'react'
import { FileText, Users, MessageCircle, Zap } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { timeAgo } from '@/lib/time'

interface Stats {
  totalPosts: number; totalUsers: number; totalReplies: number; activeToday: number; postsToday: number
  postsPerDay: { date: string, count: number }[]
  topCategories: { name: string, slug: string, count: number }[]
  trustDistribution: { name: string, value: number }[]
  reportsPerDay: { date: string, count: number }[]
  recentActivity: { id: string, action: string, created_at: string, nickname: string }[]
}

const TRUST_COLORS = ['#A1A1AA', '#4F46E5', '#16A34A', '#D97706']

export default function AdminAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  async function load() {
    setLoading(true); setError(false)
    try {
      const res = await fetch('/api/stats')
      setStats(await res.json())
    } catch { setError(true) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const Skeleton = () => (
    <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: 18 }}>
      <div style={{ width: '50%', height: 14, background: 'var(--bd)', borderRadius: 4, marginBottom: 14 }} />
      <div style={{ width: '100%', height: 160, background: 'var(--bg)', borderRadius: 'var(--rs)' }} />
    </div>
  )

  if (loading) return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)' }}>Analytics</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[1,2,3,4].map(i => <div key={i} style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: 18, height: 90 }} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}><Skeleton /><Skeleton /></div>
    </div>
  )

  if (error || !stats) return (
    <div style={{ width: '100%', textAlign: 'center', padding: '40px 0' }}>
      <p style={{ fontSize: '.875rem', color: 'var(--t3)', marginBottom: 12 }}>Failed to load analytics</p>
      <button onClick={load} style={{ padding: '7px 16px', borderRadius: 'var(--r)', background: 'var(--blue)', color: '#fff', border: 'none', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Retry</button>
    </div>
  )

  const kpis = [
    { label: 'TOTAL POSTS', value: stats.totalPosts, delta: `+${stats.postsToday} today`, icon: FileText, color: '#4F46E5' },
    { label: 'TOTAL USERS', value: stats.totalUsers, delta: '', icon: Users, color: '#16A34A' },
    { label: 'TOTAL REPLIES', value: stats.totalReplies, delta: '', icon: MessageCircle, color: '#7C3AED' },
    { label: 'ACTIVE TODAY', value: stats.activeToday, delta: '', icon: Zap, color: '#D97706' },
  ]

  const totalTrust = stats.trustDistribution.reduce((s, d) => s + d.value, 0) || 1
  const card: React.CSSProperties = { background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: 18 }
  const chartTip = { contentStyle: { background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 8, fontSize: '.75rem' } as React.CSSProperties }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 20 }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)' }}>Analytics</h1>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ ...card, position: 'relative', overflow: 'hidden' }}>
            <k.icon size={18} style={{ position: 'absolute', top: 14, right: 14, color: k.color, opacity: 0.5 }} />
            <p style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-.03em', color: 'var(--t1)' }}>{k.value.toLocaleString()}</p>
            <p style={{ fontSize: '.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--t4)', marginTop: 4 }}>{k.label}</p>
            {k.delta && (
              <span style={{ fontSize: '.65rem', color: '#16A34A', background: '#F0FDF4', padding: '1px 6px', borderRadius: 9999, marginTop: 6, display: 'inline-block' }}>{k.delta}</span>
            )}
          </div>
        ))}
      </div>

      {/* Row 2: Activity + Top Categories */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={card}>
          <p style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 14 }}>Activity</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.postsPerDay}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#A1A1AA' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#A1A1AA' }} tickLine={false} axisLine={false} width={28} />
              <Tooltip {...chartTip} />
              <Area type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={2} fill="url(#blueGrad)" activeDot={{ r: 4, fill: '#4F46E5' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={card}>
          <p style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 14 }}>Top Categories</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart layout="vertical" data={stats.topCategories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" vertical horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#A1A1AA' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#71717A' }} tickLine={false} axisLine={false} width={80} />
              <Tooltip {...chartTip} />
              <Bar dataKey="count" fill="#4F46E5" radius={[0, 4, 4, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Trust Distribution + Reports */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ ...card, position: 'relative' }}>
          <p style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 14 }}>Trust Distribution</p>
          <div style={{ position: 'relative' }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={stats.trustDistribution} innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {stats.trustDistribution.map((_, i) => <Cell key={i} fill={TRUST_COLORS[i]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--t1)' }}>{totalTrust}</p>
              <p style={{ fontSize: '.65rem', color: 'var(--t4)' }}>users</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 8 }}>
            {stats.trustDistribution.map((d, i) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: TRUST_COLORS[i] }} />
                <span style={{ fontSize: '.75rem', color: 'var(--t2)' }}>{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
        <div style={card}>
          <p style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 14 }}>Reports Trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.reportsPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#A1A1AA' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#A1A1AA' }} tickLine={false} axisLine={false} width={28} />
              <Tooltip {...chartTip} />
              <Line type="monotone" dataKey="count" stroke="#E11D48" strokeWidth={2} dot={{ fill: '#E11D48', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4: Recent Activity */}
      <div style={card}>
        <p style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 12 }}>Recent Activity</p>
        <div style={{ maxHeight: 280, overflowY: 'auto' }}>
          {stats.recentActivity.length === 0 ? (
            <p style={{ fontSize: '.8rem', color: 'var(--t4)', textAlign: 'center', padding: 20 }}>No recent activity</p>
          ) : stats.recentActivity.map((a, i) => (
            <div key={a.id || i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '8px 4px',
              background: i % 2 === 0 ? 'var(--bg)' : 'transparent', borderRadius: 'var(--rs)',
            }}>
              <span style={{ fontFamily: 'monospace', fontSize: '.65rem', color: 'var(--t4)', minWidth: 72 }}>{timeAgo(a.created_at)}</span>
              <span style={{ fontSize: '.8rem', color: 'var(--t2)', flex: 1 }}>{a.action}</span>
              <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--t1)' }}>{a.nickname}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
