import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { searchParams } = new URL(req.url)
  const categoryId = searchParams.get('category')

  // Fetch pinned + POTD (only on the default feed, not category-filtered views)
  let pinnedPost = null
  let postOfDay = null
  if (!categoryId) {
    const [pinnedRes, potdRes] = await Promise.all([
      supabase.from('posts').select('*, categories(name, slug)').eq('is_pinned', true).eq('is_deleted', false).maybeSingle(),
      supabase.from('posts').select('*, categories(name, slug)').eq('is_post_of_day', true).eq('is_deleted', false).maybeSingle(),
    ])
    pinnedPost = pinnedRes.data || null
    postOfDay = potdRes.data || null
  }

  const excludeIds = [pinnedPost?.id, postOfDay?.id].filter(Boolean)

  let query = supabase
    .from('posts')
    .select('*, categories(name, slug)')
    .eq('is_deleted', false)
    .eq('is_blurred', false)
    .order('created_at', { ascending: false })
    .limit(20)

  if (categoryId) {
    query = query.eq('category_id', parseInt(categoryId))
  }
  for (const id of excludeIds) {
    query = query.neq('id', id)
  }

  const { data: posts } = await query
  return NextResponse.json({ posts: posts || [], pinnedPost, postOfDay })
}
