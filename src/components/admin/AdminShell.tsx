'use client'
import { useState } from 'react'
import { LayoutDashboard, Flag, Users, Activity, Layers, BarChart2, Settings, LogOut, ChevronRight, Menu, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const activeLabel = navItems.find(n => n.id === active)?.label || ''

  return (
    <div className="flex min-h-screen bg-background">

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-0 overflow-hidden'} transition-all duration-200 bg-card border-r border-border flex flex-col fixed top-0 bottom-0 left-0 z-50`}>
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <a href="/" className="flex items-center gap-2 no-underline">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
            <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700, fontSize: '1rem' }} className="text-foreground">wiispr</span>
          </a>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-xs font-bold text-blue-600">
              {admin.nickname?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">{admin.nickname}</p>
              <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">Admin</Badge>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium mb-0.5 transition-colors cursor-pointer border-none ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
                style={{ fontFamily: 'inherit', background: isActive ? 'var(--blue-d)' : undefined, color: isActive ? 'var(--blue)' : undefined }}
              >
                <Icon size={15} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === 'flagged' && flaggedPosts.length > 0 && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 min-w-4">
                    {flaggedPosts.length}
                  </Badge>
                )}
              </button>
            )
          })}
        </nav>

        <Separator />

        {/* Bottom */}
        <div className="p-2">
          <a href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors no-underline">
            <LogOut size={15} />
            Back to site
          </a>
        </div>
      </aside>

      {/* Main */}
      <div className={`flex-1 flex flex-col transition-all duration-200 ${sidebarOpen ? 'ml-60' : 'ml-0'}`}>

        {/* Topbar */}
        <header className="h-13 bg-card border-b border-border flex items-center px-6 gap-4 sticky top-0 z-40" style={{ height: 52 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground hover:text-foreground transition-colors border-none bg-transparent cursor-pointer">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-muted-foreground">Admin</span>
            <ChevronRight size={13} className="text-muted-foreground" />
            <span className="font-semibold text-foreground">{activeLabel}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {active === 'overview' && <AdminOverview stats={stats} recentPosts={recentPosts} flaggedCount={flaggedPosts.length} />}
          {active === 'flagged' && <AdminFlagged initialPosts={flaggedPosts} />}
          {active === 'users' && <AdminUsers initialUsers={allUsers} />}
          {active === 'logs' && <AdminLogs logs={activityLogs} />}
          {active === 'categories' && <AdminCategories initialCategories={categories} />}
          {active === 'analytics' && <AdminAnalytics stats={stats} />}
          {active === 'settings' && <AdminSettings />}
        </main>
      </div>
    </div>
  )
}