'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, Star, Users, BarChart3, Clock, ArrowRight, Target, DollarSign, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PPCAgencyUseCasePage() {
  useEffect(() => {
    // Track page view for PPC use case page
    import('@/components/analytics').then(({ trackEvent }) => {
      trackEvent.featureUse('use_case_ppc_agencies');
    }).catch(() => {});
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <main className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="secondary">
            Built for PPC Agencies
          </Badge>
          <h1 className="text-4xl font-bold mb-6">
            Time Tracking That Shows <span className="text-[#2F6BFF]">PPC Campaign Profitability</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Stop wondering if your Google Ads, Facebook Ads, and paid campaigns are profitable after labor costs. TrackFlow shows exactly which PPC campaigns make money—and which don't.
          </p>
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="font-medium">4.9/5 from PPC Agencies</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-700" />
              <span className="font-medium">800+ PPC Agencies</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="font-medium">35% Average ROI Increase</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-[#2F6BFF] hover:bg-[#1E4DB8] text-white" asChild>
              <Link href="/signup">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demo">See PPC Demo</Link>
            </Button>
          </div>
        </div>

        {/* PPC Specific Problems */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">PPC Agency Challenges TrackFlow Solves</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-400">What PPC Agencies Struggle With</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold">×</span>
                    <span>"Campaigns generate clicks but are we profitable?"</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold">×</span>
                    <span>"Client questions our management fees"</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold">×</span>
                    <span>"Don't know which campaigns to focus on"</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold">×</span>
                    <span>"Management time varies wildly by campaign"</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold">×</span>
                    <span>"Retainers burn through too quickly"</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold">×</span>
                    <span>"Can't prove management value to clients"</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-300">How TrackFlow Helps PPC Agencies</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-700 mt-0.5" />
                    <span>Track profitability per Google Ads campaign</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-700 mt-0.5" />
                    <span>Transparent client reporting on management time</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-700 mt-0.5" />
                    <span>Identify high-maintenance vs high-profit campaigns</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-700 mt-0.5" />
                    <span>Track keyword research, ad creation, optimization time</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-700 mt-0.5" />
                    <span>Retainer alerts before budget exhaustion</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-700 mt-0.5" />
                    <span>Show ROI of your management vs campaign spend</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* PPC Workflow Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Built for PPC Workflows</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Target className="w-10 h-10 text-[#2F6BFF] mb-4" />
                <CardTitle>Campaign-Level Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Track time separately for each Google Ads, Facebook Ads, or Microsoft Ads campaign. See which campaigns require the most management time.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Individual campaign time tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Keyword research time allocation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Ad creation & testing time
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Optimization & monitoring time
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="w-10 h-10 text-[#2F6BFF] mb-4" />
                <CardTitle>Management ROI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Compare your management fees against time invested. Show clients exactly how your expertise improves their campaign performance.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Management time vs campaign performance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Cost savings through optimization
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Campaign efficiency improvements
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Client value demonstration reports
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <DollarSign className="w-10 h-10 text-[#2F6BFF] mb-4" />
                <CardTitle>PPC Retainer Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  PPC campaigns can be unpredictable. Track retainer usage and get alerts when high-maintenance campaigns threaten to exceed budgets.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Per-campaign retainer allocation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Alerts at 80% retainer usage
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Scope creep prevention
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

        {/* PPC Agency Success Story */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-[#2F6BFF]/10 to-purple-100/50 dark:from-[#2F6BFF]/20 dark:to-purple-900/20">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">PPC Agency Success Story</h3>
                  <div className="flex mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg italic mb-6">
                    "We discovered that our small Google Ads campaigns ($5K/month spend) were actually more profitable than enterprise campaigns ($50K/month spend) because of management time. We restructured our pricing and increased profits by 45%."
                  </blockquote>
                  <div>
                    <p className="font-semibold">Alex Thompson, Founder</p>
                    <p className="text-muted-foreground">PPC Masters Agency</p>
                    <Badge className="mt-2 bg-green-600 text-white">45% Profit Increase</Badge>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h4 className="font-bold mb-4 text-center">Before vs After TrackFlow</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Campaign Profitability Visibility</span>
                      <div className="flex gap-2">
                        <div className="w-16 bg-red-200 h-2 rounded"></div>
                        <span>→</span>
                        <div className="w-16 bg-green-500 h-2 rounded"></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Client Retention Rate</span>
                      <div className="flex gap-2">
                        <span className="text-red-600">67%</span>
                        <span>→</span>
                        <span className="text-green-700">89%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Campaign Margin</span>
                      <div className="flex gap-2">
                        <span className="text-red-600">23%</span>
                        <span>→</span>
                        <span className="text-green-700">41%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Monthly Retainer Overruns</span>
                      <div className="flex gap-2">
                        <span className="text-red-600">15</span>
                        <span>→</span>
                        <span className="text-green-700">2</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PPC Templates */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Pre-Built PPC Tracking Templates</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Google Ads Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Account setup & structure planning
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Keyword research & expansion
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Ad copy creation & testing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Bid management & optimization
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Performance analysis & reporting
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Landing page optimization consultation
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Facebook/Meta Ads Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Audience research & targeting setup
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Creative development & testing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Campaign structure optimization
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Pixel implementation & tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    A/B testing & performance monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Retargeting campaign management
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pricing for PPC Agencies */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Pricing That Works for PPC Agencies</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Badge className="mb-4 w-fit">Solo PPC Freelancer</Badge>
                <CardTitle>$15/month</CardTitle>
                <CardDescription>Perfect for independent PPC specialists</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Unlimited campaign tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Client reporting
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Profitability analysis
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#2F6BFF] relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-[#2F6BFF] text-white">Most Popular</Badge>
              </div>
              <CardHeader>
                <Badge className="mb-4 w-fit" variant="secondary">PPC Agency Team</Badge>
                <CardTitle>$29/month</CardTitle>
                <CardDescription>Up to 10 team members</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Team collaboration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Client portal access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    White-label reports
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Retainer alerts
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Badge className="mb-4 w-fit" variant="outline">Enterprise PPC</Badge>
                <CardTitle>$49/month</CardTitle>
                <CardDescription>Unlimited team members</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    API integrations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Custom reporting
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Priority support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Dedicated account manager
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-[#2F6BFF] to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Track PPC Profitability?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Stop wondering which campaigns are profitable. Start making data-driven decisions that optimize your PPC agency's performance and increase client satisfaction.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Button size="lg" className="bg-white text-[#2F6BFF] hover:bg-gray-100" asChild>
              <Link href="/signup">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link href="/demo">Book PPC Demo</Link>
            </Button>
          </div>
          <p className="text-sm opacity-75">
            14-day free trial • No credit card required • Built for PPC agencies
          </p>
        </div>
      </main>
    </div>
  )
}