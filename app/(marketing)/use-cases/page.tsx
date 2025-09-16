'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Users, Search, Target, BarChart3, CheckCircle, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const useCases = [
  {
    title: 'Marketing Agencies',
    slug: 'marketing-agencies',
    description: 'Complete time tracking solution for full-service digital marketing agencies',
    icon: Users,
    features: [
      'Multi-channel campaign tracking',
      'Client retainer management',
      'Team utilization analytics',
      'Profitability by service line'
    ],
    metrics: {
      roi: '25,442%',
      timeSaved: '12.5hrs/week',
      revenueIncrease: '$8,750/month'
    },
    testimonial: {
      quote: "TrackFlow helped us identify that our SEO services were 3x more profitable than PPC management. We've restructured our entire pricing model.",
      author: "Sarah Chen",
      company: "Digital Growth Partners"
    }
  },
  {
    title: 'PPC Agencies',
    slug: 'ppc-agencies',
    description: 'Specialized tracking for pay-per-click advertising agencies',
    icon: Target,
    features: [
      'Campaign-level time tracking',
      'Ad spend ROI correlation',
      'Management fee optimization',
      'Client ROAS reporting'
    ],
    metrics: {
      roi: '18,900%',
      timeSaved: '8hrs/week',
      revenueIncrease: '$5,200/month'
    },
    testimonial: {
      quote: "We discovered our Google Ads management was 45% more profitable than Facebook Ads. This insight alone paid for TrackFlow 10x over.",
      author: "Mike Rodriguez",
      company: "AdScale Partners"
    }
  },
  {
    title: 'SEO Agencies',
    slug: 'seo-agencies',
    description: 'Track technical audits, content creation, and link building campaigns',
    icon: Search,
    features: [
      'SEO service profitability analysis',
      'Technical vs content ROI',
      'Link building campaign tracking',
      'Ranking improvement correlation'
    ],
    metrics: {
      roi: '22,100%',
      timeSaved: '10hrs/week',
      revenueIncrease: '$6,800/month'
    },
    testimonial: {
      quote: "Technical SEO audits became our most profitable service after TrackFlow showed us the true time investment vs revenue.",
      author: "Emily Watson",
      company: "Pinnacle SEO"
    }
  }
]

export default function UseCasesIndexPage() {
  useEffect(() => {
    import('@/components/analytics').then(({ trackEvent }) => {
      trackEvent.featureUse('use_cases_index_page');
    }).catch(() => {});
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <main className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="secondary">
            Time Tracking Use Cases for Marketing Agencies
          </Badge>
          <h1 className="text-4xl font-bold mb-6">
            Time Tracking Built for <span className="text-[#2F6BFF]">Your Marketing Specialty</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Every marketing discipline has unique tracking needs. See how TrackFlow adapts to your agency's specific workflow, whether you focus on PPC, SEO, or full-service marketing.
          </p>
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="font-medium">4.8/5 by Marketing Agencies</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-700" />
              <span className="font-medium">2,000+ Agencies Trust TrackFlow</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Marketing-Specific Analytics</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-[#2F6BFF] hover:bg-[#1E4DB8] text-white" asChild>
              <Link href="/signup">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demo">See Live Demo</Link>
            </Button>
          </div>
        </div>

        {/* Use Cases Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Choose Your Marketing Agency Type</h2>
          <div className="space-y-8">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon
              return (
                <Card key={useCase.slug} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-[#2F6BFF]/10 rounded-lg">
                          <Icon className="w-8 h-8 text-[#2F6BFF]" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">{useCase.title}</h3>
                          <p className="text-muted-foreground">{useCase.description}</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <h4 className="font-semibold">Key Features:</h4>
                        <ul className="space-y-2">
                          {useCase.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-700" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-center">
                          <div className="text-lg font-bold text-[#2F6BFF]">{useCase.metrics.roi}</div>
                          <div className="text-xs text-muted-foreground">Avg ROI</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-[#2F6BFF]">{useCase.metrics.timeSaved}</div>
                          <div className="text-xs text-muted-foreground">Time Saved</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-[#2F6BFF]">{useCase.metrics.revenueIncrease}</div>
                          <div className="text-xs text-muted-foreground">Revenue +</div>
                        </div>
                      </div>

                      <Button className="w-full mb-4" asChild>
                        <Link href={`/use-cases/${useCase.slug}`}>
                          Learn More About {useCase.title}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>

                    <div className="bg-[#2F6BFF]/5 p-8 border-l border-[#2F6BFF]/20">
                      <Badge className="mb-4 bg-green-600 text-white">Success Story</Badge>
                      <blockquote className="text-muted-foreground mb-4 italic">
                        "{useCase.testimonial.quote}"
                      </blockquote>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#2F6BFF] rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {useCase.testimonial.author.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{useCase.testimonial.author}</div>
                          <div className="text-xs text-muted-foreground">{useCase.testimonial.company}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Why Different Agencies Need Different Tracking */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why One-Size-Fits-All Time Tracking Fails for Marketing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Target className="w-10 h-10 text-red-600 mb-4" />
                <CardTitle className="text-red-800 dark:text-red-400">PPC Complexity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  PPC agencies need to track campaign setup time vs ongoing management time, correlate hours with ad spend, and measure management efficiency across platforms. Generic trackers treat all "advertising work" the same.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Search className="w-10 h-10 text-red-600 mb-4" />
                <CardTitle className="text-red-800 dark:text-red-400">SEO Long-term View</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  SEO work spans months with delayed results. SEO agencies need to track technical audits separately from content work, measure link building ROI, and correlate time investment with ranking improvements over time.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-10 h-10 text-red-600 mb-4" />
                <CardTitle className="text-red-800 dark:text-red-400">Full-Service Juggling</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Full-service agencies manage PPC, SEO, social, email, and content simultaneously. They need to see which service lines are most profitable per client and optimize resource allocation across channels.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cross-Linking to Related Pages */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Explore More Solutions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-[#2F6BFF]" />
                  Compare Time Tracking Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  See how TrackFlow compares to Harvest, Toggl, Time Doctor, and other popular time tracking solutions for marketing agencies.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/alternatives">
                    View Comparisons
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-[#2F6BFF]" />
                  Pricing for Agencies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  See our agency-friendly pricing that scales with your team size, not per-user like other tools that get expensive fast.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/pricing">
                    View Pricing
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-[#2F6BFF] to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Track Time the Marketing Agency Way?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Choose your specialty above, or start with our full-service marketing agency solution. 14-day free trial, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Button size="lg" className="bg-white text-[#2F6BFF] hover:bg-gray-100" asChild>
              <Link href="/signup">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link href="/demo">Book a Demo</Link>
            </Button>
          </div>
          <p className="text-sm opacity-75">
            Join 2,000+ marketing agencies • Setup in under 5 minutes • Cancel anytime
          </p>
        </div>
      </main>
    </div>
  )
}