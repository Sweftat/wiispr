'use client'
import { useState, useEffect } from 'react'
import { Shield, Search } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminWomensSpace() {
  const [settings, setSettings] = useState<any>({})
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [gateMessage, setGateMessage] = useState('')
  const [msgSaved, setMsgSaved] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [settingsRes, usersRes] = await Promise.all([
      fetch('/api/admin/settings').then(r => r.json()),
      fetch('/api/admin/users').then(r => r.json()),
    ])
    setSettings(settingsRes.settings || {})
    setGateMessage(settingsRes.settings?.womens_space_gate_message || 'This space is for verified women on wiispr. Build your reputation to gain access.')
    setUsers(usersRes.users || [])
    setLoading(false)
  }

  async function updateSetting(key: string, value: any) {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: value })
    })
    toast.success('Setting updated')
  }

  async function saveGateMessage() {
    await updateSetting('womens_space_gate_message', gateMessage)
    setMsgSaved(true)
    setTimeout(() => setMsgSaved(false), 2000)
  }

  const womenUsers = users.filter(u => u.gender === 'female')
  const filteredUsers = search
    ? womenUsers.filter(u => u.nickname?.toLowerCase().includes(search.toLowerCase()))
    : womenUsers

  const card: React.CSSProperties = { background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: 16, marginBottom: 12 }
  const sectionTitle: React.CSSProperties = { fontSize: '.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginBottom: 12, borderBottom: '1px solid var(--bd)', paddingBottom: 8 }

  const ToggleRow = ({ label, desc, value, onChange }: { label: string, desc: string, value: boolean, onChange: (v: boolean) => void }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--bd)' }}>
      <div>
        <p style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--t1)' }}>{label}</p>
        <p style={{ fontSize: '.75rem', color: 'var(--t4)' }}>{desc}</p>
      </div>
      <button onClick={() => onChange(!value)} style={{
        width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
        background: value ? 'var(--blue)' : 'var(--bd)', position: 'relative', transition: 'background .2s',
      }}>
        <span style={{
          width: 16, height: 16, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 3, left: value ? 21 : 3, transition: 'left .2s',
          boxShadow: '0 1px 3px rgba(0,0,0,.15)',
        }} />
      </button>
    </div>
  )

  if (loading) return <p style={{ color: 'var(--t4)' }}>Loading...</p>

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <Shield size={20} style={{ color: '#EC4899' }} />
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)' }}>Women&apos;s Space</h1>
          <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>Manage access and settings for the Women&apos;s Space category.</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Women Users', value: womenUsers.length },
          { label: 'Trust Gate', value: settings.womens_space_trust_gate ? 'On' : 'Off' },
          { label: 'Min Trust', value: settings.womens_space_min_trust || 'None' },
        ].map(s => (
          <div key={s.label} style={{ ...card, marginBottom: 0, textAlign: 'center' }}>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)' }}>{s.value}</p>
            <p style={{ fontSize: '.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Access Control */}
      <div style={card}>
        <p style={sectionTitle}>Access Control</p>
        <ToggleRow label="Women's Space Active" desc="Enable/disable the entire Women's Space category" value={!!settings.womens_space_active} onChange={v => updateSetting('womens_space_active', v)} />
        <ToggleRow label="Trust Gate" desc="Require minimum trust level to post" value={!!settings.womens_space_trust_gate} onChange={v => updateSetting('womens_space_trust_gate', v)} />
        <ToggleRow label="Gender Verification" desc="Only users who selected female during signup can access" value={!!settings.womens_space_gender_gate} onChange={v => updateSetting('womens_space_gender_gate', v)} />
        <div style={{ paddingTop: 10 }}>
          <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>Minimum trust level</label>
          <select value={settings.womens_space_min_trust || 'new'} onChange={e => updateSetting('womens_space_min_trust', e.target.value)} style={{
            width: '100%', padding: '8px 10px', fontSize: '.8rem', color: 'var(--t1)', background: 'var(--bg)',
            border: '1px solid var(--bd)', borderRadius: 'var(--r)', outline: 'none', fontFamily: 'inherit',
          }}>
            <option value="new">New</option>
            <option value="active">Active</option>
            <option value="trusted">Trusted</option>
            <option value="top">Top</option>
          </select>
        </div>
      </div>

      {/* Gate Message */}
      <div style={card}>
        <p style={sectionTitle}>Gate Message</p>
        <p style={{ fontSize: '.75rem', color: 'var(--t4)', marginBottom: 8 }}>Shown to users who don&apos;t have access</p>
        <textarea
          value={gateMessage}
          onChange={e => { setGateMessage(e.target.value); setMsgSaved(false) }}
          onBlur={saveGateMessage}
          rows={3}
          style={{
            width: '100%', padding: '8px 10px', fontSize: '.8rem', color: 'var(--t1)',
            background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--rs)',
            outline: 'none', fontFamily: 'inherit', resize: 'none', marginBottom: 6,
          }}
        />
        <span style={{ fontSize: '.68rem', color: msgSaved ? 'var(--grn)' : 'var(--t4)' }}>
          {msgSaved ? '✓ Saved' : 'Auto-saves on blur'}
        </span>
      </div>

      {/* User Management */}
      <div style={card}>
        <p style={sectionTitle}>Women Users</p>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--t4)' }} />
          <input
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', height: 34, paddingLeft: 30, paddingRight: 10,
              fontSize: '.8rem', color: 'var(--t1)', background: 'var(--bg)',
              border: '1px solid var(--bd)', borderRadius: 'var(--r)', outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>
        {filteredUsers.length === 0 ? (
          <p style={{ fontSize: '.8rem', color: 'var(--t4)', textAlign: 'center', padding: 16 }}>No women users found</p>
        ) : (
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {filteredUsers.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--bd)' }}>
                <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--t1)', flex: 1 }}>{u.nickname}</span>
                {u.trust_level && u.trust_level !== 'new' && (
                  <span style={{
                    fontSize: '.55rem', fontWeight: 700, padding: '1px 6px', borderRadius: 9999,
                    color: u.trust_level === 'top' ? '#D97706' : u.trust_level === 'trusted' ? 'var(--grn)' : 'var(--blue)',
                    background: u.trust_level === 'top' ? '#FFFBEB' : u.trust_level === 'trusted' ? 'var(--grn-d)' : 'var(--blue-d)',
                  }}>{u.trust_level}</span>
                )}
                <span style={{ fontSize: '.7rem', color: 'var(--t4)' }}>{u.is_suspended ? 'Suspended' : 'Active'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
