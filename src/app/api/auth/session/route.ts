import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const userId = req.cookies.get('wiispr_user_id')?.value
  const nickname = req.cookies.get('wiispr_nickname')?.value

  if (!userId || !nickname) {
    return NextResponse.json({ user: null })
  }

  return NextResponse.json({ user: { id: userId, nickname } })
}

export async function POST(req: NextRequest) {
  const { userId, nickname } = await req.json()

  const response = NextResponse.json({ success: true })

  response.cookies.set('wiispr_user_id', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30
  })

  response.cookies.set('wiispr_nickname', nickname, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30
  })

  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('wiispr_user_id')
  response.cookies.delete('wiispr_nickname')
  return response
}
export async function PATCH(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  const { nickname } = await req.json()
  if (!nickname || nickname.length < 3) return NextResponse.json({ error: 'Invalid nickname' }, { status: 400 })
  await supabase.from('users').update({ nickname }).eq('id', userId)
  return NextResponse.json({ success: true })
}