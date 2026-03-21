import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function hashEmail(email: string) {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex')
}

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { email, nickname, gender, ageRange } = await req.json()

  if (!email || !nickname || !gender || !ageRange) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const emailHash = hashEmail(email)

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('nickname', nickname)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Nickname already taken' }, { status: 400 })
  }

  const { data: existingEmail } = await supabase
    .from('users')
    .select('id')
    .eq('email_hash', emailHash)
    .single()

  if (existingEmail) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
  }

  const { error } = await supabase
    .from('users')
    .insert({
      email_hash: emailHash,
      nickname,
      gender,
      age_range: ageRange,
      rep_score: 0,
      trust_level: 'new'
    })

  if (error) {
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}