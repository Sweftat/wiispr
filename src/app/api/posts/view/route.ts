import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { postId } = await req.json()
  if (!postId) return NextResponse.json({ error: 'Missing postId' }, { status: 400 })

  await supabase.rpc('increment_view_count', { post_id: postId })

  return NextResponse.json({ success: true })
}
