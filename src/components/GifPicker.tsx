'use client'
import { useState, useEffect, useRef } from 'react'
import { X, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const TENOR_KEY = process.env.NEXT_PUBLIC_TENOR_API_KEY || ''
const GIPHY_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || ''

interface GifPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (url: string) => void
}

export default function GifPicker({ open, onClose, onSelect }: GifPickerProps) {
  const [query, setQuery] = useState('')
  const [gifs, setGifs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      // Load trending on open
      fetchGifs('')
    } else {
      setQuery('')
      setGifs([])
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => fetchGifs(query), 400)
    return () => clearTimeout(timer)
  }, [query, open])

  async function fetchGifs(q: string) {
    setLoading(true)
    try {
      let results: any[] = []
      // Try Tenor first
      if (TENOR_KEY) {
        const endpoint = q.trim()
          ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=${TENOR_KEY}&limit=20&contentfilter=medium`
          : `https://tenor.googleapis.com/v2/featured?key=${TENOR_KEY}&limit=20&contentfilter=medium`
        const res = await fetch(endpoint)
        if (res.ok) {
          const data = await res.json()
          results = (data.results || []).map((g: any) => ({
            id: g.id,
            preview: g.media_formats?.tinygif?.url || g.media_formats?.nanogif?.url || '',
            full: g.media_formats?.tinygif?.url || g.media_formats?.gif?.url || '',
          }))
        }
      }
      // Fallback to GIPHY
      if (results.length === 0 && GIPHY_KEY && q.trim()) {
        const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(q)}&limit=20&rating=pg`)
        if (res.ok) {
          const data = await res.json()
          results = (data.data || []).map((g: any) => ({
            id: g.id,
            preview: g.images?.fixed_width_small?.url || g.images?.fixed_width?.url || '',
            full: g.images?.fixed_width?.url || g.images?.original?.url || '',
          }))
        }
      } else if (results.length === 0 && GIPHY_KEY && !q.trim()) {
        const res = await fetch(`https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_KEY}&limit=20&rating=pg`)
        if (res.ok) {
          const data = await res.json()
          results = (data.data || []).map((g: any) => ({
            id: g.id,
            preview: g.images?.fixed_width_small?.url || g.images?.fixed_width?.url || '',
            full: g.images?.fixed_width?.url || g.images?.original?.url || '',
          }))
        }
      }
      setGifs(results)
    } catch {
      setGifs([])
    }
    setLoading(false)
  }

  function selectGif(gif: { id: string, preview: string, full: string }) {
    if (gif.full) {
      onSelect(gif.full)
      onClose()
    }
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'fixed', bottom: 80, left: 20, right: 20,
            maxWidth: 480, margin: '0 auto',
            background: 'var(--sur)', border: '1px solid var(--bd)',
            borderRadius: 'var(--rm)', boxShadow: '0 12px 40px rgba(0,0,0,.25)',
            overflow: 'hidden', zIndex: 9999,
            maxHeight: 380, display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderBottom: '1px solid var(--bd)' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={13} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--t4)' }} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search GIFs..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{
                  width: '100%', height: 32, paddingLeft: 28, paddingRight: 10,
                  fontSize: '.8rem', color: 'var(--t1)', background: 'var(--bg)',
                  border: '1px solid var(--bd)', borderRadius: 'var(--r)',
                  outline: 'none', fontFamily: 'inherit',
                }}
              />
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t4)', display: 'flex', padding: 4 }}>
              <X size={16} />
            </button>
          </div>

          {/* Grid */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {loading && gifs.length === 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ background: 'var(--bg)', borderRadius: 'var(--rs)', aspectRatio: '16/10', animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))}
              </div>
            )}
            {!loading && gifs.length === 0 && !query && (!TENOR_KEY && !GIPHY_KEY ? (
              <p style={{ textAlign: 'center', fontSize: '.78rem', color: 'var(--t4)', padding: 20 }}>GIF search not configured. Add NEXT_PUBLIC_TENOR_API_KEY or NEXT_PUBLIC_GIPHY_API_KEY to env vars.</p>
            ) : (
              <p style={{ textAlign: 'center', fontSize: '.78rem', color: 'var(--t4)', padding: 20 }}>Search for a GIF</p>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {gifs.map((gif, i) => (
                  <button
                    key={gif.id || i}
                    onClick={() => selectGif(gif)}
                    style={{
                      background: 'var(--bg)', border: '1px solid var(--bd)',
                      borderRadius: 'var(--rs)', overflow: 'hidden', cursor: 'pointer',
                      padding: 0, display: 'block', aspectRatio: '16/10',
                    }}
                  >
                    <img
                      src={gif.preview}
                      alt=""
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </button>
              ))}
            </div>
            {!loading && gifs.length === 0 && query && (
              <p style={{ textAlign: 'center', fontSize: '.78rem', color: 'var(--t4)', padding: 20 }}>No GIFs found</p>
            )}
          </div>

          {/* Tenor attribution */}
          <div style={{ padding: '6px 12px', borderTop: '1px solid var(--bd)', textAlign: 'right' }}>
            <span style={{ fontSize: '.6rem', color: 'var(--t4)' }}>Powered by Tenor</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
