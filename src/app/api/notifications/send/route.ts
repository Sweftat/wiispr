import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
// @ts-ignore
import webpush from 'web-push'

export const dynamic = 'force-dynamic'

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BKfrV06-FsNeKfptFfyYVU2frdOJ3niFK2jYxWkBQ196whlN4kCRu90m1aiG3h8yU3kqhShHtVK-F2vvWW3xkGo'
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '0pBbh5LDjTgamVtSO_8cKT-eYA4Z_PnoLdDqqBtm1wA'

webpush.setVapidDetails('mailto:hello@wiispr.app', VAPID_PUBLIC, VAPID_PRIVATE)

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const adminId = req.cookies.get('wiispr_user_id')?.value
  if (!adminId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { data: admin } = await supabase.from('users').select('is_admin').eq('id', adminId).single()
  if (!admin?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { title, body, url, userId: targetUserId } = await req.json()

  let query = supabase.from('push_subscriptions').select('subscription')
  if (targetUserId) {
    query = query.eq('user_id', targetUserId)
  }
  const { data: subs } = await query

  const payload = JSON.stringify({ title: title || 'wiispr', body: body || '', url: url || '/' })

  let sent = 0
  let failed = 0
  for (const sub of subs || []) {
    try {
      await webpush.sendNotification(sub.subscription, payload)
      sent++
    } catch {
      failed++
      // Remove invalid subscription
      await supabase.from('push_subscriptions').delete().eq('subscription', sub.subscription)
    }
  }

  return NextResponse.json({ success: true, sent, failed })
}
