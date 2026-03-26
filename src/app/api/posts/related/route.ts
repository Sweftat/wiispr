import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { searchParams } = new URL(req.url)
  const postId = searchParams.get('postId')
  const categoryId = searchParams.get('categoryId')
  if (!postId || !categoryId) return NextResponse.json({ posts: [] })

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, upvotes, reply_count, created_at, category_id, categories(name, slug)')
    .eq('category_id', parseInt(categoryId))
    .eq('is_deleted', false)
    .neq('id', postId)
    .order('created_at', { ascending: false })
    .limit(3)

  return NextResponse.json({ posts: posts || [] })
}
