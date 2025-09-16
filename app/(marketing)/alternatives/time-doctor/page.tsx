'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, Star, Users, BarChart3, Clock, ArrowRight, Shield, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function TimeDoctorAlternativePage() {
  useEffect(() => {
    // Track page view for alternative page
    import('@/components/analytics').then(({ trackEvent }) => {
      trackEvent.featureUse('alternative_page_time_doctor');
    }).catch(() => {});
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <main className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="secondary">
            Better Time Doctor Alternative for Marketing Agencies
          </Badge>
          <h1 className="text-4xl font-bold mb-6">
            Skip the Surveillance. Get <span className="text-[#2F6BFF]">Marketing Insights</span> Instead.
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Time Doctor focuses on employee monitoring. TrackFlow focuses on marketing performance. Get campaign profitability insights without the Big Brother approach your team will hate.
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
              <Shield className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Privacy-First Approach</span>
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

        {/* Approach Comparison */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Two Completely Different Approaches</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Eye className="w-8 h-8 text-red-500" />
                  <CardTitle className="text-red-700 dark:text-red-400">Time Doctor Approach</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500">•</span>
                    <span>Screenshot monitoring every few minutes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500">•</span>
                    <span>Website and app usage tracking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500">•</span>
                    <span>Productivity scoring based on activity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500">•</span>
                    <span>Focus on "catching" unproductive time</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500">•</span>
                    <span>Creates adversarial relationship with team</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-green-500" />
                  <CardTitle className="text-green-700 dark:text-green-400">TrackFlow Approach</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-green-700 dark:text-green-400">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 mt-0.5" />
                    <span>Privacy-first time tracking (no screenshots)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 mt-0.5" />
                    <span>Campaign and channel profitability analysis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 mt-0.5" />
                    <span>Business insights to optimize operations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 mt-0.5" />
                    <span>Focus on improving marketing ROI</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 mt-0.5" />
                    <span>Builds trust and transparency with team</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">TrackFlow vs Time Doctor: Feature Comparison</h2>
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
                    <th className="text-center p-4 font-semibold">Time Doctor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Screenshot Monitoring</td>
                    <td className="text-center p-4 bg-[#2F6BFF]/5">
                      <span className="text-green-700 font-medium">Privacy-First ✓</span>
                    </td>
                    <td className="text-center p-4">
                      <span className="text-red-600">Screenshots Every 10min</span>
                    </td>
                  </tr>
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
                    <td className="p-4 font-medium">Retainer Budget Management</td>
                    <td className="text-center p-4 bg-[#2F6BFF]/5">
                      <CheckCircle className="w-5 h-5 text-green-700 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <span className="text-gray-400">×</span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">App/Website Usage Tracking</td>
                    <td className="text-center p-4 bg-[#2F6BFF]/5">
                      <span className="text-green-700">Optional</span>
                    </td>
                    <td className="text-center p-4">
                      <span className="text-orange-600">Always On</span>
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
                    <td className="p-4 font-medium">Team Collaboration</td>
                    <td className="text-center p-4 bg-[#2F6BFF]/5">
                      <CheckCircle className="w-5 h-5 text-green-700 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <CheckCircle className="w-5 h-5 text-green-700 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b bg-green-50 dark:bg-green-950/20">
                    <td className="p-4 font-medium">Starting Price</td>
                    <td className="text-center p-4 font-bold text-green-700">$15/month</td>
                    <td className="text-center p-4 font-medium">$7/user/month</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Why Teams Hate Time Doctor */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Marketing Teams Hate Time Doctor (And Love TrackFlow)</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Shield className="w-10 h-10 text-[#2F6BFF] mb-4" />
                <CardTitle>Privacy & Trust</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-red-600 mb-2">Time Doctor:</h4>
                    <p className="text-sm text-muted-foreground">"Big Brother" approach with constant screenshots, app monitoring, and productivity scoring that makes teams feel untrusted.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">TrackFlow:</h4>
                    <p className="text-sm text-green-700 dark:text-green-400">Privacy-first approach. No screenshots, no app spying. Focus on results, not surveillance.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="w-10 h-10 text-[#2F6BFF] mb-4" />
                <CardTitle>Business Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-red-600 mb-2">Time Doctor:</h4>
                    <p className="text-sm text-muted-foreground">Tells you who was "unproductive" but gives zero insights into marketing performance or profitability.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">TrackFlow:</h4>
                    <p className="text-sm text-green-700 dark:text-green-400">Shows which campaigns are profitable, which channels ROI best, and where to focus your team's efforts.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-10 h-10 text-[#2F6BFF] mb-4" />
                <CardTitle>Team Morale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-red-600 mb-2">Time Doctor:</h4>
                    <p className="text-sm text-muted-foreground">Creates an adversarial relationship. Teams spend time gaming the system instead of being productive.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">TrackFlow:</h4>
                    <p className="text-sm text-green-700 dark:text-green-400">Builds transparency and trust. Teams understand how their work contributes to agency success.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Real Reviews Comparison */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">What Users Actually Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-400">Time Doctor Reviews</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(3)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                    {[...Array(2)].map((_, i) => (
                      <Star key={i + 3} className="w-4 h-4 text-gray-300" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">3.8/5 on G2</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <blockquote className="text-sm italic border-l-4 border-red-300 pl-4">
                    "My team hates the constant screenshots. It feels like we don't trust them to do their work."
                  </blockquote>
                  <blockquote className="text-sm italic border-l-4 border-red-300 pl-4">
                    "The monitoring is too invasive. We've lost good people because of this tool."
                  </blockquote>
                  <blockquote className="text-sm italic border-l-4 border-red-300 pl-4">
                    "It tells me what websites they visit but not whether our campaigns are profitable."
                  </blockquote>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-400">TrackFlow Reviews</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">4.8/5 on G2</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <blockquote className="text-sm italic border-l-4 border-green-300 pl-4">
                    "Finally, a time tracker that understands marketing! The campaign insights are game-changing."
                  </blockquote>
                  <blockquote className="text-sm italic border-l-4 border-green-300 pl-4">
                    "My team actually likes using it because they can see how their work impacts agency profitability."
                  </blockquote>
                  <blockquote className="text-sm italic border-l-4 border-green-300 pl-4">
                    "We discovered our PPC services were 3x more profitable than content. Completely changed our pricing."
                  </blockquote>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Migration Guide */}
        <div className="mb-16">
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">Switching from Time Doctor? Your Team Will Thank You</h3>
                <p className="text-muted-foreground">Stop the surveillance. Start getting marketing insights that actually help your business.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 text-center mb-8">
                <div>
                  <div className="bg-[#2F6BFF] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                  <h4 className="font-semibold mb-2">Turn Off Screenshots</h4>
                  <p className="text-sm text-muted-foreground">Finally give your team the privacy they deserve</p>
                </div>
                <div>
                  <div className="bg-[#2F6BFF] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                  <h4 className="font-semibold mb-2">Import Your Data</h4>
                  <p className="text-sm text-muted-foreground">Easy migration from Time Doctor with our import wizard</p>
                </div>
                <div>
                  <div className="bg-[#2F6BFF] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                  <h4 className="font-semibold mb-2">Get Better Insights</h4>
                  <p className="text-sm text-muted-foreground">Start tracking marketing performance, not just time</p>
                </div>
              </div>

              <div className="text-center">
                <Button size="lg" className="bg-[#2F6BFF] hover:bg-[#1E4DB8] text-white" asChild>
                  <Link href="/signup">Switch to Privacy-First Tracking</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-[#2F6BFF] to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Stop Watching. Start Understanding.</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Get the marketing insights Time Doctor can't provide, without the surveillance your team hates. Try TrackFlow risk-free for 14 days.
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
            No screenshots • No surveillance • Just marketing insights
          </p>
        </div>
      </main>
    </div>
  )
}