import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

  const { data: posts } = await supabase
    .from('posts')
    .select('*, categories(name, slug), users(trust_level)')
    .eq('is_deleted', false)
    .eq('is_blurred', false)
    .gte('created_at', cutoff)
    .order('upvotes', { ascending: false })
    .limit(20)

  return NextResponse.json({ posts: posts || [] })
}