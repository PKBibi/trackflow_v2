import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing - TrackFlow Time Tracking for Marketing Agencies',
  description: 'Simple, transparent pricing for marketing agencies. Start free with our 14-day trial. Plans from $15/month for freelancers to enterprise solutions for large agencies.',
  keywords: 'TrackFlow pricing, time tracking pricing, marketing agency pricing, time tracking plans, agency software pricing',
  openGraph: {
    title: 'TrackFlow Pricing - Affordable Time Tracking for Marketing Agencies',
    description: 'Transparent pricing starting at $15/month. 14-day free trial with no credit card required.',
    images: ['/images/og-pricing.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrackFlow Pricing',
    description: 'Affordable time tracking for marketing agencies',
    images: ['/images/twitter-pricing.png'],
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}