'use client'
import { useEffect, useState } from 'react'
import AccessibilityToolbar from './AccessibilityToolbar'

const platformLabels: Record<string, string> = {
  twitter: 'X',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
}

export default function Footer() {
  const [socials, setSocials] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/admin/social-links')
      .then(r => r.json())
      .then(d => setSocials(d.links || {}))
  }, [])

  const activeLinks = Object.entries(socials).filter(([, url]) => url?.trim())

  return (
    <footer style={{
      borderTop: '1px solid var(--bd)', background: 'var(--sur)',
      padding: '24px 20px', marginTop: 40
    }}>
      <style>{`.footer-link:hover { color: var(--t1) !important; }`}</style>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, background: 'var(--blue)', borderRadius: '50%', display: 'inline-block' }}></span>
          <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700, fontSize: '.9375rem', color: 'var(--t1)' }}>wiispr</span>
          <span style={{ fontSize: '.75rem', color: 'var(--t4)', marginLeft: 4 }}>Made in Saudi Arabia 🇸🇦</span>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { label: 'About', href: '/about' },
            { label: 'Rules', href: '/rules' },
            { label: 'Terms', href: '/terms' },
            { label: 'Privacy', href: '/privacy' },
          ].map(link => (
            <a key={link.label} href={link.href} className="footer-link" style={{ fontSize: '.8rem', color: 'var(--t3)', textDecoration: 'none', fontWeight: 500 }}>
              {link.label}
            </a>
          ))}
          {activeLinks.length > 0 && (
            <span style={{ width: 1, height: 14, background: 'var(--bd)', display: 'inline-block' }} />
          )}
          {activeLinks.map(([key, url]) => (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
              style={{ fontSize: '.8rem', color: 'var(--t3)', textDecoration: 'none', fontWeight: 500 }}
            >
              {platformLabels[key] || key}
            </a>
          ))}
          <span style={{ width: 1, height: 14, background: 'var(--bd)', display: 'inline-block' }} />
          <AccessibilityToolbar />
        </div>
      </div>
    </footer>
  )
}
