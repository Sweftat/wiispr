import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

function hashEmail(email: string) {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex')
}

export async function POST(req: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { email } = await req.json()
  if (!email || !email.includes('@')) return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const emailHash = hashEmail(email)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
  await supabase.from('otp_codes').insert({ email_hash: emailHash, code, expires_at: expiresAt })
  await resend.emails.send({ from: 'wiispr <onboarding@resend.dev>', to: email, subject: 'Your wiispr code', html: `<div style="padding:40px"><h1>${code}</h1><p>Expires in 10 minutes.</p></div>` })
  return NextResponse.json({ success: true })
}
