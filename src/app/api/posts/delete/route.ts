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

  const { postId } = await req.json()
  if (!postId) return NextResponse.json({ error: 'Missing postId' }, { status: 400 })

  // Verify ownership
  const { data: post } = await supabase.from('posts').select('user_id').eq('id', postId).single()
  if (!post || post.user_id !== userId) {
    return NextResponse.json({ error: 'Not your post' }, { status: 403 })
  }

  await supabase.from('posts').update({ is_deleted: true }).eq('id', postId)

  return NextResponse.json({ success: true })
}
