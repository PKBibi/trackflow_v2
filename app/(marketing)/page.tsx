import Link from 'next/link'
import { ArrowRight, Play, TrendingUp, Users, Zap, DollarSign, FileText, Brain, BarChart3, Clock, AlertCircle, CheckCircle, Shield, Award, Globe, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Time Tracking Software for Digital Marketing Agencies | TrackFlow',
  description: 'The only time tracking software built for marketing agencies. Track campaign profitability, manage retainers, and increase margins by 40%. Trusted by 2,000+ agencies worldwide.',
  keywords: 'time tracking software, marketing agency time tracking, campaign profitability, retainer management, digital marketing analytics, agency productivity tools',
  openGraph: {
    title: 'TrackFlow - Time Tracking for Digital Marketing Agencies',
    description: 'Track campaign profitability, manage retainers, and increase margins by 40%. Trusted by 2,000+ marketing agencies worldwide.',
    images: ['/images/og-homepage.png'],
  },
}

export default function MarketingLandingPage() {
  return (
    <div className="bg-gradient-to-b from-white to-gray-50 dark:from-[#0B1220] dark:to-gray-950">

      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden">
        {/* Background gradient orb */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/20 to-teal-400/20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-400/20 to-blue-400/20 blur-3xl rounded-full" />

        <div className="relative max-w-7xl mx-auto">
          {/* Trust badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-teal-100 dark:from-blue-900/50 dark:to-teal-900/50 rounded-full border border-blue-200 dark:border-blue-800">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Trusted by 2,000+ marketing agencies worldwide
              </span>
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-center mb-12 bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-400 dark:to-white bg-clip-text text-transparent leading-tight">
            Time Tracking that<br />Actually Makes Money
          </h1>

          <p className="text-xl md:text-2xl text-center text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto font-light">
            The professional time tracking platform built exclusively for digital marketing agencies.
            Track profitability by channel, automate client reporting, and increase margins by 40%.
          </p>
          
          {/* Key metrics bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">2,000+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Agencies Trust Us</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">40%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Margin Increase</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">$2.4M</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Revenue Recovered/mo</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">4.9/5</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Customer Rating</div>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                Start Free 14-Day Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="border-2 border-gray-300 dark:border-gray-700 px-8 py-6 text-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                <Play className="mr-2 w-5 h-5" />
                See Live Demo
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              No credit card required
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Setup in 3 minutes
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Cancel anytime
            </span>
          </div>
          
        </div>
      </section>

      {/* Trust Signals Bar */}
      <section className="py-16 border-y border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8 uppercase tracking-wider font-medium">
            Trusted by 2,000+ marketing agencies worldwide
          </p>

          {/* Trust Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">99.9%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Uptime SLA</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">SOC 2</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Type II Certified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">GDPR</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Compliant</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">24/7</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Support</div>
            </div>
          </div>

          {/* Agency Names */}
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-75">
            <div className="text-xl font-bold text-gray-600 dark:text-gray-300">Growth Digital Partners</div>
            <div className="text-xl font-bold text-gray-600 dark:text-gray-300">Pinnacle SEO</div>
            <div className="text-xl font-bold text-gray-600 dark:text-gray-300">AdScale Partners</div>
            <div className="text-xl font-bold text-gray-600 dark:text-gray-300">Social First Agency</div>
            <div className="text-xl font-bold text-gray-600 dark:text-gray-300">Digital Revenue Co</div>
            <div className="text-xl font-bold text-gray-600 dark:text-gray-300">Marketing Lab Pro</div>
          </div>

          {/* Security Badges */}
          <div className="flex justify-center items-center gap-8 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Shield className="w-4 h-4" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <CheckCircle className="w-4 h-4" />
              <span>ISO 27001 Certified</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Globe className="w-4 h-4" />
              <span>Global Infrastructure</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Start tracking smarter in minutes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Get up and running in under 3 minutes. No complex setup, no training required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg text-white font-bold text-2xl">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Sign up in seconds</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create your account with just an email. No credit card needed for your 14-day trial.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg text-white font-bold text-2xl">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Add your clients & channels</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Set up your marketing channels (PPC, SEO, Social) and add your clients in minutes.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg text-white font-bold text-2xl">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Start tracking & see insights</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Begin tracking time and instantly see profitability insights by channel and client.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Modern Enterprise Style */}
      <section className="py-32 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-teal-100 dark:from-blue-900/30 dark:to-teal-900/30 rounded-full mb-6">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Everything you need to maximize agency profitability
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Purpose-built features that understand how modern marketing agencies operate and grow.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 - Channel Tracking */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl mb-3">Channel-Based Time Tracking</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Track time by marketing channel (PPC, SEO, Social, Email) instead of generic projects. Instantly see which channels drive the most profit.
                </CardDescription>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">+23% billable hour recovery</p>
                </div>
              </CardHeader>
            </Card>
            
            {/* Feature 2 - Profitability */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
              <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl mb-3">Real-Time Profitability Analysis</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Automatically calculate margins per channel and client. Know exactly which services and clients are most profitable.
                </CardDescription>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">+40% average margin increase</p>
                </div>
              </CardHeader>
            </Card>
            
            {/* Feature 3 - Retainer Management */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl mb-3">Smart Retainer Management</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Automatic alerts before retainers are exhausted. Keep clients happy with proactive communication about budget usage.
                </CardDescription>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">94% client retention rate</p>
                </div>
              </CardHeader>
            </Card>
            
            {/* Feature 4 - Automated Reporting */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl mb-3">One-Click Client Reports</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Generate beautiful, branded client reports instantly. Include time breakdowns, progress updates, and budget tracking.
                </CardDescription>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Save 6+ hours monthly</p>
                </div>
              </CardHeader>
            </Card>
            
            {/* Feature 5 - AI Insights */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl mb-3">AI-Powered Insights</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Get intelligent recommendations on pricing, capacity, and client health. Spot opportunities and risks before they impact your bottom line.
                </CardDescription>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-teal-600 dark:text-teal-400">Prevent 33% of client churn</p>
                </div>
              </CardHeader>
            </Card>
            
            {/* Feature 6 - Team Collaboration */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl mb-3">Team Collaboration Tools</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Manage team capacity, delegate tasks efficiently, and see who's working on what. Perfect for growing agencies.
                </CardDescription>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Scale to 50+ team members</p>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>


      {/* Testimonials Section - Enterprise Style */}
      <section className="py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-full mb-6">
              <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Customer Success Stories</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Trusted by 2,000+ marketing agencies worldwide
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              See how agencies like yours transformed their profitability with TrackFlow
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Card className="border-0 shadow-xl bg-white dark:bg-gray-900">
              <CardContent className="pt-8">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-lg mb-6 text-gray-700 dark:text-gray-300">
                  "TrackFlow transformed our agency. We discovered our SEO services had 3x better margins than paid social. After shifting focus, we added <span className="font-bold text-green-700 dark:text-green-300">$21,000/month</span> in pure profit."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">SC</div>
                  <div>
                    <p className="font-semibold">Sarah Chen</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">CEO, Growth Digital • 12 employees</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Testimonial 2 */}
            <Card className="border-0 shadow-xl bg-white dark:bg-gray-900">
              <CardContent className="pt-8">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-lg mb-6 text-gray-700 dark:text-gray-300">
                  "The retainer alerts are a game-changer. We haven't lost a single client to budget surprises in 18 months. <span className="font-bold text-green-700 dark:text-green-300">100% retention</span> speaks for itself."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">MJ</div>
                  <div>
                    <p className="font-semibold">Marcus Johnson</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">SEO Consultant • Solo Practitioner</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Testimonial 3 */}
            <Card className="border-0 shadow-xl bg-white dark:bg-gray-900">
              <CardContent className="pt-8">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-lg mb-6 text-gray-700 dark:text-gray-300">
                  "TrackFlow's insights helped us identify and drop unprofitable clients. Our margins jumped from 20% to <span className="font-bold text-green-700 dark:text-green-300">65% in just 2 months</span>."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">ER</div>
                  <div>
                    <p className="font-semibold">Emily Rodriguez</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Founder, Social First • 8 employees</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-32 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Simple, transparent pricing that scales with you
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Start free, upgrade when you're ready. No hidden fees, no surprises.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Freelancer Plan */}
            <Card className="border-2 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl">Freelancer</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$15</span>
                  <span className="text-gray-600 dark:text-gray-400">/month</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Perfect for independent marketers
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Solo use</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Unlimited clients</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Channel tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Basic reports</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Agency Starter Plan */}
            <Card className="border-2 border-blue-500 shadow-xl relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-3 py-1">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Agency Starter</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-gray-600 dark:text-gray-400">/user/month</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Growing marketing teams (2-10 people)
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Up to 10 team members</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Retainer tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>White-label reports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Client portal</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Agency Growth Plan */}
            <Card className="border-2 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl">Agency Growth</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$49</span>
                  <span className="text-gray-600 dark:text-gray-400">/user/month</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Scale your agency (10+ people)
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Unlimited team members</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Custom integrations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>API access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Dedicated support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section - Clean Enterprise Style */}
      <section className="relative py-32 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative container mx-auto px-4 text-center max-w-5xl">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Ready to transform your agency's profitability?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Join 2,000+ agencies already using TrackFlow to track smarter, bill more, and grow faster.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-6 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105">
                Start Your Free Trial
                <ArrowRight className="ml-3 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="border-2 border-white bg-white text-blue-600 hover:bg-blue-50 px-10 py-6 text-lg font-semibold">
                <Play className="mr-3 w-5 h-5" />
                See Live Demo
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-white/90">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              14-day free trial
            </span>
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Cancel anytime
            </span>
          </div>
        </div>
      </section>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "TrackFlow",
            "applicationCategory": "BusinessApplication",
            "applicationSubCategory": "Time Tracking Software",
            "description": "Time tracking software built specifically for digital marketing agencies. Track campaign profitability, manage retainers, and increase margins.",
            "url": "https://trackflow.app",
            "downloadUrl": "https://trackflow.app/signup",
            "softwareVersion": "2.0",
            "operatingSystem": "Web Browser",
            "pricing": "https://trackflow.app/pricing",
            "offers": [
              {
                "@type": "Offer",
                "name": "Freelancer Plan",
                "price": "15",
                "priceCurrency": "USD",
                "priceSpecification": {
                  "@type": "UnitPriceSpecification",
                  "price": "15",
                  "priceCurrency": "USD",
                  "unitCode": "MON"
                }
              },
              {
                "@type": "Offer",
                "name": "Agency Starter",
                "price": "29",
                "priceCurrency": "USD",
                "priceSpecification": {
                  "@type": "UnitPriceSpecification",
                  "price": "29",
                  "priceCurrency": "USD",
                  "unitCode": "MON"
                }
              }
            ],
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "500",
              "bestRating": "5"
            },
            "author": {
              "@type": "Organization",
              "name": "TrackFlow Inc",
              "url": "https://trackflow.app"
            },
            "publisher": {
              "@type": "Organization",
              "name": "TrackFlow Inc",
              "url": "https://trackflow.app",
              "logo": {
                "@type": "ImageObject",
                "url": "https://trackflow.app/images/logo.png"
              }
            },
            "featureList": [
              "Campaign-level time tracking",
              "Retainer budget management",
              "Marketing channel analytics",
              "Client profitability insights",
              "Team collaboration tools",
              "White-label reporting",
              "API integrations"
            ],
            "screenshot": "https://trackflow.app/images/screenshot.png"
          })
        }}
      />

    </div>
  )
}