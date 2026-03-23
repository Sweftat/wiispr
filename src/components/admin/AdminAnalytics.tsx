'use client'
import { FileText, Users, Flag } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

export default function AdminAnalytics({ stats, postsPerDay, usersPerDay, categoryStats }: {
  stats: { totalPosts: number, totalUsers: number, totalReports: number }
  postsPerDay: any[]
  usersPerDay: any[]
  categoryStats: any[]
}) {
  // Process category stats
  const catCounts: Record<string, number> = {}
  categoryStats.forEach((p: any) => {
    const name = p.categories?.name || 'Unknown'
    catCounts[name] = (catCounts[name] || 0) + 1
  })
  const catData = Object.entries(catCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Format dates for charts
  const postsChart = postsPerDay.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    posts: Number(d.count)
  }))

  const usersChart = usersPerDay.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    users: Number(d.count)
  }))

  const PIE_COLORS = ['#2563EB', '#16A34A', '#E11D48', '#D97706', '#7C3AED', '#0891B2', '#DC2626', '#65A30D']

  const statCards = [
    { label: 'Total Posts', value: stats.totalPosts, icon: FileText, color: 'var(--blue)', bg: 'var(--blue-d)' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'var(--grn)', bg: 'var(--grn-d)' },
    { label: 'Total Reports', value: stats.totalReports, icon: Flag, color: 'var(--rose)', bg: 'var(--rose-d)' },
  ]

  return (
    <div>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Analytics</h1>
      <p style={{ fontSize: '.875rem', color: 'var(--t3)', marginBottom: 24 }}>Platform performance over the last 30 days.</p>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {statCards.map(c => {
          const Icon = c.icon
          return (
            <div key={c.label} style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{c.label}</p>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={14} style={{ color: c.color }} />
                </div>
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--t1)', lineHeight: 1 }}>{c.value}</p>
            </div>
          )
        })}
      </div>

      {/* Posts per day chart */}
      <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '20px', marginBottom: 16 }}>
        <h2 style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 18 }}>Posts per day (last 30 days)</h2>
        {postsChart.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={postsChart}>
              <defs>
                <linearGradient id="postsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bd)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--t4)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: 'var(--t4)' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="posts" stroke="#2563EB" strokeWidth={2} fill="url(#postsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--t4)', fontSize: '.875rem', padding: '40px 0' }}>No post data yet.</p>
        )}
      </div>

      {/* Users per day chart */}
      <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '20px', marginBottom: 16 }}>
        <h2 style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 18 }}>New users per day (last 30 days)</h2>
        {usersChart.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={usersChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bd)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--t4)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: 'var(--t4)' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="users" fill="#16A34A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--t4)', fontSize: '.875rem', padding: '40px 0' }}>No user data yet.</p>
        )}
      </div>

      {/* Category breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '20px' }}>
          <h2 style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 18 }}>Posts by category</h2>
          {catData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {catData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 8, fontSize: 12 }} />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--t4)', fontSize: '.875rem', padding: '40px 0' }}>No data yet.</p>
          )}
        </div>

        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '20px' }}>
          <h2 style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 16 }}>Derived metrics</h2>
          {[
            { label: 'Posts per user', value: stats.totalUsers > 0 ? (stats.totalPosts / stats.totalUsers).toFixed(1) : '0' },
            { label: 'Report rate', value: stats.totalPosts > 0 ? ((stats.totalReports / stats.totalPosts) * 100).toFixed(1) + '