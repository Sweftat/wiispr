'use client'
import { useEffect, useState } from 'react'
import { Hash } from 'lucide-react'

export default function TrendingTopicsWidget() {
  const [topics, setTopics] = useState<{ keyword: string, count: number }[]>([])

  useEffect(() => {
    fetch('/api/trending-topics')
      .then(r => r.json())
      .then(d => setTopics(d.topics || []))
      .catch(() => {})
  }, [])

  if (topics.length === 0) return null

  return (
    <div style={{ marginTop: 20 }}>
      <p style={{ fontSize: '.625rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--t4)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
        <Hash size={11} />Trending Topics
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {topics.map((t, i) => (
          <span
            key={t.keyword}
            style={{
              fontSize: '.72rem', fontWeight: 600,
              padding: '5px 10px', borderRadius: 'var(--rs)',
              background: i === 0 ? 'var(--blue-d)' : 'var(--sur)',
              border: `1px solid ${i === 0 ? 'var(--blue)' : 'var(--bd)'}`,
              color: i === 0 ? 'var(--blue)' : 'var(--t2)',
              cursor: 'default',
            }}
          >
            {t.keyword}
            <span style={{ marginLeft: 4, fontSize: '.6rem', color: 'var(--t4)' }}>{t.count}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
