import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    .select('*')
    .eq('id', userId)
    .single()

  const { count: postCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_deleted', false)

  const { count: replyCount } = await supabase
    .from('replies')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  return NextResponse.json({ user, postCount, replyCount })
}