import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

function hashEmail(email: string) {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex')
}

function parseDevice(userAgent: string) {
  const ua = userAgent.toLowerCase()
  let device = 'Desktop'
  let browser = 'Unknown'

  if (ua.includes('iphone') || ua.includes('ipad')) device = 'iOS'
  else if (ua.includes('android')) device = 'Android'
  else if (ua.includes('mac')) device = 'Mac'
  else if (ua.includes('windows')) device = 'Windows'

  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome'
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari'
  else if (ua.includes('firefox')) browser = 'Firefox'
  else if (ua.includes('edg')) browser = 'Edge'

  return { device, browser }
}

async function getLocation(ip: string) {
  try {
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168')) {
      return { country: 'Local', city: 'Local', region: 'Local' }
    }
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,regionName,city,status`)
    const data = await res.json()
    if (data.status === 'success') {
      return { country: data.country, city: data.city, region: data.regionName }
    }
  } catch {}
  return { country: 'Unknown', city: 'Unknown', region: 'Unknown' }
}

export async function POST(req: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { email, nickname, gender, ageRange, referralCode } = await req.json()
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })
  const emailHash = hashEmail(email)

  // Get IP and user agent
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '127.0.0.1'
  const userAgent = req.headers.get('user-agent') || ''
  const { device, browser } = parseDevice(userAgent)
  const location = await getLocation(ip)

  // Check if returning user
  const { data: existingEmail } = await supabase.from('users').select('id, nickname, gender').eq('email_hash', emailHash).single()
  if (existingEmail) {
    // Log session
    await supabase.from('user_sessions').insert({
      user_id: existingEmail.id,
      ip, country: location.country, city: location.city, region: location.region,
      device, browser
    })

    const response = NextResponse.json({ success: true })
    response.cookies.set('wiispr_user_id', existingEmail.id, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 })
    response.cookies.set('wiispr_nickname', existingEmail.nickname, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 })
    response.cookies.set('wiispr_gender', existingEmail.gender || '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 })
    return response
  }

  // New user
  if (!nickname || !gender || !ageRange) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { data: existing } = await supabase.from('users').select('id').eq('nickname', nickname).single()
  if (existing) return NextResponse.json({ error: 'Nickname already taken' }, { status: 400 })

  const { data: user, error } = await supabase.from('users').insert({
    email_hash: emailHash, nickname, gender, age_range: ageRange, rep_score: 0, trust_level: 'new'
  }).select().single()
  if (error || !user) return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })

  // Log session
  await supabase.from('user_sessions').insert({
    user_id: user.id,
    ip, country: location.country, city: location.city, region: location.region,
    device, browser
  })

  // Handle referral
  if (referralCode) {
    const { data: referrer } = await supabase
      .from('users')
      .select('id, rep_score, referral_count')
      .eq('referral_code', referralCode.toUpperCase())
      .single()
    if (referrer && referrer.id !== user.id) {
      await supabase.from('users').update({
        rep_score: (referrer.rep_score || 0) + 5,
        referral_count: (referrer.referral_count || 0) + 1,
      }).eq('id', referrer.id)
      await supabase.from('notifications').insert({
        user_id: referrer.id,
        type: 'referral',
        message: `Someone joined wiispr using your referral link! +5 rep`,
        post_id: null,
        is_read: false,
      })
    }
  }

  // Generate a preview ghost ID to show in the welcome screen
  const previewGhostId = 'Ghost #' + Math.floor(1000 + Math.random() * 9000)

  const response = NextResponse.json({ success: true, isNew: true, ghostId: previewGhostId })
  response.cookies.set('wiispr_user_id', user.id, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 })
  response.cookies.set('wiispr_nickname', nickname, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 })
  response.cookies.set('wiispr_gender', gender, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 })
  return response
}