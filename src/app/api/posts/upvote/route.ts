import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { addRep } from '@/lib/rep'

export const dynamic = 'force-dynamic'

const MILESTONES = [10, 50, 100]

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ voted: [] })

  const { searchParams } = new URL(req.url)
  const postId = searchParams.get('postId')
  const replyIds = searchParams.get('replyIds')

  const voted: string[] = []

  if (postId) {
    const { data } = await supabase
      .from('upvotes')
      .select('post_id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle()
    if (data) voted.push(postId)
  }

  if (replyIds) {
    const ids = replyIds.split(',').filter(Boolean)
    if (ids.length > 0) {
      const { data } = await supabase
        .from('upvotes')
        .select('reply_id')
        .eq('user_id', userId)
        .in('reply_id', ids)
      if (data) {
        for (const d of data) {
          if (d.reply_id) voted.push(d.reply_id)
        }
      }
    }
  }

  return NextResponse.json({ voted })
}

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { postId, replyId } = await req.json()

  if (postId) {
    // Check if already upvoted
    const { data: existing } = await supabase
      .from('upvotes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Already upvoted', alreadyVoted: true }, { status: 409 })
    }

    // Record upvote
    await supabase.from('upvotes').insert({ user_id: userId, post_id: postId })
    await supabase.rpc('increment_upvotes', { post_id: postId })

    const { data: post } = await supabase
      .from('posts')
      .select('upvotes, user_id, title')
      .eq('id', postId)
      .single()

    if (post) {
      const newCount = (post.upvotes || 0)
      const promises: Promise<any>[] = []

      if (post.user_id && post.user_id !== userId) {
        promises.push(addRep(supabase, post.user_id, 1))
      }

      if (MILESTONES.includes(newCount) && post.user_id && post.user_id !== userId) {
        const { data: targetUser } = await supabase.from('users').select('notification_prefs').eq('id', post.user_id).single()
        const prefs = targetUser?.notification_prefs || { milestones: true }
        if (prefs.milestones !== false) {
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
      }

      await Promise.all(promises)
    }
  } else if (replyId) {
    // Check if already upvoted
    const { data: existing } = await supabase
      .from('upvotes')
      .select('id')
      .eq('user_id', userId)
      .eq('reply_id', replyId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Already upvoted', alreadyVoted: true }, { status: 409 })
    }

    await supabase.from('upvotes').insert({ user_id: userId, reply_id: replyId })
    await supabase.rpc('increment_reply_upvotes', { reply_id: replyId })
  }

  return NextResponse.json({ success: true })
}
