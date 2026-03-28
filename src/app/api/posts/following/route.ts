import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ posts: [] })

  const [{ data: ghostFollows }, { data: catFollows }] = await Promise.all([
    supabase.from('follows').select('ghost_id').eq('follower_id', userId),
    supabase.from('follows_categories').select('category_id').eq('user_id', userId),
  ])

  const ghostIds = ghostFollows?.map(f => f.ghost_id) || []
  const categoryIds = catFollows?.map(f => f.category_id) || []

  if (ghostIds.length === 0 && categoryIds.length === 0) {
    return NextResponse.json({ posts: [] })
  }

  // Build query: posts matching followed ghost IDs OR followed category IDs
  let query = supabase
    .from('posts')
    .select('*, categories(name, slug)')
    .eq('is_deleted', false)
    .eq('is_blurred', false)
    .order('created_at', { ascending: false })
    .limit(30)

  if (ghostIds.length > 0 && categoryIds.length > 0) {
    query = query.or(`ghost_id.in.(${ghostIds.map(g => `"${g}"`).join(',')}),category_id.in.(${categoryIds.join(',')})`)
  } else if (ghostIds.length > 0) {
    query = query.in('ghost_id', ghostIds)
  } else {
    query = query.in('category_id', categoryIds)
  }

  const { data: posts } = await query

  return NextResponse.json({ posts: posts || [] })
}
