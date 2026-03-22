'use client'
import { useState } from 'react'
import { ArrowUp } from 'lucide-react'

export default function UpvoteButton({ postId, upvotes }: { postId: string, upvotes: number }) {
  const [count, setCount] = useState(upvotes)
  const [voted, setVoted] = useState(false)

  async function upvote() {
    if (voted) return
    setVoted(true)
    setCount(c => c + 1)
    await fetch('/api/posts/upvote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId })
    })
  }

  return (
    <button
      onClick={upvote}
      style={{
        fontSize: '.75rem', fontWeight: 600, padding: '5px 10px',
        borderRadius: 'var(--rs)', border: '1px solid var(--bd)',
        background: voted ? 'var(--blue)' : 'none',
        color: voted ? '#fff' : 'var(--t3)',
        cursor: voted ? 'default' : 'pointer',
        transition: 'all .15s',
        display: 'flex', alignItems: 'center', gap: 4
      }}
    >
      <ArrowUp size={12} strokeWidth={voted ? 2.5 : 1.75} />
      {count}
    </button>
  )
}