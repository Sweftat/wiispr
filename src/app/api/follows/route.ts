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

  const body = await req.json()
  const { ghostId, categoryId, action } = body

  // Category follow
  if (categoryId) {
    if (action === 'unfollow') {
      await supabase.from('follows_categories').delete().eq('user_id', userId).eq('category_id', categoryId)
    } else {
      await supabase.from('follows_categories').upsert({ user_id: userId, category_id: categoryId })
    }
    return NextResponse.json({ success: true })
  }

  // Ghost ID follow
  if (!ghostId) return NextResponse.json({ error: 'Missing ghostId or categoryId' }, { status: 400 })

  if (action === 'unfollow') {
    await supabase.from('follows').delete().eq('follower_id', userId).eq('ghost_id', ghostId)
  } else {
    await supabase.from('follows').upsert({ follower_id: userId, ghost_id: ghostId })

    // Notify the ghost_id owner (find their most recent post with that ghost_id)
    const { data: post } = await supabase
      .from('posts')
      .select('user_id, id')
      .eq('ghost_id', ghostId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (post && post.user_id !== userId) {
      const { data: targetUser } = await supabase.from('users').select('notification_prefs').eq('id', post.user_id).single()
      const prefs = targetUser?.notification_prefs || { follows: true }
      if (prefs.follows !== false) {
        await supabase.from('notifications').insert({
          user_id: post.user_id,
          type: 'follow',
          message: `Someone started following ${ghostId}`,
          post_id: post.id,
          is_read: false,
        })
      }
    }
  }

  return NextResponse.json({ success: true })
}

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ ghostIds: [], categoryIds: [], follows: [] })

  const [{ data: ghostFollows }, { data: catFollows }] = await Promise.all([
    supabase.from('follows').select('ghost_id').eq('follower_id', userId),
    supabase.from('follows_categories').select('category_id').eq('user_id', userId),
  ])

  const ghostIds = ghostFollows?.map(f => f.ghost_id) || []
  const categoryIds = catFollows?.map(f => f.category_id) || []

  return NextResponse.json({ ghostIds, categoryIds, follows: ghostIds })
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const body = await req.json()
  const { ghostId, categoryId } = body

  if (categoryId) {
    await supabase.from('follows_categories').delete().eq('user_id', userId).eq('category_id', categoryId)
  } else if (ghostId) {
    await supabase.from('follows').delete().eq('follower_id', userId).eq('ghost_id', ghostId)
  }

  return NextResponse.json({ success: true })
}
