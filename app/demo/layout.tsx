import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Live Demo - See TrackFlow in Action',
  description: 'Experience TrackFlow\'s powerful marketing time tracking features with our interactive demo. See campaign profitability analysis, retainer management, and ROI tracking in real-time.',
  keywords: 'TrackFlow demo, time tracking demo, marketing agency demo, campaign profitability demo, interactive demo',
  openGraph: {
    title: 'TrackFlow Live Demo - Interactive Time Tracking for Marketing Agencies',
    description: 'Try TrackFlow\'s marketing-focused time tracking features with real scenarios. See how agencies track campaign profitability and manage retainers.',
    images: ['/images/og-demo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrackFlow Live Demo',
    description: 'Interactive demo of time tracking for marketing agencies',
    images: ['/images/twitter-demo.png'],
  },
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}