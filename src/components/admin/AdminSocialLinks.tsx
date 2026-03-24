'use client'
import { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'

const platforms = [
  { key: 'twitter', label: 'X / Twitter', placeholder: 'https://x.com/yourhandle' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourhandle' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@yourhandle' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourchannel' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourpage' },
]

const empty = Object.fromEntries(platforms.map(p => [p.key, '']))

export default function AdminSocialLinks() {
  const [links, setLinks] = useState<Record<string, string>>(empty)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/social-links')
      .then(r => r.json())
      .then(d => {
        setLinks({ ...empty, ...d.links })
        setLoading(false)
      })
  }, [])

  async function save() {
    setSaving(true)
    await fetch('/api/admin/social-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(links),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Social Links</h1>
        <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>Links displayed in the site footer. Leave blank to hide.</p>
      </div>

      <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '20px' }}>
        {loading ? (
          <p style={{ fontSize: '.875rem', color: 'var(--t4)' }}>Loading...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {platforms.map(p => (
              <div key={p.key}>
                <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>
                  {p.label}
                </label>
                <input
                  type="url"
                  value={links[p.key]}
                  onChange={e => setLinks(l => ({ ...l, [p.key]: e.target.value }))}
                  placeholder={p.placeholder}
                  style={{
                    width: '100%', height: 38, padding: '0 12px',
                    fontSize: '.875rem', color: 'var(--t1)',
                    background: 'var(--bg)', border: '1px solid var(--bd)',
                    borderRadius: 'var(--r)', outline: 'none', fontFamily: 'inherit',
                  }}
                />
              </div>
            ))}

            <button
              onClick={save}
              disabled={saving}
              style={{
                marginTop: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                width: '100%', padding: '10px',
                borderRadius: 'var(--r)', border: 'none',
                background: saved ? 'var(--grn)' : 'var(--blue)',
                color: '#fff', fontSize: '.875rem', fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', transition: 'background .2s',
              }}
            >
              {saved && <CheckCircle size={14} />}
              {saved ? 'Saved!' : saving ? 'Saving...' : 'Save social links'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
