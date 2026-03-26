'use client'
import { useState, useEffect, useRef } from 'react'
import Nav from '@/components/Nav'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'

function OTPInput({ length = 6, onComplete }: { length?: number, onComplete: (code: string) => void }) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''))
  const refs = useRef<(HTMLInputElement | null)[]>([])

  function handleChange(index: number, value: string) {
    const digit = value.replace(/[^0-9]/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)

    if (digit && index < length - 1) {
      refs.current[index + 1]?.focus()
    }

    const code = next.join('')
    if (code.length === length && next.every(d => d !== '')) {
      onComplete(code)
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus()
      const next = [...digits]
      next[index - 1] = ''
      setDigits(next)
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length)
    if (pasted.length === 0) return
    const next = [...digits]
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i]
    }
    setDigits(next)
    const focusIdx = Math.min(pasted.length, length - 1)
    refs.current[focusIdx]?.focus()
    if (pasted.length === length) {
      onComplete(pasted)
    }
  }

  useEffect(() => {
    refs.current[0]?.focus()
  }, [])

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }} onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          style={{
            width: 44, height: 52, textAlign: 'center',
            fontSize: '1.25rem', fontWeight: 700, fontFamily: 'monospace',
            borderRadius: 'var(--r)', border: '1px solid var(--bd)',
            background: 'var(--bg)', color: 'var(--t1)', outline: 'none',
            transition: 'border-color .15s',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--blue)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--bd)' }}
        />
      ))}
    </div>
  )
}

export default function AuthPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSignIn, setIsSignIn] = useState(false)
  const [email, setEmail] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [agreed, setAgreed] = useState(false)
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

  async function verifyOTP(code: string) {
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    })
    const data = await res.json()
    if (data.success) {
      const signInRes = await fetch('/api/auth/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nickname: '', gender: '', ageRange: '' })
      })
      const signInData = await signInRes.json()
      if (signInData.success) { router.push('/'); router.refresh() }
      else { setLoading(false); setStep(3) }
    } else { setLoading(false); setError(data.error || 'Invalid code') }
  }

  async function createAccount() {
    setLoading(true)
    setError('')
    const referralCode = sessionStorage.getItem('wiispr_referral_code') || undefined
    const res = await fetch('/api/auth/create-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, nickname, gender, ageRange, referralCode })
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      if (data.isNew && data.ghostId) {
        sessionStorage.removeItem('wiispr_referral_code')
        sessionStorage.setItem('wiispr_new_ghost_id', data.ghostId)
        router.push('/welcome')
      } else {
        router.push('/')
      }
      router.refresh()
    } else setError(data.error || 'Something went wrong')
  }

  const canSend = email.includes('@') && (isSignIn || (!!ageRange && agreed))

  const inputStyle = { paddingLeft: 14, paddingRight: 14 }

  const primaryBtn = (active: boolean, onClick: () => void, label: string, loadingLabel: string) => (
    <button
      onClick={onClick}
      disabled={!active || loading}
      style={{
        width: '100%', padding: '11px', borderRadius: 'var(--r)',
        background: active && !loading ? 'var(--blue)' : 'var(--bd)',
        color: '#fff', border: 'none',
        cursor: active && !loading ? 'pointer' : 'not-allowed',
        fontSize: '.875rem', fontWeight: 600, fontFamily: 'inherit',
        transition: 'background .15s'
      }}
    >
      {loading ? loadingLabel : label}
    </button>
  )

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 52px)', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700, fontSize: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--t1)' }}>
              <span style={{ width: 8, height: 8, background: 'var(--blue)', borderRadius: '50%', display: 'inline-block' }}></span>
              wiispr
            </span>
            <p style={{ fontSize: '.875rem', color: 'var(--t3)', marginTop: 6 }}>
              {isSignIn ? 'Welcome back' : 'Anonymous. Honest. Built for Saudi Arabia.'}
            </p>
          </div>

          <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '28px 24px' }}>

            <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
              {[1, 2, 3].map(s => (
                <div key={s} style={{ height: 3, flex: 1, borderRadius: 2, background: s <= step ? 'var(--blue)' : 'var(--bd)', transition: 'background .2s' }} />
              ))}
            </div>

            {error && (
              <div style={{ background: 'var(--rose-d)', border: '1px solid var(--rose)', borderRadius: 'var(--r)', padding: '10px 12px', fontSize: '.8rem', color: 'var(--rose)', marginBottom: 16 }}>{error}</div>
            )}

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
                    style={inputStyle}
                  />
                </div>
                {!isSignIn && (
                  <>
                    <div>
                      <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>Age range</label>
                      <select value={ageRange} onChange={e => setAgeRange(e.target.value)} style={{ width: '100%', fontSize: '.875rem', color: 'var(--t1)', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', padding: '9px 12px', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
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
                {primaryBtn(canSend, sendOTP, 'Send code', 'Sending...')}
                {isSignIn && (
                  <p style={{ textAlign: 'center', fontSize: '.8rem', color: 'var(--t4)' }}>
                    No account? <a href="/auth" style={{ color: 'var(--blue)' }}>Join free</a>
                  </p>
                )}
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>Check your email</h1>
                  <p style={{ fontSize: '.8125rem', color: 'var(--t3)' }}>We sent a 6-digit code to <strong>{email}</strong></p>
                </div>
                <OTPInput onComplete={verifyOTP} />
                {loading && <p style={{ textAlign: 'center', fontSize: '.8rem', color: 'var(--t4)' }}>Verifying...</p>}
                <button onClick={() => setStep(1)} style={{ fontSize: '.8rem', color: 'var(--t4)', background: 'none', border: 'none', cursor: 'pointer' }}>Back</button>
              </div>
            )}

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
                  style={inputStyle}
                />
                <div>
                  <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t2)', display: 'block', marginBottom: 8 }}>Gender</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['male', 'female', 'other'].map(g => (
                      <button key={g} onClick={() => setGender(g)} style={{ flex: 1, padding: '9px', borderRadius: 'var(--r)', border: '1px solid var(--bd)', background: gender === g ? 'var(--blue)' : 'none', color: gender === g ? '#fff' : 'var(--t2)', fontSize: '.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize', transition: 'all .15s' }}>{g}</button>
                    ))}
                  </div>
                </div>
                {primaryBtn(nickname.length >= 3 && !!gender, createAccount, 'Create account', 'Creating...')}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
