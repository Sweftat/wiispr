export type Segment = { type: 'text'; value: string } | { type: 'link'; value: string }

const URL_RE = /(https?:\/\/[^\s<>"']+)/g

export function linkify(text: string): Segment[] {
  if (!text) return []
  const segments: Segment[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = URL_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }
    segments.push({ type: 'link', value: match[1] })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) })
  }

  URL_RE.lastIndex = 0
  return segments.length ? segments : [{ type: 'text', value: text }]
}
