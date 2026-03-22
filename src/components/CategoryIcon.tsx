const icons: Record<string, JSX.Element> = {
  tech: <svg width="15" height="15" fill="none" viewBox="0 0 16 16"><rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 13v1.5M11 13v1.5M3.5 14.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M4 7l2 2-2 2M8.5 11h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  sports: <svg width="15" height="15" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 2c0 2-2 3-2 6s2 4 2 6M8 2c0 2 2 3 2 6s-2 4-2 6M2.5 5.5h11M2.5 10.5h11" stroke="currentColor" strokeWidth="1.25"/></svg>,
  lifestyle: <svg width="15" height="15" fill="none" viewBox="0 0 16 16"><path d="M8 13S3 9.5 3 6a5 5 0 0 1 10 0c0 3.5-5 7-5 7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  business: <svg width="15" height="15" fill="none" viewBox="0 0 16 16"><rect x="2" y="6" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/><path d="M5 6V4a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M2 10h12" stroke="currentColor" strokeWidth="1.5"/></svg>,
  gaming: <svg width="15" height="15" fill="none" viewBox="0 0 16 16"><rect x="1" y="4" width="14" height="8" rx="3" stroke="currentColor" strokeWidth="1.5"/><path d="M5 8h2M6 7v2M10.5 8h.5M11.5 7.5v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  family: <svg width="15" height="15" fill="none" viewBox="0 0 16 16"><circle cx="5" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="11" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M2 13v-2a3 3 0 0 1 6 0v2M8 13v-2a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  women: <svg width="15" height="15" fill="none" viewBox="0 0 16 16"><path d="M8 2l5 2v4c0 3-5 6-5 6S3 11 3 8V4l5-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  open: <svg width="15" height="15" fill="none" viewBox="0 0 16 16"><path d="M14 8A6 6 0 0 1 8 14l-5 1 1-5A6 6 0 1 1 14 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

export default function CategoryIcon({ slug }: { slug: string }) {
  return <span style={{ color: 'var(--t3)', display: 'flex', alignItems: 'center' }}>{icons[slug] || icons.open}</span>
}