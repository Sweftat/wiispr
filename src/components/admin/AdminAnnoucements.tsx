'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, X } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

const types = ['info', 'warning', 'success', 'announcement']
const typeColors: Record<string, string> = {
  info: 'var(--blue)', warning: '#D97706', success: 'var(--grn)', announcement: '#7C3AED'
}

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ title: '', body: '', type: 'info', is_active: false })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const res = await fetch('/api/announcements/all')
    const data = await res.json()
    setAnnouncements(data.announcements || [])
  }

  async function save() {
    setSaving(true)
    if (editing) {
      await fetch('/api/announcements', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...form }) })
    } else {
      await fetch('/api/announcements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    }
    setSaving(false)
    setShowForm(false)
    setEditing(null)
    setForm({ title: '', body: '', type: 'info', is_active: false })
    load()
  }

  async function toggle(id: string, is_active: boolean) {
    await fetch('/api/announcements', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, is_active: !is_active }) })
    load()
  }

  async function remove(id: string) {
    await fetch('/api/announcements', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    load()
  }

  function startEdit(a: any) {
    setEditing(a)
    setForm({ title: a.title, body: a.body || '', type: a.type, is_active: a.is_active })
    setShowForm(true)
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Announcements</h1>
          <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>Banners shown to all users across the platform.</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ title: '', body: '', type: 'info', is_active: false }); setShowForm(true) }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--r)', background: 'var(--blue)', color: '#fff', border: 'none', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          <Plus size={14} /> New announcement
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '20px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--t1)' }}>{editing ? 'Edit' : 'New'} Announcement</h2>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t4)' }}><X size={16} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>Title</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ width: '100%', height: 38, padding: '0 12px', fontSize: '.875rem', color: 'var(--t1)', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', outline: 'none', fontFamily: 'inherit' }} />
            </div>
            <div>
              <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>Body (optional)</label>
              <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={2} style={{ width: '100%', padding: '10px 12px', fontSize: '.875rem', color: 'var(--t1)', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', outline: 'none', fontFamily: 'inherit', resize: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>Type</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {types.map(t => (
                  <button key={t} onClick={() => setForm({ ...form, type: t })} style={{ padding: '6px 14px', borderRadius: 'var(--r)', border: '1px solid var(--bd)', background: form.type === t ? typeColors[t] : 'none', color: form.type === t ? '#fff' : 'var(--t2)', fontSize: '.8rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize', transition: 'all .15s' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
              <span style={{ fontSize: '.8rem', color: 'var(--t2)' }}>Active immediately</span>
            </div>
            <button onClick={save} disabled={!form.title || saving} style={{ padding: '9px', borderRadius: 'var(--r)', background: form.title ? 'var(--blue)' : 'var(--bd)', color: '#fff', border: 'none', fontSize: '.875rem', fontWeight: 600, cursor: form.title ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {announcements.length === 0 ? (
        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>No announcements yet</p>
          <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>Create one to show a banner to all users.</p>
        </div>
      ) : announcements.map((a, i) => (
        <div key={a.id} style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '16px 18px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: typeColors[a.type] || 'var(--t4)', flexShrink: 0 }}></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--t1)', marginBottom: 2 }}>{a.title}</p>
            {a.body && <p style={{ fontSize: '.8rem', color: 'var(--t3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.body}</p>}
          </div>
          <span style={{ fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', color: typeColors[a.type], background: 'var(--bg)', padding: '2px 7px', borderRadius: 3, flexShrink: 0 }}>{a.type}</span>
          <Switch checked={!!a.is_active} onCheckedChange={() => toggle(a.id, a.is_active)} />
          <button onClick={() => startEdit(a)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t4)', display: 'flex' }}><Edit2 size={14} /></button>
          <button onClick={() => remove(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rose)', display: 'flex' }}><Trash2 size={14} /></button>
        </div>
      ))}
    </div>
  )
}