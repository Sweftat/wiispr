import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Common stop words to filter out
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
  'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
  'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
  'because', 'but', 'and', 'or', 'if', 'while', 'about', 'up', 'down',
  'this', 'that', 'these', 'those', 'i', 'me', 'my', 'we', 'our', 'you',
  'your', 'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them',
  'their', 'what', 'which', 'who', 'whom', 'this', 'that', 'am', 'don',
  'doesn', 'didn', 'won', 'isn', 'aren', 'wasn', 'weren', 'hasn', 'haven',
  'hadn', 'wouldn', 'couldn', 'shouldn', 'get', 'got', 'like', 'know',
  'think', 'want', 'going', 'really', 'much', 'even', 'also', 'back',
  'make', 'made', 'still', 'let', 'say', 'said', 'one', 'two',
])

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get cached trending topics
  const { data: cached } = await supabase
    .from('trending_topics')
    .select('*')
    .order('count', { ascending: false })
    .limit(5)

  // Check if we need to refresh (older than 1 hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const needsRefresh = !cached || cached.length === 0 || cached[0]?.created_at < oneHourAgo

  if (needsRefresh) {
    // Fetch post titles from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: posts } = await supabase
      .from('posts')
      .select('title')
      .eq('is_deleted', false)
      .gte('created_at', oneDayAgo)

    if (posts && posts.length > 0) {
      const wordCounts: Record<string, number> = {}
      for (const post of posts) {
        const words = post.title.toLowerCase().replace(/[^a-zA-Z\s\u0600-\u06FF]/g, '').split(/\s+/)
        const seen = new Set<string>()
        for (const word of words) {
          if (word.length < 3 || STOP_WORDS.has(word) || seen.has(word)) continue
          seen.add(word)
          wordCounts[word] = (wordCounts[word] || 0) + 1
        }
      }

      const topKeywords = Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

      if (topKeywords.length > 0) {
        const now = new Date()
        const periodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()

        // Clear old topics and insert new
        await supabase.from('trending_topics').delete().lt('created_at', oneHourAgo)
        await supabase.from('trending_topics').insert(
          topKeywords.map(([keyword, count]) => ({
            keyword,
            count,
            period_start: periodStart,
            period_end: now.toISOString(),
          }))
        )

        return NextResponse.json({
          topics: topKeywords.map(([keyword, count]) => ({ keyword, count }))
        })
      }
    }
  }

  return NextResponse.json({
    topics: (cached || []).map((t: any) => ({ keyword: t.keyword, count: t.count }))
  })
}
