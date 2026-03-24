import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  const { data: user } = await supabase.from('users').select('is_admin').eq('id', userId).single()
  if (!user?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { categoryId, action, name, slug, icon, order } = await req.json()

  if (action === 'enable' || action === 'disable') {
    await supabase.from('categories').update({ is_active: action === 'enable' }).eq('id', categoryId)
  } else if (action === 'create') {
    const { error } = await supabase.from('categories').insert({ name, slug, icon: icon || 'circle', is_active: true, sort_order: 999 })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else if (action === 'reorder') {
    // order: array of { id, sort_order }
    for (const item of order) {
      await supabase.from('categories').update({ sort_order: item.sort_order }).eq('id', item.id)
    }
  }

  return NextResponse.json({ success: true })
}
