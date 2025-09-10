import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { IntegrationCard } from '@/components/integrations/integration-card'

export const metadata: Metadata = {
  title: 'Integrations - TrackFlow | Connect Your Marketing Tools',
  description: 'Integrate TrackFlow with Google Ads, Meta Business, Analytics, Slack, QuickBooks and more. Streamline your marketing workflow.',
  keywords: 'marketing integrations, google ads integration, meta business integration, slack integration, quickbooks integration',
  openGraph: {
    title: 'TrackFlow Integrations - Connect Your Marketing Stack',
    description: 'Seamlessly integrate with your favorite marketing and business tools.',
    images: ['/images/og-integrations.png'],
  },
  alternates: {
    canonical: 'https://track-flow.app/integrations',
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


  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4 border-b border-gray-100">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-600 text-white border-blue-600">
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
                  <IntegrationCard key={tool.name} tool={tool} />
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
            <a href="mailto:integrations@track-flow.app">
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
