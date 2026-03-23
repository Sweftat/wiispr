import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
export const metadata = { title: 'Community Rules — wiispr' }
export default function RulesPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>Community Rules</h1>
        <p style={{ fontSize: '.9rem', color: 'var(--t3)', marginBottom: 32, lineHeight: 1.7 }}>wiispr works because people follow these rules. Break them and your account gets suspended.</p>
        {[
          { num: '01', title: 'No personal information', body: 'Never share phone numbers, emails, social handles, or any information that could identify you or someone else.', color: 'var(--rose)' },
          { num: '02', title: 'No harassment', body: 'Targeting, threatening, or repeatedly attacking another user is not allowed under any circumstances.', color: 'var(--rose)' },
          { num: '03', title: 'No doxxing', body: 'Attempting to reveal the real identity of any user — including speculating about who they are — is an immediate ban.', color: 'var(--rose)' },
          { num: '04', title: 'Stay on topic', body: 'Post in the right category. Off-topic posts clutter the feed and will be moved or removed.', color: 'var(--blue)' },
          { num: '05', title: 'Be honest', body: 'This is an anonymous platform. Use that freedom to be genuinely honest, not to spread misinformation.', color: 'var(--blue)' },
          { num: '06', title: 'Respect Women\'s Space', body: 'The Women\'s Space category is for female users only. Violating this space results in immediate suspension.', color: 'var(--blue)' },
          { num: '07', title: 'No spam', body: 'Repeated posts, bot activity, or promotional content will be removed and the account suspended.', color: 'var(--t3)' },
        ].map(s => (
          <div key={s.num} style={{ display: 'flex', gap: 16, marginBottom: 24, padding: '16px 18px', background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)' }}>
            <span style={{ fontSize: '.75rem', fontWeight: 800, color: s.color, fontFamily: 'monospace', minWidth: 24 }}>{s.num}</span>
            <div>
              <h2 style={{ fontSize: '.9375rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>{s.title}</h2>
              <p style={{ fontSize: '.875rem', color: 'var(--t2)', lineHeight: 1.7 }}>{s.body}</p>
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </main>
  )
}