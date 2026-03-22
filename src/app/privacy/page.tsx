import Nav from '@/components/Nav'
export const metadata = { title: 'Privacy Policy — wiispr' }
export default function PrivacyPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ fontSize: '.8rem', color: 'var(--t4)', marginBottom: 32 }}>Last updated: March 2026</p>
        {[
          { title: 'What we collect', body: 'We collect your email address (stored as a one-way hash), age range, gender, and the content you post. We do not store your plain-text email.' },
          { title: 'How we use it', body: 'Your email hash is used only for authentication via OTP codes. We do not sell, share, or use your data for advertising.' },
          { title: 'Ghost IDs', body: 'Every post and reply is assigned a random Ghost ID. This ID is not linked to your account in any way visible to other users.' },
          { title: 'Cookies', body: 'We use a session cookie to keep you logged in. No tracking or advertising cookies are used.' },
          { title: 'Data retention', body: 'You may delete your account at any time. Upon deletion, your posts are anonymized and your account data is removed.' },
          { title: 'Third parties', body: 'We use Supabase for database hosting and Resend for email delivery. Both are bound by their own privacy policies.' },
          { title: 'Contact', body: 'For privacy concerns, contact us at privacy@wiispr.com.' },
        ].map(s => (
          <div key={s.title} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>{s.title}</h2>
            <p style={{ fontSize: '.9rem', color: 'var(--t2)', lineHeight: 1.8 }}>{s.body}</p>
          </div>
        ))}
      </div>
    </main>
  )
}