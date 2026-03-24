'use client'
import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'

const ACTION_LABELS: Record<string, string> = {
  delete: 'Deleted post',
  unblur: 'Unblurred post',
  pin: 'Pinned post',
  unpin: 'Unpinned post',
  set_potd: 'Set post of the day',
  unset_potd: 'Unset post of the day',
  set_warning: 'Set content warning',
  clear_warning: 'Cleared content warning',
  suspend: 'Suspended user',
  unsuspend: 'Unsuspended user',
  set_trust: 'Changed trust level',
  enable: 'Enabled category',
  disable: 'Disabled category',
  create: 'Created category',
  reorder: 'Reordered categories',
  notify_all: 'Broadcast notification',
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const TARGET_COLORS: Record<string, string> = {
  post: 'var(--blue)',
  user: '#a855f7',
  category: '#f59e0b',
  broadcast: '#10b981',
}

export default function AdminAuditLog() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState(0)
  const LIMIT = 50

  async function load(reset = false) {
    setLoading(true)
    const o = reset ? 0 : offset
    const res = await fetch(`/api/admin/audit-logs?limit=${LIMIT}&offset=${o}`)
    const data = await res.json()
    if (reset) {
      setLogs(data.logs || [])
      setOffset(0)
    } else {
      setLogs(prev => [...prev, ...(data.logs || [])])
    }
    setLoading(false)
  }

  useEffect(() => { load(true) }, [])

  function loadMore() {
    const newOffset = offset + LIMIT
    setOffset(newOffset)
    load(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 2 }}>Audit Log</h2>
          <p style={{ fontSize: '.8rem', color: 'var(--t3)' }}>Every admin action, recorded.</p>
        </div>
        <button
          onClick={() => load(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 'var(--r)', border: '1px solid var(--bd)', background: 'none', color: 'var(--t3)', fontSize: '.8rem', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {loading && logs.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height: 56, background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', opacity: 0.5 }} />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--t4)', fontSize: '.875rem', padding: '32px 0' }}>No actions logged yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {logs.map((log: any) => (
            <div key={log.id} style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--t1)' }}>
                    {ACTION_LABELS[log.action] || log.action}
                  </span>
                  <span style={{
                    fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em',
                    color: TARGET_COLORS[log.target_type] || 'var(--t4)',
                    background: 'var(--bg)', border: `1px solid ${TARGET_COLORS[log.target_type] || 'var(--bd)'}`,
                    padding: '1px 6px', borderRadius: 3
                  }}>
                    {log.target_type}
                  </span>
                  {log.meta?.trustLevel && (
                    <span style={{ fontSize: '.75rem', color: 'var(--t3)' }}>→ {log.meta.trustLevel}</span>
                  )}
                  {log.meta?.warning && (
                    <span style={{ fontSize: '.75rem', color: 'var(--t3)', fontStyle: 'italic' }}>"{log.meta.warning}"</span>
                  )}
                  {log.meta?.message && (
                    <span style={{ fontSize: '.75rem', color: 'var(--t3)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>"{log.meta.message}"</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: '.72rem', color: 'var(--t4)', fontFamily: 'monospace' }}>
                    by {log.admin?.nickname || 'admin'}
                  </span>
                  {log.target_id && (
                    <span style={{ fontSize: '.72rem', color: 'var(--t4)', fontFamily: 'monospace' }}>
                      · {log.target_id.slice(0, 8)}…
                    </span>
                  )}
                </div>
              </div>
              <span style={{ fontSize: '.72rem', color: 'var(--t4)', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                {timeAgo(log.created_at)}
              </span>
            </div>
          ))}
          {logs.length >= LIMIT && (
            <button
              onClick={loadMore}
              disabled={loading}
              style={{ padding: '10px', borderRadius: 'var(--r)', border: '1px solid var(--bd)', background: 'none', color: 'var(--t3)', fontSize: '.8rem', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {loading ? 'Loading…' : 'Load more'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
