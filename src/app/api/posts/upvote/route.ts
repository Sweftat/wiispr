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

  const { postId, replyId } = await req.json()

  if (postId) {
    await supabase.rpc('increment_upvotes', { post_id: postId })
  } else if (replyId) {
    await supabase.rpc('increment_reply_upvotes', { reply_id: replyId })
  }

  return NextResponse.json({ success: true })
}