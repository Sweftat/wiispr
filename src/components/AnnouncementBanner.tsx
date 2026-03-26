'use client'
import { useState, useEffect } from 'react'
import { X, Info, AlertTriangle, CheckCircle, Megaphone } from 'lucide-react'

const typeConfig: Record<string, { icon: any, color: string, bg: string, border: string }> = {
  info: { icon: Info, color: 'var(--blue)', bg: 'var(--blue-d)', border: '#BFDBFE' },
  warning: { icon: AlertTriangle, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  success: { icon: CheckCircle, color: 'var(--grn)', bg: 'var(--grn-d)', border: '#BBF7D0' },
  announcement: { icon: Megaphone, color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
}

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<any>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const dismissedId = sessionStorage.getItem('dismissed_announcement')
    fetch('/api/announcements')
      .then(r => r.json())
      .then(d => {
        if (d.announcement && d.announcement.id !== dismissedId) {
          setAnnouncement(d.announcement)
        }
      })
  }, [])

  function dismiss() {
    sessionStorage.setItem('dismissed_announcement', announcement.id)
    setDismissed(true)
  }

  if (!announcement || dismissed) return null

  const config = typeConfig[announcement.type] || typeConfig.info
  const Icon = config.icon

  return (
    <div style={{
      background: config.bg,
      borderBottom: `1px solid ${config.border}`,
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      position: 'sticky',
      top: 52,
      zIndex: 95
    }}>
      <Icon size={15} style={{ color: config.color, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        {announcement.title && (
          <span style={{ fontSize: '.8rem', fontWeight: 700, color: config.color, marginRight: 6 }}>
            {announcement.title}
          </span>
        )}
        {announcement.body && (
          <span style={{ fontSize: '.8rem', color: config.color, opacity: 0.85 }}>
            {announcement.body}
          </span>
        )}
      </div>
      <button onClick={dismiss} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: config.color, display: 'flex', alignItems: 'center',
        padding: 4, borderRadius: 4, opacity: 0.7, flexShrink: 0
      }}>
        <X size={14} />
      </button>
    </div>
  )
}