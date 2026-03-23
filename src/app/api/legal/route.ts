import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const page = req.nextUrl.searchParams.get('page')
  if (!page) return NextResponse.json({ error: 'Missing page' }, { status: 400 })
  const { data } = await supabase.from('legal_pages').select('*').eq('id', page).single()
  return NextResponse.json({ page: data })
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  const { data: user } = await supabase.from('users').select('is_admin').eq('id', userId).single()
  if (!user?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { id, content } = await req.json()
  await supabase.from('legal_pages').update({ content, updated_at: new Date().toISOString() }).eq('id', id)
  return NextResponse.json({ success: true })
}
