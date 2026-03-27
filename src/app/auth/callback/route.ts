import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/auth?error=missing_code', req.url))
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Exchange code for session
  const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !session?.user) {
    return NextResponse.redirect(new URL('/auth?error=auth_failed', req.url))
  }

  const oauthUser = session.user
  const email = oauthUser.email || ''

  // Check if user already exists
  const { data: existing } = await supabase
    .from('users')
    .select('id, nickname')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    // Existing user — set cookies and redirect
    const response = NextResponse.redirect(new URL('/', req.url))
    response.cookies.set('wiispr_user_id', existing.id, { path: '/', httpOnly: false, maxAge: 60 * 60 * 24 * 365 })
    response.cookies.set('wiispr_nickname', existing.nickname, { path: '/', httpOnly: false, maxAge: 60 * 60 * 24 * 365 })
    return response
  }

  // New user — create account
  const nickname = (oauthUser.user_metadata?.full_name || email.split('@')[0] || 'anon')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .slice(0, 20) || 'anon'

  function randomCode(len: number) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  }

  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert({
      email,
      nickname,
      gender: 'unspecified',
      age_range: '18-23',
      trust_level: 'new',
      rep_score: 0,
      referral_code: randomCode(6),
    })
    .select('id, nickname')
    .single()

  if (insertError || !newUser) {
    return NextResponse.redirect(new URL('/auth?error=create_failed', req.url))
  }

  const ghostId = 'Ghost #' + Math.floor(1000 + Math.random() * 9000)

  const response = NextResponse.redirect(new URL('/welcome', req.url))
  response.cookies.set('wiispr_user_id', newUser.id, { path: '/', httpOnly: false, maxAge: 60 * 60 * 24 * 365 })
  response.cookies.set('wiispr_nickname', newUser.nickname, { path: '/', httpOnly: false, maxAge: 60 * 60 * 24 * 365 })

  // Store ghost ID for welcome page
  // We'll use a cookie since we can't use sessionStorage in a route handler
  response.cookies.set('wiispr_new_ghost_id', ghostId, { path: '/', httpOnly: false, maxAge: 300 })

  return response
}
