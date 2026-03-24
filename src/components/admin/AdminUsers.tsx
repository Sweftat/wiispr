'use client'
import { useState } from 'react'
import { User, X, Monitor, Smartphone, Globe } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

const trustColor: Record<string, string> = {
  new: 'var(--t4)', active: 'var(--blue)', trusted: 'var(--grn)', top: '#D97706'
}

export default function AdminUsers({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [selected, setSelected] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [sessions, setSessions] = useState<any[]>([])

  async function loadSessions(userId: string) {
    const res = await fetch('/api/admin/user-sessions?userId=' + userId)
    const data = await res.json()
    setSessions(data.sessions || [])
  }

  async function selectUser(user: any) {
    setSelected(user)
    await loadSessions(user.id)
  }

  async function suspend(userId: string) {
    await fetch('/api/admin/user-action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, action: 'suspend' }) })
    setUsers(users.map(u => u.id === userId ? { ...u, is_suspended: true } : u))
    if (selected?.id === userId) setSelected((s: any) => ({ ...s, is_suspended: true }))
  }

  async function unsuspend(userId: string) {
    await fetch('/api/admin/user-action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, action: 'unsuspend' }) })
    setUsers(users.map(u => u.id === userId ? { ...u, is_suspended: false } : u))
    if (selected?.id === userId) setSelected((s: any) => ({ ...s, is_suspended: false }))
  }

  async function setTrust(userId: string, trustLevel: string) {
    await fetch('/api/admin/user-action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, action: 'set_trust', trustLevel }) })
    setUsers(users.map(u => u.id === userId ? { ...u, trust_level: trustLevel } : u))
    if (selected?.id === userId) setSelected((s: any) => ({ ...s, trust_level: trustLevel }))
  }

  const filtered = users.filter(u => u.nickname?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {/* List */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Users</h1>
            <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>{users.length} users total</p>
          </div>
          <input type="text" placeholder="Search nickname..." value={search} onChange={e => setSearch(e.target.value)} style={{ height: 36, padding: '0 12px', fontSize: '.8rem', color: 'var(--t1)', background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', outline: 'none', fontFamily: 'inherit', width: 200 }} />
        </div>

        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 100px', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--bd)', background: 'var(--bg)' }}>
            {['User', 'Gender', 'Trust', 'Status', 'Joined'].map(h => (
              <p key={h} style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</p>
            ))}
          </div>
          {filtered.map((user, i) => (
            <div key={user.id} onClick={() => selectUser(user)} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 100px', gap: 12, padding: '11px 16px', borderBottom: i < filtered.length - 1 ? '1px solid var(--bd)' : 'none', cursor: 'pointer', background: selected?.id === user.id ? 'var(--blue-d)' : 'none', transition: 'background .12s' }}
              onMouseEnter={e => { if (selected?.id !== user.id) e.currentTarget.style.background = 'var(--bg)' }}
              onMouseLeave={e => { if (selected?.id !== user.id) e.currentTarget.style.background = 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--blue-d)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={13} style={{ color: 'var(--blue)' }} />
                </div>
                <div>
                  <p style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--t1)' }}>{user.nickname}</p>
                  {user.is_admin && <span style={{ fontSize: '.6rem', fontWeight: 700, color: 'var(--blue)', background: 'var(--blue-d)', padding: '1px 5px', borderRadius: 3 }}>ADMIN</span>}
                </div>
              </div>
              <p style={{ fontSize: '.8rem', color: 'var(--t2)', textTransform: 'capitalize', alignSelf: 'center' }}>{user.gender}</p>
              <p style={{ fontSize: '.75rem', fontWeight: 700, color: trustColor[user.trust_level] || 'var(--t4)', textTransform: 'uppercase', alignSelf: 'center' }}>{user.trust_level || 'new'}</p>
              <div style={{ alignSelf: 'center' }}>
                {user.is_suspended
                  ? <span style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--rose)', background: 'var(--rose-d)', padding: '2px 6px', borderRadius: 3 }}>SUSPENDED</span>
                  : <span style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--grn)', background: 'var(--grn-d)', padding: '2px 6px', borderRadius: 3 }}>ACTIVE</span>
                }
              </div>
              <p style={{ fontSize: '.75rem', color: 'var(--t4)', alignSelf: 'center' }}>{new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div style={{ width: 300, flexShrink: 0 }}>
          <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '18px', position: 'sticky', top: 76 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--t1)' }}>User Details</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t4)', display: 'flex' }}><X size={15} /></button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--bd)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--blue-d)', border: '2px solid var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} style={{ color: 'var(--blue)' }} />
              </div>
              <div>
                <p style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--t1)' }}>{selected.nickname}</p>
                <p style={{ fontSize: '.7rem', fontWeight: 700, color: trustColor[selected.trust_level] || 'var(--t4)', textTransform: 'uppercase' }}>{selected.trust_level || 'new'}</p>
              </div>
            </div>

            {[
              { label: 'Gender', value: selected.gender },
              { label: 'Age range', value: selected.age_range },
              { label: 'Rep score', value: selected.rep_score || 0 },
              { label: 'Status', value: selected.is_suspended ? 'Suspended' : 'Active' },
              { label: 'Joined', value: new Date(selected.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--bd)' }}>
                <span style={{ fontSize: '.78rem', color: 'var(--t3)' }}>{item.label}</span>
                <span style={{ fontSize: '.78rem', fontWeight: 600, color: item.label === 'Status' && selected.is_suspended ? 'var(--rose)' : 'var(--t1)', textTransform: 'capitalize' }}>{item.value}</span>
              </div>
            ))}

            {/* Sessions */}
            {sessions.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <p style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Recent Sessions</p>
                {sessions.slice(0, 3).map((s, i) => (
                  <div key={i} style={{ background: 'var(--bg)', borderRadius: 'var(--rs)', padding: '8px 10px', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <Monitor size={11} style={{ color: 'var(--t4)' }} />
                      <span style={{ fontSize: '.75rem', color: 'var(--t2)' }}>{s.device} · {s.browser}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Globe size={11} style={{ color: 'var(--t4)' }} />
                      <span style={{ fontSize: '.75rem', color: 'var(--t2)' }}>{s.city}, {s.country}</span>
                    </div>
                    <p style={{ fontSize: '.7rem', color: 'var(--t4)', marginTop: 3, fontFamily: 'monospace' }}>{new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Trust level override */}
            <div style={{ marginTop: 14 }}>
              <p style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Trust Level</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {(['new', 'active', 'trusted', 'top'] as const).map(level => {
                  const isActive = (selected.trust_level || 'new') === level
                  const color = level === 'top' ? '#D97706' : level === 'trusted' ? 'var(--grn)' : level === 'active' ? 'var(--blue)' : 'var(--t4)'
                  return (
                    <button
                      key={level}
                      onClick={() => setTrust(selected.id, level)}
                      disabled={isActive || selected.is_admin}
                      style={{ padding: '6px 8px', borderRadius: 'var(--r)', border: `1px solid ${isActive ? color : 'var(--bd)'}`, background: isActive ? (level === 'top' ? '#FFFBEB' : level === 'trusted' ? 'var(--grn-d)' : level === 'active' ? 'var(--blue-d)' : 'var(--bg)') : 'none', color: isActive ? color : 'var(--t3)', fontSize: '.75rem', fontWeight: isActive ? 700 : 500, cursor: isActive || selected.is_admin ? 'default' : 'pointer', fontFamily: 'inherit', textTransform: 'capitalize', transition: 'all .12s' }}
                    >
                      {level}
                    </button>
                  )
                })}
              </div>
            </div>

            {!selected.is_admin && (
              <button onClick={() => selected.is_suspended ? unsuspend(selected.id) : suspend(selected.id)} style={{ width: '100%', marginTop: 10, padding: '9px', borderRadius: 'var(--r)', border: 'none', background: selected.is_suspended ? 'var(--grn)' : 'var(--rose)', color: '#fff', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                {selected.is_suspended ? 'Unsuspend user' : 'Suspend user'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}