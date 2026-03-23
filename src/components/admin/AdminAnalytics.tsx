'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Users, Flag, TrendingUp } from 'lucide-react'

export default function AdminAnalytics({ stats }: {
  stats: { totalPosts: number, totalUsers: number, totalReports: number }
}) {
  const max = Math.max(stats.totalPosts, stats.totalUsers, stats.totalReports, 1)

  const bars = [
    { label: 'Total Posts', value: stats.totalPosts, color: 'bg-blue-500', icon: FileText, textColor: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Users', value: stats.totalUsers, color: 'bg-green-500', icon: Users, textColor: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Reports', value: stats.totalReports, color: 'bg-red-500', icon: Flag, textColor: 'text-red-600', bg: 'bg-red-50' },
  ]

  const derived = [
    { label: 'Posts per user', value: stats.totalUsers > 0 ? (stats.totalPosts / stats.totalUsers).toFixed(1) : '0' },
    { label: 'Report rate', value: stats.totalPosts > 0 ? ((stats.totalReports / stats.totalPosts) * 100).toFixed(1) + '%' : '0%' },
    { label: 'Active categories', value: '8' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform stats at a glance.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {bars.map(b => {
          const Icon = b.icon
          return (
            <Card key={b.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{b.label}</p>
                  <div className={`w-8 h-8 rounded-lg ${b.bg} flex items-center justify-center`}>
                    <Icon size={15} className={b.textColor} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground">{b.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Bar chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Platform Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {bars.map(bar => (
            <div key={bar.label}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{bar.label}</span>
                <span className="text-sm font-bold text-foreground">{bar.value}</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${bar.color} rounded-full transition-all duration-700`}
                  style={{ width: `${Math.round((bar.value / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Derived stats */}
      <div className="grid grid-cols-3 gap-4">
        {derived.map(s => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{s.label}</p>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}