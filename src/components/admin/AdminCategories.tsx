'use client'
import { useState } from 'react'
import CategoryIcon from '@/components/CategoryIcon'

export default function AdminCategories({ initialCategories }: { initialCategories: any[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [saving, setSaving] = useState<string | null>(null)

  async function toggleCategory(catId: number, isActive: boolean) {
    setSaving(String(catId))
    await fetch('/api/admin/category-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId: catId, action: isActive ? 'disable' : 'enable' })
    })
    setCategories(categories.map(c => c.id === catId ? { ...c, is_active: !isActive } : c))
    setSaving(null)
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Categories</h1>
      <p style={{ fontSize: '.875rem', color: 'var(--t3)', marginBottom: 24 }}>Enable or disable categories on the platform.</p>

      <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', overflow: 'hidden' }}>
        {categories.map((cat, i) => (
          <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: i < categories.length - 1 ? '1px solid var(--bd)' : 'none' }}>
            <CategoryIcon slug={cat.icon} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--t1)' }}>{cat.name}</p>
              <p style={{ fontSize: '.75rem', color: 'var(--t4)' }}>{cat.women_only ? 'Women only' : 'All users'}</p>
            </div>
            <button
              onClick={() => toggleCategory(cat.id, cat.is_active)}
              disabled={saving === String(cat.id)}
              style={{
                padding: '6px 14px', borderRadius: 'var(--r)', border: 'none',
                background: cat.is_active ? 'var(--grn)' : 'var(--bd)',
                color: cat.is_active ? '#fff' : 'var(--t3)',
                fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all .15s'
              }}
            >
              {saving === String(cat.id) ? '...' : cat.is_active ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}