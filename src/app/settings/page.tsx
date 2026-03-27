'use client'
import { useState, useEffect, useRef } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { useRouter } from 'next/navigation'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Ghost, AlertTriangle } from 'lucide-react'

function NicknameDrawer({ open, onClose, currentNickname, onSaved }: { open: boolean, onClose: () => void, currentNickname: string, onSaved: (v: string) => void }) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkStatus, setCheckStatus] = useState<'idle'|'checking'|'available'|'taken'>('idle')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (open) { setValue(''); setCheckStatus('idle'); setTimeout(() => inputRef.current?.focus(), 100) } }, [open])

  useEffect(() => {
    if (value.length < 3 || value === currentNickname) { setCheckStatus('idle'); return }
    setCheckStatus('checking')
    const timer = setTimeout(() => {
      fetch('/api/auth/session?checkNickname=' + encodeURIComponent(value))
        .then(r => r.json())
        .then(d => setCheckStatus(d.available ? 'available' : 'taken'))
        .catch(() => setCheckStatus('idle'))
    }, 600)
    return () => clearTimeout(timer)
  }, [value, currentNickname])

  async function save() {
    if (value.length < 3 || value === currentNickname || checkStatus === 'taken') return
    setLoading(true)
    const res = await fetch('/api/auth/session', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nickname: value }) })
    setLoading(false)
    if (res.ok) { toast.success('Nickname updated!'); onSaved(value); onClose() }
    else if (res.status === 409) setCheckStatus('taken')
    else toast.error('Something went wrong')
  }

  const canSave = value.length >= 3 && value !== currentNickname && checkStatus !== 'taken' && !loading
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(4px)', zIndex: 400 }} />
          <motion.div
            initial={isMobile ? { y: '100%' } : { x: '100%' }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: '100%' } : { x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            style={isMobile ? {
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 401,
              background: 'var(--sur)', borderTop: '1px solid var(--bd)',
              borderRadius: '16px 16px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,.15)',
              maxHeight: '90vh', overflowY: 'auto',
            } : {
              position: 'fixed', top: 0, right: 0, bottom: 0, width: 360, zIndex: 401,
              background: 'var(--sur)', borderLeft: '1px solid var(--bd)',
              boxShadow: '-8px 0 40px rgba(0,0,0,.15)',
            }}
          >
            {isMobile && <div style={{ width: 36, height: 4, background: 'var(--bd)', borderRadius: 9999, margin: '12px auto 4px' }} />}
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--bd)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--t3)' }}><X size={14} /></button>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)' }}>Edit Nickname</span>
              </div>

              <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>New nickname</label>
              <input ref={inputRef} value={value} onChange={e => setValue(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 30))} maxLength={30}
                style={{
                  width: '100%', height: 44, fontSize: '.9375rem', fontWeight: 600, color: 'var(--t1)',
                  background: 'var(--bg)', border: `1.5px solid ${checkStatus === 'taken' ? 'var(--rose)' : checkStatus === 'available' ? 'var(--grn)' : 'var(--bd)'}`,
                  borderRadius: 'var(--r)', padding: '0 14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                }} />
              <div style={{ textAlign: 'right', fontSize: '.65rem', fontFamily: 'monospace', color: value.length >= 27 ? 'var(--rose)' : 'var(--t4)', marginTop: 4 }}>{30 - value.length}</div>

              {value.length > 0 && value.length < 3 && <span style={{ fontSize: '.72rem', color: 'var(--rose)', display: 'block', marginTop: 4 }}>At least 3 characters required</span>}
              {checkStatus === 'checking' && <span style={{ fontSize: '.72rem', color: 'var(--t4)', display: 'block', marginTop: 4 }}>Checking availability…</span>}
              {checkStatus === 'available' && <span style={{ fontSize: '.72rem', color: 'var(--grn)', display: 'block', marginTop: 4 }}>✓ Available</span>}
              {checkStatus === 'taken' && <span style={{ fontSize: '.72rem', color: 'var(--rose)', display: 'block', marginTop: 4 }}>✗ Already taken — try another</span>}

              <div style={{ marginTop: 14, background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--rs)', padding: '10px 14px' }}>
                <span style={{ fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', display: 'block', marginBottom: 4 }}>Preview</span>
                <span style={{ fontSize: '.8rem', color: 'var(--t3)' }}>wiispr · <span style={{ fontWeight: 700, color: value ? 'var(--blue)' : 'var(--t4)' }}>{value || currentNickname}</span></span>
              </div>

              <div style={{ marginTop: 12, display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', background: '#FFFBEB', border: '1px solid rgba(217,119,6,.2)', borderRadius: 'var(--rs)' }}>
                <AlertTriangle size={14} style={{ color: '#D97706', flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: '.72rem', color: '#92400E', lineHeight: 1.5 }}>Changing your nickname affects how others see you across wiispr.</span>
              </div>

              <button onClick={save} disabled={!canSave} style={{
                width: '100%', height: 44, marginTop: 20, fontSize: '.875rem', fontWeight: 700,
                borderRadius: 'var(--r)', border: 'none', cursor: canSave ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit', background: canSave ? 'var(--blue)' : 'var(--bd)', color: canSave ? '#fff' : 'var(--t4)',
                transition: 'all .15s',
              }}>{loading ? 'Saving…' : 'Save nickname'}</button>
              <button onClick={onClose} style={{ display: 'block', textAlign: 'center', marginTop: 12, width: '100%', fontSize: '.8rem', color: 'var(--t3)', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' }}>Cancel</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [nickname, setNickname] = useState('')
  const [nicknameDrawerOpen, setNicknameDrawerOpen] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState({ follows: true, upvotes: true, milestones: true, replies: true })
  const [savedNotif, setSavedNotif] = useState(false)
  const [follows, setFollows] = useState<string[]>([])
  const [followsLoaded, setFollowsLoaded] = useState(false)
  const [deleteText, setDeleteText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(localStorage.getItem('theme') === 'dark')
    fetch('/api/profile').then(r => r.json()).then(d => {
      if (d.user) {
        setUser(d.user)
        setNickname(d.user.nickname)
        if (d.user.notification_prefs) setNotifPrefs(d.user.notification_prefs)
        fetch('/api/follows').then(r => r.json()).then(f => { setFollows(f.follows || f.following?.map((x: any) => x.ghost_id) || []); setFollowsLoaded(true) }).catch(() => setFollowsLoaded(true))
      }
    })
    // Check push status
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(reg => reg.pushManager.getSubscription()).then(sub => { if (sub) setPushEnabled(true) }).catch(() => {})
    }
  }, [])

  function toggleTheme() {
    const isDark = !dark
    setDark(isDark)
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }

  async function deleteAccount() {
    setDeleting(true)
    await fetch('/api/auth/session', { method: 'DELETE' })
    router.push('/')
  }

  const sectionLabel: React.CSSProperties = { fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--t4)', marginBottom: 6 }
  const card: React.CSSProperties = { background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: 20 }
  const row: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--bd)' }
  const rowLast: React.CSSProperties = { ...row, borderBottom: 'none' }

  if (!user) return (
    <main style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div style={{ flex: 1, maxWidth: 480, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--t2)', fontSize: '.875rem' }}>Please <a href="/auth" style={{ color: 'var(--blue)' }}>sign in</a> to access settings.</p>
      </div>
      <Footer />
    </main>
  )

  return (
    <main style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div style={{ flex: 1, maxWidth: 640, margin: '0 auto', padding: '24px 20px', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div style={{ marginBottom: 8 }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--t1)', letterSpacing: '-.02em' }}>Settings</h1>
          <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>Manage your account and preferences</p>
        </div>

        {/* Profile */}
        <div><div style={sectionLabel}>Profile</div>
          <div style={card}>
            <div style={row}>
              <div><p style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--t1)' }}>Nickname</p><p style={{ fontSize: '.72rem', color: 'var(--t4)', fontFamily: 'monospace' }}>{nickname}</p></div>
              <button onClick={() => setNicknameDrawerOpen(true)} style={{ fontSize: '.75rem', fontWeight: 600, padding: '5px 16px', borderRadius: 9999, border: '1px solid var(--bd)', color: 'var(--t2)', background: 'var(--sur)', cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
            </div>
            <div style={row}>
              <div><p style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--t1)' }}>Age Range</p></div>
              <select value={user.age_range || ''} onChange={async e => {
                await fetch('/api/auth/session', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ageRange: e.target.value }) })
                toast.success('Saved ✓')
              }} style={{ fontSize: '.8rem', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--rs)', padding: '4px 8px', color: 'var(--t1)', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                <option value="">Select...</option><option>15-17</option><option>18-23</option><option>24-30</option><option>31-40</option><option>41+</option>
              </select>
            </div>
            <div style={row}><span style={{ fontSize: '.875rem', color: 'var(--t1)' }}>Gender</span><span style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--t1)', textTransform: 'capitalize' }}>{user.gender}</span></div>
            <div style={row}><span style={{ fontSize: '.875rem', color: 'var(--t1)' }}>Trust Level</span>
              <span style={{ fontSize: '.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 9999, textTransform: 'uppercase',
                color: user.trust_level === 'top' ? '#D97706' : user.trust_level === 'trusted' ? 'var(--grn)' : user.trust_level === 'active' ? 'var(--blue)' : 'var(--t3)',
                background: user.trust_level === 'top' ? '#FFFBEB' : user.trust_level === 'trusted' ? 'var(--grn-d)' : user.trust_level === 'active' ? 'var(--blue-d)' : 'var(--bg)',
              }}>{user.trust_level || 'new'}</span>
            </div>
            <div style={rowLast}><span style={{ fontSize: '.875rem', color: 'var(--t1)' }}>Member since</span><span style={{ fontSize: '.8rem', color: 'var(--t2)' }}>{new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span></div>
          </div>
        </div>

        {/* Appearance */}
        <div><div style={sectionLabel}>Appearance</div>
          <div style={card}>
            <div style={row}>
              <div><p style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--t1)' }}>Theme</p><p style={{ fontSize: '.72rem', color: 'var(--t4)' }}>Light or dark mode</p></div>
              <button onClick={toggleTheme} style={{ width: 76, height: 28, borderRadius: 99, background: 'var(--bd)', border: 'none', display: 'flex', alignItems: 'center', position: 'relative', cursor: 'pointer', padding: 3, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                <motion.div layout transition={{ type: 'spring', stiffness: 400, damping: 30 }} style={{ width: 34, height: 22, borderRadius: 99, background: dark ? 'var(--sur)' : '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.18)', position: 'absolute', left: dark ? 39 : 3, top: 3 }} />
                <span style={{ flex: 1, textAlign: 'center', fontSize: '.68rem', fontWeight: 600, color: !dark ? 'var(--t1)' : 'var(--t4)', zIndex: 1, userSelect: 'none' }}>Light</span>
                <span style={{ flex: 1, textAlign: 'center', fontSize: '.68rem', fontWeight: 600, color: dark ? 'var(--t1)' : 'var(--t4)', zIndex: 1, userSelect: 'none' }}>Dark</span>
              </button>
            </div>
            <div style={rowLast}>
              <div><p style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--t1)' }}>Language</p></div>
              <select defaultValue={typeof window !== 'undefined' ? localStorage.getItem('wiispr_lang') || 'en' : 'en'} onChange={e => localStorage.setItem('wiispr_lang', e.target.value)} style={{ fontSize: '.8rem', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--rs)', padding: '4px 8px', color: 'var(--t1)', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                <option value="en">English</option><option value="ar">العربية</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div><div style={sectionLabel}>Notifications</div>
          <div style={card}>
            <p style={{ fontSize: '.75rem', color: 'var(--t3)', marginBottom: 14 }}>Choose what you get notified about</p>
            {([
              { key: 'follows', label: 'New followers', desc: 'When someone follows your Ghost ID' },
              { key: 'upvotes', label: 'Upvotes on your posts', desc: 'When your post gets upvoted' },
              { key: 'milestones', label: 'Milestones', desc: 'When your post hits 10, 50, or 100 upvotes' },
              { key: 'replies', label: 'Replies to your posts', desc: 'When someone replies to your post' },
            ] as const).map((item, i, arr) => (
              <div key={item.key} style={i === arr.length - 1 ? rowLast : row}>
                <div><p style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--t1)' }}>{item.label}</p><p style={{ fontSize: '.72rem', color: 'var(--t4)' }}>{item.desc}</p></div>
                <Switch checked={notifPrefs[item.key]} onCheckedChange={async v => {
                  const updated = { ...notifPrefs, [item.key]: v }; setNotifPrefs(updated)
                  await fetch('/api/notification-prefs', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prefs: updated }) })
                  setSavedNotif(true); setTimeout(() => setSavedNotif(false), 1500)
                }} />
              </div>
            ))}
            {savedNotif && <span style={{ fontSize: '.7rem', color: 'var(--grn)', display: 'block', marginTop: 8 }}>Saved ✓</span>}
          </div>
        </div>

        {/* Push */}
        <div><div style={sectionLabel}>Push Notifications</div>
          <div style={card}>
            <p style={{ fontSize: '.75rem', color: 'var(--t3)', marginBottom: 14 }}>Get notified even when wiispr is closed</p>
            {pushEnabled ? (
              <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--grn)' }}>✓ Push notifications enabled</span>
            ) : (
              <button onClick={async () => {
                try {
                  const reg = await navigator.serviceWorker.register('/sw.js')
                  const permission = await Notification.requestPermission()
                  if (permission !== 'granted') { toast.error('Permission denied'); return }
                  const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '' })
                  await fetch('/api/notifications/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscription: sub.toJSON() }) })
                  setPushEnabled(true); toast.success('Push notifications enabled!')
                } catch { toast.error('Could not enable notifications') }
              }} style={{ padding: '8px 18px', borderRadius: 'var(--r)', background: 'var(--blue)', color: '#fff', border: 'none', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Enable push notifications</button>
            )}
          </div>
        </div>

        {/* Privacy */}
        <div><div style={sectionLabel}>Privacy</div>
          <div style={card}>
            {[
              { label: 'Ghost ID per post', chip: 'Always on', green: true },
              { label: 'Email storage', chip: 'SHA-256 hashed', green: true },
              { label: 'IP logging', chip: '90 day TTL', green: false },
            ].map((item, i, arr) => (
              <div key={item.label} style={i === arr.length - 1 ? rowLast : row}>
                <span style={{ fontSize: '.875rem', color: 'var(--t1)' }}>{item.label}</span>
                <span style={{ fontSize: '.7rem', fontWeight: 600, padding: '2px 9px', borderRadius: 9999, color: item.green ? 'var(--grn)' : 'var(--t3)', background: item.green ? 'var(--grn-d)' : 'var(--bg)', border: item.green ? 'none' : '1px solid var(--bd)' }}>{item.chip}</span>
              </div>
            ))}
            <button onClick={() => toast('Your data export will be sent to your email')} style={{ border: '1px solid var(--bd)', color: 'var(--t2)', background: 'none', padding: '7px 16px', borderRadius: 'var(--r)', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', marginTop: 14, fontFamily: 'inherit' }}>Export my data</button>
          </div>
        </div>

        {/* Following */}
        <div><div style={sectionLabel}>Following</div>
          <div style={card}>
            {!followsLoaded ? <p style={{ fontSize: '.8rem', color: 'var(--t4)' }}>Loading...</p> :
             follows.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Ghost size={24} style={{ color: 'var(--t4)', opacity: 0.4, margin: '0 auto 8px' }} />
                <p style={{ fontSize: '.8rem', color: 'var(--t4)' }}>You&apos;re not following anyone yet</p>
              </div>
            ) : (
              <AnimatePresence>
                {follows.map(ghostId => (
                  <motion.div key={ghostId} exit={{ opacity: 0, height: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--bd)' }}>
                    <Ghost size={12} style={{ color: 'var(--t4)' }} />
                    <span style={{ fontFamily: 'monospace', fontSize: '.8rem', color: 'var(--t2)', flex: 1 }}>{ghostId}</span>
                    <button onClick={async () => {
                      setFollows(follows.filter(f => f !== ghostId))
                      await fetch('/api/follows', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ghostId }) })
                    }} style={{ fontSize: '.7rem', fontWeight: 500, color: 'var(--rose)', border: '1px solid rgba(225,29,72,.2)', background: 'var(--rose-d)', borderRadius: 'var(--rs)', padding: '3px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>Unfollow</button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div><div style={sectionLabel}>Danger Zone</div>
          <div style={{ ...card, border: '1px solid rgba(225,29,72,.25)', background: 'rgba(225,29,72,.03)' }}>
            <p style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--rose)', marginBottom: 6 }}>Danger Zone</p>
            <p style={{ fontSize: '.8rem', color: 'var(--t2)', lineHeight: 1.6, marginBottom: 14 }}>This is permanent. All your posts and data will be removed.</p>
            <input type="text" value={deleteText} onChange={e => setDeleteText(e.target.value)}
              placeholder='Type "delete my account" to confirm'
              style={{ width: '100%', fontSize: '.875rem', color: 'var(--t1)', background: 'var(--sur)', border: '1px solid rgba(225,29,72,.25)', borderRadius: 'var(--r)', padding: '9px 12px', outline: 'none', marginBottom: 10, fontFamily: 'inherit', boxSizing: 'border-box' }} />
            <button onClick={deleteAccount} disabled={deleteText !== 'delete my account' || deleting} style={{
              width: '100%', padding: 9, borderRadius: 'var(--r)', fontSize: '.875rem', fontWeight: 600,
              border: 'none', cursor: deleteText === 'delete my account' ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit', transition: 'background .2s',
              background: deleteText === 'delete my account' ? 'var(--rose)' : 'var(--bd)',
              color: deleteText === 'delete my account' ? '#fff' : 'var(--t4)',
            }}>{deleting ? 'Deleting...' : 'Delete my account'}</button>
          </div>
        </div>
      </div>
      <Footer />
      <NicknameDrawer open={nicknameDrawerOpen} onClose={() => setNicknameDrawerOpen(false)} currentNickname={nickname} onSaved={v => setNickname(v)} />
    </main>
  )
}
