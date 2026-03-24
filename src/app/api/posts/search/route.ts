import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const q = req.nextUrl.searchParams.get('q')
  if (!q || q.length < 2) return NextResponse.json({ posts: [] })
  const { data: posts } = await supabase
    .from('posts')
    .select('*, categories(name)')
    .eq('is_deleted', false)
    .eq('is_blurred', false)
    .or(`title.ilike.%${q}%,body.ilike.%${q}%`)
    .order('created_at', { ascending: false })
    .limit(10)
  return NextResponse.json({ posts: posts || [] })
}
