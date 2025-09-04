import Link from 'next/link'
import { ArrowRight, Play, TrendingUp, Users, Zap, DollarSign, FileText, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function MarketingLandingPage() {
  return (
    <div className="bg-gradient-to-b from-white to-gray-50 dark:from-[#0B1220] dark:to-gray-950">

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-6">
            <span className="text-blue-600 text-sm font-medium">
              Trusted by 2,000+ agencies managing $50M+ monthly ad spend
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            The Only Time Tracking Software<br />
            Built for Digital Marketers
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Stop forcing generic time trackers to understand PPC, SEO, and social campaigns.
            TrackFlow speaks your language with channel tracking, retainer management, 
            and campaign ROI built-in.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                         <Link href="/signup" className="px-8 py-4 btn-primary text-white rounded-lg hover:bg-blue-800">
               Start Free 14-Day Trial
             </Link>
            <Link href="/demo" className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-lg hover:bg-gray-50">
              Watch 2-min Demo
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <span>✓ No credit card required</span>
            <span>✓ 30-day free trial</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </section>

             {/* Features Grid */}
       <section className="py-24 bg-white dark:bg-gray-900">
         <div className="container mx-auto px-4">
           <div className="text-center mb-16">
             <Badge className="mb-4 bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]">
               Marketing-First Features
             </Badge>
             <h2 className="text-3xl md:text-4xl font-bold mb-4">
               Built for Modern Marketing Teams
             </h2>
             <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
               Every feature designed with marketers in mind
             </p>
           </div>
           
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             {/* Campaign ROI Tracking */}
             <Card className="border-[#2F6BFF]/20 hover:border-[#2F6BFF] transition-colors">
               <CardHeader>
                 <div className="w-12 h-12 bg-[#2F6BFF]/10 rounded-lg flex items-center justify-center mb-4">
                   <TrendingUp className="w-6 h-6 text-[#2F6BFF]" />
                 </div>
                 <CardTitle>Campaign ROI Tracking</CardTitle>
                 <CardDescription>
                   Link time spent to campaign performance. See which campaigns are actually profitable after labor costs.
                 </CardDescription>
               </CardHeader>
             </Card>
             
             {/* Multi-Channel Time Allocation */}
             <Card className="border-[#7C3AED]/20 hover:border-[#7C3AED] transition-colors">
               <CardHeader>
                 <div className="w-12 h-12 bg-[#7C3AED]/10 rounded-lg flex items-center justify-center mb-4">
                   <Users className="w-6 h-6 text-[#7C3AED]" />
                 </div>
                 <CardTitle>Multi-Channel Time Allocation</CardTitle>
                 <CardDescription>
                   Track time across PPC, SEO, Social, Email. Know exactly where your hours go.
                 </CardDescription>
               </CardHeader>
             </Card>
             
             {/* Retainer Burndown Alerts */}
             <Card className="border-[#16B8A6]/20 hover:border-[#16B8A6] transition-colors">
               <CardHeader>
                 <div className="w-12 h-12 bg-[#16B8A6]/10 rounded-lg flex items-center justify-center mb-4">
                   <DollarSign className="w-6 h-6 text-[#16B8A6]" />
                 </div>
                 <CardTitle>Retainer Burndown Alerts</CardTitle>
                 <CardDescription>
                   Get notified at 75%, 90%, and 100% retainer usage. Never go over budget unexpectedly.
                 </CardDescription>
               </CardHeader>
             </Card>
             
             {/* White-Label Client Reports */}
             <Card className="border-[#F59E0B]/20 hover:border-[#F59E0B] transition-colors">
               <CardHeader>
                 <div className="w-12 h-12 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center mb-4">
                   <FileText className="w-6 h-6 text-[#F59E0B]" />
                 </div>
                 <CardTitle>White-Label Client Reports</CardTitle>
                 <CardDescription>
                   Professional reports showing time by campaign, channel, and deliverable. Your branding, not ours.
                 </CardDescription>
               </CardHeader>
             </Card>
             
             {/* Platform Auto-Detection */}
             <Card className="border-[#2F6BFF]/20 hover:border-[#2F6BFF] transition-colors">
               <CardHeader>
                 <div className="w-12 h-12 bg-[#2F6BFF]/10 rounded-lg flex items-center justify-center mb-4">
                   <Zap className="w-6 h-6 text-[#2F6BFF]" />
                 </div>
                 <CardTitle>Platform Auto-Detection</CardTitle>
                 <CardDescription>
                   Browser extension detects when you're in Google Ads, Meta Business, or Analytics.
                 </CardDescription>
               </CardHeader>
             </Card>
             
             {/* AI Insights & Predictions */}
             <Card className="border-[#7C3AED]/20 hover:border-[#7C3AED] transition-colors">
               <CardHeader>
                 <div className="w-12 h-12 bg-[#7C3AED]/10 rounded-lg flex items-center justify-center mb-4">
                   <Brain className="w-6 h-6 text-[#7C3AED]" />
                 </div>
                 <CardTitle>AI Insights & Predictions</CardTitle>
                 <CardDescription>
                   Get daily insights on productivity patterns and time predictions for similar tasks.
                 </CardDescription>
               </CardHeader>
             </Card>
           </div>
         </div>
       </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Marketing Professionals
            </h2>
            <p className="text-xl text-muted-foreground">
              See why agencies choose TrackFlow
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Finally, a timer that understands the difference between campaign setup and optimization. TrackFlow cut our invoicing time by 70%."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#2F6BFF]/10 rounded-full"></div>
                  <div>
                    <p className="font-medium">Sarah Chen</p>
                    <p className="text-sm text-muted-foreground">PPC Manager, Growth Digital Agency</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "The retainer alerts are a game-changer. I haven't gone over a client's budget since switching to TrackFlow."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#7C3AED]/10 rounded-full"></div>
                  <div>
                    <p className="font-medium">Marcus Johnson</p>
                    <p className="text-sm text-muted-foreground">SEO Consultant, Freelance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "My team loves the channel tracking. We can finally see that our SEO work is 3x more profitable than paid social."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#16B8A6]/10 rounded-full"></div>
                  <div>
                    <p className="font-medium">Emily Rodriguez</p>
                    <p className="text-sm text-muted-foreground">Agency Owner, Social First Marketing</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

             {/* CTA Section */}
       <section className="py-24 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Track Time Like a Marketer?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of marketing professionals who've made the switch to privacy-first time tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                         <Link href="/signup">
               <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90">
                 Start Free Trial
                 <ArrowRight className="w-4 h-4 ml-2" />
               </Button>
             </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
            </Link>
          </div>
          <p className="text-sm text-white/60 mt-4">
            No credit card required • 14-day free trial
          </p>
        </div>
      </section>

    </div>
  )
}

