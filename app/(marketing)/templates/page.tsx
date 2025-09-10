import Link from 'next/link'
import { Clock, Users, Target, BarChart3, Zap, Star, Download, Play } from 'lucide-react'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Templates | TrackFlow – Ready-to-Use Workflows',
  description: 'Download ready-to-use templates for PPC optimization, SEO audits, and more. Save time and standardize your workflow.',
  openGraph: {
    title: 'TrackFlow Templates',
    description: 'Ready-to-use workflows for PPC, SEO, and creative testing.',
    url: 'https://track-flow.app/templates',
    siteName: 'TrackFlow',
    images: [ { url: '/images/og-templates.png', width: 1200, height: 630 } ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrackFlow Templates',
    description: 'Ready-to-use workflows for PPC, SEO, and creative testing.',
    images: ['/images/og-templates.png'],
  },
}

const templates = [
  // Advertising Templates
  {
    name: "PPC Monthly Optimization",
    duration: 45,
    category: "advertising",
    description: "Complete PPC account review and optimization workflow",
    icon: Target,
    downloads: 247,
    rating: 4.9,
    features: ["Campaign analysis", "Keyword research", "Ad copy review", "Performance reporting"]
  },
  {
    name: "Google Ads Account Audit",
    duration: 120,
    category: "advertising",
    description: "Comprehensive Google Ads account review and optimization roadmap",
    icon: BarChart3,
    downloads: 189,
    rating: 4.8,
    features: ["Account structure review", "Keyword analysis", "Ad copy assessment", "Landing page review", "Optimization roadmap"]
  },
  {
    name: "Facebook Ads Creative Testing",
    duration: 90,
    category: "advertising",
    description: "Set up and manage Facebook ad creative testing campaigns",
    icon: Zap,
    downloads: 156,
    rating: 4.7,
    features: ["Creative development", "Audience setup", "Test structure", "Budget allocation", "Performance tracking"]
  },
  
  // SEO Templates
  {
    name: "SEO Technical Audit",
    duration: 90,
    category: "seo",
    description: "Comprehensive technical SEO audit and recommendations",
    icon: BarChart3,
    downloads: 192,
    rating: 4.8,
    features: ["Site crawl analysis", "Performance review", "Technical fixes", "Priority recommendations"]
  },
  {
    name: "Local SEO Setup",
    duration: 60,
    category: "seo",
    description: "Complete local SEO optimization for local businesses",
    icon: Target,
    downloads: 134,
    rating: 4.6,
    features: ["Google My Business", "Local citations", "Review management", "Local content strategy"]
  },
  
  // Content Templates
  {
    name: "Content Creation",
    duration: 120,
    category: "content",
    description: "End-to-end content creation and optimization process",
    icon: Users,
    downloads: 267,
    rating: 4.7,
    features: ["Research & planning", "Content creation", "SEO optimization", "Publishing workflow"]
  },
  {
    name: "Blog Post Writing",
    duration: 180,
    category: "content",
    description: "Complete blog post creation from research to publication",
    icon: Clock,
    downloads: 198,
    rating: 4.8,
    features: ["Topic research", "SEO optimization", "Draft creation", "Editing round", "Publishing setup"]
  },
  {
    name: "Video Script Writing",
    duration: 120,
    category: "content",
    description: "Professional video script development for marketing videos",
    icon: Play,
    downloads: 87,
    rating: 4.5,
    features: ["Hook development", "Story structure", "CTA placement", "Visual notes", "Duration targeting"]
  },
  
  // Analytics Templates
  {
    name: "Google Analytics Monthly Report",
    duration: 60,
    category: "analytics",
    description: "Comprehensive monthly analytics review and insights",
    icon: BarChart3,
    downloads: 312,
    rating: 4.9,
    features: ["Traffic analysis", "Conversion tracking", "Goal performance", "Custom insights", "Recommendations"]
  },
  {
    name: "Campaign Performance Review",
    duration: 90,
    category: "analytics",
    description: "Multi-channel campaign performance analysis",
    icon: Target,
    downloads: 176,
    rating: 4.7,
    features: ["Multi-channel analysis", "ROI calculation", "A/B test results", "Budget recommendations", "Next steps planning"]
  },
  
  // Strategy Templates
  {
    name: "Competitor Analysis",
    duration: 120,
    category: "strategy",
    description: "Comprehensive competitive landscape analysis",
    icon: Users,
    downloads: 145,
    rating: 4.8,
    features: ["Competitive landscape", "Ad spy research", "SEO gap analysis", "Social media audit", "Opportunity identification"]
  },
  {
    name: "Marketing Strategy Session",
    duration: 180,
    category: "strategy",
    description: "Complete marketing strategy development session",
    icon: Target,
    downloads: 98,
    rating: 4.9,
    features: ["Goal setting", "Channel selection", "Budget allocation", "Timeline planning", "KPI definition"]
  },
  
  // Email Templates
  {
    name: "Email Marketing Setup",
    duration: 75,
    category: "email",
    description: "Email marketing campaign setup and automation",
    icon: Target,
    downloads: 134,
    rating: 4.8,
    features: ["List segmentation", "Template design", "Automation setup", "A/B testing"]
  },
  {
    name: "Welcome Series Setup",
    duration: 120,
    category: "email",
    description: "Complete welcome email series setup and automation",
    icon: Zap,
    downloads: 112,
    rating: 4.7,
    features: ["Sequence planning", "Copy writing", "Design templates", "Automation setup", "Testing"]
  },
  {
    name: "Newsletter Creation",
    duration: 60,
    category: "email",
    description: "Weekly or monthly newsletter creation process",
    icon: Clock,
    downloads: 203,
    rating: 4.6,
    features: ["Content curation", "Copy writing", "Design layout", "List segmentation", "Scheduling"]
  },
  
  // Social Media Templates
  {
    name: "Social Media Campaign",
    duration: 60,
    category: "social",
    description: "Complete social media campaign planning and execution",
    icon: Zap,
    downloads: 243,
    rating: 4.6,
    features: ["Strategy planning", "Content calendar", "Community management", "Performance tracking"]
  },
  
  // Admin Templates
  {
    name: "Client Reporting Call",
    duration: 30,
    category: "admin",
    description: "Structured client reporting and Q&A sessions",
    icon: Clock,
    downloads: 410,
    rating: 4.9,
    features: ["Report preparation", "Call structure", "Action items", "Follow-up tasks"]
  }
]

const TemplateCard = ({ name, duration, category, description, icon: Icon, downloads, rating, features }: typeof templates[0]) => (
  <Card className="border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-lg">
    <CardHeader>
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <Badge variant="secondary" className="text-xs capitalize">{category}</Badge>
      </div>
      <CardTitle className="text-lg mb-2">{name}</CardTitle>
      <CardDescription className="text-sm text-gray-600">{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Duration</span>
          <span className="font-medium">{duration} min</span>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Key Features:</p>
          <ul className="space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="text-xs text-gray-600 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                {feature}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{rating}</span>
            <span className="text-xs text-gray-500">({downloads})</span>
          </div>
          <Link href={`/signup?template=${encodeURIComponent(name)}`} aria-label={`Use template ${name}`}>
            <Button size="sm" variant="outline" className="text-xs">
              <Download className="w-3 h-3 mr-1" />
              Use Template
            </Button>
          </Link>
        </div>
      </div>
    </CardContent>
  </Card>
)

export default function TemplatesPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4 border-b border-gray-100">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-600 text-white border-blue-600">
            Quick Start Templates
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Quick Start Templates
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Pre-built workflows for common marketing tasks. 
            Save hours of setup time and start tracking immediately.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="btn-primary">
                Start Free 14-Day Trial
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map(template => (
              <TemplateCard key={template.name} {...template} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Need a Custom Template?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Our team can create custom templates for your specific workflow and industry.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="btn-primary">
                Request Custom Template
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">
                Schedule Demo
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Free consultation • Custom workflows • Industry-specific templates
          </p>
        </div>
      </section>
    </div>
  )
}
