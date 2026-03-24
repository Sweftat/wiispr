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

  const { data: user } = await supabase.from('users').select('is_admin, totp_secret').eq('id', userId).single()
  if (!user?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { token } = await req.json()
  if (!user.totp_secret || !verifyToken(token, user.totp_secret)) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
  }

  await supabase.from('users').update({ totp_secret: null, totp_enabled: false }).eq('id', userId)

  return NextResponse.json({ success: true })
}
