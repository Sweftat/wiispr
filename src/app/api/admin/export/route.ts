import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function toCSV(rows: Record<string, any>[], columns: string[]): string {
  const escape = (v: any) => {
    const s = v == null ? '' : String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }
  const header = columns.join(',')
  const body = rows.map(row => columns.map(c => escape(row[c])).join(','))
  return [header, ...body].join('\r\n')
}

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = req.cookies.get('wiispr_user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { data: admin } = await supabase.from('users').select('is_admin').eq('id', userId).single()
  if (!admin?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const type = req.nextUrl.searchParams.get('type')

  let csv = ''
  let filename = ''

  if (type === 'users') {
    const { data, error } = await supabase
      .from('users')
      .select('id, nickname, gender, age_range, trust_level, rep_score, is_suspended, is_admin, created_at')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    csv = toCSV(data || [], ['id', 'nickname', 'gender', 'age_range', 'trust_level', 'rep_score', 'is_suspended', 'is_admin', 'created_at'])
    filename = `wiispr-users-${new Date().toISOString().slice(0, 10)}.csv`

  } else if (type === 'posts') {
    const { data, error } = await supabase
      .from('posts')
      .select('id, content, categories(name), upvotes, replies_count, is_blurred, is_deleted, created_at')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const flat = (data || []).map(p => ({
      id: p.id,
      content: p.content,
      category: (p.categories as any)?.name || '',
      upvotes: p.upvotes,
      replies_count: p.replies_count,
      is_blurred: p.is_blurred,
      is_deleted: p.is_deleted,
      created_at: p.created_at,
    }))

    csv = toCSV(flat, ['id', 'content', 'category', 'upvotes', 'replies_count', 'is_blurred', 'is_deleted', 'created_at'])
    filename = `wiispr-posts-${new Date().toISOString().slice(0, 10)}.csv`

  } else {
    return NextResponse.json({ error: 'Invalid type. Use ?type=users or ?type=posts' }, { status: 400 })
  }

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
