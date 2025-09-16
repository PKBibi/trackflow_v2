'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, Star, Users, BarChart3, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function HarvestAlternativePage() {
  useEffect(() => {
    // Track page view for alternative page
    import('@/components/analytics').then(({ trackEvent }) => {
      trackEvent.featureUse('alternative_page_harvest');
    }).catch(() => {});
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <main className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="secondary">
            #1 Harvest Alternative for Marketing Agencies
          </Badge>
          <h1 className="text-4xl font-bold mb-6">
            The Best Harvest Alternative for <span className="text-[#2F6BFF]">Marketing Teams</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            While Harvest is great for basic time tracking, TrackFlow is purpose-built for digital marketing agencies who need to track by campaign, channel, and client—with built-in profitability analytics.
          </p>
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="font-medium">4.8/5 on G2</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-700" />
              <span className="font-medium">2,000+ Marketing Agencies</span>
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

        {/* Comparison Table */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">TrackFlow vs Harvest: Side-by-Side Comparison</h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="text-center p-4 font-semibold bg-[#2F6BFF]/10">
                      <div className="flex items-center justify-center gap-2">
                        <span>TrackFlow</span>
                        <Badge variant="secondary" className="bg-[#2F6BFF] text-white">Recommended</Badge>
                      </div>
                    </th>
                    <th className="text-center p-4 font-semibold">Harvest</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Marketing Channel Tracking</td>
                    <td className="text-center p-4 bg-[#2F6BFF]/5">
                      <CheckCircle className="w-5 h-5 text-green-700 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <span className="text-gray-400">×</span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Campaign ROI Tracking</td>
                    <td className="text-center p-4 bg-[#2F6BFF]/5">
                      <CheckCircle className="w-5 h-5 text-green-700 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <span className="text-gray-400">×</span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Retainer Burndown Tracking</td>
                    <td className="text-center p-4 bg-[#2F6BFF]/5">
                      <CheckCircle className="w-5 h-5 text-green-700 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <span className="text-gray-400">×</span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Service Margin Analysis</td>
                    <td className="text-center p-4 bg-[#2F6BFF]/5">
                      <CheckCircle className="w-5 h-5 text-green-700 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <span className="text-gray-400">×</span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Basic Time Tracking</td>
                    <td className="text-center p-4 bg-[#2F6BFF]/5">
                      <CheckCircle className="w-5 h-5 text-green-700 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <CheckCircle className="w-5 h-5 text-green-700 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Invoicing</td>
                    <td className="text-center p-4 bg-[#2F6BFF]/5">
                      <CheckCircle className="w-5 h-5 text-green-700 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <CheckCircle className="w-5 h-5 text-green-700 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Team Collaboration</td>
                    <td className="text-center p-4 bg-[#2F6BFF]/5">
                      <CheckCircle className="w-5 h-5 text-green-700 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <CheckCircle className="w-5 h-5 text-green-700 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b bg-green-50 dark:bg-green-950/20">
                    <td className="p-4 font-medium">Starting Price (Monthly)</td>
                    <td className="text-center p-4 font-bold text-green-700">$15/month</td>
                    <td className="text-center p-4 font-medium text-red-600">$12/user/month</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Why Switch */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Marketing Agencies Choose TrackFlow Over Harvest</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <BarChart3 className="w-10 h-10 text-[#2F6BFF] mb-4" />
                <CardTitle>Marketing-Specific Features</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Harvest treats all work the same. TrackFlow understands marketing workflows with channel tracking, campaign ROI analysis, and retainer management.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Track by PPC, SEO, Social, Email channels
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Campaign-level profitability analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Retainer burndown alerts
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="w-10 h-10 text-[#2F6BFF] mb-4" />
                <CardTitle>Better Pricing for Agencies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Harvest charges per user. TrackFlow has flat agency pricing that scales with your business, not your headcount.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Freelancer: $15/month (vs Harvest $12/user)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Agency Starter: $29/month up to 10 users
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Save $100s monthly with team scaling
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-10 h-10 text-[#2F6BFF] mb-4" />
                <CardTitle>Built for Marketing Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Every feature designed with digital marketers in mind. From campaign templates to client health scoring.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Marketing campaign templates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Client health & risk alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Marketing ROI reporting
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Customer Story */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-[#2F6BFF]/10 to-purple-100/50 dark:from-[#2F6BFF]/20 dark:to-purple-900/20">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">Real Agency Success Story</h3>
                <div className="flex justify-center mb-6">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <blockquote className="text-lg text-center italic mb-6">
                "We switched from Harvest to TrackFlow and immediately saw our agency's profitability increase by 23%. The campaign-level tracking helped us identify which services were actually making money and which clients needed pricing adjustments."
              </blockquote>
              <div className="text-center">
                <p className="font-semibold">Sarah Chen, Founder</p>
                <p className="text-muted-foreground">Digital Spark Marketing (15-person agency)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-[#2F6BFF] to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Switch from Harvest?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join 2,000+ marketing agencies who've made the switch. Start your free 14-day trial today—no credit card required.
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
            Easy migration • 24/7 support • No setup fees
          </p>
        </div>
      </main>
    </div>
  )
}