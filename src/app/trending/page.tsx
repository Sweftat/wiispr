import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { createClient } from '@supabase/supabase-js'
import TrendingFeed from '@/components/TrendingFeed'

export const dynamic = 'force-dynamic'

export default async function TrendingPage() {
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
    .limit(30)

  return (
    <main style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div style={{ flex: 1, maxWidth: 720, margin: '0 auto', padding: '20px', width: '100%' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Trending</h1>
          <p style={{ fontSize: '.8rem', color: 'var(--t4)' }}>Top posts from the last 48 hours</p>
        </div>
        <TrendingFeed initialPosts={posts || []} />
      </div>
      <Footer />
    </main>
  )
}
