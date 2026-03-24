import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { data: user } = await supabase.from('users').select('is_admin').eq('id', userId).single()
  if (!user?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { userId: targetId, action, trustLevel } = await req.json()

  if (action === 'suspend') {
    await supabase.from('users').update({ is_suspended: true }).eq('id', targetId)
  } else if (action === 'unsuspend') {
    await supabase.from('users').update({ is_suspended: false }).eq('id', targetId)
  } else if (action === 'set_trust') {
    const valid = ['new', 'active', 'trusted', 'top']
    if (valid.includes(trustLevel)) {
      await supabase.from('users').update({ trust_level: trustLevel }).eq('id', targetId)
    }
  }

  await supabase.from('admin_logs').insert({
    admin_id: userId,
    action,
    target_type: 'user',
    target_id: targetId,
    meta: trustLevel ? { trustLevel } : {},
  })

  return NextResponse.json({ success: true })
}