import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  const { data: admin } = await supabase.from('users').select('is_admin').eq('id', userId).single()
  if (!admin?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const targetUserId = req.nextUrl.searchParams.get('userId')
  if (!targetUserId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  const { data: sessions } = await supabase.from('user_sessions').select('*').eq('user_id', targetUserId).order('created_at', { ascending: false }).limit(10)
  return NextResponse.json({ sessions: sessions || [] })
}