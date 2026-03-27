'use client'
import { linkify } from '@/lib/linkify'
import { ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

export default function LinkifiedText({ text, style, className }: { text: string, style?: React.CSSProperties, className?: string }) {
  const segments = linkify(text)

  function handleClick(e: React.MouseEvent, url: string) {
    e.stopPropagation()
    toast('Opening external link', { description: new URL(url).hostname })
  }

  return (
    <p className={className} style={style}>
      {segments.map((seg, i) =>
        seg.type === 'link' ? (
          <a
            key={i}
            href={seg.value}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => handleClick(e, seg.value)}
            style={{ color: 'var(--blue)', textDecoration: 'underline', textUnderlineOffset: 2, wordBreak: 'break-all' }}
          >
            {seg.value}
            <ExternalLink size={10} style={{ display: 'inline', marginLeft: 2, verticalAlign: 'middle' }} />
          </a>
        ) : (
          <span key={i}>{seg.value}</span>
        )
      )}
    </p>
  )
}
