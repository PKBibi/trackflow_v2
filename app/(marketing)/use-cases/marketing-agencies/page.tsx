'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, Star, Users, BarChart3, Clock, ArrowRight, Target, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function MarketingAgencyUseCasePage() {
  useEffect(() => {
    // Track page view for use case page
    import('@/components/analytics').then(({ trackEvent }) => {
      trackEvent.featureUse('use_case_marketing_agencies');
    }).catch(() => {});
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <main className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="secondary">
            Built for Marketing Agencies
          </Badge>
          <h1 className="text-4xl font-bold mb-6">
            Time Tracking That Actually Helps <span className="text-[#2F6BFF]">Marketing Agencies</span> Grow
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Stop guessing which services are profitable. TrackFlow shows you exactly which campaigns, channels, and clients are making you money—so you can focus on what works.
          </p>
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="font-medium">4.8/5 from Agencies</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-700" />
              <span className="font-medium">2,000+ Marketing Agencies</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Average 23% Profit Increase</span>
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

        {/* Agency Problems */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Marketing Agency Challenges TrackFlow Solves</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-400">Common Agency Problems</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold">×</span>
                    <span>"We're busy but not profitable"</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold">×</span>
                    <span>"Don't know which services make money"</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold">×</span>
                    <span>"Retainers always go over budget"</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold">×</span>
                    <span>"Can't price services accurately"</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold">×</span>
                    <span>"Clients question our time allocation"</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold">×</span>
                    <span>"Team utilization is unclear"</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-300">TrackFlow Solutions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-700 mt-0.5" />
                    <span>See exactly which services are profitable</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-700 mt-0.5" />
                    <span>Campaign and channel ROI analysis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-700 mt-0.5" />
                    <span>Retainer burndown tracking & alerts</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-700 mt-0.5" />
                    <span>Data-driven pricing recommendations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-700 mt-0.5" />
                    <span>Transparent client reporting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-700 mt-0.5" />
                    <span>Team capacity & utilization insights</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Marketing-Specific Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Built for Marketing Workflows</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Target className="w-10 h-10 text-[#2F6BFF] mb-4" />
                <CardTitle>Campaign Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Track time by individual marketing campaigns, not just generic "projects." See which campaigns are most profitable.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Campaign-level time allocation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    ROI analysis per campaign
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Budget vs actual tracking
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="w-10 h-10 text-[#2F6BFF] mb-4" />
                <CardTitle>Channel Profitability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Understand which marketing channels (PPC, SEO, Social, Email) generate the highest margins for your agency.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    PPC vs SEO profitability comparison
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Social media service margins
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Content marketing ROI
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <DollarSign className="w-10 h-10 text-[#2F6BFF] mb-4" />
                <CardTitle>Retainer Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Monitor retainer budgets in real-time with burndown charts and automatic alerts before you go over budget.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Real-time retainer burndown
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Overage alerts at 80% usage
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Client communication tools
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Agency Size Workflows */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Perfect for Any Agency Size</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Badge className="mb-4 w-fit">1-5 People</Badge>
                <CardTitle>Freelancer & Solo Agencies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Focus on profitability from day one. Understand which services to focus on and how to price them.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Service profitability analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Time-based pricing guidance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Simple client reporting
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300">$15/month flat rate</p>
                  <p className="text-xs text-green-700 dark:text-green-500">Perfect for getting started</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#2F6BFF] relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-[#2F6BFF] text-white">Most Popular</Badge>
              </div>
              <CardHeader>
                <Badge className="mb-4 w-fit" variant="secondary">5-15 People</Badge>
                <CardTitle>Growing Marketing Agencies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Scale operations with team collaboration, client portals, and advanced reporting.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Team collaboration tools
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Client access portals
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    White-label reporting
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-400">$29/month up to 10 users</p>
                  <p className="text-xs text-blue-700 dark:text-blue-500">Save vs per-user pricing</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Badge className="mb-4 w-fit" variant="outline">15+ People</Badge>
                <CardTitle>Enterprise Agencies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Advanced features for large teams: custom fields, API access, and dedicated support.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Unlimited team members
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    API access & integrations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Dedicated account manager
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <p className="text-sm font-semibold text-purple-800 dark:text-purple-400">$49/month unlimited users</p>
                  <p className="text-xs text-purple-700 dark:text-purple-500">Best value for large teams</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Success Stories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Agency Success Stories</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
              <CardContent className="p-8">
                <div className="flex mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg italic mb-6">
                  "TrackFlow helped us discover that our PPC management services had a 65% margin while content creation was only 25%. We completely restructured our service offerings and increased profits by 40%."
                </blockquote>
                <div>
                  <p className="font-semibold">Sarah Chen, Founder</p>
                  <p className="text-muted-foreground">Digital Spark Marketing (8-person agency)</p>
                  <Badge className="mt-2 bg-green-600 text-white">40% Profit Increase</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
              <CardContent className="p-8">
                <div className="flex mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg italic mb-6">
                  "The retainer tracking is a game-changer. We used to constantly go over budget on client work. Now we get alerts at 80% usage and can have conversations with clients before it becomes a problem."
                </blockquote>
                <div>
                  <p className="font-semibold">Mike Rodriguez, CEO</p>
                  <p className="text-muted-foreground">Growth Digital (15-person agency)</p>
                  <Badge className="mt-2 bg-blue-600 text-white">Zero Budget Overruns</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ROI Calculator */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-[#2F6BFF]/10 to-purple-100/50 dark:from-[#2F6BFF]/20 dark:to-purple-900/20">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">Calculate Your Agency's ROI</h3>
                <p className="text-muted-foreground">See how much TrackFlow could save your agency</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h4 className="font-semibold mb-4">Average Agency Savings with TrackFlow:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between">
                      <span>Eliminate retainer overruns</span>
                      <span className="font-bold text-green-700">+$2,400/month</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Focus on profitable services</span>
                      <span className="font-bold text-green-700">+$3,200/month</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Optimize team utilization</span>
                      <span className="font-bold text-green-700">+$1,800/month</span>
                    </li>
                    <li className="border-t pt-3 mt-3 flex items-center justify-between text-lg font-bold">
                      <span>Total Monthly Benefit</span>
                      <span className="text-green-700">+$7,400</span>
                    </li>
                    <li className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>TrackFlow Cost</span>
                      <span>-$29</span>
                    </li>
                    <li className="border-t pt-3 mt-3 flex items-center justify-between text-xl font-bold">
                      <span className="text-[#2F6BFF]">Net Monthly ROI</span>
                      <span className="text-[#2F6BFF]">+$7,371</span>
                    </li>
                  </ul>
                </div>

                <div className="text-center">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                    <div className="text-4xl font-bold text-[#2F6BFF] mb-2">25,442%</div>
                    <div className="text-lg font-semibold mb-4">Average ROI</div>
                    <div className="text-sm text-muted-foreground mb-6">
                      Based on 2,000+ agency data points
                    </div>
                    <Button size="lg" className="bg-[#2F6BFF] hover:bg-[#1E4DB8] text-white w-full" asChild>
                      <Link href="/signup">Start Free Trial</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-[#2F6BFF] to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Marketing Agency?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Stop guessing what's profitable. Start making data-driven decisions that grow your agency. Join 2,000+ marketing agencies already using TrackFlow.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Button size="lg" className="bg-white text-[#2F6BFF] hover:bg-gray-100" asChild>
              <Link href="/signup">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link href="/demo">Book Agency Demo</Link>
            </Button>
          </div>
          <p className="text-sm opacity-75">
            14-day free trial • No credit card required • Built for marketing agencies
          </p>
        </div>
      </main>
    </div>
  )
}