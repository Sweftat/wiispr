'use client'
import { useState } from 'react'
import { Switch } from '@/components/ui/switch'

export default function AdminSettings() {
  const [saved, setSaved] = useState(false)
  const [maintenance, setMaintenance] = useState(false)
  const [registrations, setRegistrations] = useState(true)

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ width: "100%" }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Site Settings</h1>
      <p style={{ fontSize: '.875rem', color: 'var(--t3)', marginBottom: 24 }}>Global platform configuration.</p>

      <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '20px', marginBottom: 12 }}>
        <h2 style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 16 }}>Platform</h2>
        {[
          { label: 'Platform name', value: 'wiispr', type: 'text' },
          { label: 'Tagline', value: 'Say what you actually think', type: 'text' },
          { label: 'Contact email', value: 'hello@wiispr.com', type: 'email' },
        ].map(field => (
          <div key={field.label} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>{field.label}</label>
            <input type={field.type} defaultValue={field.value} style={{ width: '100%', height: 38, padding: '0 12px', fontSize: '.875rem', color: 'var(--t1)', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', outline: 'none', fontFamily: 'inherit' }} />
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', overflow: 'hidden', marginBottom: 12 }}>
        <h2 style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--t1)', padding: '16px 18px', borderBottom: '1px solid var(--bd)' }}>Platform Controls</h2>
        {[
          { label: 'Maintenance mode', desc: 'Disables new posts and shows a maintenance message', value: maintenance, set: setMaintenance },
          { label: 'Open registrations', desc: 'Allow new users to sign up', value: registrations, set: setRegistrations },
        ].map((toggle, i) => (
          <div key={toggle.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: i === 0 ? '1px solid var(--bd)' : 'none' }}>
            <div>
              <p style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--t1)', marginBottom: 2 }}>{toggle.label}</p>
              <p style={{ fontSize: '.75rem', color: 'var(--t3)' }}>{toggle.desc}</p>
            </div>
            <Switch checked={toggle.value} onCheckedChange={toggle.set} />
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--sur)', border: '1px solid var(--rose)', borderRadius: 'var(--rm)', padding: '18px', marginBottom: 16 }}>
        <h2 style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--rose)', marginBottom: 4 }}>Danger Zone</h2>
        <p style={{ fontSize: '.8rem', color: 'var(--t3)', marginBottom: 12 }}>Permanently delete all report records.</p>
        <button style={{ padding: '7px 16px', borderRadius: 'var(--r)', border: '1px solid var(--rose)', background: 'none', color: 'var(--rose)', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Clear all reports</button>
      </div>

      <button onClick={save} style={{ width: '100%', padding: '11px', borderRadius: 'var(--r)', border: 'none', background: saved ? 'var(--grn)' : 'var(--blue)', color: '#fff', fontSize: '.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background .2s' }}>
        {saved ? '✓ Saved!' : 'Save settings'}
      </button>
    </div>
  )
}