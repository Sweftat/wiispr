'use client'
import { useState } from 'react'
import Nav from '@/components/Nav'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [code, setCode] = useState('')
  const [nickname, setNickname] = useState('')
  const [gender, setGender] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function sendOTP() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) setStep(2)
    else setError(data.error || 'Something went wrong')
  }

  async function verifyOTP() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) setStep(3)
    else setError(data.error || 'Invalid code')
  }

  async function createAccount() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/create-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, nickname, gender, ageRange })
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) router.push('/')
    else setError(data.error || 'Something went wrong')
  }

  const inputStyle = {
    width: '100%', fontSize: '.875rem', color: 'var(--t1)',
    background: 'var(--bg)', border: '1px solid var(--bd)',
    borderRadius: 'var(--r)', padding: '10px 12px', outline: 'none',
    fontFamily: 'inherit', marginBottom: 12
  }

  const btnStyle = (active: boolean) => ({
    width: '100%', fontSize: '.875rem', fontWeight: 600,
    padding: 11, borderRadius: 'var(--r)',
    background: active ? '#18181B' : '#D4D4D8',
    color: '#fff', border: 'none', cursor: active ? 'pointer' : 'not-allowed',
    fontFamily: 'inherit'
  })

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100vh - 52px)', padding: 20
      }}>
        <div style={{
          background: 'var(--sur)', border: '1px solid var(--bd)',
          borderRadius: 'var(--rm)', padding: '32px 28px',
          width: '100%', maxWidth: 400
        }}>
          {/* Step indicators */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
            {[1,2,3].map(s => (
              <div key={s} style={{
                height: 3, flex: 1, borderRadius: 2,
                background: s <= step ? '#18181B' : 'var(--bd)'
              }} />
            ))}
          </div>

          {error && (
            <div style={{
              background: 'var(--rose-d)', border: '1px solid var(--rose)',
              borderRadius: 'var(--r)', padding: '10px 12px',
              fontSize: '.8rem', color: 'var(--rose)', marginBottom: 16
            }}>{error}</div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 6 }}>
                Create your account
              </h1>
              <p style={{ fontSize: '.875rem', color: 'var(--t3)', marginBottom: 22 }}>
                We only need your email to send a one-time code.
              </p>
              <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t3)', display: 'block', marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
              />
              <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t3)', display: 'block', marginBottom: 6 }}>
                Age range
              </label>
              <select
                value={ageRange}
                onChange={e => setAgeRange(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">Select age range</option>
                <option>15-17</option>
                <option>18-23</option>
                <option>24-30</option>
                <option>31-40</option>
                <option>41+</option>
              </select>
              <label style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                fontSize: '.8125rem', color: 'var(--t3)', cursor: 'pointer', marginBottom: 20
              }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  style={{ marginTop: 2 }}
                />
                I agree to the Terms of Service and Privacy Policy
              </label>
              <button
                onClick={sendOTP}
                disabled={!email.includes('@') || !ageRange || !agreed || loading}
                style={btnStyle(email.includes('@') && !!ageRange && agreed && !loading)}
              >
                {loading ? 'Sending...' : 'Send code'}
              </button>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 6 }}>
                Check your email
              </h1>
              <p style={{ fontSize: '.875rem', color: 'var(--t3)', marginBottom: 22 }}>
                We sent a 6-digit code to {email}
              </p>
              <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t3)', display: 'block', marginBottom: 6 }}>
                6-digit code
              </label>
              <input
                type="text"
                placeholder="000000"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                style={{ ...inputStyle, fontSize: '1.5rem', fontFamily: 'monospace', letterSpacing: '.2em', textAlign: 'center' }}
              />
              <button
                onClick={verifyOTP}
                disabled={code.length !== 6 || loading}
                style={btnStyle(code.length === 6 && !loading)}
              >
                {loading ? 'Verifying...' : 'Verify code'}
              </button>
              <button
                onClick={() => setStep(1)}
                style={{ width: '100%', marginTop: 10, fontSize: '.8rem', color: 'var(--t4)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Back
              </button>
            </>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 6 }}>
                Choose your nickname
              </h1>
              <p style={{ fontSize: '.875rem', color: 'var(--t3)', marginBottom: 22 }}>
                This is your only public identity. Posts show Ghost IDs, not this name.
              </p>
              <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t3)', display: 'block', marginBottom: 6 }}>
                Nickname
              </label>
              <input
                type="text"
                placeholder="midnight_writer"
                value={nickname}
                onChange={e => setNickname(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                style={inputStyle}
              />
              <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t3)', display: 'block', marginBottom: 8 }}>
                Gender
              </label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {['male', 'female', 'other'].map(g => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    style={{
                      flex: 1, padding: '9px', borderRadius: 'var(--r)',
                      border: '1px solid var(--bd)',
                      background: gender === g ? '#18181B' : 'none',
                      color: gender === g ? '#fff' : 'var(--t2)',
                      fontSize: '.8125rem', fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'inherit',
                      textTransform: 'capitalize'
                    }}
                  >{g}</button>
                ))}
              </div>
              <button
                onClick={createAccount}
                disabled={nickname.length < 3 || !gender || loading}
                style={btnStyle(nickname.length >= 3 && !!gender && !loading)}
              >
                {loading ? 'Creating...' : 'Create account'}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}