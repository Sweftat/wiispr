'use client'
import { useState, useEffect } from 'react'
import { Eye, ZoomIn, ZoomOut, Accessibility } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const COLOR_MODES = [
  { key: 'none', label: 'Default', filter: 'none' },
  { key: 'protanopia', label: 'Protanopia', filter: 'url(#protanopia)' },
  { key: 'deuteranopia', label: 'Deuteranopia', filter: 'url(#deuteranopia)' },
  { key: 'tritanopia', label: 'Tritanopia', filter: 'url(#tritanopia)' },
  { key: 'grayscale', label: 'Grayscale', filter: 'grayscale(100%)' },
]

const ZOOM_LEVELS = [90, 100, 110, 125, 150]

export default function AccessibilityToolbar() {
  const [open, setOpen] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [colorMode, setColorMode] = useState('none')

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
    const mode = COLOR_MODES.find(m => m.key === colorMode)
    if (mode) {
      document.documentElement.style.filter = mode.filter
    }
    localStorage.setItem('a11y_color', colorMode)
  }, [colorMode])

  function zoomIn() {
    const idx = ZOOM_LEVELS.indexOf(zoom)
    if (idx < ZOOM_LEVELS.length - 1) setZoom(ZOOM_LEVELS[idx + 1])
  }

  function zoomOut() {
    const idx = ZOOM_LEVELS.indexOf(zoom)
    if (idx > 0) setZoom(ZOOM_LEVELS[idx - 1])
  }

  function resetAll() {
    setZoom(100)
    setColorMode('none')
  }

  return (
    <>
      {/* SVG filters for color blindness simulation */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="protanopia">
            <feColorMatrix type="matrix" values="
              0.567, 0.433, 0,     0, 0
              0.558, 0.442, 0,     0, 0
              0,     0.242, 0.758, 0, 0
              0,     0,     0,     1, 0" />
          </filter>
          <filter id="deuteranopia">
            <feColorMatrix type="matrix" values="
              0.625, 0.375, 0,   0, 0
              0.7,   0.3,   0,   0, 0
              0,     0.3,   0.7, 0, 0
              0,     0,     0,   1, 0" />
          </filter>
          <filter id="tritanopia">
            <feColorMatrix type="matrix" values="
              0.95, 0.05,  0,     0, 0
              0,    0.433, 0.567, 0, 0
              0,    0.475, 0.525, 0, 0
              0,    0,     0,     1, 0" />
          </filter>
        </defs>
      </svg>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Accessibility settings"
        style={{
          position: 'fixed', bottom: 80, right: 16,
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--sur)', border: '1px solid var(--bd)',
          boxShadow: '0 2px 8px rgba(0,0,0,.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 150, color: 'var(--t2)',
          transition: 'all .15s',
        }}
      >
        <Accessibility size={18} />
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed', bottom: 128, right: 16,
              width: 240, background: 'var(--sur)',
              border: '1px solid var(--bd)', borderRadius: 'var(--rm)',
              boxShadow: '0 8px 24px rgba(0,0,0,.15)',
              zIndex: 150, padding: '14px', overflow: 'hidden',
            }}
          >
            <p style={{ fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginBottom: 10 }}>Accessibility</p>

            {/* Zoom controls */}
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t2)', marginBottom: 6 }}>Text Size</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button onClick={zoomOut} disabled={zoom <= 90} style={{
                  width: 32, height: 32, borderRadius: 'var(--rs)',
                  border: '1px solid var(--bd)', background: 'var(--bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: zoom <= 90 ? 'not-allowed' : 'pointer',
                  color: zoom <= 90 ? 'var(--t4)' : 'var(--t2)', opacity: zoom <= 90 ? 0.5 : 1,
                }}>
                  <ZoomOut size={14} />
                </button>
                <span style={{
                  flex: 1, textAlign: 'center', fontSize: '.78rem',
                  fontWeight: 700, color: 'var(--t1)', fontFamily: 'monospace',
                }}>{zoom}%</span>
                <button onClick={zoomIn} disabled={zoom >= 150} style={{
                  width: 32, height: 32, borderRadius: 'var(--rs)',
                  border: '1px solid var(--bd)', background: 'var(--bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: zoom >= 150 ? 'not-allowed' : 'pointer',
                  color: zoom >= 150 ? 'var(--t4)' : 'var(--t2)', opacity: zoom >= 150 ? 0.5 : 1,
                }}>
                  <ZoomIn size={14} />
                </button>
              </div>
            </div>

            {/* Color vision */}
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t2)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Eye size={12} /> Color Vision
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {COLOR_MODES.map(mode => (
                  <button
                    key={mode.key}
                    onClick={() => setColorMode(mode.key)}
                    style={{
                      padding: '5px 10px', borderRadius: 'var(--rs)',
                      border: `1px solid ${colorMode === mode.key ? 'var(--blue)' : 'var(--bd)'}`,
                      background: colorMode === mode.key ? 'var(--blue-d)' : 'var(--bg)',
                      color: colorMode === mode.key ? 'var(--blue)' : 'var(--t3)',
                      fontSize: '.72rem', fontWeight: 600, cursor: 'pointer',
                      textAlign: 'left', fontFamily: 'inherit', transition: 'all .12s',
                    }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset */}
            {(zoom !== 100 || colorMode !== 'none') && (
              <button onClick={resetAll} style={{
                width: '100%', padding: '6px 10px', borderRadius: 'var(--rs)',
                border: '1px solid var(--bd)', background: 'none',
                color: 'var(--t3)', fontSize: '.72rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Reset to defaults
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
