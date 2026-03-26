'use client'
import { useState, useEffect } from 'react'
import { Eye, Plus, Minus } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const COLOR_MODES = [
  { key: 'none', label: 'Default' },
  { key: 'protanopia', label: 'Protanopia' },
  { key: 'deuteranopia', label: 'Deuteranopia' },
  { key: 'tritanopia', label: 'Tritanopia' },
  { key: 'grayscale', label: 'Grayscale' },
]

const FILTERS: Record<string, string> = {
  none: 'none',
  protanopia: 'url(#protanopia)',
  deuteranopia: 'url(#deuteranopia)',
  tritanopia: 'url(#tritanopia)',
  grayscale: 'grayscale(100%)',
}

const ZOOM_STEPS = [85, 90, 95, 100, 105, 110, 120, 130, 150]

export default function AccessibilityToolbar() {
  const [zoom, setZoom] = useState(100)
  const [colorMode, setColorMode] = useState('none')
  const [showColorMenu, setShowColorMenu] = useState(false)

  useEffect(() => {
    const savedZoom = localStorage.getItem('a11y_zoom')
    const savedColor = localStorage.getItem('a11y_color')
    if (savedZoom) setZoom(parseInt(savedZoom))
    if (savedColor) setColorMode(savedColor)
  }, [])

  useEffect(() => {
    document.documentElement.style.fontSize = `${zoom}%`
    localStorage.setItem('a11y_zoom', String(zoom))
  }, [zoom])

  useEffect(() => {
    document.documentElement.style.filter = FILTERS[colorMode] || 'none'
    localStorage.setItem('a11y_color', colorMode)
  }, [colorMode])

  function zoomIn() {
    const idx = ZOOM_STEPS.indexOf(zoom)
    if (idx < ZOOM_STEPS.length - 1) setZoom(ZOOM_STEPS[idx + 1])
    else if (idx === -1) {
      const next = ZOOM_STEPS.find(z => z > zoom)
      if (next) setZoom(next)
    }
  }

  function zoomOut() {
    const idx = ZOOM_STEPS.indexOf(zoom)
    if (idx > 0) setZoom(ZOOM_STEPS[idx - 1])
    else if (idx === -1) {
      const prev = [...ZOOM_STEPS].reverse().find(z => z < zoom)
      if (prev) setZoom(prev)
    }
  }

  const btnStyle: React.CSSProperties = {
    width: 32, height: 32,
    borderRadius: 'var(--rs)',
    border: '1px solid var(--bd)',
    background: 'var(--sur)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'var(--t3)',
    transition: 'all .15s',
    position: 'relative' as const,
    padding: 0,
    fontFamily: 'inherit',
  }

  return (
    <>
      {/* SVG filters — hidden, global */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="protanopia">
            <feColorMatrix type="matrix" values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0" />
          </filter>
          <filter id="deuteranopia">
            <feColorMatrix type="matrix" values="0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0" />
          </filter>
          <filter id="tritanopia">
            <feColorMatrix type="matrix" values="0.95 0.05 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0" />
          </filter>
        </defs>
      </svg>

      {/* Inline footer widget — eye + zoom buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Color blindness button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowColorMenu(o => !o)}
            aria-label="Color vision settings"
            style={{
              ...btnStyle,
              border: colorMode !== 'none' ? '1px solid var(--blue)' : '1px solid var(--bd)',
              color: colorMode !== 'none' ? 'var(--blue)' : 'var(--t3)',
            }}
          >
            <Eye size={14} />
          </button>

          <AnimatePresence>
            {showColorMenu && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                transition={{ duration: 0.12 }}
                style={{
                  position: 'absolute', bottom: 40, right: 0,
                  width: 160, background: 'var(--sur)',
                  border: '1px solid var(--bd)', borderRadius: 'var(--r)',
                  boxShadow: '0 8px 24px rgba(0,0,0,.15)',
                  padding: 4, zIndex: 160,
                }}
              >
                {COLOR_MODES.map(mode => (
                  <button
                    key={mode.key}
                    onClick={() => { setColorMode(mode.key); setShowColorMenu(false) }}
                    style={{
                      width: '100%', padding: '6px 10px', borderRadius: 'var(--rs)',
                      border: 'none',
                      background: colorMode === mode.key ? 'var(--blue-d)' : 'transparent',
                      color: colorMode === mode.key ? 'var(--blue)' : 'var(--t2)',
                      fontSize: '.72rem', fontWeight: 600, cursor: 'pointer',
                      textAlign: 'left', fontFamily: 'inherit',
                      display: 'block',
                    }}
                  >
                    {mode.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Zoom in */}
        <button
          onClick={zoomIn}
          disabled={zoom >= 150}
          aria-label="Zoom in"
          style={{
            ...btnStyle,
            opacity: zoom >= 150 ? 0.4 : 1,
            cursor: zoom >= 150 ? 'not-allowed' : 'pointer',
          }}
        >
          <Plus size={14} />
        </button>

        {/* Zoom out */}
        <button
          onClick={zoomOut}
          disabled={zoom <= 85}
          aria-label="Zoom out"
          style={{
            ...btnStyle,
            opacity: zoom <= 85 ? 0.4 : 1,
            cursor: zoom <= 85 ? 'not-allowed' : 'pointer',
          }}
        >
          <Minus size={14} />
        </button>

        {/* Active mode indicator */}
        {(colorMode !== 'none' || zoom !== 100) && (
          <span style={{ fontSize: '.65rem', color: 'var(--t4)', marginLeft: 2, whiteSpace: 'nowrap' }}>
            {colorMode !== 'none' && COLOR_MODES.find(m => m.key === colorMode)?.label}
            {colorMode !== 'none' && zoom !== 100 && ' · '}
            {zoom !== 100 && `${zoom}%`}
          </span>
        )}
      </div>
    </>
  )
}
