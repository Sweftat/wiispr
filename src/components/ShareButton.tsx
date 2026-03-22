'use client'
import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

export default function ShareButton({ postId }: { postId: string }) {
  const [copied, setCopied] = useState(false)

  function share() {
    const url = window.location.origin + '/post/' + postId
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={share} style={{
      fontSize: '.75rem', fontWeight: 600, padding: '5px 10px',
      borderRadius: 'var(--rs)', border: '1px solid var(--bd)',
      background: 'none', color: copied ? 'var(--grn)' : 'var(--t3)',
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
      transition: 'color .15s'
    }}>
      {copied ? <Check size={12} /> : <Share2 size={12} />}
      {copied ? 'Copied!' : 'Share'}
    </button>
  )
}