'use client'
import { useState } from 'react'
import CategoryIcon from './CategoryIcon'

interface Category {
  id: number
  name: string
  icon: string
  women_only: boolean
}

export default function CategoryFilter({ categories, onSelect }: { categories: Category[], onSelect: (id: number | null | string) => void }) {
  const [selected, setSelected] = useState<number | null | string>(null)

  function select(id: number | null | string) {
    setSelected(id)
    onSelect(id)
  }

  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
      <button
        onClick={() => select('following')}
        style={{
          fontSize: '.8rem', fontWeight: 600, padding: '6px 12px',
          borderRadius: 'var(--rs)', border: '1px solid var(--bd)',
          background: selected === 'following' ? '#18181B' : 'var(--sur)',
          color: selected === 'following' ? '#fff' : 'var(--t3)',
          cursor: 'pointer'
        }}
      >Following</button>
      <button
        onClick={() => select(null)}
        style={{
          fontSize: '.8rem', fontWeight: 600, padding: '6px 12px',
          borderRadius: 'var(--rs)', border: '1px solid var(--bd)',
          background: selected === null ? '#18181B' : 'var(--sur)',
          color: selected === null ? '#fff' : 'var(--t3)',
          cursor: 'pointer'
        }}
      >All</button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => select(cat.id)}
          style={{
            fontSize: '.8rem', fontWeight: 600, padding: '6px 12px',
            borderRadius: 'var(--rs)', border: '1px solid var(--bd)',
            background: selected === cat.id ? '#18181B' : 'var(--sur)',
            color: selected === cat.id ? '#fff' : 'var(--t3)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5
          }}
        >
          <CategoryIcon slug={cat.icon} />
          {cat.name}
        </button>
      ))}
    </div>
  )
}