'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Categories</h1>
        <p className="text-sm text-muted-foreground mt-1">Enable or disable categories on the platform.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{categories.length} Categories</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {categories.map((cat, i) => (
            <div key={cat.id} className={`flex items-center gap-4 px-6 py-4 ${i < categories.length - 1 ? 'border-b border-border' : ''}`}>
              <div className="text-muted-foreground">
                <CategoryIcon slug={cat.icon} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                  {cat.women_only && (
                    <Badge variant="secondary" className="text-[10px]">Women only</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">/{cat.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{cat.is_active ? 'Enabled' : 'Disabled'}</span>
                <Switch
                  checked={!!cat.is_active}
                  disabled={saving === String(cat.id)}
                  onCheckedChange={() => toggleCategory(cat.id, cat.is_active)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}