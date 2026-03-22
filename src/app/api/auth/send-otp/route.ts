import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const resend = new Resend(process.env.RESEND_API_KEY)
  
  const { email } = await req.json()
 

function hashEmail(email: string) {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex')
}

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const emailHash = hashEmail(email)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  await supabase.from('otp_codes').insert({
    email_hash: emailHash,
    code,
    expires_at: expiresAt
  })

  await resend.emails.send({
    from: 'wiispr <onboarding@resend.dev>',
    to: email,
    subject: 'Your wiispr code',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:400px;margin:0 auto;padding:40px 20px">
        <p style="font-family:Georgia,serif;font-style:italic;font-weight:700;font-size:1.25rem;margin-bottom:24px">wiispr</p>
        <h1 style="font-size:1.5rem;font-weight:800;color:#18181B;margin-bottom:8px">Your sign-in code</h1>
        <p style="color:#52525B;margin-bottom:24px">Enter this code to continue. Expires in 10 minutes.</p>
        <div style="font-family:monospace;font-size:2rem;font-weight:700;letter-spacing:.2em;color:#18181B;background:#F4F4F5;padding:20px;border-radius:8px;text-align:center">${code}</div>
        <p style="color:#A1A1AA;font-size:.8rem;margin-top:24px">If you did not request this, ignore this email.</p>
      </div>
    `
  })

  return NextResponse.json({ success: true })
}