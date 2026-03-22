import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

function hashEmail(email: string) {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex')
}

export async function POST(req: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { email, code } = await req.json()
  if (!email || !code) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const emailHash = hashEmail(email)
  const { data: otpRecord } = await supabase.from('otp_codes').select('*').eq('email_hash', emailHash).eq('code', code).eq('used', false).gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(1).single()
  if (!otpRecord) return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
  await supabase.from('otp_codes').update({ used: true }).eq('id', otpRecord.id)
  return NextResponse.json({ success: true, emailHash })
}
