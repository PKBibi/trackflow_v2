import Link from 'next/link'
import { TrendingUp, Users, DollarSign, FileText, Zap, Brain, Clock, BarChart3, Shield, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function FeaturesPage() {
  const features = [
    {
      icon: TrendingUp,
      title: "Campaign ROI Tracking",
      description: "Link time spent to campaign performance. See which campaigns are actually profitable after labor costs.",
      category: "Analytics"
    },
    {
      icon: Users,
      title: "Multi-Channel Time Allocation",
      description: "Track time across PPC, SEO, Social, Email. Know exactly where your hours go.",
      category: "Organization"
    },
    {
      icon: DollarSign,
      title: "Retainer Burndown Alerts",
      description: "Get notified at 75%, 90%, and 100% retainer usage. Never go over budget unexpectedly.",
      category: "Billing"
    },
    {
      icon: FileText,
      title: "White-Label Client Reports",
      description: "Professional reports showing time by campaign, channel, and deliverable. Your branding, not ours.",
      category: "Reporting"
    },
    {
      icon: Zap,
      title: "Platform Auto-Detection",
      description: "Browser extension detects when you're in Google Ads, Meta Business, or Analytics.",
      category: "Automation"
    },
    {
      icon: Brain,
      title: "AI Insights & Predictions",
      description: "Get daily insights on productivity patterns and time predictions for similar tasks.",
      category: "Intelligence"
    },
    {
      icon: Clock,
      title: "Smart Time Tracking",
      description: "One-click timers, idle detection, and automatic time categorization based on your work patterns.",
      category: "Efficiency"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Deep insights into team productivity, project profitability, and client performance metrics.",
      category: "Analytics"
    },
    {
      icon: Shield,
      title: "Privacy-First Design",
      description: "Your data stays on your servers. No tracking, no ads, no data mining.",
      category: "Security"
    },
    {
      icon: Globe,
      title: "Multi-Platform Sync",
      description: "Works across desktop, mobile, and browser. Sync your time data everywhere.",
      category: "Accessibility"
    }
  ]

  const categories = ["All", "Analytics", "Organization", "Billing", "Reporting", "Automation", "Intelligence", "Efficiency", "Security", "Accessibility"]

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 dark:from-[#0B1220] dark:to-gray-950">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-600 border-blue-200">
            Marketing-First Features
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Built for Digital Marketing Teams
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Every feature designed with marketers in mind. Track time by campaign, channel, and client 
            with tools that understand your workflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="btn-primary">
                Start Free 14-Day Trial
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Track Marketing Time
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From campaign tracking to client billing, we've got you covered
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="border-blue-200/20 hover:border-blue-300 transition-colors hover:shadow-lg">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <Badge variant="secondary" className="w-fit mb-2">
                      {feature.category}
                    </Badge>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 cta-gradient">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Time Tracking?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of marketing professionals who've made the switch to TrackFlow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Contact Sales
              </Button>
            </Link>
          </div>
          <p className="text-sm text-white/80 mt-4">
            No credit card required • 14-day free trial
          </p>
        </div>
      </section>
    </div>
  )
}
