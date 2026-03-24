import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// GET: get current user's referral stats
export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { data: user } = await supabase
    .from('users')
    .select('referral_code, referral_count')
    .eq('id', userId)
    .single()

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Generate code if missing
  if (!user.referral_code) {
    const code = userId.slice(0, 8).toUpperCase()
    await supabase.from('users').update({ referral_code: code }).eq('id', userId)
    return NextResponse.json({ code, count: user.referral_count || 0 })
  }

  return NextResponse.json({ code: user.referral_code, count: user.referral_count || 0 })
}
