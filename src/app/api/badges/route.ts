import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { computeBadges, ALL_BADGES } from '@/lib/badges'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { data: user } = await supabase
    .from('users')
    .select('trust_level, referral_count')
    .eq('id', userId)
    .single()

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Get post count
  const { count: postCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_deleted', false)

  // Get max upvotes on a single post
  const { data: topPost } = await supabase
    .from('posts')
    .select('upvotes')
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .order('upvotes', { ascending: false })
    .limit(1)
    .maybeSingle()

  const earned = computeBadges({
    post_count: postCount || 0,
    max_post_upvotes: topPost?.upvotes || 0,
    trust_level: user.trust_level,
    referral_count: user.referral_count || 0,
  })

  const badges = ALL_BADGES.filter(b => earned.includes(b.id))

  return NextResponse.json({ badges, earned })
}
