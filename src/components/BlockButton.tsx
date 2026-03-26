'use client'
import { useState } from 'react'
import { ShieldOff } from 'lucide-react'
import { toast } from 'sonner'

export default function BlockButton({ ghostId }: { ghostId: string }) {
  const [blocked, setBlocked] = useState(false)
  const [loading, setLoading] = useState(false)

  async function block() {
    if (blocked || loading) return
    setLoading(true)
    const res = await fetch('/api/blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ghostId, action: 'block' })
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      setBlocked(true)
      toast.success('Ghost ID blocked', { description: 'You won\'t see their posts in your feed' })
    } else if (data.error === 'Not logged in') {
      toast.error('Sign in to block')
    }
  }

  return (
    <button
      onClick={block}
      disabled={blocked || loading}
      style={{
        fontSize: '.75rem', fontWeight: 600, padding: '5px 10px',
        borderRadius: 'var(--rs)', border: '1px solid var(--bd)',
        background: 'none',
        color: blocked ? 'var(--rose)' : 'var(--t3)',
        cursor: blocked ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', gap: 4,
        transition: 'color .15s'
      }}
    >
      <ShieldOff size={12} />
      {blocked ? 'Blocked' : loading ? '...' : 'Block'}
    </button>
  )
}
