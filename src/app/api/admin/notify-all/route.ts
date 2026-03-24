import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { data: admin } = await supabase.from('users').select('is_admin').eq('id', userId).single()
  if (!admin?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { message } = await req.json()
  if (!message?.trim()) return NextResponse.json({ error: 'Message is required' }, { status: 400 })

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id')

  if (usersError || !users) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }

  const notifications = users.map(u => ({
    user_id: u.id,
    type: 'admin',
    message: message.trim(),
    post_id: null,
    is_read: false,
  }))

  const { error: insertError } = await supabase
    .from('notifications')
    .insert(notifications)

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, sent: notifications.length })
}
