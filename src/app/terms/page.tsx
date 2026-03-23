import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
export const metadata = { title: 'Terms of Service — wiispr' }
export default function TermsPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ fontSize: '.8rem', color: 'var(--t4)', marginBottom: 32 }}>Last updated: March 2026</p>
        {[
          { title: '1. Acceptance', body: 'By using wiispr you agree to these terms. If you do not agree, do not use the platform.' },
          { title: '2. Anonymity', body: 'wiispr is an anonymous platform. You may not attempt to identify, dox, or expose other users. Any attempt to do so will result in immediate account suspension.' },
          { title: '3. Prohibited Content', body: 'You may not post content that is illegal, defamatory, threatening, or violates the privacy of others. No personal contact information including phone numbers, emails, or social media handles.' },
          { title: '4. Women\'s Space', body: 'The Women\'s Space category is reserved for female users. Misrepresenting your gender to access this space is a violation of these terms.' },
          { title: '5. Account Suspension', body: 'We reserve the right to suspend or terminate accounts that violate these terms at our sole discretion.' },
          { title: '6. Content Ownership', body: 'You retain ownership of your content. By posting, you grant wiispr a license to display your content on the platform.' },
          { title: '7. Disclaimer', body: 'wiispr is provided as-is without warranties of any kind. We are not liable for any damages arising from your use of the platform.' },
          { title: '8. Changes', body: 'We may update these terms at any time. Continued use of the platform constitutes acceptance of the updated terms.' },
        ].map(s => (
          <div key={s.title} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>{s.title}</h2>
            <p style={{ fontSize: '.9rem', color: 'var(--t2)', lineHeight: 1.8 }}>{s.body}</p>
          </div>
        ))}
      </div>
      <Footer />
    </main>
  )
}