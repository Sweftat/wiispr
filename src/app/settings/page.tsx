'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [nickname, setNickname] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [ageSaved, setAgeSaved] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setUser(d.user)
          setNickname(d.user.nickname)
          setAgeRange(d.user.age_range || '')
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
    if (data.success) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  }

  async function saveAgeRange() {
    if (!ageRange) return
    const res = await fetch('/api/auth/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ageRange })
    })
    const data = await res.json()
    if (data.success) { setAgeSaved(true); setTimeout(() => setAgeSaved(false), 2000) }
  }

  async function deleteAccount() {
    setDeleting(true)
    await fetch('/api/auth/session', { method: 'DELETE' })
    router.push('/')
  }

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
      <div style={{ flex: 1, maxWidth: 480, margin: '0 auto', padding: '24px 20px', width: '100%' }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 24 }}>Settings</h1>

        {/* Nickname */}
        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '20px', marginBottom: 12 }}>
          <h2 style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>Nickname</h2>
          <p style={{ fontSize: '.8rem', color: 'var(--t3)', marginBottom: 14 }}>Your only public identity on wiispr.</p>
          <Input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
            style={{ paddingLeft: 14, marginBottom: 10 }}
          />
          <button onClick={saveNickname} disabled={nickname.length < 3 || loading} style={{
            padding: '8px 18px', borderRadius: 'var(--r)',
            background: saved ? 'var(--grn)' : nickname.length >= 3 ? 'var(--blue)' : 'var(--bd)',
            color: '#fff', border: 'none', cursor: 'pointer',
            fontSize: '.8rem', fontWeight: 600, fontFamily: 'inherit', transition: 'background .2s'
          }}>
            {saved ? 'Saved!' : loading ? 'Saving...' : 'Save nickname'}
          </button>
        </div>

        {/* Age range */}
        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '20px', marginBottom: 12 }}>
          <h2 style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>Age Range</h2>
          <p style={{ fontSize: '.8rem', color: 'var(--t3)', marginBottom: 14 }}>Update your age range if it has changed.</p>
          <select value={ageRange} onChange={e => setAgeRange(e.target.value)} style={{
            width: '100%', fontSize: '.875rem', color: 'var(--t1)',
            background: 'var(--bg)', border: '1px solid var(--bd)',
            borderRadius: 'var(--r)', padding: '9px 12px', outline: 'none',
            cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10
          }}>
            <option value="">Select age range</option>
            <option>15-17</option>
            <option>18-23</option>
            <option>24-30</option>
            <option>31-40</option>
            <option>41+</option>
          </select>
          <button onClick={saveAgeRange} disabled={!ageRange} style={{
            padding: '8px 18px', borderRadius: 'var(--r)',
            background: ageSaved ? 'var(--grn)' : ageRange ? 'var(--blue)' : 'var(--bd)',
            color: '#fff', border: 'none', cursor: ageRange ? 'pointer' : 'not-allowed',
            fontSize: '.8rem', fontWeight: 600, fontFamily: 'inherit', transition: 'background .2s'
          }}>
            {ageSaved ? 'Saved!' : 'Save age range'}
          </button>
        </div>

        {/* Account info */}
        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '20px', marginBottom: 12 }}>
          <h2 style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 14 }}>Account</h2>
          {[
            { label: 'Gender', value: user.gender },
            { label: 'Trust level', value: user.trust_level || 'new' },
            { label: 'Member since', value: new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--bd)' }}>
              <span style={{ fontSize: '.8rem', color: 'var(--t3)' }}>{item.label}</span>
              <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--t1)', textTransform: 'capitalize' }}>{item.value}</span>
            </div>
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
      <Footer />
    </main>
  )
}