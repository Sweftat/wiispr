import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('user_sessions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', fiveMinAgo)

  return NextResponse.json({ online: Math.max(count || 0, 1) })
}
