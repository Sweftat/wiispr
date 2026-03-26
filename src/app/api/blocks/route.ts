import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ blocks: [] })

  const { data } = await supabase
    .from('blocks')
    .select('blocked_ghost_id, created_at')
    .eq('blocker_id', userId)
    .order('created_at', { ascending: false })

  return NextResponse.json({ blocks: data || [] })
}

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { ghostId, action } = await req.json()
  if (!ghostId) return NextResponse.json({ error: 'Missing ghostId' }, { status: 400 })

  if (action === 'unblock') {
    await supabase.from('blocks').delete()
      .eq('blocker_id', userId).eq('blocked_ghost_id', ghostId)
  } else {
    await supabase.from('blocks').upsert({
      blocker_id: userId,
      blocked_ghost_id: ghostId,
    })
  }

  return NextResponse.json({ success: true })
}
