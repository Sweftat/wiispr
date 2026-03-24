'use client'
import { useState } from 'react'
import { Download, Users, FileText, AlertCircle } from 'lucide-react'

const exports = [
  {
    type: 'users',
    label: 'Users',
    description: 'All user accounts — nickname, gender, age range, trust level, rep score, status, join date.',
    icon: Users,
    color: 'var(--blue)',
    colorD: 'var(--blue-d)',
  },
  {
    type: 'posts',
    label: 'Posts',
    description: 'All posts — content, category, upvotes, reply count, moderation flags, created date.',
    icon: FileText,
    color: 'var(--grn)',
    colorD: 'var(--grn-d)',
  },
]

export default function AdminExport() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function download(type: string) {
    setLoading(type)
    setError(null)
    try {
      const res = await fetch(`/api/admin/export?type=${type}`)
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Export failed.')
        setLoading(null)
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const disposition = res.headers.get('Content-Disposition') || ''
      const match = disposition.match(/filename="([^"]+)"/)
      a.download = match ? match[1] : `wiispr-${type}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(null)
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Export Data</h1>
        <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>Download platform data as CSV files.</p>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--rose-d)', border: '1px solid var(--rose)', borderRadius: 'var(--r)', marginBottom: 16 }}>
          <AlertCircle size={14} style={{ color: 'var(--rose)', flexShrink: 0 }} />
          <p style={{ fontSize: '.8rem', color: 'var(--rose)', fontWeight: 500 }}>{error}</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {exports.map(({ type, label, description, icon: Icon, color, colorD }) => (
          <div key={type} style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: colorD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 3 }}>{label}</p>
              <p style={{ fontSize: '.775rem', color: 'var(--t3)', lineHeight: 1.5 }}>{description}</p>
            </div>
            <button
              onClick={() => download(type)}
              disabled={loading === type}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 'var(--r)', border: '1px solid var(--bd)',
                background: loading === type ? 'var(--bg)' : 'var(--sur)',
                color: loading === type ? 'var(--t4)' : 'var(--t1)',
                fontSize: '.8rem', fontWeight: 600, cursor: loading === type ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', flexShrink: 0, transition: 'background .12s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (loading !== type) e.currentTarget.style.background = 'var(--bg)' }}
              onMouseLeave={e => { if (loading !== type) e.currentTarget.style.background = 'var(--sur)' }}
            >
              <Download size={13} />
              {loading === type ? 'Exporting...' : 'Download CSV'}
            </button>
          </div>
        ))}
      </div>

      <p style={{ fontSize: '.75rem', color: 'var(--t4)', marginTop: 16 }}>
        Exports fetch all records. For large datasets this may take a moment.
      </p>
    </div>
  )
}
