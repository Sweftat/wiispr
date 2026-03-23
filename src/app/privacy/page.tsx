import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Privacy Policy — wiispr' }
export default async function PrivacyPage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data } = await supabase.from('legal_pages').select('content').eq('id', 'privacy').single()
  const content = data?.content || ''
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div style={{ flex: 1, maxWidth: 680, margin: '0 auto', padding: '40px 20px', width: '100%' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ fontSize: '.8rem', color: 'var(--t4)', marginBottom: 32 }}>Last updated: March 2026</p>
        <div style={{ fontSize: '.9rem', color: 'var(--t2)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{content}</div>
      </div>
      <Footer />
    </main>
  )
}
