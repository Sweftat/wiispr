'use client'
import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'

export default function Admin2FAPage() {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function verify() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/2fa/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      window.location.href = '/admin'
    } else {
      setError(data.error || 'Invalid code')
      setToken('')
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, background: 'var(--blue-d)', border: '1px solid var(--blue)', borderRadius: '50%', marginBottom: 14 }}>
            <ShieldCheck size={22} style={{ color: 'var(--blue)' }} />
          </div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>Two-factor authentication</h1>
          <p style={{ fontSize: '.8125rem', color: 'var(--t3)' }}>Enter the 6-digit code from your authenticator app.</p>
        </div>

        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '24px' }}>
          {error && (
            <div style={{ background: 'var(--rose-d)', border: '1px solid var(--rose)', borderRadius: 'var(--r)', padding: '10px 12px', fontSize: '.8rem', color: 'var(--rose)', marginBottom: 16 }}>{error}</div>
          )}
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={token}
            onChange={e => setToken(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => e.key === 'Enter' && token.length === 6 && verify()}
            autoFocus
            style={{
              width: '100%', textAlign: 'center', fontSize: '1.75rem', letterSpacing: '.4em',
              fontFamily: 'monospace', padding: '12px', borderRadius: 'var(--r)',
              border: '1px solid var(--bd)', background: 'var(--bg)', color: 'var(--t1)',
              outline: 'none', marginBottom: 14, boxSizing: 'border-box',
            }}
          />
          <button
            onClick={verify}
            disabled={token.length !== 6 || loading}
            style={{
              width: '100%', padding: '11px', borderRadius: 'var(--r)',
              background: token.length === 6 && !loading ? 'var(--blue)' : 'var(--bd)',
              color: '#fff', border: 'none',
              cursor: token.length === 6 && !loading ? 'pointer' : 'not-allowed',
              fontSize: '.875rem', fontWeight: 600, fontFamily: 'inherit',
            }}
          >
            {loading ? 'Verifying…' : 'Verify'}
          </button>
        </div>
      </div>
    </main>
  )
}
