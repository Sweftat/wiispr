import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Notifications — wiispr',
  description: 'Your notifications on wiispr',
}

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return children
}
