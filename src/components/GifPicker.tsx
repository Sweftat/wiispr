'use client'
import { useState, useEffect, useRef } from 'react'
import { X, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const TENOR_KEY = process.env.NEXT_PUBLIC_TENOR_API_KEY || 'AIzaSyAyimkuYQYF_FXVALexPzkcsvZBywrLdyI'

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
      const endpoint = q.trim()
        ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=${TENOR_KEY}&limit=20&contentfilter=medium`
        : `https://tenor.googleapis.com/v2/featured?key=${TENOR_KEY}&limit=20&contentfilter=medium`
      const res = await fetch(endpoint)
      const data = await res.json()
      setGifs(data.results || [])
    } catch {
      setGifs([])
    }
    setLoading(false)
  }

  function selectGif(gif: any) {
    const url = gif.media_formats?.tinygif?.url || gif.media_formats?.gif?.url || ''
    if (url) {
      onSelect(url)
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
            position: 'absolute', bottom: '100%', left: 0, right: 0,
            marginBottom: 8,
            background: 'var(--sur)', border: '1px solid var(--bd)',
            borderRadius: 'var(--rm)', boxShadow: '0 8px 32px rgba(0,0,0,.15)',
            overflow: 'hidden', zIndex: 200,
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
              <div style={{ textAlign: 'center', padding: 20 }}>
                <p style={{ fontSize: '.78rem', color: 'var(--t4)' }}>Loading...</p>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {gifs.map((gif, i) => {
                const preview = gif.media_formats?.tinygif?.url || gif.media_formats?.nanogif?.url || ''
                return (
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
                      src={preview}
                      alt=""
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </button>
                )
              })}
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
