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

  const { data: user } = await supabase.from('users').select('is_admin').eq('id', userId).single()
  if (!user?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { postId, action, warning } = await req.json()

  if (action === 'delete') {
    await supabase.from('posts').update({ is_deleted: true }).eq('id', postId)
  } else if (action === 'unblur') {
    await supabase.from('posts').update({ is_blurred: false }).eq('id', postId)
    await supabase.from('reports').delete().eq('post_id', postId)
  } else if (action === 'pin') {
    await supabase.from('posts').update({ is_pinned: false }).eq('is_pinned', true)
    await supabase.from('posts').update({ is_pinned: true }).eq('id', postId)
  } else if (action === 'unpin') {
    await supabase.from('posts').update({ is_pinned: false }).eq('id', postId)
  } else if (action === 'set_potd') {
    await supabase.from('posts').update({ is_post_of_day: false }).eq('is_post_of_day', true)
    await supabase.from('posts').update({ is_post_of_day: true }).eq('id', postId)
  } else if (action === 'unset_potd') {
    await supabase.from('posts').update({ is_post_of_day: false }).eq('id', postId)
  } else if (action === 'set_warning') {
    await supabase.from('posts').update({ content_warning: warning || null }).eq('id', postId)
  } else if (action === 'clear_warning') {
    await supabase.from('posts').update({ content_warning: null }).eq('id', postId)
  }

  return NextResponse.json({ success: true })
}