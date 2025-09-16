'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Clock, BarChart3, Users, CheckCircle, Star, Target, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const alternatives = [
  {
    name: 'Harvest',
    slug: 'harvest',
    description: 'Popular with freelancers but lacks marketing-specific features',
    reasons: [
      'No campaign or channel tracking',
      'Basic reporting for agencies',
      'Per-user pricing gets expensive'
    ],
    pricing: '$12/user/month',
    users: '50,000+ businesses'
  },
  {
    name: 'Toggl Track',
    slug: 'toggl',
    description: 'Simple time tracking that treats all work the same',
    reasons: [
      'No marketing workflow support',
      'Limited profitability insights',
      'General-purpose, not marketing-focused'
    ],
    pricing: '$9/user/month',
    users: '5M+ users'
  },
  {
    name: 'Time Doctor',
    slug: 'time-doctor',
    description: 'Employee monitoring focus, not marketing optimization',
    reasons: [
      'Surveillance approach vs insights',
      'No campaign ROI tracking',
      'Complex for marketing teams'
    ],
    pricing: '$7/user/month',
    users: '83,000+ businesses'
  },
  {
    name: 'RescueTime',
    slug: 'rescuetime',
    description: 'Personal productivity tracking without business insights',
    reasons: [
      'Individual focus, not team-oriented',
      'No client or project management',
      'Lacks marketing-specific analytics'
    ],
    pricing: '$12/month individual',
    users: '2.5M+ users'
  }
]

export default function AlternativesIndexPage() {
  useEffect(() => {
    // Track page view for alternatives index
    import('@/components/analytics').then(({ trackEvent }) => {
      trackEvent.featureUse('alternatives_index_page');
    }).catch(() => {});
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <main className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="secondary">
            Time Tracking Alternatives for Marketing Agencies
          </Badge>
          <h1 className="text-4xl font-bold mb-6">
            The Best Time Tracking Alternative for <span className="text-[#2F6BFF]">Marketing Agencies</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Generic time tracking tools miss what marketing agencies need most: campaign profitability, channel analysis, and retainer management. TrackFlow is purpose-built for digital marketing teams.
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
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Marketing-Focused Analytics</span>
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

        {/* Why Different */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Marketing Agencies Need Different Time Tracking</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <BarChart3 className="w-10 h-10 text-[#2F6BFF] mb-4" />
                <CardTitle>Campaign Profitability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Generic tools tell you "how long" you worked. Marketing agencies need to know which campaigns, channels, and services are actually profitable after labor costs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="w-10 h-10 text-[#2F6BFF] mb-4" />
                <CardTitle>Retainer Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track retainer budgets, get burndown alerts, and prevent scope creep. Essential for agency cash flow that general time trackers completely miss.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-10 h-10 text-[#2F6BFF] mb-4" />
                <CardTitle>Marketing Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Built-in understanding of marketing channels (PPC, SEO, Social, Email) and campaign structures that other tools treat as generic "projects."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Alternatives Comparison */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Time Tracking Tools vs TrackFlow</h2>
          <div className="space-y-6">
            {alternatives.map((tool, index) => (
              <Card key={tool.slug} className="overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">{tool.name}</h3>
                      <Badge variant="outline">{tool.pricing}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{tool.description}</p>
                    <p className="text-sm text-muted-foreground mb-4">Used by {tool.users}</p>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Why agencies switch from {tool.name}:</h4>
                      <ul className="space-y-1">
                        {tool.reasons.map((reason, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button variant="outline" className="w-full mt-4" asChild>
                      <Link href={`/alternatives/${tool.slug}`}>
                        See Detailed Comparison
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>

                  <div className="bg-[#2F6BFF]/5 p-6 border-l border-[#2F6BFF]/20">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="font-bold">TrackFlow</span>
                      <Badge className="bg-[#2F6BFF] text-white">Better for Agencies</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Purpose-built for marketing agencies with campaign tracking, channel profitability, and retainer management.
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-700" />
                        <span>Campaign & channel tracking</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-700" />
                        <span>Retainer budget management</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-700" />
                        <span>Marketing ROI analytics</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-700" />
                        <span>Agency-friendly pricing</span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="font-semibold text-green-700">From $15/month</span>
                      <span className="text-muted-foreground"> (flat agency pricing)</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* What Makes TrackFlow Different */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">What TrackFlow Does That Others Don't</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-[#2F6BFF]" />
                  Marketing-Specific Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-700 mt-0.5" />
                    <div>
                      <strong>Channel Profitability:</strong> See which marketing channels (PPC, SEO, Social, Email) are most profitable
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-700 mt-0.5" />
                    <div>
                      <strong>Campaign ROI:</strong> Track time spent vs campaign performance to see true profitability
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-700 mt-0.5" />
                    <div>
                      <strong>Service Margins:</strong> Understand which services have the highest margins after labor costs
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-6 h-6 text-[#2F6BFF]" />
                  Agency Operations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-700 mt-0.5" />
                    <div>
                      <strong>Retainer Tracking:</strong> Monitor retainer budgets with burndown charts and overage alerts
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-700 mt-0.5" />
                    <div>
                      <strong>Client Health:</strong> Get early warning signs when client relationships need attention
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-700 mt-0.5" />
                    <div>
                      <strong>Team Utilization:</strong> Optimize resource allocation across marketing campaigns
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pricing Comparison */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Pricing That Scales With Your Agency</h2>
          <Card className="overflow-hidden max-w-4xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="text-left p-4 font-semibold">Team Size</th>
                    <th className="text-center p-4 font-semibold">Harvest</th>
                    <th className="text-center p-4 font-semibold">Toggl</th>
                    <th className="text-center p-4 font-semibold">Time Doctor</th>
                    <th className="text-center p-4 font-semibold bg-[#2F6BFF]/10">
                      <Badge className="bg-[#2F6BFF] text-white">TrackFlow</Badge>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 font-medium">1 user (Freelancer)</td>
                    <td className="text-center p-4">$12/month</td>
                    <td className="text-center p-4">$9/month</td>
                    <td className="text-center p-4">$7/month</td>
                    <td className="text-center p-4 bg-[#2F6BFF]/5 font-bold text-green-700">$15/month</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">5 users (Small Agency)</td>
                    <td className="text-center p-4">$60/month</td>
                    <td className="text-center p-4">$45/month</td>
                    <td className="text-center p-4">$35/month</td>
                    <td className="text-center p-4 bg-[#2F6BFF]/5 font-bold text-green-700">$29/month</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">10 users (Growing Agency)</td>
                    <td className="text-center p-4">$120/month</td>
                    <td className="text-center p-4">$90/month</td>
                    <td className="text-center p-4">$70/month</td>
                    <td className="text-center p-4 bg-[#2F6BFF]/5 font-bold text-green-700">$49/month</td>
                  </tr>
                  <tr className="border-b bg-green-50 dark:bg-green-950/20">
                    <td className="p-4 font-medium">20 users (Established Agency)</td>
                    <td className="text-center p-4 text-red-600">$240/month</td>
                    <td className="text-center p-4 text-red-600">$180/month</td>
                    <td className="text-center p-4 text-red-600">$140/month</td>
                    <td className="text-center p-4 bg-[#2F6BFF]/5 font-bold text-green-700">$49/month</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Save hundreds monthly with TrackFlow's agency-friendly pricing model
          </p>
        </div>

        {/* Related Solutions */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Find Your Marketing Agency Solution</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Users className="w-8 h-8 text-[#2F6BFF] mb-2" />
                <CardTitle className="text-lg">Full-Service Marketing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Multi-channel campaign tracking for agencies managing PPC, SEO, social, and content marketing.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/use-cases/marketing-agencies">
                    View Use Case
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="w-8 h-8 text-[#2F6BFF] mb-2" />
                <CardTitle className="text-lg">PPC Specialists</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Campaign-level tracking for Google Ads, Facebook Ads, and other paid advertising management.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/use-cases/ppc-agencies">
                    View Use Case
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Search className="w-8 h-8 text-[#2F6BFF] mb-2" />
                <CardTitle className="text-lg">SEO Agencies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Track technical audits, content creation, and link building with ranking correlation analytics.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/use-cases/seo-agencies">
                    View Use Case
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-[#2F6BFF] to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Switch to Marketing-Focused Time Tracking?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join 2,000+ marketing agencies getting insights that generic time trackers can't provide. Start your free trial today.
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
            14-day free trial • No credit card required • Easy migration from any tool
          </p>
        </div>
      </main>
    </div>
  )
}