'use client'
import { useState } from 'react'
import { User, X, Monitor, Smartphone, Globe, Clock, EyeOff, StickyNote, Check } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

const trustColor: Record<string, string> = {
  new: 'var(--t4)', active: 'var(--blue)', trusted: 'var(--grn)', top: '#D97706'
}

export default function AdminUsers({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [selected, setSelected] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [sessions, setSessions] = useState<any[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [notesSaving, setNotesSaving] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set())
  const [bulkMode, setBulkMode] = useState(false)

  async function loadSessions(userId: string) {
    setSessionsLoading(true)
    setSessions([])
    const res = await fetch('/api/admin/user-sessions?userId=' + userId)
    const data = await res.json()
    setSessions(data.sessions || [])
    setSessionsLoading(false)
  }

  async function selectUser(user: any) {
    if (bulkMode) {
      toggleBulkSelect(user.id)
      return
    }
    setSelected(user)
    setAdminNotes(user.admin_notes || '')
    setNotesSaved(false)
    loadSessions(user.id)
  }

  function toggleBulkSelect(userId: string) {
    setBulkSelected(prev => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  async function doAction(userId: string, action: string, extra?: Record<string, any>) {
    await fetch('/api/admin/user-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action, ...extra })
    })
  }

  async function suspend(userId: string) {
    await doAction(userId, 'suspend')
    setUsers(users.map(u => u.id === userId ? { ...u, is_suspended: true } : u))
    if (selected?.id === userId) setSelected((s: any) => ({ ...s, is_suspended: true }))
  }

  async function unsuspend(userId: string) {
    await doAction(userId, 'unsuspend')
    setUsers(users.map(u => u.id === userId ? { ...u, is_suspended: false } : u))
    if (selected?.id === userId) setSelected((s: any) => ({ ...s, is_suspended: false }))
  }

  async function shadowban(userId: string) {
    await doAction(userId, 'shadowban')
    setUsers(users.map(u => u.id === userId ? { ...u, is_shadowbanned: true } : u))
    if (selected?.id === userId) setSelected((s: any) => ({ ...s, is_shadowbanned: true }))
  }

  async function unshadowban(userId: string) {
    await doAction(userId, 'unshadowban')
    setUsers(users.map(u => u.id === userId ? { ...u, is_shadowbanned: false } : u))
    if (selected?.id === userId) setSelected((s: any) => ({ ...s, is_shadowbanned: false }))
  }

  async function setTrust(userId: string, trustLevel: string) {
    await doAction(userId, 'set_trust', { trustLevel })
    setUsers(users.map(u => u.id === userId ? { ...u, trust_level: trustLevel } : u))
    if (selected?.id === userId) setSelected((s: any) => ({ ...s, trust_level: trustLevel }))
  }

  async function saveNotes() {
    if (!selected) return
    setNotesSaving(true)
    await doAction(selected.id, 'set_admin_notes', { notes: adminNotes })
    setUsers(users.map(u => u.id === selected.id ? { ...u, admin_notes: adminNotes } : u))
    setSelected((s: any) => ({ ...s, admin_notes: adminNotes }))
    setNotesSaving(false)
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2000)
  }

  // Bulk actions
  async function bulkSuspend() {
    for (const id of bulkSelected) { await doAction(id, 'suspend') }
    setUsers(users.map(u => bulkSelected.has(u.id) ? { ...u, is_suspended: true } : u))
    setBulkSelected(new Set())
    setBulkMode(false)
  }

  async function bulkUnsuspend() {
    for (const id of bulkSelected) { await doAction(id, 'unsuspend') }
    setUsers(users.map(u => bulkSelected.has(u.id) ? { ...u, is_suspended: false } : u))
    setBulkSelected(new Set())
    setBulkMode(false)
  }

  async function bulkShadowban() {
    for (const id of bulkSelected) { await doAction(id, 'shadowban') }
    setUsers(users.map(u => bulkSelected.has(u.id) ? { ...u, is_shadowbanned: true } : u))
    setBulkSelected(new Set())
    setBulkMode(false)
  }

  const filtered = users.filter(u => u.nickname?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {/* List */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 10 }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Users</h1>
            <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>{users.length} users total</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => { setBulkMode(!bulkMode); setBulkSelected(new Set()) }}
              style={{
                padding: '7px 14px', borderRadius: 'var(--r)',
                border: `1px solid ${bulkMode ? 'var(--blue)' : 'var(--bd)'}`,
                background: bulkMode ? 'var(--blue-d)' : 'none',
                color: bulkMode ? 'var(--blue)' : 'var(--t3)',
                fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {bulkMode ? `${bulkSelected.size} selected` : 'Bulk select'}
            </button>
            <input type="text" placeholder="Search nickname..." value={search} onChange={e => setSearch(e.target.value)} style={{ height: 36, padding: '0 12px', fontSize: '.8rem', color: 'var(--t1)', background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', outline: 'none', fontFamily: 'inherit', width: 200 }} />
          </div>
        </div>

        {/* Bulk actions bar */}
        {bulkMode && bulkSelected.size > 0 && (
          <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', padding: '10px 14px', marginBottom: 10, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '.75rem', color: 'var(--t2)', fontWeight: 600 }}>{bulkSelected.size} selected:</span>
            <button onClick={bulkSuspend} style={{ padding: '5px 12px', borderRadius: 'var(--rs)', border: 'none', background: 'var(--rose)', color: '#fff', fontSize: '.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Suspend all</button>
            <button onClick={bulkUnsuspend} style={{ padding: '5px 12px', borderRadius: 'var(--rs)', border: 'none', background: 'var(--grn)', color: '#fff', fontSize: '.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Unsuspend all</button>
            <button onClick={bulkShadowban} style={{ padding: '5px 12px', borderRadius: 'var(--rs)', border: 'none', background: '#7C3AED', color: '#fff', fontSize: '.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Shadowban all</button>
            <button onClick={() => { setBulkSelected(new Set()); setBulkMode(false) }} style={{ padding: '5px 12px', borderRadius: 'var(--rs)', border: '1px solid var(--bd)', background: 'none', color: 'var(--t3)', fontSize: '.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          </div>
        )}

        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: bulkMode ? '30px 1fr 80px 80px 80px 100px' : '1fr 80px 80px 80px 100px', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--bd)', background: 'var(--bg)' }}>
            {bulkMode && <span />}
            {['User', 'Gender', 'Trust', 'Status', 'Joined'].map(h => (
              <p key={h} style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</p>
            ))}
          </div>
          {filtered.map((user, i) => (
            <div key={user.id} onClick={() => selectUser(user)} style={{ display: 'grid', gridTemplateColumns: bulkMode ? '30px 1fr 80px 80px 80px 100px' : '1fr 80px 80px 80px 100px', gap: 12, padding: '11px 16px', borderBottom: i < filtered.length - 1 ? '1px solid var(--bd)' : 'none', cursor: 'pointer', background: selected?.id === user.id ? 'var(--blue-d)' : bulkSelected.has(user.id) ? 'var(--blue-d)' : 'none', transition: 'background .12s' }}
              onMouseEnter={e => { if (selected?.id !== user.id && !bulkSelected.has(user.id)) e.currentTarget.style.background = 'var(--bg)' }}
              onMouseLeave={e => { if (selected?.id !== user.id && !bulkSelected.has(user.id)) e.currentTarget.style.background = 'none' }}
            >
              {bulkMode && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 16, height: 16, borderRadius: 3, border: '1.5px solid var(--bd)', background: bulkSelected.has(user.id) ? 'var(--blue)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {bulkSelected.has(user.id) && <Check size={10} style={{ color: '#fff' }} />}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--blue-d)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={13} style={{ color: 'var(--blue)' }} />
                </div>
                <div>
                  <p style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--t1)' }}>{user.nickname}</p>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {user.is_admin && <span style={{ fontSize: '.6rem', fontWeight: 700, color: 'var(--blue)', background: 'var(--blue-d)', padding: '1px 5px', borderRadius: 3 }}>ADMIN</span>}
                    {user.is_shadowbanned && <span style={{ fontSize: '.6rem', fontWeight: 700, color: '#7C3AED', background: '#F5F3FF', padding: '1px 5px', borderRadius: 3 }}>SHADOW</span>}
                  </div>
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
      {selected && !bulkMode && (
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
              { label: 'Status', value: selected.is_suspended ? 'Suspended' : selected.is_shadowbanned ? 'Shadowbanned' : 'Active' },
              { label: 'Streak', value: `${selected.streak_days || 0} days` },
              { label: 'Joined', value: new Date(selected.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--bd)' }}>
                <span style={{ fontSize: '.78rem', color: 'var(--t3)' }}>{item.label}</span>
                <span style={{ fontSize: '.78rem', fontWeight: 600, color: item.label === 'Status' && (selected.is_suspended || selected.is_shadowbanned) ? 'var(--rose)' : 'var(--t1)', textTransform: 'capitalize' }}>{item.value}</span>
              </div>
            ))}

            {/* Admin notes */}
            <div style={{ marginTop: 14 }}>
              <p style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <StickyNote size={11} /> Admin Notes
              </p>
              <textarea
                value={adminNotes}
                onChange={e => { setAdminNotes(e.target.value); setNotesSaved(false) }}
                onBlur={saveNotes}
                placeholder="Private notes about this user..."
                rows={3}
                style={{
                  width: '100%', padding: '8px 10px', fontSize: '.78rem', color: 'var(--t1)',
                  background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--rs)',
                  outline: 'none', fontFamily: 'inherit', resize: 'none', marginBottom: 6,
                }}
              />
              <span style={{ fontSize: '.68rem', color: notesSaved ? 'var(--grn)' : notesSaving ? 'var(--t4)' : 'var(--t4)', fontWeight: 500, transition: 'color .2s' }}>
                {notesSaved ? '✓ Saved' : notesSaving ? 'Saving...' : 'Auto-saves on blur'}
              </span>
            </div>

            {/* Sessions */}
            <div style={{ marginTop: 14 }}>
              <p style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Recent Sessions</p>
              {sessionsLoading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[1, 2].map(i => (
                    <div key={i} style={{ background: 'var(--bg)', borderRadius: 'var(--rs)', padding: '8px 10px', opacity: 0.5 }}>
                      <div style={{ width: '60%', height: 10, borderRadius: 3, background: 'var(--bd)', marginBottom: 6 }} />
                      <div style={{ width: '40%', height: 10, borderRadius: 3, background: 'var(--bd)', marginBottom: 4 }} />
                      <div style={{ width: '50%', height: 9, borderRadius: 3, background: 'var(--bd)' }} />
                    </div>
                  ))}
                </div>
              )}
              {!sessionsLoading && sessions.length === 0 && (
                <p style={{ fontSize: '.78rem', color: 'var(--t4)', fontStyle: 'italic' }}>No sessions recorded.</p>
              )}
              {!sessionsLoading && sessions.map((s, i) => {
                const isMobile = /mobile|android|iphone|ipad/i.test(s.device || '')
                const location = [s.city, s.country].filter(Boolean).join(', ') || 'Unknown location'
                const deviceLabel = [s.device, s.browser].filter(Boolean).join(' · ') || 'Unknown device'
                const loginTime = s.created_at
                  ? new Date(s.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : '—'
                return (
                  <div key={i} style={{ background: 'var(--bg)', borderRadius: 'var(--rs)', padding: '9px 11px', marginBottom: 6, border: '1px solid var(--bd)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      {isMobile
                        ? <Smartphone size={11} style={{ color: 'var(--blue)', flexShrink: 0 }} />
                        : <Monitor size={11} style={{ color: 'var(--t4)', flexShrink: 0 }} />
                      }
                      <span style={{ fontSize: '.75rem', color: 'var(--t1)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{deviceLabel}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Globe size={11} style={{ color: 'var(--t4)', flexShrink: 0 }} />
                      <span style={{ fontSize: '.75rem', color: 'var(--t2)' }}>{location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={11} style={{ color: 'var(--t4)', flexShrink: 0 }} />
                      <span style={{ fontSize: '.7rem', color: 'var(--t4)', fontFamily: 'monospace' }}>{loginTime}</span>
                    </div>
                  </div>
                )
              })}
            </div>

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

            {/* Action buttons */}
            {!selected.is_admin && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14 }}>
                <button onClick={() => selected.is_suspended ? unsuspend(selected.id) : suspend(selected.id)} style={{ width: '100%', padding: '9px', borderRadius: 'var(--r)', border: 'none', background: selected.is_suspended ? 'var(--grn)' : 'var(--rose)', color: '#fff', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {selected.is_suspended ? 'Unsuspend user' : 'Suspend user'}
                </button>
                <button onClick={() => selected.is_shadowbanned ? unshadowban(selected.id) : shadowban(selected.id)} style={{
                  width: '100%', padding: '9px', borderRadius: 'var(--r)',
                  border: `1px solid ${selected.is_shadowbanned ? 'var(--grn)' : '#7C3AED'}`,
                  background: 'none',
                  color: selected.is_shadowbanned ? 'var(--grn)' : '#7C3AED',
                  fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <EyeOff size={13} />
                  {selected.is_shadowbanned ? 'Remove shadowban' : 'Shadowban'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
