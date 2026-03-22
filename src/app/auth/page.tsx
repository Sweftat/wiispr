'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AuthPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSignIn, setIsSignIn] = useState(false)
  const [email, setEmail] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [code, setCode] = useState('')
  const [nickname, setNickname] = useState('')
  const [gender, setGender] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (window.location.search.includes('signin')) setIsSignIn(true)
  }, [])

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
    if (data.success) {
      const signInRes = await fetch('/api/auth/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nickname: '', gender: '', ageRange: '' })
      })
      const signInData = await signInRes.json()
      if (signInData.success) { router.push('/'); router.refresh() }
      else setStep(3)
    } else setError(data.error || 'Invalid code')
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
    if (data.success) { router.push('/'); router.refresh() }
    else setError(data.error || 'Something went wrong')
  }

  const canSend = email.includes('@') && (isSignIn || (!!ageRange && agreed))

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 52px)', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <span style={{
              fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700,
              fontSize: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--t1)'
            }}>
              <span style={{ width: 8, height: 8, background: 'var(--blue)', borderRadius: '50%', display: 'inline-block' }}></span>
              wiispr
            </span>
            <p style={{ fontSize: '.875rem', color: 'var(--t3)', marginTop: 6 }}>
              {isSignIn ? 'Welcome back' : 'Anonymous. Honest. Built for Saudi Arabia.'}
            </p>
          </div>

          {/* Card */}
          <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '28px 24px' }}>

            {/* Step indicators */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
              {[1, 2, 3].map(s => (
                <div key={s} style={{
                  height: 3, flex: 1, borderRadius: 2,
                  background: s <= step ? 'var(--t1)' : 'var(--bd)',
                  transition: 'background .2s'
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>
                    {isSignIn ? 'Sign in to wiispr' : 'Create your account'}
                  </h1>
                  <p style={{ fontSize: '.8125rem', color: 'var(--t3)' }}>
                    {isSignIn ? 'Enter your email to receive a sign-in code.' : 'We only need your email. No passwords.'}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>Email address</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && canSend && sendOTP()}
                  />
                </div>
                {!isSignIn && (
                  <>
                    <div>
                      <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>Age range</label>
                      <select
                        value={ageRange}
                        onChange={e => setAgeRange(e.target.value)}
                        style={{
                          width: '100%', fontSize: '.875rem', color: 'var(--t1)',
                          background: 'var(--bg)', border: '1px solid var(--bd)',
                          borderRadius: 'var(--r)', padding: '9px 12px', outline: 'none',
                          cursor: 'pointer', fontFamily: 'inherit'
                        }}
                      >
                        <option value="">Select age range</option>
                        <option>15-17</option>
                        <option>18-23</option>
                        <option>24-30</option>
                        <option>31-40</option>
                        <option>41+</option>
                      </select>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '.8rem', color: 'var(--t3)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 2 }} />
                      I agree to the Terms of Service and Privacy Policy
                    </label>
                  </>
                )}
                <Button onClick={sendOTP} disabled={!canSend || loading} className="w-full">
                  {loading ? 'Sending...' : 'Send code'}
                </Button>
                {isSignIn && (
                  <p style={{ textAlign: 'center', fontSize: '.8rem', color: 'var(--t4)' }}>
                    No account? <a href="/auth" style={{ color: 'var(--blue)' }}>Join free</a>
                  </p>
                )}
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>Check your email</h1>
                  <p style={{ fontSize: '.8125rem', color: 'var(--t3)' }}>We sent a 6-digit code to <strong>{email}</strong></p>
                </div>
                <Input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                  style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '.3em', fontFamily: 'monospace' }}
                />
                <Button onClick={verifyOTP} disabled={code.length !== 6 || loading} className="w-full">
                  {loading ? 'Verifying...' : 'Verify code'}
                </Button>
                <button onClick={() => setStep(1)} style={{ fontSize: '.8rem', color: 'var(--t4)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Back
                </button>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>Choose your nickname</h1>
                  <p style={{ fontSize: '.8125rem', color: 'var(--t3)' }}>Your only public identity. Posts show Ghost IDs, not this.</p>
                </div>
                <Input
                  type="text"
                  placeholder="midnight_writer"
                  value={nickname}
                  onChange={e => setNickname(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                />
                <div>
                  <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t2)', display: 'block', marginBottom: 8 }}>Gender</label>
                  <div style={{ display: 'flex', gap: 8 }}>
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
                </div>
                <Button onClick={createAccount} disabled={nickname.length < 3 || !gender || loading} className="w-full">
                  {loading ? 'Creating...' : 'Create account'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}