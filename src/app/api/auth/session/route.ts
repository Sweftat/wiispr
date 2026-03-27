import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Nickname availability check
  const checkNickname = req.nextUrl.searchParams.get('checkNickname')
  if (checkNickname) {
    const userId = req.cookies.get('wiispr_user_id')?.value
    const { data } = await supabase.from('users').select('id').eq('nickname', checkNickname).neq('id', userId || '').maybeSingle()
    return NextResponse.json({ available: !data })
  }

  const userId = req.cookies.get('wiispr_user_id')?.value
  const nickname = req.cookies.get('wiispr_nickname')?.value
  const gender = req.cookies.get('wiispr_gender')?.value

  if (!userId || !nickname) {
    return NextResponse.json({ user: null })
  }

  const { data: dbUser } = await supabase
    .from('users')
    .select('is_admin, totp_enabled')
    .eq('id', userId)
    .single()

  return NextResponse.json({
    user: {
      id: userId,
      nickname,
      gender,
      is_admin: dbUser?.is_admin || false,
      totp_enabled: dbUser?.totp_enabled || false,
    },
  })
}

export async function POST(req: NextRequest) {
  const { userId, nickname, gender } = await req.json()

  const response = NextResponse.json({ success: true })

  response.cookies.set('wiispr_user_id', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30
  })

  response.cookies.set('wiispr_nickname', nickname, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30
  })

  if (gender) {
    response.cookies.set('wiispr_gender', gender, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30
    })
  }

  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('wiispr_user_id')
  response.cookies.delete('wiispr_nickname')
  response.cookies.delete('wiispr_gender')
  return response
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const body = await req.json()
  const updates: any = {}

  if (body.nickname) {
    if (body.nickname.length < 3) return NextResponse.json({ error: 'Invalid nickname' }, { status: 400 })
    updates.nickname = body.nickname
  }

  if (body.ageRange) {
    updates.age_range = body.ageRange
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  await supabase.from('users').update(updates).eq('id', userId)

  const response = NextResponse.json({ success: true })

  if (body.nickname) {
    response.cookies.set('wiispr_nickname', body.nickname, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30
    })
  }

  return response
}