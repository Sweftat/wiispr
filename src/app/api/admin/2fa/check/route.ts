import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyToken } from '@/lib/totp'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { data: user } = await supabase.from('users').select('is_admin, totp_secret, totp_enabled').eq('id', userId).single()
  if (!user?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  if (!user.totp_enabled || !user.totp_secret) return NextResponse.json({ error: '2FA not enabled' }, { status: 400 })

  const { token } = await req.json()
  if (!verifyToken(token, user.totp_secret)) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
  }

  const response = NextResponse.json({ success: true })
  // Session-scoped cookie (no maxAge = expires on browser close)
  response.cookies.set('wiispr_2fa_verified', '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',
  })
  return response
}
