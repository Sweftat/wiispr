import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search — wiispr',
  description: 'Search posts on wiispr',
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children
}
