import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data } = await supabase
    .from('onboarding_slides')
    .select('*')
    .order('id')

  return NextResponse.json({ slides: data || [] })
}

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { data: admin } = await supabase.from('users').select('is_admin').eq('id', userId).single()
  if (!admin?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { title, body, emoji, color } = await req.json()

  // Get next ID
  const { data: maxRow } = await supabase.from('onboarding_slides').select('id').order('id', { ascending: false }).limit(1).maybeSingle()
  const nextId = (maxRow?.id || 0) + 1

  const { data: slide, error } = await supabase.from('onboarding_slides')
    .insert({ id: nextId, title: title || 'New Slide', body: body || '', emoji: emoji || '👋', color: color || '#4F46E5' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, slide })
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { data: admin } = await supabase.from('users').select('is_admin').eq('id', userId).single()
  if (!admin?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { id, title, body, emoji, color } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const updates: any = {}
  if (title !== undefined) updates.title = title
  if (body !== undefined) updates.body = body
  if (emoji !== undefined) updates.emoji = emoji
  if (color !== undefined) updates.color = color
  updates.updated_at = new Date().toISOString()

  await supabase.from('onboarding_slides').update(updates).eq('id', id)
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { data: admin } = await supabase.from('users').select('is_admin').eq('id', userId).single()
  if (!admin?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await supabase.from('onboarding_slides').delete().eq('id', id)
  return NextResponse.json({ success: true })
}
