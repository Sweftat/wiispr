'use client'
import { useState, useEffect } from 'react'

const pages = [
  { id: 'terms', label: 'Terms of Service' },
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'about', label: 'About wiispr' },
  { id: 'rules', label: 'Community Rules' },
]

export default function AdminLegalEditor() {
  const [activePage, setActivePage] = useState('terms')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { loadPage(activePage) }, [activePage])

  async function loadPage(pageId: string) {
    setLoading(true)
    const res = await fetch('/api/legal?page=' + pageId)
    const data = await res.json()
    setContent(data.page?.content || '')
    setLoading(false)
  }

  async function save() {
    setSaving(true)
    await fetch('/api/legal', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: activePage, content })
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ width: "100%" }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Legal Pages</h1>
      <p style={{ fontSize: '.875rem', color: 'var(--t3)', marginBottom: 24 }}>Edit content for all legal pages. Changes appear instantly on the site.</p>

      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--bg)', borderRadius: 'var(--r)', padding: 4, border: '1px solid var(--bd)' }}>
        {pages.map(p => (
          <button key={p.id} onClick={() => setActivePage(p.id)} style={{
            flex: 1, padding: '7px 12px', borderRadius: 6, border: 'none',
            background: activePage === p.id ? 'var(--sur)' : 'none',
            color: activePage === p.id ? 'var(--t1)' : 'var(--t3)',
            fontSize: '.8rem', fontWeight: activePage === p.id ? 600 : 500,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: activePage === p.id ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
            transition: 'all .15s'
          }}>
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--bd)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--t1)' }}>
            {pages.find(p => p.id === activePage)?.label}
          </p>
          <a href={'/' + activePage} target="_blank" style={{ fontSize: '.75rem', color: 'var(--blue)', textDecoration: 'none', fontWeight: 500 }}>
            Preview
          </a>
        </div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: '.875rem', color: 'var(--t4)' }}>Loading...</p>
          </div>
        ) : (
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={20}
            style={{
              width: '100%', padding: '16px 18px',
              fontSize: '.875rem', color: 'var(--t1)',
              background: 'var(--sur)', border: 'none',
              outline: 'none', fontFamily: 'inherit',
              lineHeight: 1.8, resize: 'vertical'
            }}
            placeholder="Enter page content here..."
          />
        )}
        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--bd)', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={save} disabled={saving || loading} style={{
            padding: '8px 20px', borderRadius: 'var(--r)', border: 'none',
            background: saved ? 'var(--grn)' : 'var(--blue)',
            color: '#fff', fontSize: '.875rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'background .2s'
          }}>
            {saved ? 'Saved!' : saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
