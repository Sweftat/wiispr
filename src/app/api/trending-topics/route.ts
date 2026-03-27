import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Try post_tags table first (most accurate)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: tagRows } = await supabase
    .from('post_tags')
    .select('tag')
    .gte('created_at', oneDayAgo)

  if (tagRows && tagRows.length > 0) {
    const counts: Record<string, number> = {}
    for (const row of tagRows) {
      const t = row.tag?.toLowerCase().trim()
      if (t) counts[t] = (counts[t] || 0) + 1
    }

    const topics = Object.entries(counts)
      .filter(([, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword, count]) => ({ keyword, count }))

    if (topics.length > 0) {
      return NextResponse.json({ topics })
    }
  }

  // Fallback: extract keywords from post titles (min 3 occurrences)
  const STOP_WORDS = new Set([
    'the','a','an','is','are','was','were','be','been','being','have','has','had',
    'do','does','did','will','would','could','should','may','might','can','need',
    'to','of','in','for','on','with','at','by','from','as','into','through',
    'during','before','after','above','below','between','out','off','over','under',
    'again','then','once','here','there','when','where','why','how','all','each',
    'every','both','few','more','most','other','some','such','no','not','only',
    'own','same','so','than','too','very','just','because','but','and','or','if',
    'while','about','up','down','this','that','these','those','i','me','my','we',
    'our','you','your','he','him','his','she','her','it','its','they','them',
    'their','what','which','who','whom','am','don','get','got','like','know',
    'think','want','going','really','much','even','also','back','make','made',
    'still','let','say','said','one','two',
  ])

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

    const topics = Object.entries(wordCounts)
      .filter(([, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword, count]) => ({ keyword, count }))

    return NextResponse.json({ topics })
  }

  return NextResponse.json({ topics: [] })
}
