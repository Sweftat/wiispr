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

  const { postId, reason } = await req.json()
  if (!postId) return NextResponse.json({ error: 'Missing postId' }, { status: 400 })

  // Check if already reported by this user
  const { data: existing } = await supabase
    .from('reports')
    .select('id')
    .eq('post_id', postId)
    .eq('reporter_id', userId)
    .single()

  if (existing) return NextResponse.json({ error: 'Already reported' }, { status: 400 })

  await supabase.from('reports').insert({
    post_id: postId,
    reporter_id: userId,
    reason: reason || 'inappropriate'
  })

  // Count reports for this post
  const { count } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)

  // Auto-blur at 3 reports
  if (count && count >= 3) {
    await supabase.from('posts').update({ is_blurred: true }).eq('id', postId)
  }

  return NextResponse.json({ success: true })
}