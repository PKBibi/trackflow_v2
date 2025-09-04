import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TrackFlow - Time Tracking for Digital Marketing',
  description: 'The only time tracking software built specifically for digital marketing freelancers and agencies.',
  keywords: 'time tracking, marketing, retainer tracking, agency time tracking, privacy-first, campaign tracking, digital marketing',
  authors: [{ name: 'TrackFlow' }],
  creator: 'TrackFlow',
  publisher: 'TrackFlow',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://trackflow.app'),
  openGraph: {
    title: 'TrackFlow - Time Tracking for Digital Marketing',
    description: 'Track time by campaign, channel, and client.',
    url: 'https://trackflow.app',
    siteName: 'TrackFlow',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TrackFlow - Time Tracking for Marketing Teams',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrackFlow',
    description: 'Time tracking for digital marketers',
    images: ['/images/twitter-image.png'],
    creator: '@trackflow',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/images/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/images/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/images/favicon.svg',
        color: '#2F6BFF',
      },
    ],
  },
  manifest: '/site.webmanifest',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0B1220' },
  ],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-verification-code',
  },
  category: 'productivity',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
