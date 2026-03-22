'use client'
import { useState } from 'react'
import CategoryIcon from './CategoryIcon'
import { Users } from 'lucide-react'

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

  const chipStyle = (isActive: boolean) => ({
    fontSize: '.8rem', fontWeight: 600, padding: '6px 12px',
    borderRadius: 'var(--rs)',
    border: isActive ? '1px solid var(--blue)' : '1px solid var(--bd)',
    background: isActive ? 'var(--blue)' : 'var(--sur)',
    color: isActive ? '#fff' : 'var(--t3)',
    cursor: 'pointer', transition: 'all .15s',
    display: 'flex', alignItems: 'center', gap: 5
  } as React.CSSProperties)

  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
      <button onClick={() => select('following')} style={chipStyle(selected === 'following')}>
        <Users size={12} />
        Following
      </button>
      <button onClick={() => select(null)} style={chipStyle(selected === null)}>
        All
      </button>
      {categories.map(cat => (
        <button key={cat.id} onClick={() => select(cat.id)} style={chipStyle(selected === cat.id)}>
          <CategoryIcon slug={cat.icon} />
          {cat.name}
        </button>
      ))}
    </div>
  )
}