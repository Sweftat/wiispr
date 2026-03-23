'use client'
import { useState } from 'react'
import { LayoutDashboard, Flag, Users, Activity, Layers, BarChart2, Settings, LogOut, ChevronRight, Menu, Megaphone } from 'lucide-react'
import AdminOverview from './AdminOverview'
import AdminFlagged from './AdminFlagged'
import AdminUsers from './AdminUsers'
import AdminLogs from './AdminLogs'
import AdminCategories from './AdminCategories'
import AdminAnalytics from './AdminAnalytics'
import AdminSettings from './AdminSettings'
import AdminAnnouncements from './AdminAnnouncements'

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'flagged', label: 'Flagged Posts', icon: Flag },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'logs', label: 'Activity Logs', icon: Activity },
  { id: 'categories', label: 'Categories', icon: Layers },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'settings', label: 'Site Settings', icon: Settings },
]

export default function AdminShell({ admin, flaggedPosts, allUsers, activityLogs, categories, recentPosts, stats, postsPerDay, usersPerDay, categoryStats }: {
  admin: any
  flaggedPosts: any[]
  allUsers: any[]
  activityLogs: any[]
  categories: any[]
  recentPosts: any[]
  postsPerDay: any[]
  usersPerDay: any[]
  categoryStats: any[]
  stats: { totalPosts: number, totalUsers: number, totalReports: number }
}) {
  const [active, setActive] = useState('overview')
  const [collapsed, setCollapsed] = useState(false)

  const activeLabel = navItems.find(n => n.id === active)?.label || ''

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}>

      <aside style={{
        width: collapsed ? 56 : 220,
        background: 'var(--sur)',
        borderRight: '1px solid var(--bd)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, bottom: 0, left: 0,
        zIndex: 50,
        transition: 'width .2s ease',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '16px 12px', borderBottom: '1px solid var(--bd)', display: 'flex', alignItems: 'center', gap: 10, minHeight: 52 }}>
          {!collapsed && (
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none', flex: 1 }}>
              <span style={{ width: 7, height: 7, background: 'var(--blue)', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }}></span>
              <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700, fontSize: '.9375rem', color: 'var(--t1)', whiteSpace: 'nowrap' }}>wiispr</span>
            </a>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, borderRadius: 6, marginLeft: collapsed ? 'auto' : undefined, width: 28, height: 28, flexShrink: 0 }}>
            <Menu size={15} />
          </button>
        </div>

        {!collapsed && (
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--bd)', display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--blue-d)', border: '1.5px solid var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 800, color: 'var(--blue)', flexShrink: 0 }}>
              {admin.nickname?.[0]?.toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{admin.nickname}</p>
              <p style={{ fontSize: '.65rem', color: 'var(--blue)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>Admin</p>
            </div>
          </div>
        )}

        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                title={collapsed ? item.label : undefined}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                  padding: collapsed ? '9px 0' : '8px 10px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 7, border: 'none',
                  background: isActive ? 'var(--blue-d)' : 'none',
                  color: isActive ? 'var(--blue)' : 'var(--t3)',
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: '.8rem',
                  fontWeight: isActive ? 600 : 500, marginBottom: 2,
                  transition: 'all .12s', whiteSpace: 'nowrap', overflow: 'hidden'
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'none' }}
              >
                <Icon size={15} style={{ flexShrink: 0 }} />
                {!collapsed && <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>}
                {!collapsed && item.id === 'flagged' && flaggedPosts.length > 0 && (
                  <span style={{ background: 'var(--rose)', color: '#fff', borderRadius: 99, fontSize: '.6rem', fontWeight: 700, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>
                    {flaggedPosts.length}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '8px', borderTop: '1px solid var(--bd)' }}>
          <a href="/" style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: collapsed ? '9px 0' : '8px 10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 7, color: 'var(--t3)', fontSize: '.8rem', fontWeight: 500,
            textDecoration: 'none', transition: 'background .12s'
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <LogOut size={15} style={{ flexShrink: 0 }} />
            {!collapsed && 'Back to site'}
          </a>
        </div>
      </aside>

      <div style={{ marginLeft: collapsed ? 56 : 220, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left .2s ease', minWidth: 0 }}>
        <header style={{
          height: 52, background: 'var(--sur)', borderBottom: '1px solid var(--bd)',
          display: 'flex', alignItems: 'center', padding: '0 24px', gap: 8,
          position: 'sticky', top: 0, zIndex: 40
        }}>
          <span style={{ fontSize: '.75rem', color: 'var(--t4)' }}>Admin</span>
          <ChevronRight size={12} style={{ color: 'var(--t4)' }} />
          <span style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t1)' }}>{activeLabel}</span>
        </header>

        <main style={{ flex: 1, padding: 24, overflowX: 'hidden' }}>
          {active === 'overview' && <AdminOverview stats={stats} recentPosts={recentPosts} flaggedCount={flaggedPosts.length} />}
          {active === 'flagged' && <AdminFlagged initialPosts={flaggedPosts} />}
          {active === 'users' && <AdminUsers initialUsers={allUsers} />}
          {active === 'logs' && <AdminLogs logs={activityLogs} />}
          {active === 'categories' && <AdminCategories initialCategories={categories} />}
          {active === 'announcements' && <AdminAnnouncements />}
          {active === 'analytics' && <AdminAnalytics stats={stats} postsPerDay={postsPerDay} usersPerDay={usersPerDay} categoryStats={categoryStats} />}
          {active === 'settings' && <AdminSettings />}
        </main>
      </div>
    </div>
  )
}