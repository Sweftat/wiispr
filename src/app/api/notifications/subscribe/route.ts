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

  const { subscription } = await req.json()
  if (!subscription) return NextResponse.json({ error: 'Missing subscription' }, { status: 400 })

  // Remove existing subscription for this user
  await supabase.from('push_subscriptions').delete().eq('user_id', userId)

  // Save new subscription
  await supabase.from('push_subscriptions').insert({
    user_id: userId,
    subscription,
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  await supabase.from('push_subscriptions').delete().eq('user_id', userId)
  return NextResponse.json({ success: true })
}
