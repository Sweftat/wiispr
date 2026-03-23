'use client'
import { useState } from 'react'
import { LayoutDashboard, Flag, Users, Activity, Layers, FileText, Sliders, BarChart2, Settings, LogOut, ChevronRight } from 'lucide-react'
import AdminOverview from './AdminOverview'
import AdminFlagged from './AdminFlagged'
import AdminUsers from './AdminUsers'
import AdminLogs from './AdminLogs'
import AdminCategories from './AdminCategories'
import AdminAnalytics from './AdminAnalytics'
import AdminSettings from './AdminSettings'

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'flagged', label: 'Flagged Posts', icon: Flag },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'logs', label: 'Activity Logs', icon: Activity },
  { id: 'categories', label: 'Categories', icon: Layers },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'settings', label: 'Site Settings', icon: Settings },
]

export default function AdminShell({ admin, flaggedPosts, allUsers, activityLogs, categories, recentPosts, stats }: {
  admin: any
  flaggedPosts: any[]
  allUsers: any[]
  activityLogs: any[]
  categories: any[]
  recentPosts: any[]
  stats: { totalPosts: number, totalUsers: number, totalReports: number }
}) {
  const [active, setActive] = useState('overview')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Sidebar */}
      <div style={{
        width: 240, background: 'var(--sur)', borderRight: '1px solid var(--bd)',
        display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 50
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--bd)' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
            <span style={{ width: 7, height: 7, background: 'var(--blue)', borderRadius: '50%', display: 'inline-block' }}></span>
            <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700, fontSize: '1rem', color: 'var(--t1)' }}>wiispr</span>
          </a>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--blue-d)', border: '1.5px solid var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 700, color: 'var(--blue)' }}>
              {admin.nickname?.[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t1)' }}>{admin.nickname}</p>
              <p style={{ fontSize: '.65rem', color: 'var(--blue)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 'var(--r)', border: 'none',
                  background: isActive ? 'var(--blue-d)' : 'none',
                  color: isActive ? 'var(--blue)' : 'var(--t3)',
                  cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: '.8375rem', fontWeight: isActive ? 600 : 500,
                  marginBottom: 2, transition: 'all .15s', textAlign: 'left'
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'none' }}
              >
                <Icon size={15} />
                {item.label}
                {item.id === 'flagged' && flaggedPosts.length > 0 && (
                  <span style={{ marginLeft: 'auto', background: 'var(--rose)', color: '#fff', borderRadius: 99, fontSize: '.6rem', fontWeight: 700, padding: '1px 6px' }}>
                    {flaggedPosts.length}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--bd)' }}>
          <a href="/" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 'var(--r)',
            color: 'var(--t3)', fontSize: '.8375rem', fontWeight: 500,
            textDecoration: 'none'
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <LogOut size={15} />
            Back to site
          </a>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: 240, flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ height: 52, background: 'var(--sur)', borderBottom: '1px solid var(--bd)', display: 'flex', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 0, zIndex: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '.75rem', color: 'var(--t4)' }}>Admin</span>
            <ChevronRight size={12} style={{ color: 'var(--t4)' }} />
            <span style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t1)', textTransform: 'capitalize' }}>{active}</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {active === 'overview' && <AdminOverview stats={stats} recentPosts={recentPosts} flaggedCount={flaggedPosts.length} />}
          {active === 'flagged' && <AdminFlagged initialPosts={flaggedPosts} />}
          {active === 'users' && <AdminUsers initialUsers={allUsers} />}
          {active === 'logs' && <AdminLogs logs={activityLogs} />}
          {active === 'categories' && <AdminCategories initialCategories={categories} />}
          {active === 'analytics' && <AdminAnalytics stats={stats} />}
          {active === 'settings' && <AdminSettings />}
        </div>
      </div>
    </div>
  )
}