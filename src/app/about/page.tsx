import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
export const metadata = { title: 'About — wiispr' }
export default function AboutPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ marginBottom: 40 }}>
          <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700, fontSize: '2rem', display: 'inline-flex', alignItems: 'center', gap: 10, color: 'var(--t1)' }}>
            <span style={{ width: 10, height: 10, background: 'var(--blue)', borderRadius: '50%', display: 'inline-block' }}></span>
            wiispr
          </span>
          <p style={{ fontSize: '1.125rem', color: 'var(--t2)', marginTop: 12, lineHeight: 1.7 }}>An anonymous forum built for Saudi Arabia. Say what you actually think.</p>
        </div>
        {[
          { title: 'Why wiispr?', body: 'Saudi Arabia has no shortage of opinions. It has a shortage of safe places to share them. wiispr fills that gap — a platform where your identity stays hidden but your voice is heard.' },
          { title: 'How it works', body: 'You sign up with just your email. Every post you make is assigned a random Ghost ID. No one — not even us — can link your posts back to you. You build reputation through honest contributions, not followers.' },
          { title: 'The two i\'s', body: 'The name wiispr has two i\'s — representing two people in conversation. That\'s what this platform is about: real conversations between real people, without the noise of identity.' },
          { title: 'Made in Saudi Arabia', body: 'wiispr is built with Saudi Arabia in mind — its culture, its conversations, and its need for honest spaces. We support Arabic content and are working toward full RTL support.' },
        ].map(s => (
          <div key={s.title} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>{s.title}</h2>
            <p style={{ fontSize: '.9rem', color: 'var(--t2)', lineHeight: 1.8 }}>{s.body}</p>
          </div>
        ))}
        <p style={{ fontSize: '.875rem', color: 'var(--t4)', marginTop: 40 }}>Made in Saudi Arabia 🇸🇦</p>
      </div>
      <Footer />
    </main>
  )
}