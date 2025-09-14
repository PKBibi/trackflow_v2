import Link from 'next/link'
import { ArrowRight, Play, TrendingUp, Users, Zap, DollarSign, FileText, Brain, BarChart3, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function MarketingLandingPage() {
  return (
    <div className="bg-gradient-to-b from-white to-gray-50 dark:from-[#0B1220] dark:to-gray-950">

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Trust badge with urgency */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full mb-6 animate-pulse">
            <span className="text-green-600 text-sm font-medium">
              🔥 147 agencies signed up this week • Average ROI: 312% in first 90 days
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Smart Time Tracking for<br />
            Digital Marketing Agencies
          </h1>
          
          <p className="text-2xl font-semibold text-blue-600 mb-6">
            Stop losing $4,200/month in unbilled hours with the only time tracker 
            that speaks PPC, SEO, and social media
          </p>
          
          <div className="bg-white border-2 border-blue-200 rounded-lg p-6 max-w-4xl mx-auto mb-8 shadow-lg">
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-green-600">WHAT</div>
                <p className="text-sm">Profitability-focused time tracking with margin analysis</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">WHO</div>
                <p className="text-sm">Digital marketing agencies & consultants (1-50 people)</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">WHY</div>
                <p className="text-sm">Recover 23% lost hours + 40% margin boost in 30 days</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-600">HOW</div>
                <p className="text-sm">Unlike generic trackers - built for marketing workflows</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link href="/signup" className="btn-cta text-xl px-10 py-5 font-bold shadow-lg">
              Start Free Trial - See Results in 7 Days →
            </Link>
            <Link href="/demo" className="btn-cta-outline text-lg px-8 py-4">
              Watch 2-Min Demo
            </Link>
          </div>
          
          <div className="text-center mb-4">
            <p className="text-lg font-medium text-gray-700">
              ⚡ Takes 3 minutes to setup • 💰 Guarantee 40% margin boost • 🚫 No credit card
            </p>
          </div>
          
          {/* Instant Value Proof */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 max-w-2xl mx-auto mb-8 border-2 border-green-200">
            <div className="text-center">
              <p className="text-lg font-bold text-green-700 mb-2">Your Agency's Hidden Revenue Calculator:</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Team Size:</span>
                  <div className="font-bold text-2xl text-blue-600">5 people</div>
                </div>
                <div>
                  <span className="text-gray-600">Lost Hours:</span>
                  <div className="font-bold text-2xl text-red-600">23%</div>
                </div>
                <div>
                  <span className="text-gray-600">Recovery:</span>
                  <div className="font-bold text-2xl text-green-600">$27,600/mo</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <span>✓ Set up in 3 minutes</span>
            <span>✓ See ROI in first week</span>
            <span>✓ Money-back guarantee</span>
          </div>
        </div>
      </section>

      {/* Differentiation Bar */}
      <section className="py-12 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-6">Why TrackFlow vs Generic Time Trackers?</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="text-3xl mb-2">⏱️ vs 🏢</div>
              <h4 className="font-bold mb-2">Built for Marketing</h4>
              <p className="text-sm text-blue-100">Pre-configured for PPC, SEO, Social vs generic "projects"</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📊 vs 📋</div>
              <h4 className="font-bold mb-2">Profit-Focused</h4>
              <p className="text-sm text-blue-100">Shows margin analysis per channel vs basic reports</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🎯 vs ❓</div>
              <h4 className="font-bold mb-2">Agency Workflows</h4>
              <p className="text-sm text-blue-100">Retainer tracking & client billing vs one-size-fits-all</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-8 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium">$2.4M recovered revenue last month</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium">94% client retention rate</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium">40% average margin increase</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-red-100 text-red-700 border-red-200">
                The Hidden Problem
              </Badge>
              <h3 className="text-2xl font-bold mb-4">You're Bleeding Money Every Day</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <span>23% of billable work goes untracked (industry average)</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <span>60% of agencies don't know which services are profitable</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <span>$4,200/month lost per employee from poor time tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <span>33% of client churn from unexpected overages</span>
                </li>
              </ul>
            </div>
            
            <div>
              <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">
                The TrackFlow Solution
              </Badge>
              <h3 className="text-2xl font-bold mb-4">Turn Every Hour Into Profit</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span><strong>Week 1:</strong> Recover 23% of lost billable hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span><strong>Week 2:</strong> Identify your 3 most profitable services</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span><strong>Week 3:</strong> Cut admin time by 70% with automation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span><strong>Month 1:</strong> 40% margin improvement guaranteed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Outcome Focused */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-600 text-white border-green-600">
              Time Tracking That Pays For Itself
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              6 Ways Our Smart Timer Boosts Your Profits
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Unlike generic time trackers, every minute tracked delivers measurable ROI
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-2 hover:border-green-300 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <Badge variant="outline" className="bg-green-50">+$4,200/mo</Badge>
                </div>
                <CardTitle>Smart Time Capture by Channel</CardTitle>
                <CardDescription>
                  <strong>How:</strong> Track time across PPC, SEO, Social, Email with 1-click.<br/>
                  <strong>Result:</strong> Recover 23% lost billable hours = $4,200/month per employee.
                </CardDescription>
              </CardHeader>
            </Card>
            
            {/* Feature 2 */}
            <Card className="border-2 hover:border-blue-300 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <Badge variant="outline" className="bg-blue-50">+40% margins</Badge>
                </div>
                <CardTitle>Automatic Profitability Analysis</CardTitle>
                <CardDescription>
                  <strong>How:</strong> Our timer calculates real-time margins per marketing channel.<br/>
                  <strong>Result:</strong> Discover your most profitable services + 40% margin boost.
                </CardDescription>
              </CardHeader>
            </Card>
            
            {/* Feature 3 */}
            <Card className="border-2 hover:border-amber-300 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-amber-600" />
                  </div>
                  <Badge variant="outline" className="bg-amber-50">94% retention</Badge>
                </div>
                <CardTitle>Smart Retainer Tracking</CardTitle>
                <CardDescription>
                  <strong>How:</strong> Automatic alerts at 75%, 90%, 100% retainer usage.<br/>
                  <strong>Result:</strong> Zero surprise overages + 94% client retention rate.
                </CardDescription>
              </CardHeader>
            </Card>
            
            {/* Feature 4 */}
            <Card className="border-2 hover:border-purple-300 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <Badge variant="outline" className="bg-purple-50">-70% time</Badge>
                </div>
                <CardTitle>Cut Invoicing by 70%</CardTitle>
                <CardDescription>
                  <strong>Result:</strong> Auto-generate branded client reports in 2 clicks. 
                  Save 6 hours/month on admin = $900/month back in billable time.
                </CardDescription>
              </CardHeader>
            </Card>
            
            {/* Feature 5 */}
            <Card className="border-2 hover:border-red-300 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <Badge variant="outline" className="bg-red-50">Risk alerts</Badge>
                </div>
                <CardTitle>Prevent Revenue Loss</CardTitle>
                <CardDescription>
                  <strong>Result:</strong> Client health scoring spots at-risk accounts 30 days early. 
                  Save 2-3 clients per year worth $180,000 in lifetime value.
                </CardDescription>
              </CardHeader>
            </Card>
            
            {/* Feature 6 */}
            <Card className="border-2 hover:border-indigo-300 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <Badge variant="outline" className="bg-indigo-50">$150/hr</Badge>
                </div>
                <CardTitle>Optimize to $150+ Rates</CardTitle>
                <CardDescription>
                  <strong>Result:</strong> Capacity planning shows exactly when to hire and what to outsource. 
                  Reach $150/hr effective rate within 60 days.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-green-300">
            <CardHeader className="text-center">
              <h2 className="text-3xl font-bold mb-2">Your Potential ROI</h2>
              <p className="text-lg text-gray-600">Based on averages from 2,000+ agencies</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-4xl font-bold text-green-600">$4,200</p>
                  <p className="text-sm text-gray-600">Monthly recovered revenue</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-blue-600">312%</p>
                  <p className="text-sm text-gray-600">Average ROI in 90 days</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-purple-600">6 hours</p>
                  <p className="text-sm text-gray-600">Saved per week</p>
                </div>
              </div>
              <div className="mt-8 text-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg">
                    Calculate Your Exact ROI →
                  </Button>
                </Link>
                <p className="text-xs text-gray-500 mt-2">Takes 30 seconds • No email required</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials with Results */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Real Agencies, Real Results
            </h2>
            <p className="text-xl text-muted-foreground">
              Join 2,000+ agencies already maximizing profitability
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="font-bold text-green-600 mb-2">+$21,000/month recovered</p>
                <p className="text-muted-foreground mb-4">
                  "We discovered SEO services had 3x better margins than paid social. Shifted our focus and added $21k/month in profit."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full"></div>
                  <div>
                    <p className="font-medium">Sarah Chen</p>
                    <p className="text-sm text-muted-foreground">Growth Digital • 12 employees</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="font-bold text-green-600 mb-2">100% client retention</p>
                <p className="text-muted-foreground mb-4">
                  "Retainer alerts eliminated surprise overages. Haven't lost a single client to budget issues in 18 months."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full"></div>
                  <div>
                    <p className="font-medium">Marcus Johnson</p>
                    <p className="text-sm text-muted-foreground">SEO Consultant • Solo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="font-bold text-green-600 mb-2">45% margin increase</p>
                <p className="text-muted-foreground mb-4">
                  "Client health scoring helped us fire 3 unprofitable clients. Margins went from 20% to 65% in 2 months."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full"></div>
                  <div>
                    <p className="font-medium">Emily Rodriguez</p>
                    <p className="text-sm text-muted-foreground">Social First • 8 employees</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Urgency Section */}
      <section className="py-16 bg-red-50 dark:bg-red-900/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Every Day You Wait Costs You Money</h2>
          <div className="max-w-3xl mx-auto">
            <Card className="bg-white border-red-200">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-red-600">$140</p>
                    <p className="text-sm">Lost per day</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-red-600">$980</p>
                    <p className="text-sm">Lost per week</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-red-600">$4,200</p>
                    <p className="text-sm">Lost per month</p>
                  </div>
                </div>
                <p className="mt-6 text-lg font-medium">
                  While you're reading this, billable hours are slipping through the cracks.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 cta-gradient">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Start Recovering Lost Revenue Today
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Join 2,000+ agencies already using TrackFlow to maximize profitability. 
            Set up in 3 minutes, see results in 7 days.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90 px-8 py-4 text-lg font-bold">
                Start Free 14-Day Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
                <Play className="w-5 h-5 mr-2" />
                Watch 2-Min Demo
              </Button>
            </Link>
          </div>
          <p className="text-white mb-4">
            <strong>🎁 Limited Time:</strong> Sign up today and get our Agency Profitability Playbook ($297 value) FREE
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/90">
            <span>✓ No credit card required</span>
            <span>✓ 30-day money back guarantee</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </section>

    </div>
  )
}