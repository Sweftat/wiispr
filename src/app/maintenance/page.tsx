export default function MaintenancePage() {
  return (
    <main style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>

      <div style={{ marginBottom: 32 }}>
        <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700, fontSize: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--t1)' }}>
          <span style={{ width: 8, height: 8, background: 'var(--blue)', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
          wiispr
        </span>
      </div>

      <div style={{ maxWidth: 400, width: '100%' }}>
        <div style={{ fontSize: '3rem', marginBottom: 20 }}>🛠️</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 12, letterSpacing: '-.02em' }}>
          We&apos;ll be right back
        </h1>
        <p style={{ fontSize: '.9375rem', color: 'var(--t3)', lineHeight: 1.7, marginBottom: 32 }}>
          wiispr is currently undergoing maintenance. We&apos;re working hard to get things back online. Check back shortly.
        </p>
      </div>

      <p style={{ marginTop: 48, fontSize: '.75rem', color: 'var(--t4)' }}>Made in Saudi Arabia 🇸🇦</p>
    </main>
  )
}
