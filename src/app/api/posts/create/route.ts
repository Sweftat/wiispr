import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { addRep } from '@/lib/rep'

export const dynamic = 'force-dynamic'

function generateGhostId() {
  return 'Ghost #' + Math.floor(1000 + Math.random() * 9000)
}

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { data: poster } = await supabase.from('users').select('is_suspended').eq('id', userId).single()
  if (poster?.is_suspended) return NextResponse.json({ error: 'Your account is suspended.' }, { status: 403 })

  // Rate limiting: max 10 posts per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count: recentPosts } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneHourAgo)
  if ((recentPosts || 0) >= 10) {
    return NextResponse.json({ error: 'Too many posts. Please wait before posting again.' }, { status: 429 })
  }

  const { title, body, categoryId, gifUrl } = await req.json()
  if (!title || !categoryId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const ghostId = generateGhostId()

  const { error } = await supabase.from('posts').insert({
    user_id: userId,
    ghost_id: ghostId,
    category_id: parseInt(categoryId),
    title,
    body: body || null,
    gif_url: gifUrl || null,
    upvotes: 0,
    reply_count: 0,
    is_blurred: false,
    is_deleted: false
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Extract and save hashtags from body
  if (body) {
    const tagMatches = body.match(/#([a-zA-Z0-9_\u0600-\u06FF]+)/g)
    if (tagMatches && tagMatches.length > 0) {
      const { data: createdPost } = await supabase
        .from('posts')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (createdPost) {
        const tags = [...new Set(tagMatches.map((t: string) => t.slice(1).toLowerCase()))].slice(0, 5)
        await supabase.from('post_tags').insert(
          tags.map(tag => ({ post_id: createdPost.id, tag }))
        )
      }
    }
  }

  // Update streak
  const today = new Date().toISOString().slice(0, 10)
  const { data: userData } = await supabase.from('users').select('last_post_date, streak_days').eq('id', userId).single()
  if (userData) {
    const lastDate = userData.last_post_date
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    let newStreak = 1
    if (lastDate === yesterday) newStreak = (userData.streak_days || 0) + 1
    else if (lastDate === today) newStreak = userData.streak_days || 1
    await supabase.from('users').update({ last_post_date: today, streak_days: newStreak }).eq('id', userId)
  }

  await Promise.all([
    supabase.from('activity_logs').insert({
      user_id: userId,
      action: 'post_created',
      target_type: 'post',
      meta: { title, category_id: parseInt(categoryId), ghost_id: ghostId }
    }),
    addRep(supabase, userId, 5),
  ])

  return NextResponse.json({ success: true })
}