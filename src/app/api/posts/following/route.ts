import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ posts: [] })

  const { data: follows } = await supabase
    .from('follows')
    .select('ghost_id')
    .eq('follower_id', userId)

  if (!follows || follows.length === 0) {
    return NextResponse.json({ posts: [] })
  }

  const ghostIds = follows.map(f => f.ghost_id)

  const { data: posts } = await supabase
    .from('posts')
    .select('*, categories(name, slug)')
    .eq('is_deleted', false)
    .eq('is_blurred', false)
    .in('ghost_id', ghostIds)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ posts: posts || [] })
}