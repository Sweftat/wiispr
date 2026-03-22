import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Join wiispr — Anonymous Forum for Saudi Arabia',
  description: 'Sign up or sign in to wiispr',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children
}
