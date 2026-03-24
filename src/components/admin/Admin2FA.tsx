'use client'
import { useState, useEffect } from 'react'
import { ShieldCheck, ShieldOff, Copy, Check } from 'lucide-react'

export default function Admin2FA() {
  const [status, setStatus] = useState<{ totp_enabled: boolean } | null>(null)
  const [phase, setPhase] = useState<'idle' | 'setup' | 'disable'>('idle')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [secret, setSecret] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(d => {
      if (d.user) setStatus({ totp_enabled: d.user.totp_enabled || false })
    })
  }, [])

  async function startSetup() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/2fa/setup', { method: 'POST' })
    const data = await res.json()
    setLoading(false)
    if (data.qrDataUrl) {
      setQrDataUrl(data.qrDataUrl)
      setSecret(data.secret)
      setPhase('setup')
    } else {
      setError(data.error || 'Failed to start setup')
    }
  }

  async function confirmSetup() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/2fa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      setStatus({ totp_enabled: true })
      setPhase('idle')
      setToken('')
    } else {
      setError(data.error || 'Invalid code')
    }
  }

  async function disable() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/2fa/disable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      setStatus({ totp_enabled: false })
      setPhase('idle')
      setToken('')
    } else {
      setError(data.error || 'Invalid code')
    }
  }

  function copySecret() {
    navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!status) return <div style={{ color: 'var(--t4)', fontSize: '.875rem' }}>Loading…</div>

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>Two-Factor Authentication</h2>
      <p style={{ fontSize: '.8rem', color: 'var(--t3)', marginBottom: 20 }}>Protect your admin account with an authenticator app (Google Authenticator, Authy, etc.)</p>

      <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: phase !== 'idle' ? 20 : 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: status.totp_enabled ? 'rgba(16,185,129,.12)' : 'var(--bg)',
            border: `1px solid ${status.totp_enabled ? '#10b981' : 'var(--bd)'}`,
          }}>
            {status.totp_enabled
              ? <ShieldCheck size={18} style={{ color: '#10b981' }} />
              : <ShieldOff size={18} style={{ color: 'var(--t4)' }} />
            }
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--t1)', marginBottom: 1 }}>
              {status.totp_enabled ? '2FA is enabled' : '2FA is not enabled'}
            </p>
            <p style={{ fontSize: '.75rem', color: 'var(--t3)' }}>
              {status.totp_enabled ? 'Your account requires a TOTP code on each admin login.' : 'Add an extra layer of security to your admin account.'}
            </p>
          </div>
          {phase === 'idle' && (
            <button
              onClick={() => { setError(''); setToken(''); setPhase(status.totp_enabled ? 'disable' : 'setup') }}
              style={{
                padding: '7px 14px', borderRadius: 'var(--r)',
                border: `1px solid ${status.totp_enabled ? 'var(--rose)' : 'var(--blue)'}`,
                background: 'none',
                color: status.totp_enabled ? 'var(--rose)' : 'var(--blue)',
                fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {status.totp_enabled ? 'Disable' : 'Enable'}
            </button>
          )}
        </div>

        {error && (
          <div style={{ background: 'var(--rose-d)', border: '1px solid var(--rose)', borderRadius: 'var(--r)', padding: '9px 12px', fontSize: '.8rem', color: 'var(--rose)', marginBottom: 14 }}>{error}</div>
        )}

        {phase === 'setup' && (
          <div>
            <p style={{ fontSize: '.8rem', color: 'var(--t3)', marginBottom: 14 }}>
              Scan this QR code with your authenticator app, then enter the 6-digit code to confirm.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="QR Code" style={{ width: 180, height: 180, borderRadius: 8, border: '1px solid var(--bd)' }} />
            </div>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', padding: '10px 12px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontFamily: 'monospace', fontSize: '.75rem', color: 'var(--t3)', wordBreak: 'break-all' }}>{secret}</span>
              <button onClick={copySecret} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--t4)', flexShrink: 0 }}>
                {copied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
              </button>
            </div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit code"
              value={token}
              onChange={e => setToken(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && token.length === 6 && confirmSetup()}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--r)', border: '1px solid var(--bd)', background: 'var(--bg)', color: 'var(--t1)', fontSize: '.875rem', outline: 'none', marginBottom: 10, fontFamily: 'monospace', letterSpacing: '.2em', textAlign: 'center', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setPhase('idle'); setToken(''); setError('') }} style={{ flex: 1, padding: '9px', borderRadius: 'var(--r)', border: '1px solid var(--bd)', background: 'none', color: 'var(--t3)', fontSize: '.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button
                onClick={confirmSetup}
                disabled={token.length !== 6 || loading}
                style={{ flex: 2, padding: '9px', borderRadius: 'var(--r)', border: 'none', background: token.length === 6 && !loading ? 'var(--blue)' : 'var(--bd)', color: '#fff', fontSize: '.8rem', fontWeight: 600, cursor: token.length === 6 && !loading ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}
              >
                {loading ? 'Verifying…' : 'Activate 2FA'}
              </button>
            </div>
          </div>
        )}

        {phase === 'disable' && (
          <div>
            <p style={{ fontSize: '.8rem', color: 'var(--t3)', marginBottom: 14 }}>
              Enter the current code from your authenticator app to disable 2FA.
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit code"
              value={token}
              onChange={e => setToken(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && token.length === 6 && disable()}
              autoFocus
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--r)', border: '1px solid var(--bd)', background: 'var(--bg)', color: 'var(--t1)', fontSize: '.875rem', outline: 'none', marginBottom: 10, fontFamily: 'monospace', letterSpacing: '.2em', textAlign: 'center', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setPhase('idle'); setToken(''); setError('') }} style={{ flex: 1, padding: '9px', borderRadius: 'var(--r)', border: '1px solid var(--bd)', background: 'none', color: 'var(--t3)', fontSize: '.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button
                onClick={disable}
                disabled={token.length !== 6 || loading}
                style={{ flex: 2, padding: '9px', borderRadius: 'var(--r)', border: 'none', background: token.length === 6 && !loading ? 'var(--rose)' : 'var(--bd)', color: '#fff', fontSize: '.8rem', fontWeight: 600, cursor: token.length === 6 && !loading ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}
              >
                {loading ? 'Disabling…' : 'Disable 2FA'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
