'use client'
import { timeAgo } from '@/lib/time'

const actionColors: Record<string, string> = {
  post_created: 'var(--blue)',
  reply_created: 'var(--grn)',
  post_reported: 'var(--rose)',
  post_deleted: 'var(--rose)',
  user_suspended: 'var(--rose)',
  user_unsuspended: 'var(--grn)',
}

export default function AdminLogs({ logs }: { logs: any[] }) {
  return (
    <div>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Activity Logs</h1>
      <p style={{ fontSize: '.875rem', color: 'var(--t3)', marginBottom: 24 }}>Last {logs.length} actions on the platform.</p>

      <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', overflow: 'hidden' }}>
        {logs.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>No activity yet</p>
            <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>Actions will appear here.</p>
          </div>
        ) : logs.map((log, i) => (
          <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderBottom: i < logs.length - 1 ? '1px solid var(--bd)' : 'none' }}>
            <span style={{
              fontSize: '.6rem', fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase',
              color: actionColors[log.action] || 'var(--t3)',
              background: 'var(--bg)', padding: '2px 7px', borderRadius: 3, whiteSpace: 'nowrap', flexShrink: 0
            }}>{log.action.replace(/_/g, ' ')}</span>
            <span style={{ fontSize: '.8rem', color: 'var(--t2)', flex: 1 }}>{log.users?.nickname || 'Anonymous'}</span>
            <span style={{ fontSize: '.7rem', color: 'var(--t4)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{timeAgo(log.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}