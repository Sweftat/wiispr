'use client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { timeAgo } from '@/lib/time'

const actionConfig: Record<string, { label: string, variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  post_created: { label: 'Post Created', variant: 'secondary' },
  reply_created: { label: 'Reply Created', variant: 'outline' },
  post_reported: { label: 'Post Reported', variant: 'destructive' },
  post_deleted: { label: 'Post Deleted', variant: 'destructive' },
  user_suspended: { label: 'User Suspended', variant: 'destructive' },
  user_unsuspended: { label: 'User Unsuspended', variant: 'default' },
}

export default function AdminLogs({ logs }: { logs: any[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Activity Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">Last {logs.length} actions on the platform.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6 text-center">No activity yet.</p>
          ) : logs.map((log, i) => {
            const config = actionConfig[log.action] || { label: log.action.replace(/_/g, ' '), variant: 'outline' as const }
            return (
              <div key={log.id} className={`flex items-center gap-3 px-6 py-3 ${i < logs.length - 1 ? 'border-b border-border' : ''}`}>
                <Badge variant={config.variant} className="text-[10px] shrink-0 capitalize">
                  {config.label}
                </Badge>
                <span className="text-sm text-foreground flex-1">{log.users?.nickname || 'Anonymous'}</span>
                <span className="text-xs text-muted-foreground font-mono shrink-0">{timeAgo(log.created_at)}</span>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}