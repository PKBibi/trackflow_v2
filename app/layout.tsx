import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Analytics } from '@/components/analytics'
import { PostHogAnalytics } from '@/components/posthog'
import { WebVitals } from '@/components/web-vitals'
import { Toaster } from '@/components/ui/toaster'
import ErrorBoundary from '@/components/error-boundary'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Improve font loading performance
  preload: true
})

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
  metadataBase: new URL('https://track-flow.app'),
  openGraph: {
    title: 'TrackFlow - Time Tracking for Digital Marketing',
    description: 'Track time by campaign, channel, and client.',
    url: 'https://track-flow.app',
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
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-verification-code',
  },
  category: 'productivity',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0B1220' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://app.posthog.com" />
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      </head>
      <body className={inter.className}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 bg-white text-black dark:bg-gray-800 dark:text-white px-3 py-2 rounded shadow">Skip to main content</a>
        <div className="min-h-screen flex flex-col">
          <Toaster />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'TrackFlow',
                url: 'https://track-flow.app',
                logo: 'https://track-flow.app/images/logo.png',
                telephone: '+44 20 8156 6441',
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: '167-169 Great Portland Street, 5th Floor',
                  addressLocality: 'London',
                  postalCode: 'W1W 5PF',
                  addressCountry: 'GB'
                },
                sameAs: [
                  'https://twitter.com/trackflow',
                  'https://linkedin.com/company/trackflow'
                ]
              })
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                url: 'https://track-flow.app',
                potentialAction: {
                  '@type': 'SearchAction',
                  target: {
                    '@type': 'EntryPoint',
                    urlTemplate: 'https://track-flow.app/search?q={search_term_string}'
                  },
                  'query-input': 'required name=search_term_string'
                }
              })
            }}
          />
          <Header />
          <ErrorBoundary>
            <main id="main-content" className="flex-1">
              {children}
            </main>
          </ErrorBoundary>
          <Footer />
          {/* Load analytics after main content to prevent CLS */}
          <Analytics />
          <PostHogAnalytics />
          <WebVitals />
        </div>
      </body>
    </html>
  )
}
