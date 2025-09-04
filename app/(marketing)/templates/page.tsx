import Link from 'next/link'
import { Download, Clock, Users, FileText, BarChart3, Settings, Zap, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TemplatesPage() {
  const templates = [
    {
      icon: Clock,
      title: "PPC Campaign Template",
      description: "Pre-configured time tracking for Google Ads, Meta Ads, and other PPC platforms.",
      category: "Campaign",
      downloads: 1247,
      rating: 4.9,
      features: ["Campaign categorization", "Ad group tracking", "Performance metrics", "Client reporting"]
    },
    {
      icon: Users,
      title: "SEO Project Template",
      description: "Track time across keyword research, content creation, and technical optimization.",
      category: "SEO",
      downloads: 892,
      rating: 4.8,
      features: ["Keyword research", "Content creation", "Technical SEO", "Link building"]
    },
    {
      icon: FileText,
      title: "Social Media Template",
      description: "Organize time by platform, content type, and campaign objectives.",
      category: "Social",
      downloads: 1563,
      rating: 4.7,
      features: ["Platform tracking", "Content types", "Campaign objectives", "Engagement metrics"]
    },
    {
      icon: BarChart3,
      title: "Client Retainer Template",
      description: "Track time against client retainers with automatic budget alerts.",
      category: "Billing",
      downloads: 2101,
      rating: 4.9,
      features: ["Retainer tracking", "Budget alerts", "Client reporting", "Invoice generation"]
    },
    {
      icon: Settings,
      title: "Agency Operations Template",
      description: "Complete workflow for agency teams managing multiple clients and projects.",
      category: "Operations",
      downloads: 756,
      rating: 4.8,
      features: ["Client management", "Project tracking", "Team collaboration", "Resource allocation"]
    },
    {
      icon: Zap,
      title: "Freelancer Template",
      description: "Simple, efficient time tracking for individual marketing consultants.",
      category: "Freelance",
      downloads: 1892,
      rating: 4.9,
      features: ["Project tracking", "Client billing", "Time categorization", "Invoice templates"]
    }
  ]

  const categories = ["All", "Campaign", "SEO", "Social", "Billing", "Operations", "Freelance"]

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 dark:from-[#0B1220] dark:to-gray-950">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-600 border-blue-200">
            Ready-to-Use Templates
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Marketing Time Tracking Templates
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Hit the ground running with pre-configured templates designed specifically for 
            digital marketing teams. No setup required.
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

      {/* Templates Grid */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose Your Template
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Each template comes with pre-configured categories, projects, and workflows
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template, index) => {
              const Icon = template.icon
              return (
                <Card key={index} className="border-blue-200/20 hover:border-blue-300 transition-colors hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <Badge variant="secondary">
                        {template.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <CardDescription>
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          {template.downloads.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          {template.rating}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Includes:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {template.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Button className="w-full" variant="outline">
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
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
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Choose your template and start tracking time like a professional marketer in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Get Custom Template
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
