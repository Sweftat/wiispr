import Nav from '@/components/Nav'
import Feed from '@/components/Feed'
import SidebarCategories from '@/components/SidebarCategories'
import Footer from '@/components/Footer'
import AnnouncementBanner from '@/components/AnnouncementBanner'
import TrendingWidget from '@/components/TrendingWidget'
import TrendingTopicsWidget from '@/components/TrendingTopicsWidget'
import LeaderboardWidget from '@/components/LeaderboardWidget'
import StatsWidget from '@/components/StatsWidget'
import ActiveGhostsWidget from '@/components/ActiveGhostsWidget'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: categories } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order')

  const [{ data: pinnedPost }, { data: postOfDay }] = await Promise.all([
    supabase.from('posts').select('*, categories(name, slug)').eq('is_pinned', true).eq('is_deleted', false).maybeSingle(),
    supabase.from('posts').select('*, categories(name, slug)').eq('is_post_of_day', true).eq('is_deleted', false).maybeSingle(),
  ])

  const excludeIds = [pinnedPost?.id, postOfDay?.id].filter(Boolean)
  let postsQuery = supabase.from('posts').select('*, categories(name, slug), users(trust_level)').eq('is_deleted', false).eq('is_blurred', false).order('created_at', { ascending: false }).limit(20)
  for (const id of excludeIds) postsQuery = postsQuery.neq('id', id)
  const { data: posts } = await postsQuery

  return (
    <main style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', overflowX: 'hidden', position: 'relative' }}>
      <Nav />
      <AnnouncementBanner />
      <div className="feed-container" style={{ flex: 1, maxWidth: 1100, margin: '0 auto', padding: '20px', width: '100%', boxSizing: 'border-box' }}>
        <div className="feed-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
          <div style={{ minWidth: 0, width: '100%', overflow: 'hidden' }}>
            <Feed initialPosts={posts || []} initialPinnedPost={pinnedPost || null} initialPostOfDay={postOfDay || null} categories={categories || []} />
          </div>
          <div className="feed-sidebar">
            <StatsWidget />
            <p style={{ fontSize: '.625rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--t4)', marginBottom: 10 }}>Categories</p>
            <SidebarCategories categories={categories || []} />
            <TrendingWidget />
            <TrendingTopicsWidget />
            <LeaderboardWidget />
            <ActiveGhostsWidget />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
