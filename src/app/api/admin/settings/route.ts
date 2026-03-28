import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data } = await supabase
    .from('site_settings')
    .select('key, value')

  const raw: Record<string, any> = {}
  for (const row of data || []) raw[row.key] = row.value

  // Flatten women's space settings from the womens_space key
  const ws = raw.womens_space || {}

  return NextResponse.json({
    maintenance: raw.maintenance?.enabled ?? false,
    registrationsOpen: raw.registrations_open?.enabled ?? true,
    settings: {
      womens_space_active: ws.active ?? false,
      womens_space_trust_gate: ws.trust_gate ?? false,
      womens_space_gender_gate: ws.gender_gate ?? true,
      womens_space_min_trust: ws.min_trust ?? 'new',
      womens_space_gate_message: ws.gate_message ?? 'This space is for verified women on wiispr. Build your reputation to gain access.',
    },
  })
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

  const { maintenance, registrationsOpen } = await req.json()

  await Promise.all([
    supabase.from('site_settings').upsert({ key: 'maintenance', value: { enabled: maintenance } }, { onConflict: 'key' }),
    supabase.from('site_settings').upsert({ key: 'registrations_open', value: { enabled: registrationsOpen } }, { onConflict: 'key' }),
  ])

  return NextResponse.json({ success: true })
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

  const body = await req.json()

  // Get current women's space settings
  const { data: existing } = await supabase.from('site_settings').select('value').eq('key', 'womens_space').maybeSingle()
  const current = existing?.value || {}

  // Map incoming keys to stored keys
  const keyMap: Record<string, string> = {
    womens_space_active: 'active',
    womens_space_trust_gate: 'trust_gate',
    womens_space_gender_gate: 'gender_gate',
    womens_space_min_trust: 'min_trust',
    womens_space_gate_message: 'gate_message',
  }

  const updated = { ...current }
  for (const [incoming, stored] of Object.entries(keyMap)) {
    if (body[incoming] !== undefined) updated[stored] = body[incoming]
  }

  await supabase.from('site_settings').upsert({ key: 'womens_space', value: updated }, { onConflict: 'key' })

  return NextResponse.json({ success: true })
}
