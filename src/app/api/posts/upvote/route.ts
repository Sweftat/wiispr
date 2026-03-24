import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { addRep } from '@/lib/rep'

export const dynamic = 'force-dynamic'

const MILESTONES = [10, 50, 100]

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { postId, replyId } = await req.json()

  if (postId) {
    const { data: post } = await supabase
      .from('posts')
      .select('upvotes, user_id, title')
      .eq('id', postId)
      .single()

    await supabase.rpc('increment_upvotes', { post_id: postId })

    if (post) {
      const newCount = (post.upvotes || 0) + 1
      const promises: Promise<any>[] = []

      // Rep for post author (not for self-upvotes)
      if (post.user_id && post.user_id !== userId) {
        promises.push(addRep(supabase, post.user_id, 1))
      }

      // Milestone notification
      if (MILESTONES.includes(newCount) && post.user_id && post.user_id !== userId) {
        promises.push(
          Promise.resolve(supabase.from('notifications').insert({
            user_id: post.user_id,
            type: 'milestone',
            message: `Your post "${post.title}" hit ${newCount} upvotes! 🎉`,
            post_id: postId,
            is_read: false,
          }))
        )
      }

      await Promise.all(promises)
    }
  } else if (replyId) {
    await supabase.rpc('increment_reply_upvotes', { reply_id: replyId })
  }

  return NextResponse.json({ success: true })
}
