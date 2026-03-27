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
  const search = searchParams.get('search')
  const trending = searchParams.get('trending')

  // Get tags for a specific post
  if (postId) {
    const { data } = await supabase
      .from('post_tags')
      .select('tag')
      .eq('post_id', postId)
    return NextResponse.json({ tags: (data || []).map(t => t.tag) })
  }

  // Autocomplete search
  if (search) {
    const { data } = await supabase
      .from('post_tags')
      .select('tag')
      .ilike('tag', `${search}%`)
      .limit(10)
    const counts: Record<string, number> = {}
    for (const row of data || []) {
      counts[row.tag] = (counts[row.tag] || 0) + 1
    }
    const suggestions = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }))
    return NextResponse.json({ suggestions })
  }

  // Trending tags in last 24h
  if (trending) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data } = await supabase
      .from('post_tags')
      .select('tag')
      .gte('created_at', oneDayAgo)
    const counts: Record<string, number> = {}
    for (const row of data || []) {
      counts[row.tag] = (counts[row.tag] || 0) + 1
    }
    const trending = Object.entries(counts)
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }))
    return NextResponse.json({ trending })
  }

  return NextResponse.json({ tags: [] })
}
