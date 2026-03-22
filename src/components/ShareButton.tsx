'use client'
import { useState } from 'react'

export default function ShareButton({ postId }: { postId: string }) {
  const [copied, setCopied] = useState(false)

  function share() {
    const url = window.location.origin + '/post/' + postId
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={share}
      style={{
        fontSize: '.75rem', fontWeight: 600, padding: '5px 10px',
        borderRadius: 'var(--rs)', border: '1px solid var(--bd)',
        background: 'none', color: copied ? 'var(--grn)' : 'var(--t3)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
        transition: 'color .15s'
      }}
    >
      <svg width="12" height="12" fill="none" viewBox="0 0 16 16">
        <path d="M10.5 9.5l2.5-2-2.5-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13 7.5H7C5.3 7.5 4 8.8 4 10.5v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      {copied ? 'Copied!' : 'Share'}
    </button>
  )
}