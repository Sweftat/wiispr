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

  async function signInWithOAuth(provider: 'google' | 'apple') {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    })
    if (error) setError(error.message)
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
    <main style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <Nav />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', minHeight: 'calc(100dvh - 52px)', padding: '40px 20px 20px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700, fontSize: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--t1)' }}>
              <span style={{ width: 7, height: 7, background: 'var(--blue)', borderRadius: '50%', display: 'inline-block' }}></span>
              wiispr
            </span>
            <p style={{ fontSize: '.8rem', color: 'var(--t3)', marginTop: 4 }}>
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

                {/* OAuth buttons */}
                <button onClick={() => signInWithOAuth('google')} style={{
                  width: '100%', padding: '10px', borderRadius: 'var(--r)',
                  background: 'var(--bg)', border: '1px solid var(--bd)',
                  cursor: 'pointer', fontSize: '.8rem', fontWeight: 600, fontFamily: 'inherit',
                  color: 'var(--t1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </button>
                <button onClick={() => signInWithOAuth('apple')} style={{
                  width: '100%', padding: '10px', borderRadius: 'var(--r)',
                  background: 'var(--t1)', border: 'none',
                  cursor: 'pointer', fontSize: '.8rem', fontWeight: 600, fontFamily: 'inherit',
                  color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                  Continue with Apple
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--bd)' }} />
                  <span style={{ fontSize: '.72rem', color: 'var(--t4)', fontWeight: 500 }}>or use email</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--bd)' }} />
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
