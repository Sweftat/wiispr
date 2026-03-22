'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setUser(d.user)
          setNickname(d.user.nickname)
        }
      })
  }, [])

  async function saveNickname() {
    if (nickname.length < 3) return
    setLoading(true)
    const res = await fetch('/api/auth/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname })
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function deleteAccount() {
    setDeleting(true)
    await fetch('/api/auth/session', { method: 'DELETE' })
    router.push('/')
  }

  if (!user) return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--t2)', fontSize: '.875rem' }}>Please <a href="/auth" style={{ color: 'var(--blue)' }}>sign in</a> to access settings.</p>
      </div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px' }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 24 }}>Settings</h1>

        {/* Nickname */}
        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '20px', marginBottom: 12 }}>
          <h2 style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>Nickname</h2>
          <p style={{ fontSize: '.8rem', color: 'var(--t3)', marginBottom: 14 }}>This is your only public identity on wiispr.</p>
          <Input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
            style={{ paddingLeft: 14, marginBottom: 10 }}
          />
          <button
            onClick={saveNickname}
            disabled={nickname.length < 3 || loading}
            style={{
              padding: '8px 18px', borderRadius: 'var(--r)',
              background: saved ? 'var(--grn)' : nickname.length >= 3 ? 'var(--blue)' : 'var(--bd)',
              color: '#fff', border: 'none', cursor: 'pointer',
              fontSize: '.8rem', fontWeight: 600, fontFamily: 'inherit',
              transition: 'background .2s'
            }}
          >
            {saved ? 'Saved!' : loading ? 'Saving...' : 'Save nickname'}
          </button>
        </div>

        {/* Account info */}
        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '20px', marginBottom: 12 }}>
          <h2 style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 14 }}>Account</h2>
          {[
            { label: 'Age range', value: user.age_range },
            { label: 'Gender', value: user.gender },
            { label: 'Trust level', value: user.trust_level || 'new' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--bd)' }}>
              <span style={{ fontSize: '.8rem', color: 'var(--t3)' }}>{item.label}</span>
              <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--t1)', textTransform: 'capitalize' }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Legal links */}
        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '20px', marginBottom: 12 }}>
          <h2 style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 14 }}>Legal</h2>
          {[
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Community Rules', href: '/rules' },
            { label: 'About wiispr', href: '/about' },
          ].map(item => (
            <a key={item.label} href={item.href} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--bd)', textDecoration: 'none', color: 'var(--t2)', fontSize: '.8rem' }}>
              {item.label}
              <span style={{ color: 'var(--t4)' }}>→</span>
            </a>
          ))}
        </div>

        {/* Danger zone */}
        <div style={{ background: 'var(--sur)', border: '1px solid var(--rose)', borderRadius: 'var(--rm)', padding: '20px' }}>
          <h2 style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--rose)', marginBottom: 4 }}>Danger Zone</h2>
          <p style={{ fontSize: '.8rem', color: 'var(--t3)', marginBottom: 14 }}>Deleting your account is permanent and cannot be undone.</p>
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} style={{ padding: '8px 18px', borderRadius: 'var(--r)', background: 'none', border: '1px solid var(--rose)', color: 'var(--rose)', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Delete account
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={deleteAccount} disabled={deleting} style={{ padding: '8px 18px', borderRadius: 'var(--r)', background: 'var(--rose)', border: 'none', color: '#fff', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                {deleting ? 'Deleting...' : 'Yes, delete'}
              </button>
              <button onClick={() => setConfirmDelete(false)} style={{ padding: '8px 18px', borderRadius: 'var(--r)', background: 'none', border: '1px solid var(--bd)', color: 'var(--t2)', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}