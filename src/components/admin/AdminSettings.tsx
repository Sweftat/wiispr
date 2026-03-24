'use client'
import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'

export default function AdminSettings() {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [maintenance, setMaintenance] = useState(false)
  const [registrationsOpen, setRegistrationsOpen] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => {
        setMaintenance(d.maintenance ?? false)
        setRegistrationsOpen(d.registrationsOpen ?? true)
        setLoading(false)
      })
  }, [])

  async function save() {
    setSaving(true)
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maintenance, registrationsOpen }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ width: '100%' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Site Settings</h1>
      <p style={{ fontSize: '.875rem', color: 'var(--t3)', marginBottom: 24 }}>Global platform configuration.</p>

      <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', overflow: 'hidden', marginBottom: 12 }}>
        <h2 style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--t1)', padding: '16px 18px', borderBottom: '1px solid var(--bd)' }}>Platform Controls</h2>
        {[
          { label: 'Maintenance mode', desc: 'Shows a maintenance page to all non-admin users', value: maintenance, set: setMaintenance, danger: maintenance },
          { label: 'Open registrations', desc: 'Allow new users to sign up', value: registrationsOpen, set: setRegistrationsOpen, danger: false },
        ].map((toggle, i, arr) => (
          <div key={toggle.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: i < arr.length - 1 ? '1px solid var(--bd)' : 'none' }}>
            <div>
              <p style={{ fontSize: '.875rem', fontWeight: 600, color: toggle.danger ? 'var(--rose)' : 'var(--t1)', marginBottom: 2 }}>{toggle.label}</p>
              <p style={{ fontSize: '.75rem', color: 'var(--t3)' }}>{toggle.desc}</p>
            </div>
            <Switch checked={toggle.value} disabled={loading} onCheckedChange={toggle.set} />
          </div>
        ))}
      </div>

      {maintenance && (
        <div style={{ background: 'var(--rose-d)', border: '1px solid var(--rose)', borderRadius: 'var(--r)', padding: '12px 16px', marginBottom: 12 }}>
          <p style={{ fontSize: '.8rem', color: 'var(--rose)', fontWeight: 600 }}>⚠ Maintenance mode is ON — all users will see the maintenance page until you turn this off and save.</p>
        </div>
      )}

      <div style={{ background: 'var(--sur)', border: '1px solid var(--rose)', borderRadius: 'var(--rm)', padding: '18px', marginBottom: 16 }}>
        <h2 style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--rose)', marginBottom: 4 }}>Danger Zone</h2>
        <p style={{ fontSize: '.8rem', color: 'var(--t3)', marginBottom: 12 }}>Permanently delete all report records.</p>
        <button style={{ padding: '7px 16px', borderRadius: 'var(--r)', border: '1px solid var(--rose)', background: 'none', color: 'var(--rose)', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Clear all reports</button>
      </div>

      <button onClick={save} disabled={saving || loading} style={{ width: '100%', padding: '11px', borderRadius: 'var(--r)', border: 'none', background: saved ? 'var(--grn)' : 'var(--blue)', color: '#fff', fontSize: '.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background .2s' }}>
        {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save settings'}
      </button>
    </div>
  )
}
