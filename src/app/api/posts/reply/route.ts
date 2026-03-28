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

  const { data: replier } = await supabase.from('users').select('is_suspended').eq('id', userId).single()
  if (replier?.is_suspended) return NextResponse.json({ error: 'Your account is suspended.' }, { status: 403 })

  const { postId, body } = await req.json()
  if (!postId || !body) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const ghostId = generateGhostId()

  const { data: reply, error } = await supabase.from('replies').insert({
    post_id: postId,
    user_id: userId,
    ghost_id: ghostId,
    body,
    upvotes: 0,
    is_deleted: false
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await Promise.all([
    supabase.rpc('increment_reply_count', { post_id: postId }),
    addRep(supabase, userId, 2),
  ])

  return NextResponse.json({ success: true, reply })
}