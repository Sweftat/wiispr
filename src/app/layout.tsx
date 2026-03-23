import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
  {children}
</body>
      </body>
    </html>
  );
}