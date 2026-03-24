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
    .in('key', ['maintenance', 'registrations_open'])

  const settings: Record<string, any> = {}
  for (const row of data || []) settings[row.key] = row.value

  return NextResponse.json({
    maintenance: settings.maintenance?.enabled ?? false,
    registrationsOpen: settings.registrations_open?.enabled ?? true,
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
