'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Search, TrendingUp, Users, CheckCircle, Star, Clock, BarChart3, Target, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const seoServices = [
  { name: 'Technical SEO Audits', avgTime: '8-12 hours', avgRate: '$125/hour', monthlyValue: '$1,250' },
  { name: 'Content Strategy & Creation', avgTime: '15-20 hours', avgRate: '$95/hour', monthlyValue: '$1,710' },
  { name: 'Link Building Campaigns', avgTime: '10-15 hours', avgRate: '$115/hour', monthlyValue: '$1,495' },
  { name: 'Local SEO Management', avgTime: '6-8 hours', avgRate: '$105/hour', monthlyValue: '$735' },
  { name: 'E-commerce SEO', avgTime: '12-16 hours', avgRate: '$135/hour', monthlyValue: '$1,890' },
  { name: 'SEO Reporting & Analysis', avgTime: '4-6 hours', avgRate: '$85/hour', monthlyValue: '$425' }
]

const seoMetrics = [
  { metric: 'Organic Traffic Growth', improvement: '156%', timeframe: '6 months' },
  { metric: 'Keyword Rankings (Top 3)', improvement: '89%', timeframe: '4 months' },
  { metric: 'Local Rankings', improvement: '234%', timeframe: '3 months' },
  { metric: 'Conversion Rate', improvement: '67%', timeframe: '5 months' }
]

export default function SEOAgenciesPage() {
  useEffect(() => {
    import('@/components/analytics').then(({ trackEvent }) => {
      trackEvent.featureUse('seo_agencies_page');
    }).catch(() => {});
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <main className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="secondary">
            Time Tracking for SEO Agencies
          </Badge>
          <h1 className="text-4xl font-bold mb-6">
            SEO Time Tracking That Actually <span className="text-[#2F6BFF]">Improves Rankings</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Track technical audits, content creation, and link building campaigns. See which SEO activities drive the highest ROI and optimize your agency's keyword strategy.
          </p>
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="font-medium">4.9/5 by SEO Agencies</span>
            </div>
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Track 50+ SEO Activities</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-700" />
              <span className="font-medium">Avg 89% Ranking Improvement</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-[#2F6BFF] hover:bg-[#1E4DB8] text-white" asChild>
              <Link href="/signup">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demo">See SEO Demo</Link>
            </Button>
          </div>
        </div>

        {/* SEO Agency Challenges */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">The SEO Agency Time Tracking Problem</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <Clock className="w-10 h-10 text-red-600 mb-4" />
                <CardTitle className="text-red-800 dark:text-red-400">Campaign Time Blindness</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  "We spent 40 hours on technical SEO this month, but which site improvements actually moved rankings?" Without campaign-level tracking, you can't optimize your SEO strategy.
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <BarChart3 className="w-10 h-10 text-red-600 mb-4" />
                <CardTitle className="text-red-800 dark:text-red-400">Service Profitability Mystery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  "Link building takes forever, but technical audits are quick wins." Without service-level analytics, you're pricing SEO services based on guesswork instead of actual time investment.
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <Target className="w-10 h-10 text-red-600 mb-4" />
                <CardTitle className="text-red-800 dark:text-red-400">Keyword ROI Unknown</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  "We rank #1 for 50 keywords, but which ones justify the time investment?" Generic time trackers can't connect SEO effort to ranking improvements and revenue.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* TrackFlow SEO Solution */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">How TrackFlow Solves SEO Time Tracking</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-[#2F6BFF]/20 bg-[#2F6BFF]/5">
              <CardHeader>
                <Search className="w-10 h-10 text-[#2F6BFF] mb-4" />
                <CardTitle>SEO-Specific Activity Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    <span className="text-sm">Technical SEO audits & site speed optimization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    <span className="text-sm">Content research, writing & optimization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    <span className="text-sm">Link building outreach & relationship management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    <span className="text-sm">Local SEO & Google Business Profile management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    <span className="text-sm">Keyword research & competitive analysis</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#2F6BFF]/20 bg-[#2F6BFF]/5">
              <CardHeader>
                <TrendingUp className="w-10 h-10 text-[#2F6BFF] mb-4" />
                <CardTitle>ROI & Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    <span className="text-sm">Service profitability analysis (technical vs content vs links)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    <span className="text-sm">Campaign-level time tracking for keyword targets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    <span className="text-sm">Client ranking improvement correlation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    <span className="text-sm">Monthly SEO retainer burn tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    <span className="text-sm">Team efficiency across different SEO tasks</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SEO Service Value Analysis */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">SEO Service Profitability Analysis</h2>
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-center">Average Monthly Service Values</CardTitle>
              <CardDescription className="text-center">
                Based on 500+ SEO agencies using TrackFlow time tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold">SEO Service</th>
                      <th className="text-center p-4 font-semibold">Avg. Hours/Month</th>
                      <th className="text-center p-4 font-semibold">Avg. Rate</th>
                      <th className="text-center p-4 font-semibold">Monthly Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seoServices.map((service, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-4 font-medium">{service.name}</td>
                        <td className="text-center p-4">{service.avgTime}</td>
                        <td className="text-center p-4">{service.avgRate}</td>
                        <td className="text-center p-4 font-bold text-green-700">{service.monthlyValue}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#2F6BFF]/5 font-bold">
                      <td className="p-4">Total Monthly SEO Revenue</td>
                      <td className="text-center p-4">55-77 hours</td>
                      <td className="text-center p-4">$110 avg</td>
                      <td className="text-center p-4 text-[#2F6BFF] text-lg">$7,505</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Success Story */}
        <div className="mb-16">
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
            <CardHeader>
              <Badge className="w-fit bg-green-600 text-white mb-4">Success Story</Badge>
              <CardTitle className="text-2xl">How Pinnacle SEO Increased Profit Margins by 52%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-muted-foreground mb-6">
                    "Before TrackFlow, we were charging the same rate for technical audits and content creation. Turns out technical work was 3x more profitable per hour. We've restructured our entire pricing model."
                  </p>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                      MP
                    </div>
                    <div>
                      <div className="font-semibold">Mike Patterson</div>
                      <div className="text-sm text-muted-foreground">Founder, Pinnacle SEO</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {seoMetrics.map((metric, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold text-green-700 mb-1">+{metric.improvement}</div>
                      <div className="text-sm font-medium mb-1">{metric.metric}</div>
                      <div className="text-xs text-muted-foreground">in {metric.timeframe}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pre-built SEO Templates */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Pre-built SEO Tracking Templates</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Globe className="w-8 h-8 text-[#2F6BFF] mb-2" />
                <CardTitle className="text-lg">Technical SEO Audit</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Site speed analysis</li>
                  <li>• Core Web Vitals optimization</li>
                  <li>• Schema markup implementation</li>
                  <li>• Mobile-first indexing check</li>
                  <li>• Internal linking structure</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Search className="w-8 h-8 text-[#2F6BFF] mb-2" />
                <CardTitle className="text-lg">Content Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Keyword research & mapping</li>
                  <li>• Content gap analysis</li>
                  <li>• Title tag optimization</li>
                  <li>• Meta description writing</li>
                  <li>• Content refresh & updates</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-8 h-8 text-[#2F6BFF] mb-2" />
                <CardTitle className="text-lg">Link Building Campaign</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Prospect research & outreach</li>
                  <li>• Guest posting coordination</li>
                  <li>• Broken link building</li>
                  <li>• Resource page submissions</li>
                  <li>• Relationship management</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="w-8 h-8 text-[#2F6BFF] mb-2" />
                <CardTitle className="text-lg">Local SEO Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Google Business Profile optimization</li>
                  <li>• Local citation building</li>
                  <li>• Review management</li>
                  <li>• Local keyword tracking</li>
                  <li>• NAP consistency audits</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-[#2F6BFF] mb-2" />
                <CardTitle className="text-lg">E-commerce SEO</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Product page optimization</li>
                  <li>• Category structure planning</li>
                  <li>• Faceted navigation SEO</li>
                  <li>• Product schema markup</li>
                  <li>• Shopping feed optimization</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="w-8 h-8 text-[#2F6BFF] mb-2" />
                <CardTitle className="text-lg">SEO Reporting</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Ranking position tracking</li>
                  <li>• Organic traffic analysis</li>
                  <li>• Conversion attribution</li>
                  <li>• Competitive benchmarking</li>
                  <li>• ROI calculation & reporting</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ROI Calculator */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-[#2F6BFF]/10 to-purple-600/10 border-[#2F6BFF]/20">
            <CardHeader>
              <CardTitle className="text-center text-2xl">SEO Agency ROI Calculator</CardTitle>
              <CardDescription className="text-center">
                Based on average improvements seen by SEO agencies using TrackFlow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-[#2F6BFF] mb-2">52%</div>
                  <div className="text-lg font-semibold mb-2">Higher Profit Margins</div>
                  <div className="text-sm text-muted-foreground">
                    By identifying your most profitable SEO services and optimizing pricing accordingly
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#2F6BFF] mb-2">8.5hrs</div>
                  <div className="text-lg font-semibold mb-2">Time Saved Weekly</div>
                  <div className="text-sm text-muted-foreground">
                    Through automated time tracking and SEO workflow optimization
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#2F6BFF] mb-2">$4,890</div>
                  <div className="text-lg font-semibold mb-2">Additional Monthly Revenue</div>
                  <div className="text-sm text-muted-foreground">
                    From better service pricing and improved client retention
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing for SEO Agencies */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">SEO Agency Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Freelance SEO</CardTitle>
                <CardDescription>Perfect for independent SEO consultants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#2F6BFF] mb-4">$15<span className="text-base font-normal text-muted-foreground">/month</span></div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    <span className="text-sm">1 user account</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    <span className="text-sm">Unlimited SEO projects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    <span className="text-sm">Pre-built SEO templates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    <span className="text-sm">Basic reporting</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/signup">Start Free Trial</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-[#2F6BFF] relative">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[#2F6BFF] text-white">
                Most Popular
              </Badge>
              <CardHeader>
                <CardTitle>Growing SEO Agency</CardTitle>
                <CardDescription>For teams of 2-15 SEO specialists</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#2F6BFF] mb-4">$29<span className="text-base font-normal text-muted-foreground">/month</span></div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    <span className="text-sm">Up to 15 team members</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    <span className="text-sm">Advanced SEO analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    <span className="text-sm">Client reporting dashboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    <span className="text-sm">Team collaboration tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    <span className="text-sm">Priority support</span>
                  </li>
                </ul>
                <Button className="w-full bg-[#2F6BFF] hover:bg-[#1E4DB8] text-white" asChild>
                  <Link href="/signup">Start Free Trial</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enterprise SEO</CardTitle>
                <CardDescription>For large SEO agencies and in-house teams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#2F6BFF] mb-4">$49<span className="text-base font-normal text-muted-foreground">/month</span></div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    <span className="text-sm">Unlimited team members</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    <span className="text-sm">White-label reporting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    <span className="text-sm">API access & integrations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    <span className="text-sm">Custom SEO templates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    <span className="text-sm">Dedicated account manager</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/signup">Start Free Trial</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-[#2F6BFF] to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Optimize Your SEO Agency's Profitability?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join 500+ SEO agencies using TrackFlow to identify their most profitable services and increase profit margins by an average of 52%.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Button size="lg" className="bg-white text-[#2F6BFF] hover:bg-gray-100" asChild>
              <Link href="/signup">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link href="/demo">Book SEO Demo</Link>
            </Button>
          </div>
          <p className="text-sm opacity-75">
            14-day free trial • Pre-built SEO templates included • Cancel anytime
          </p>
        </div>
      </main>
    </div>
  )
}