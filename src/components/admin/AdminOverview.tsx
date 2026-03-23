import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Users, Flag, AlertTriangle } from 'lucide-react'

export default function AdminOverview({ stats, recentPosts, flaggedCount }: {
  stats: { totalPosts: number, totalUsers: number, totalReports: number }
  recentPosts: any[]
  flaggedCount: number
}) {
  const statCards = [
    { label: 'Total Posts', value: stats.totalPosts, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Reports', value: stats.totalReports, icon: Flag, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Flagged Now', value: flaggedCount, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back. Here's what's happening on wiispr.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map(s => {
          const Icon = s.icon
          return (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</p>
                  <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                    <Icon size={16} className={s.color} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground">{s.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent posts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Posts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6 text-center">No posts yet.</p>
          ) : recentPosts.map((post, i) => (
            <div key={post.id} className={`flex items-center gap-3 px-6 py-3 ${i < recentPosts.length - 1 ? 'border-b border-border' : ''}`}>
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wide shrink-0">
                {post.categories?.name}
              </Badge>
              <p className="text-sm font-medium text-foreground flex-1 truncate">{post.title}</p>
              <span className="text-xs text-muted-foreground font-mono shrink-0">{post.ghost_id}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}