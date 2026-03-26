import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ bookmarked: false, bookmarks: [] })

  const { searchParams } = new URL(req.url)
  const postId = searchParams.get('postId')

  if (postId) {
    const { data } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle()
    return NextResponse.json({ bookmarked: !!data })
  }

  // Return all bookmarked posts
  const { data } = await supabase
    .from('bookmarks')
    .select('post_id, created_at, posts(*, categories(name, slug), users(trust_level))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const bookmarks = (data || []).map((b: any) => ({ ...b.posts, bookmarked_at: b.created_at })).filter(Boolean)
  return NextResponse.json({ bookmarks })
}

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { postId, action } = await req.json()
  if (!postId) return NextResponse.json({ error: 'Missing postId' }, { status: 400 })

  if (action === 'remove') {
    await supabase.from('bookmarks').delete().eq('user_id', userId).eq('post_id', postId)
  } else {
    await supabase.from('bookmarks').upsert({ user_id: userId, post_id: postId })
  }

  return NextResponse.json({ success: true })
}
