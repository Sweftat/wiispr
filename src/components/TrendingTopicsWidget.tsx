'use client'
import { useEffect, useState } from 'react'
import { Hash } from 'lucide-react'

export default function TrendingTopicsWidget() {
  const [topics, setTopics] = useState<{ tag?: string, keyword?: string, count: number }[]>([])

  useEffect(() => {
    // Try tags first, fall back to keyword extraction
    fetch('/api/tags?trending=1')
      .then(r => r.json())
      .then(d => {
        if (d.trending && d.trending.length > 0) {
          setTopics(d.trending)
        } else {
          // Fallback to old keyword extraction
          fetch('/api/trending-topics')
            .then(r => r.json())
            .then(d => setTopics(d.topics || []))
        }
      })
      .catch(() => {
        fetch('/api/trending-topics')
          .then(r => r.json())
          .then(d => setTopics(d.topics || []))
      })
  }, [])

  if (topics.length === 0) return null

  function handleClick(topic: string) {
    window.dispatchEvent(new CustomEvent('filterByTag', { detail: topic }))
  }

  return (
    <div style={{ marginTop: 20 }}>
      <p style={{ fontSize: '.625rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--t4)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
        <Hash size={11} />Trending
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {topics.map((t, i) => {
          const label = t.tag ? `#${t.tag}` : t.keyword || ''
          return (
            <span
              key={label}
              onClick={() => handleClick(t.tag || t.keyword || '')}
              style={{
                fontSize: '.72rem', fontWeight: 600,
                padding: '4px 10px', borderRadius: 99,
                background: 'var(--bd)', border: 'none',
                color: 'var(--t3)', cursor: 'pointer',
              }}
            >
              {label}
              <span style={{ marginLeft: 4, fontSize: '.6rem', color: 'var(--t4)' }}>{t.count}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
