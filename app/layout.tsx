import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Analytics } from '@/components/analytics'
import { PostHogProvider } from '@/components/PostHogProvider'
import { WebVitals } from '@/components/web-vitals'
import { Toaster } from '@/components/ui/toaster'
import ErrorBoundary from '@/components/error-boundary'
import { createClient } from '@/lib/supabase/server'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
  fallback: ['system-ui', 'arial'],
})

export const metadata: Metadata = {
  title: {
    default: 'TrackFlow - Time Tracking for Digital Marketing Agencies',
    template: '%s | TrackFlow'
  },
  description: 'The only time tracking software built specifically for digital marketing agencies. Track campaign profitability, manage retainers, and increase margins by 40%. Used by 2,000+ agencies worldwide.',
  keywords: 'time tracking software, marketing agency time tracking, campaign profitability tracking, retainer management, PPC time tracking, SEO time tracking, digital marketing analytics, agency productivity tools, marketing ROI tracking',
  authors: [{ name: 'TrackFlow' }],
  creator: 'TrackFlow',
  publisher: 'TrackFlow',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://track-flow.app'),
  alternates: {
    canonical: 'https://track-flow.app'
  },
  openGraph: {
    title: 'TrackFlow - Time Tracking for Digital Marketing Agencies',
    description: 'Track campaign profitability, manage retainers, and increase margins by 40%. Trusted by 2,000+ marketing agencies worldwide.',
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
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_SITE_VERIFICATION,
    yahoo: process.env.YAHOO_SITE_VERIFICATION,
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {user?.id ? <meta name="trackflow-user-id" content={user.id} /> : null}
        {/* Critical font preload for LCP optimization */}
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://app.posthog.com" />
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      </head>
      <body className={inter.className}>
        <PostHogProvider>
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
                  description: 'The only time tracking software built specifically for digital marketing freelancers and agencies.',
                  telephone: '+44 20 8156 6441',
                  email: 'hello@track-flow.app',
                  foundingDate: '2023',
                  numberOfEmployees: '2-10',
                  industry: 'Software',
                  address: {
                    '@type': 'PostalAddress',
                    streetAddress: '167-169 Great Portland Street, 5th Floor',
                    addressLocality: 'London',
                    postalCode: 'W1W 5PF',
                    addressCountry: 'GB'
                  },
                  sameAs: [
                    'https://twitter.com/trackflow',
                    'https://linkedin.com/company/trackflow',
                    'https://github.com/trackflow'
                  ],
                  aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: '4.8',
                    reviewCount: '127',
                    bestRating: '5',
                    worstRating: '1'
                  }
                })
              }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'WebSite',
                  name: 'TrackFlow',
                  url: 'https://track-flow.app',
                  description: 'Time tracking software for digital marketing professionals',
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
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'SoftwareApplication',
                  name: 'TrackFlow',
                  operatingSystem: 'Web Browser',
                  applicationCategory: 'BusinessApplication',
                  aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: '4.8',
                    ratingCount: '127'
                  },
                  offers: {
                    '@type': 'Offer',
                    price: '29',
                    priceCurrency: 'USD',
                    priceValidUntil: '2025-12-31',
                    availability: 'https://schema.org/InStock',
                    url: 'https://track-flow.app/pricing'
                  },
                  screenshot: 'https://track-flow.app/images/app-screenshot.png',
                  featureList: [
                    'Campaign ROI Tracking',
                    'Multi-Channel Time Allocation', 
                    'Retainer Management',
                    'White-Label Reports',
                    'AI Insights'
                  ],
                  author: {
                    '@type': 'Organization',
                    name: 'TrackFlow',
                    url: 'https://track-flow.app'
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
            <WebVitals />
          </div>
        </PostHogProvider>
      </body>
    </html>
  )
}
