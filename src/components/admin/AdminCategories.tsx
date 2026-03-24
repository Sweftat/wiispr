'use client'
import { useState, useRef } from 'react'
import { Switch } from '@/components/ui/switch'
import CategoryIcon from '@/components/CategoryIcon'
import { Plus, GripVertical, X } from 'lucide-react'

export default function AdminCategories({ initialCategories }: { initialCategories: any[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [saving, setSaving] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', icon: '' })
  const [creating, setCreating] = useState(false)
  const dragItem = useRef<number | null>(null)
  const dragOver = useRef<number | null>(null)

  async function toggleCategory(catId: number, isActive: boolean) {
    setSaving(String(catId))
    await fetch('/api/admin/category-action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ categoryId: catId, action: isActive ? 'disable' : 'enable' }) })
    setCategories(categories.map(c => c.id === catId ? { ...c, is_active: !isActive } : c))
    setSaving(null)
  }

  async function createCategory() {
    if (!form.name.trim() || !form.slug.trim()) return
    setCreating(true)
    await fetch('/api/admin/category-action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create', name: form.name.trim(), slug: form.slug.trim(), icon: form.icon.trim() || 'circle' }) })
    // Reload page to get DB-assigned id
    window.location.reload()
  }

  function handleDragStart(index: number) {
    dragItem.current = index
  }

  function handleDragEnter(index: number) {
    dragOver.current = index
    if (dragItem.current === null || dragItem.current === index) return
    const reordered = [...categories]
    const dragged = reordered.splice(dragItem.current, 1)[0]
    reordered.splice(index, 0, dragged)
    dragItem.current = index
    setCategories(reordered)
  }

  async function handleDragEnd() {
    dragItem.current = null
    dragOver.current = null
    const order = categories.map((c, i) => ({ id: c.id, sort_order: i + 1 }))
    await fetch('/api/admin/category-action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reorder', order }) })
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Categories</h1>
          <p style={{ fontSize: '.875rem', color: 'var(--t3)' }}>Enable, disable, reorder, or create categories.</p>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 'var(--r)', background: 'var(--blue)', color: '#fff', border: 'none', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? 'Cancel' : 'New category'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', padding: '18px 20px', marginBottom: 16 }}>
          <h2 style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 14 }}>New Category</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>Name</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: f.slug || e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))}
                placeholder="e.g. Technology"
                style={{ width: '100%', height: 36, padding: '0 10px', fontSize: '.875rem', color: 'var(--t1)', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>Slug</label>
              <input
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                placeholder="e.g. technology"
                style={{ width: '100%', height: 36, padding: '0 10px', fontSize: '.875rem', color: 'var(--t1)', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>Icon name <span style={{ fontWeight: 400, color: 'var(--t4)' }}>(lucide icon slug, optional)</span></label>
            <input
              value={form.icon}
              onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
              placeholder="e.g. cpu, heart, globe"
              style={{ width: '100%', height: 36, padding: '0 10px', fontSize: '.875rem', color: 'var(--t1)', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>
          <button
            onClick={createCategory}
            disabled={!form.name.trim() || !form.slug.trim() || creating}
            style={{ padding: '8px 20px', borderRadius: 'var(--r)', background: form.name && form.slug ? 'var(--blue)' : 'var(--bd)', color: '#fff', border: 'none', fontSize: '.875rem', fontWeight: 600, cursor: form.name && form.slug ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}
          >
            {creating ? 'Creating...' : 'Create category'}
          </button>
        </div>
      )}

      {/* Drag-to-reorder list */}
      <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto', gap: 10, padding: '8px 16px', borderBottom: '1px solid var(--bd)', background: 'var(--bg)' }}>
          <span />
          <p style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Category</p>
          <p style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Active</p>
        </div>
        {categories.map((cat, i) => (
          <div
            key={cat.id}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragEnter={() => handleDragEnter(i)}
            onDragEnd={handleDragEnd}
            onDragOver={e => e.preventDefault()}
            style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto', gap: 10, alignItems: 'center', padding: '12px 16px', borderBottom: i < categories.length - 1 ? '1px solid var(--bd)' : 'none', cursor: 'grab', background: dragItem.current === i ? 'var(--blue-d)' : 'none', transition: 'background .1s', userSelect: 'none' }}
          >
            <GripVertical size={14} style={{ color: 'var(--t4)', flexShrink: 0 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ color: 'var(--t3)' }}><CategoryIcon slug={cat.icon} /></div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <p style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--t1)' }}>{cat.name}</p>
                  {cat.women_only && <span style={{ fontSize: '.6rem', fontWeight: 700, color: 'var(--rose)', background: 'var(--rose-d)', padding: '1px 6px', borderRadius: 3 }}>WOMEN</span>}
                </div>
                <p style={{ fontSize: '.75rem', color: 'var(--t4)', marginTop: 1 }}>/{cat.slug}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '.75rem', color: cat.is_active ? 'var(--grn)' : 'var(--t4)', fontWeight: 500 }}>{cat.is_active ? 'On' : 'Off'}</span>
              <Switch checked={!!cat.is_active} disabled={saving === String(cat.id)} onCheckedChange={() => toggleCategory(cat.id, cat.is_active)} />
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '.75rem', color: 'var(--t4)', marginTop: 10 }}>Drag rows to reorder. Order saves automatically on drop.</p>
    </div>
  )
}
