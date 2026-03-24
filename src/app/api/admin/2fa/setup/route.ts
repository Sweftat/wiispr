import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateSecret, toTotpUri } from '@/lib/totp'
import QRCode from 'qrcode'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { data: user } = await supabase.from('users').select('is_admin, nickname').eq('id', userId).single()
  if (!user?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const secret = generateSecret()
  const otpauth = toTotpUri(secret, user.nickname, 'wiispr Admin')
  const qrDataUrl = await QRCode.toDataURL(otpauth)

  // Store secret (not yet enabled — confirmed only after verifying)
  await supabase.from('users').update({ totp_secret: secret, totp_enabled: false }).eq('id', userId)

  return NextResponse.json({ secret, qrDataUrl })
}
