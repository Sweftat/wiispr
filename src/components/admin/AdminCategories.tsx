'use client'
import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import CategoryIcon from '@/components/CategoryIcon'

export default function AdminCategories({ initialCategories }: { initialCategories: any[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [saving, setSaving] = useState<string | null>(null)

  async function toggleCategory(catId: number, isActive: boolean) {
    setSaving(String(catId))
    await fetch('/api/admin/category-action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ categoryId: catId, action: isActive ? 'disable' : 'enable' }) })
    setCategories(categories.map(c => c.id === catId ? { ...c, is_active: !isActive } : c))
    setSaving(null)
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Categories</h1>
      <p style={{ fontSize: '.875rem', color: 'var(--t3)', marginBottom: 24 }}>Enable or disable categories on the platform.</p>

      <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', overflow: 'hidden' }}>
        {categories.map((cat, i) => (
          <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < categories.length - 1 ? '1px solid var(--bd)' : 'none' }}>
            <div style={{ color: 'var(--t3)' }}><CategoryIcon slug={cat.icon} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <p style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--t1)' }}>{cat.name}</p>
                {cat.women_only && <span style={{ fontSize: '.6rem', fontWeight: 700, color: 'var(--rose)', background: 'var(--rose-d)', padding: '1px 6px', borderRadius: 3 }}>WOMEN</span>}
              </div>
              <p style={{ fontSize: '.75rem', color: 'var(--t4)', marginTop: 2 }}>/{cat.slug}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '.75rem', color: cat.is_active ? 'var(--grn)' : 'var(--t4)', fontWeight: 500 }}>{cat.is_active ? 'Enabled' : 'Disabled'}</span>
              <Switch checked={!!cat.is_active} disabled={saving === String(cat.id)} onCheckedChange={() => toggleCategory(cat.id, cat.is_active)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}