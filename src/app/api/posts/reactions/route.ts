import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { searchParams } = new URL(req.url)
  const postId = searchParams.get('postId')
  if (!postId) return NextResponse.json({ counts: {}, userReaction: null })

  const userId = req.cookies.get('wiispr_user_id')?.value

  const { data: allReactions } = await supabase
    .from('post_reactions')
    .select('reaction, user_id')
    .eq('post_id', postId)

  const counts: Record<string, number> = {}
  let userReaction: string | null = null
  for (const r of allReactions || []) {
    counts[r.reaction] = (counts[r.reaction] || 0) + 1
    if (userId && r.user_id === userId) userReaction = r.reaction
  }

  return NextResponse.json({ counts, userReaction })
}

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { postId, reaction } = await req.json()
  if (!postId || !reaction) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // Check existing reaction
  const { data: existing } = await supabase
    .from('post_reactions')
    .select('id, reaction')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    if (existing.reaction === reaction) {
      // Same reaction — remove it (toggle off)
      await supabase.from('post_reactions').delete().eq('id', existing.id)
    } else {
      // Different reaction — switch
      await supabase.from('post_reactions').update({ reaction }).eq('id', existing.id)
    }
  } else {
    // No existing — create new
    await supabase.from('post_reactions').insert({ post_id: postId, user_id: userId, reaction })
  }

  return NextResponse.json({ success: true })
}
