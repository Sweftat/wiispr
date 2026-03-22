import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Welcome to wiispr' }
export default function Layout({ children }: { children: React.ReactNode }) { return children }
