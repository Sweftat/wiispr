'use client'
import { useState } from 'react'

export default function AdminSettings() {
  const [saved, setSaved] = useState(false)
  const [maintenance, setMaintenance] = useState(false)

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Site Settings</h1>
      <p style={{ fontSize: '.875rem', color: 'var(--t3)', marginBottom: 24 }}>Global platform configuration.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '20px' }}>
          <h2 style={{ fontSize: '.9375rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 16 }}>Platform</h2>
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

        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '20px' }}>
          <h2 style={{ fontSize: '.9375rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 16 }}>Toggles</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--bd)' }}>
            <div>
              <p style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--t1)' }}>Maintenance mode</p>
              <p style={{ fontSize: '.75rem', color: 'var(--t3)' }}>Disables new posts and registrations</p>
            </div>
            <button onClick={() => setMaintenance(!maintenance)} style={{
              width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer',
              background: maintenance ? 'var(--blue)' : 'var(--bd)', transition: 'background .2s', position: 'relative'
            }}>
              <span style={{ position: 'absolute', top: 3, left: maintenance ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
            </button>
          </div>
        </div>

        <button onClick={save} style={{ padding: '11px', borderRadius: 'var(--r)', background: saved ? 'var(--grn)' : 'var(--blue)', color: '#fff', border: 'none', fontSize: '.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background .2s' }}>
          {saved ? 'Saved!' : 'Save settings'}
        </button>
      </div>
    </div>
  )
}