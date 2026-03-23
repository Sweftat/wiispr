'use client'
import { useState } from 'react'
import { User, ChevronRight, X } from 'lucide-react'

export default function AdminUsers({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [selected, setSelected] = useState<any>(null)
  const [search, setSearch] = useState('')

  async function suspend(userId: string) {
    await fetch('/api/admin/user-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action: 'suspend' })
    })
    setUsers(users.map(u => u.id === userId ? { ...u, is_suspended: true } : u))
    if (selected?.id === userId) setSelected({ ...selected, is_suspended: true })
  }

  async function unsuspend(userId: string) {
    await fetch('/api/admin/user-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action: 'unsuspend' })
    })
    setUsers(users.map(u => u.id === userId ? { ...u, is_suspended: false } : u))
    if (selected?.id === userId) setSelected({ ...selected, is_suspended: false })
  }

  const filtered = users.filter(u => u.nickname?.toLowerCase().includes(search.toLowerCase()))

  const trustColor: Record<string, string> = {
    new: 'var(--t4)', active: 'var(--blue)', trusted: 'var(--grn)', top: '#D97706'
  }

  return (
    <div style={{ display: 'flex', gap: 16, position: 'relative' }}>
      {/* Users list */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Users</h1>
            <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>{users.length} users total</p>
          </div>
          <input
            type="text"
            placeholder="Search nickname..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ height: 36, padding: '0 12px', fontSize: '.8rem', color: 'var(--t1)', background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', outline: 'none', fontFamily: 'inherit', width: 200 }}
          />
        </div>

        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', overflow: 'hidden' }}>
          {filtered.map((user, i) => (
            <div
              key={user.id}
              onClick={() => setSelected(user)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--bd)' : 'none',
                cursor: 'pointer', transition: 'background .15s',
                background: selected?.id === user.id ? 'var(--blue-d)' : 'none'
              }}
              onMouseEnter={e => { if (selected?.id !== user.id) e.currentTarget.style.background = 'var(--bg)' }}
              onMouseLeave={e => { if (selected?.id !== user.id) e.currentTarget.style.background = 'none' }}
            >
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--blue-d)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={15} style={{ color: 'var(--blue)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '.8375rem', fontWeight: 600, color: 'var(--t1)' }}>{user.nickname}</p>
                <p style={{ fontSize: '.7rem', color: 'var(--t4)', fontFamily: 'monospace' }}>{user.gender} · {user.age_range}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {user.is_admin && <span style={{ fontSize: '.6rem', fontWeight: 700, color: 'var(--blue)', background: 'var(--blue-d)', padding: '2px 6px', borderRadius: 3 }}>ADMIN</span>}
                {user.is_suspended && <span style={{ fontSize: '.6rem', fontWeight: 700, color: 'var(--rose)', background: 'var(--rose-d)', padding: '2px 6px', borderRadius: 3 }}>SUSPENDED</span>}
                <span style={{ fontSize: '.6rem', fontWeight: 700, color: trustColor[user.trust_level] || 'var(--t4)', textTransform: 'uppercase' }}>{user.trust_level || 'new'}</span>
                <ChevronRight size={14} style={{ color: 'var(--t4)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div style={{ width: 280, background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '20px', height: 'fit-content', position: 'sticky', top: 76 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: '.9375rem', fontWeight: 700, color: 'var(--t1)' }}>User Details</h2>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t4)', display: 'flex' }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--bd)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--blue-d)', border: '2px solid var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} style={{ color: 'var(--blue)' }} />
            </div>
            <div>
              <p style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--t1)' }}>{selected.nickname}</p>
              <p style={{ fontSize: '.7rem', color: trustColor[selected.trust_level] || 'var(--t4)', fontWeight: 700, textTransform: 'uppercase' }}>{selected.trust_level || 'new'}</p>
            </div>
          </div>

          {[
            { label: 'Gender', value: selected.gender },
            { label: 'Age range', value: selected.age_range },
            { label: 'Rep score', value: selected.rep_score || 0 },
            { label: 'Joined', value: new Date(selected.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
            { label: 'Status', value: selected.is_suspended ? 'Suspended' : 'Active' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--bd)' }}>
              <span style={{ fontSize: '.78rem', color: 'var(--t3)' }}>{item.label}</span>
              <span style={{ fontSize: '.78rem', fontWeight: 600, color: item.label === 'Status' && selected.is_suspended ? 'var(--rose)' : 'var(--t1)', textTransform: 'capitalize' }}>{item.value}</span>
            </div>
          ))}

          {!selected.is_admin && (
            <button
              onClick={() => selected.is_suspended ? unsuspend(selected.id) : suspend(selected.id)}
              style={{
                width: '100%', marginTop: 16, padding: '9px',
                borderRadius: 'var(--r)', border: 'none',
                background: selected.is_suspended ? 'var(--grn)' : 'var(--rose)',
                color: '#fff', fontSize: '.8rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              {selected.is_suspended ? 'Unsuspend user' : 'Suspend user'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
