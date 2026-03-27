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
  const tagFilter = searchParams.get('tag')

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

  const offset = parseInt(searchParams.get('offset') || '0')
  const limit = parseInt(searchParams.get('limit') || '20')
  const since = searchParams.get('since')

  // If 'since' param, just return count of new posts
  if (since) {
    const { count } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('is_deleted', false)
      .eq('is_blurred', false)
      .gt('created_at', since)
    return NextResponse.json({ newCount: count || 0 })
  }

  // Get blocked ghost IDs for current user
  const userId = req.cookies.get('wiispr_user_id')?.value
  let blockedGhostIds: string[] = []
  if (userId) {
    const { data: blocks } = await supabase
      .from('blocks')
      .select('blocked_ghost_id')
      .eq('blocker_id', userId)
    blockedGhostIds = (blocks || []).map(b => b.blocked_ghost_id)
  }

  let query = supabase
    .from('posts')
    .select('*, categories(name, slug), users(trust_level)')
    .eq('is_deleted', false)
    .eq('is_blurred', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (categoryId) {
    query = query.eq('category_id', parseInt(categoryId))
  }
  for (const id of excludeIds) {
    query = query.neq('id', id)
  }

  const { data: posts } = await query

  // Filter by tag if specified
  let tagFilteredPosts = posts || []
  if (tagFilter) {
    const { data: taggedPostIds } = await supabase
      .from('post_tags')
      .select('post_id')
      .eq('tag', tagFilter.toLowerCase())
    const taggedIds = new Set((taggedPostIds || []).map(t => t.post_id))
    tagFilteredPosts = tagFilteredPosts.filter((p: any) => taggedIds.has(p.id))
  }

  // Get shadowbanned user IDs
  const { data: shadowbanned } = await supabase
    .from('users')
    .select('id')
    .eq('is_shadowbanned', true)
  const shadowbannedIds = new Set((shadowbanned || []).map(u => u.id))

  // Filter: remove blocked ghost IDs + shadowbanned posts (unless it's the current user's own post)
  const filteredPosts = tagFilteredPosts.filter((p: any) => {
    if (blockedGhostIds.length > 0 && blockedGhostIds.includes(p.ghost_id)) return false
    if (shadowbannedIds.has(p.user_id) && p.user_id !== userId) return false
    return true
  })

  // Fetch tags for all returned posts
  const postIds = filteredPosts.map((p: any) => p.id)
  let tagsByPostId: Record<string, string[]> = {}
  if (postIds.length > 0) {
    const { data: allTags } = await supabase
      .from('post_tags')
      .select('post_id, tag')
      .in('post_id', postIds)
    if (allTags) {
      for (const t of allTags) {
        if (!tagsByPostId[t.post_id]) tagsByPostId[t.post_id] = []
        tagsByPostId[t.post_id].push(t.tag)
      }
    }
  }
  const postsWithTags = filteredPosts.map((p: any) => ({
    ...p,
    tags: tagsByPostId[p.id] || [],
  }))

  return NextResponse.json({ posts: postsWithTags, pinnedPost, postOfDay })
}
