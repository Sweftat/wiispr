import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

  const { title, body, categoryId } = await req.json()
  if (!title || !categoryId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const ghostId = generateGhostId()

  const { error } = await supabase.from('posts').insert({
    user_id: userId,
    ghost_id: ghostId,
    category_id: parseInt(categoryId),
    title,
    body: body || null,
    upvotes: 0,
    reply_count: 0,
    is_blurred: false,
    is_deleted: false
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('activity_logs').insert({
    user_id: userId,
    action: 'post_created',
    target_type: 'post',
    meta: { title, category_id: parseInt(categoryId), ghost_id: ghostId }
  })

  return NextResponse.json({ success: true })
}