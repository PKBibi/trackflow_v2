import Link from 'next/link'
import { TrendingUp, Users, DollarSign, FileText, Zap, Brain, Clock, BarChart3, Shield, Globe, Target, PieChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: TrendingUp,
    title: "Campaign ROI Tracking",
    description: "Link time spent to campaign performance. See which campaigns are actually profitable after labor costs.",
    category: "Analytics",
    highlight: "Track profitability by campaign"
  },
  {
    icon: Users,
    title: "Multi-Channel Time Allocation",
    description: "Track time across PPC, SEO, Social, Email. Know exactly where your hours go.",
    category: "Organization",
    highlight: "Organize by marketing channels"
  },
  {
    icon: DollarSign,
    title: "Retainer Burndown Alerts",
    description: "Get notified at 75%, 90%, and 100% retainer usage. Never go over budget unexpectedly.",
    category: "Financial",
    highlight: "Stay within client budgets"
  },
  {
    icon: FileText,
    title: "White-Label Client Reports",
    description: "Professional reports showing time by campaign, channel, and deliverable. Your branding, not ours.",
    category: "Reporting",
    highlight: "Professional client deliverables"
  },
  {
    icon: Zap,
    title: "Platform Auto-Detection",
    description: "Browser extension detects when you're in Google Ads, Meta Business, or Analytics.",
    category: "Automation",
    highlight: "Automatic platform detection"
  },
  {
    icon: Brain,
    title: "AI Insights & Predictions",
    description: "Get daily insights on productivity patterns and time predictions for similar tasks.",
    category: "Intelligence",
    highlight: "AI-powered insights"
  },
  {
    icon: Clock,
    title: "Smart Time Tracking",
    description: "One-click timers, idle detection, and automatic time categorization based on your workflow.",
    category: "Productivity",
    highlight: "Minimize manual tracking"
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Deep insights into team productivity, project profitability, and client ROI.",
    category: "Analytics",
    highlight: "Data-driven decisions"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 compliant, GDPR ready, and enterprise-grade security for your sensitive client data.",
    category: "Security",
    highlight: "Enterprise-grade security"
  }
]

const FeatureCard = ({ icon: Icon, title, description, category, highlight }: typeof features[0]) => (
  <Card className="border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-lg">
    <CardHeader>
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <Badge variant="secondary" className="text-xs">{category}</Badge>
      </div>
      <CardTitle className="text-lg mb-2">{title}</CardTitle>
      <CardDescription className="text-sm text-gray-600">{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
        <Target className="w-4 h-4" />
        {highlight}
      </div>
    </CardContent>
  </Card>
)

export default function FeaturesPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4 border-b border-gray-100">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-600 border-blue-200">
            Marketing-First Features
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Features Built for Digital Marketers
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Every feature designed with agencies and freelancers in mind. 
            Track time like a marketer, not like a generic business.
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
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(feature => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Track Time Like a Marketer?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join 2,847+ agencies who've made the switch to marketing-specific time tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="btn-primary">
                Start Free 14-Day Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Talk to Sales
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  )
}
