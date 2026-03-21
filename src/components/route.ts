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

  const { data: posts } = await query

  return NextResponse.json({ posts: posts || [] })
}