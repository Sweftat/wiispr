import type { Metadata } from "next";
import localFont from 'next/font/local'
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { Toaster } from "sonner";

const satoshi = localFont({
  src: [
    { path: '../../public/fonts/Satoshi-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/Satoshi-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/Satoshi-Bold.woff2', weight: '700', style: 'normal' },
    { path: '../../public/fonts/Satoshi-Black.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--font-satoshi'
})

export const metadata: Metadata = {
  title: {
    default: 'wiispr — Say what you actually think',
    template: '%s — wiispr'
  },
  description: 'An anonymous forum built for Saudi Arabia. Share your thoughts honestly with a Ghost ID. No name, no face, just your voice.',
  keywords: ['anonymous forum', 'saudi arabia', 'wiispr', 'anonymous posts', 'ghost id'],
  openGraph: {
    title: 'wiispr — Say what you actually think',
    description: 'Anonymous. Honest. Built for Saudi Arabia.',
    url: 'https://wiispr.vercel.app',
    siteName: 'wiispr',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'wiispr — Say what you actually think',
    description: 'Anonymous. Honest. Built for Saudi Arabia.',
  },
  robots: {
    index: true,
    follow: true,
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={satoshi.variable}>
        {children}
        <BottomNav />
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
