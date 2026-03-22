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

  const { ghostId, action } = await req.json()
  if (!ghostId) return NextResponse.json({ error: 'Missing ghostId' }, { status: 400 })

  if (action === 'unfollow') {
    await supabase.from('follows').delete().eq('follower_id', userId).eq('ghost_id', ghostId)
  } else {
    await supabase.from('follows').upsert({ follower_id: userId, ghost_id: ghostId })
  }

  return NextResponse.json({ success: true })
}

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ follows: [] })

  const { data } = await supabase
    .from('follows')
    .select('ghost_id')
    .eq('follower_id', userId)

  return NextResponse.json({ follows: data?.map(f => f.ghost_id) || [] })
}