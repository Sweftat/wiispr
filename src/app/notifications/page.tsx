'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import { timeAgo } from '@/lib/time'
import { Bell, MessageCircle, ArrowUp, Users } from 'lucide-react'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then(d => {
        setNotifications(d.notifications || [])
        setLoading(false)
        fetch('/api/notifications', { method: 'POST' })
      })
  }, [])

  function getIcon(type: string) {
    if (type === 'reply') return <MessageCircle size={14} />
    if (type === 'upvote') return <ArrowUp size={14} />
    if (type === 'follow') return <Users size={14} />
    return <Bell size={14} />
  }

  function getColor(type: string) {
    if (type === 'reply') return 'var(--blue)'
    if (type === 'upvote') return 'var(--grn)'
    if (type === 'follow') return '#7C3AED'
    return 'var(--t3)'
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 16 }}>Notifications</h1>

        {loading && <p style={{ color: 'var(--t4)', fontSize: '.875rem' }}>Loading...</p>}

        {!loading && notifications.length === 0 && (
          <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '48px 24px', textAlign: 'center' }}>
            <Bell size={24} style={{ color: 'var(--t4)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>Nothing yet</p>
            <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>When someone replies to you, it appears here.</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {notifications.map((n, i) => (
            <a key={n.id} href={n.post_id ? '/post/' + n.post_id : '#'} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '13px 16px',
              background: n.is_read ? 'var(--sur)' : 'var(--blue-d)',
              border: '1px solid var(--bd)',
              borderRadius: i === 0 ? '12px 12px 4px 4px' : i === notifications.length - 1 ? '4px 4px 12px 12px' : '4px',
              textDecoration: 'none', color: 'inherit',
              marginBottom: 2
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: getColor(n.type),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', flexShrink: 0
              }}>
                {getIcon(n.type)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '.8375rem', color: 'var(--t1)', lineHeight: 1.5 }}>{n.message}</p>
                <p style={{ fontSize: '.7rem', color: 'var(--t4)', marginTop: 3, fontFamily: 'monospace' }}>{timeAgo(n.created_at)}</p>
              </div>
              {!n.is_read && (
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)', flexShrink: 0, marginTop: 4 }} />
              )}
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}