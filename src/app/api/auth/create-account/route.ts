import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

function hashEmail(email: string) {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex')
}

export async function POST(req: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { email, nickname, gender, ageRange } = await req.json()
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })
  const emailHash = hashEmail(email)

  // Check if returning user first
  const { data: existingEmail } = await supabase.from('users').select('id, nickname').eq('email_hash', emailHash).single()
  if (existingEmail) {
    const response = NextResponse.json({ success: true })
    response.cookies.set('wiispr_user_id', existingEmail.id, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 })
    response.cookies.set('wiispr_nickname', existingEmail.nickname, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 })
    return response
  }

  // New user — require all fields
  if (!nickname || !gender || !ageRange) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { data: existing } = await supabase.from('users').select('id').eq('nickname', nickname).single()
  if (existing) return NextResponse.json({ error: 'Nickname already taken' }, { status: 400 })

  const { data: user, error } = await supabase.from('users').insert({ email_hash: emailHash, nickname, gender, age_range: ageRange, rep_score: 0, trust_level: 'new' }).select().single()
  if (error || !user) return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })

  const response = NextResponse.json({ success: true })
  response.cookies.set('wiispr_user_id', user.id, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 })
  response.cookies.set('wiispr_nickname', nickname, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 })
  return response
}
