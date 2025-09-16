'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, Star, Users, BarChart3, Clock, ArrowRight, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function TogglAlternativePage() {
  useEffect(() => {
    // Track page view for alternative page
    import('@/components/analytics').then(({ trackEvent }) => {
      trackEvent.featureUse('alternative_page_toggl');
    }).catch(() => {});
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <main className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="secondary">
            #1 Toggl Alternative for Marketing Agencies
          </Badge>
          <h1 className="text-4xl font-bold mb-6">
            The Best Toggl Alternative for <span className="text-[#2F6BFF]">Marketing Agencies</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Toggl is perfect for basic time tracking, but marketing agencies need more. TrackFlow adds campaign tracking, channel profitability analysis, and retainer management—everything Toggl is missing.
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
              <Target className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Marketing-Focused</span>
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
          <h2 className="text-3xl font-bold text-center mb-8">TrackFlow vs Toggl: Feature-by-Feature Comparison</h2>
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
                    <th className="text-center p-4 font-semibold">Toggl Track</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Marketing Campaign Tracking</td>
                    <td className="text-center p-4 bg-[#2F6BFF]/5">
                      <CheckCircle className="w-5 h-5 text-green-700 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <span className="text-gray-400">×</span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Channel Profitability (PPC, SEO, Social)</td>
                    <td className="text-center p-4 bg-[#2F6BFF]/5">
                      <CheckCircle className="w-5 h-5 text-green-700 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <span className="text-gray-400">×</span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Retainer Budget Tracking</td>
                    <td className="text-center p-4 bg-[#2F6BFF]/5">
                      <CheckCircle className="w-5 h-5 text-green-700 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <span className="text-gray-400">×</span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Client Health Scoring</td>
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
                    <td className="p-4 font-medium">Project Management</td>
                    <td className="text-center p-4 bg-[#2F6BFF]/5">
                      <CheckCircle className="w-5 h-5 text-green-700 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <CheckCircle className="w-5 h-5 text-green-700 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Reporting & Analytics</td>
                    <td className="text-center p-4 bg-[#2F6BFF]/5">
                      <div className="text-green-700 text-sm">Marketing-Focused</div>
                    </td>
                    <td className="text-center p-4">
                      <div className="text-blue-600 text-sm">General</div>
                    </td>
                  </tr>
                  <tr className="border-b bg-green-50 dark:bg-green-950/20">
                    <td className="p-4 font-medium">Starting Price</td>
                    <td className="text-center p-4 font-bold text-green-700">$15/month flat</td>
                    <td className="text-center p-4 font-medium">$9/user/month</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
          <p className="text-sm text-muted-foreground text-center mt-4">
            *Toggl pricing scales per user. TrackFlow offers flat agency pricing that grows with you.
          </p>
        </div>

        {/* What You're Missing */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">What Toggl Can't Tell You (But TrackFlow Can)</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-400">What Toggl Shows</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground">
                  <li>• "You spent 8 hours on Project X"</li>
                  <li>• "Client ABC used 15 hours this week"</li>
                  <li>• "Your team logged 120 hours"</li>
                  <li>• "This project took 40 hours"</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-400">What TrackFlow Reveals</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-green-700 dark:text-green-400">
                  <li>• "PPC campaigns are 40% more profitable than SEO"</li>
                  <li>• "Client ABC is 80% through their retainer budget"</li>
                  <li>• "Social media services have a 65% margin"</li>
                  <li>• "This campaign generated $2,500 profit"</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Why Switch */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why 2,000+ Marketing Agencies Switched from Toggl</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Target className="w-10 h-10 text-[#2F6BFF] mb-4" />
                <CardTitle>Built for Marketing Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Toggl treats all work the same. TrackFlow understands that PPC management is different from content creation, and SEO is different from social media.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Pre-built marketing campaign templates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Channel-specific tracking (PPC, SEO, Social, Email)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Campaign ROI and profitability analysis
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="w-10 h-10 text-[#2F6BFF] mb-4" />
                <CardTitle>Marketing Analytics That Matter</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Get insights that help you run a better agency: which services are profitable, which clients need attention, and where to focus your team's time.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Service margin analysis by channel
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Client health scoring and risk alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Retainer utilization tracking
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="w-10 h-10 text-[#2F6BFF] mb-4" />
                <CardTitle>Agency-Friendly Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Toggl's per-user pricing gets expensive fast. TrackFlow's flat agency pricing scales with your business growth, not your team size.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    $15/month vs $9/user/month (save at 2+ users)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    Agency tiers with unlimited team members
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    No per-user fees as you scale
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Migration Made Easy */}
        <div className="mb-16">
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">Switching from Toggl is Easy</h3>
                <p className="text-muted-foreground">We'll help you migrate your data and get set up in under an hour.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="bg-[#2F6BFF] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                  <h4 className="font-semibold mb-2">Export from Toggl</h4>
                  <p className="text-sm text-muted-foreground">Use Toggl's export feature to download your time data</p>
                </div>
                <div>
                  <div className="bg-[#2F6BFF] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                  <h4 className="font-semibold mb-2">Import to TrackFlow</h4>
                  <p className="text-sm text-muted-foreground">Our import wizard maps your projects and clients automatically</p>
                </div>
                <div>
                  <div className="bg-[#2F6BFF] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                  <h4 className="font-semibold mb-2">Start Tracking Better</h4>
                  <p className="text-sm text-muted-foreground">Begin getting marketing-specific insights immediately</p>
                </div>
              </div>

              <div className="text-center mt-8">
                <Button size="lg" className="bg-[#2F6BFF] hover:bg-[#1E4DB8] text-white" asChild>
                  <Link href="/signup">Start Your Migration Today</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Story */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-[#2F6BFF]/10 to-purple-100/50 dark:from-[#2F6BFF]/20 dark:to-purple-900/20">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">Agency Success Story</h3>
                <div className="flex justify-center mb-6">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <blockquote className="text-lg text-center italic mb-6">
                "Toggl told us what we already knew—we were busy. TrackFlow showed us what we needed to know—that our PPC services were 3x more profitable than content marketing. We've completely restructured our offerings based on TrackFlow's insights."
              </blockquote>
              <div className="text-center">
                <p className="font-semibold">Mike Rodriguez, CEO</p>
                <p className="text-muted-foreground">Growth Digital Agency (22-person team)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-[#2F6BFF] to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Marketing-Specific Insights?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Stop settling for basic time tracking. Start getting the marketing analytics that actually help you grow your agency.
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
            14-day free trial • No credit card required • Migrate from Toggl in minutes
          </p>
        </div>
      </main>
    </div>
  )
}