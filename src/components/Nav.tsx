import Link from 'next/link'

export default function Nav() {
  return (
    <nav style={{
      height: 52,
      background: 'var(--sur)',
      borderBottom: '1px solid var(--bd)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: 16,
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <Link href="/" style={{
        fontFamily: 'Georgia, serif',
        fontStyle: 'italic',
        fontWeight: 700,
        fontSize: '1.0625rem',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        color: 'var(--t1)'
      }}>
        <span style={{
          width: 6,
          height: 6,
          background: 'var(--blue)',
          borderRadius: '50%',
          display: 'inline-block'
        }}></span>
        wiispr
      </Link>
      <span style={{ flex: 1 }}></span>
      <Link href="/auth" style={{
        fontSize: '.8rem',
        fontWeight: 600,
        padding: '6px 14px',
        borderRadius: 'var(--r)',
        border: '1px solid var(--bd)',
        color: 'var(--t2)'
      }}>Sign in</Link>
      <Link href="/auth" style={{
        fontSize: '.8rem',
        fontWeight: 600,
        padding: '6px 14px',
        borderRadius: 'var(--r)',
        background: '#18181B',
        color: '#fff'
      }}>Join free</Link>
    </nav>
  )
}