import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Integrations - TrackFlow | Connect Your Marketing Tools',
  description: 'Integrate TrackFlow with Google Ads, Meta Business, Analytics, Slack, QuickBooks and more. Streamline your marketing workflow.',
  keywords: 'marketing integrations, google ads integration, meta business integration, slack integration, quickbooks integration',
  openGraph: {
    title: 'TrackFlow Integrations - Connect Your Marketing Stack',
    description: 'Seamlessly integrate with your favorite marketing and business tools.',
    images: ['/og-integrations.png'],
  },
  alternates: {
    canonical: 'https://trackflow.app/integrations',
  },
}

export default function IntegrationsPage() {
  const integrations = [
    {
      category: "Advertising Platforms",
      description: "Track time directly from your ad platforms",
      tools: [
        { 
          name: "Google Ads", 
          status: "coming-soon", 
          description: "Auto-detect when you're optimizing campaigns",
          icon: "🔍"
        },
        { 
          name: "Meta Business", 
          status: "coming-soon", 
          description: "Track Facebook & Instagram ad management",
          icon: "📘"
        },
        { 
          name: "LinkedIn Ads", 
          status: "planned", 
          description: "B2B campaign time tracking",
          icon: "💼"
        },
        { 
          name: "TikTok Ads", 
          status: "planned", 
          description: "Track TikTok campaign management",
          icon: "🎵"
        },
      ]
    },
    {
      category: "Analytics & SEO",
      description: "Automatically categorize analytics and SEO work",
      tools: [
        { 
          name: "Google Analytics", 
          status: "coming-soon", 
          description: "Track reporting and analysis time",
          icon: "📊"
        },
        { 
          name: "Search Console", 
          status: "planned", 
          description: "SEO optimization tracking",
          icon: "🔎"
        },
        { 
          name: "SEMrush", 
          status: "planned", 
          description: "Competitive analysis time tracking",
          icon: "📈"
        },
        { 
          name: "Ahrefs", 
          status: "planned", 
          description: "Link building and research tracking",
          icon: "🔗"
        },
      ]
    },
    {
      category: "Project Management",
      description: "Sync with your project management tools",
      tools: [
        { 
          name: "Asana", 
          status: "planned", 
          description: "Two-way task synchronization",
          icon: "📋"
        },
        { 
          name: "Slack", 
          status: "coming-soon", 
          description: "Start timers from Slack messages",
          icon: "💬"
        },
        { 
          name: "Zapier", 
          status: "coming-soon", 
          description: "Connect with 5000+ apps",
          icon: "⚡"
        },
        { 
          name: "Monday.com", 
          status: "planned", 
          description: "Sync projects and time entries",
          icon: "📅"
        },
      ]
    },
    {
      category: "Invoicing & Payments",
      description: "Turn tracked time into invoices instantly",
      tools: [
        { 
          name: "QuickBooks", 
          status: "planned", 
          description: "Automatic invoice generation",
          icon: "💰"
        },
        { 
          name: "Stripe", 
          status: "available", 
          description: "Accept payments for tracked time",
          icon: "💳"
        },
        { 
          name: "Xero", 
          status: "planned", 
          description: "Sync time entries and invoices",
          icon: "📑"
        },
        { 
          name: "CSV Export", 
          status: "available", 
          description: "Export to any accounting software",
          icon: "📄"
        },
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Available</Badge>
      case 'coming-soon':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Coming Soon</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Planned</Badge>
    }
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4 border-b border-gray-100">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-600 border-blue-200">
            Integrations
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Connect Your Marketing Stack
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            TrackFlow integrates with the tools you already use. 
            Automatically track time across all your marketing platforms.
          </p>
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          {integrations.map((category) => (
            <div key={category.category} className="mb-16">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{category.category}</h2>
                <p className="text-gray-600">{category.description}</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {category.tools.map((tool) => (
                  <Card key={tool.name} className="relative p-6 hover:shadow-lg transition-shadow">
                    <div className="absolute top-4 right-4">
                      {getStatusBadge(tool.status)}
                    </div>
                    <div className="mb-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl mb-4">
                        {tool.icon}
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{tool.name}</h3>
                      <p className="text-sm text-gray-600">{tool.description}</p>
                    </div>
                    {tool.status === 'available' && (
                      <Button size="sm" className="w-full">
                        Configure
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Request Integration CTA */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Don't See Your Tool?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Let us know what integration you need and we'll prioritize it in our roadmap.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:integrations@trackflow.app">
              <Button size="lg" className="btn-primary">
                Request Integration
              </Button>
            </a>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Contact Sales
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Most requested integrations are built within 30 days
          </p>
        </div>
      </section>
    </div>
  )
}
