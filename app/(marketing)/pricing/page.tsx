'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, X, ChevronRight, Shield, Clock, Users, FileText, BarChart3, Zap, Globe, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

const plans = [
  {
    name: 'Freelancer',
    price: { monthly: 15, annual: 12 },
    description: 'Perfect for independent marketers',
    microcopy: 'Best for solo professionals',
    recommended: false,
    features: {
      tracking: [
        { name: 'Channel & campaign-level tracking', included: true },
        { name: 'Privacy-first auto-detect', included: true },
        { name: 'Marketer templates', included: true },
        { name: 'CSV KPI import', included: true }
      ],
      collaboration: [
        { name: 'Unlimited clients', included: true },
        { name: 'Solo use', included: true },
        { name: 'Client access portal', included: false },
        { name: 'Team collaboration', included: false }
      ],
      reporting: [
        { name: 'Basic reports', included: true },
        { name: 'Export to CSV/PDF', included: true },
        { name: 'White-label reports', included: false },
        { name: 'Custom branding', included: false }
      ],
      governance: [
        { name: 'Time tracking limits', included: true },
        { name: 'Basic integrations', included: true },
        { name: 'API access', included: false },
        { name: 'SSO authentication', included: false }
      ]
    },
    cta: 'Start Free Trial',
    highlighted: false
  },
  {
    name: 'Agency Starter',
    price: { monthly: 29, annual: 23 },
    description: 'Growing marketing teams',
    microcopy: 'Best for 2-10 person teams',
    recommended: true,
    features: {
      tracking: [
        { name: 'Everything in Freelancer', included: true },
        { name: 'Retainer burndown tracking', included: true },
        { name: 'Team templates', included: true },
        { name: 'Bulk time entry import', included: true }
      ],
      collaboration: [
        { name: 'Up to 10 team members', included: true },
        { name: 'Client portal access', included: true },
        { name: 'Project collaboration', included: true },
        { name: 'Team activity feed', included: true }
      ],
      reporting: [
        { name: 'Retainer utilization reports', included: true },
        { name: 'Channel efficiency analytics', included: true },
        { name: 'White-label reports', included: true },
        { name: 'Scheduled reports', included: true }
      ],
      governance: [
        { name: 'Role-based permissions', included: true },
        { name: 'Budget alerts', included: true },
        { name: 'Advanced integrations', included: true },
        { name: 'Priority support', included: true }
      ]
    },
    cta: 'Start Free Trial',
    highlighted: true
  },
  {
    name: 'Agency Growth',
    price: { monthly: 49, annual: 39 },
    description: 'Scale your agency operations',
    microcopy: 'Best for 10+ person teams',
    recommended: false,
    features: {
      tracking: [
        { name: 'Everything in Agency Starter', included: true },
        { name: 'Custom tracking fields', included: true },
        { name: 'Capacity planning', included: true },
        { name: 'Benchmarks (opt-in)', included: true }
      ],
      collaboration: [
        { name: 'Unlimited team members', included: true },
        { name: 'Multiple workspaces', included: true },
        { name: 'Advanced permissions', included: true },
        { name: 'Guest collaborators', included: true }
      ],
      reporting: [
        { name: 'Custom report builder', included: true },
        { name: 'API access', included: true },
        { name: 'Custom integrations', included: true },
        { name: 'Executive dashboards', included: true }
      ],
      governance: [
        { name: 'SSO authentication', included: true },
        { name: 'Audit logs', included: true },
        { name: 'SLA guarantee', included: true },
        { name: 'Dedicated account manager', included: true }
      ]
    },
    cta: 'Start Free Trial',
    highlighted: false
  }
]

const featureCategories = ['tracking', 'collaboration', 'reporting', 'governance'] as const
const categoryLabels = {
  tracking: 'Tracking',
  collaboration: 'Collaboration',
  reporting: 'Reporting',
  governance: 'Governance'
}

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')
  const [plan, setPlan] = useState<'free'|'pro'|'enterprise'>('free')
  const [auth, setAuth] = useState(false)
  const [prices, setPrices] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/me/plan').then(r=>r.json()).then(d=>{ setPlan(d.plan||'free'); setAuth(!!d.authenticated) }).catch(()=>{})
    fetch('/api/billing/status').then(r=>r.json()).then(d=>{ if (Array.isArray(d.prices)) setPrices(d.prices) }).catch(()=>{})
  }, [])

  const startCheckout = async (target: 'pro'|'enterprise') => {
    try {
      const res = await fetch('/api/billing/create-checkout-session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: target })
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <main className="container mx-auto px-4 py-16">
        {/* Breadcrumb JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://track-flow.app/' },
                { '@type': 'ListItem', position: 2, name: 'Pricing', item: 'https://track-flow.app/pricing' }
              ]
            })
          }}
        />
        {/* Pricing Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="secondary">
            <Lock className="w-3 h-3 mr-1" />
            Privacy-first: no DOM scraping
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            Plans Built for Marketing Teams
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
            Track by client, channel and campaign—with privacy-first auto-detect and retainer burndown.
          </p>
          {prices.length > 0 && (
            <p className="text-sm text-muted-foreground mb-8">
              {(() => {
                const pro = prices.find((p:any)=> (p.nickname||'').toLowerCase().includes('pro')) || prices.sort((a:any,b:any)=> (a.unitAmount||0)-(b.unitAmount||0))[0]
                const ent = prices.find((p:any)=> (p.nickname||'').toLowerCase().includes('ent')) || prices.sort((a:any,b:any)=> (b.unitAmount||0)-(a.unitAmount||0))[0]
                const proText = pro?.unitAmount ? `$${(pro.unitAmount/100).toFixed(0)}/${pro?.recurring?.interval || 'mo'}` : ''
                const entText = ent?.unitAmount ? `$${(ent.unitAmount/100).toFixed(0)}/${ent?.recurring?.interval || 'mo'}` : ''
                return `Pro from ${proText}${entText ? ` • Enterprise from ${entText}` : ''}`
              })()}
            </p>
          )}
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-2">
            <Label htmlFor="billing" className={billingPeriod === 'monthly' ? 'font-medium' : 'text-muted-foreground'}>
              Monthly
            </Label>
            <Switch
              id="billing"
              checked={billingPeriod === 'annual'}
              onCheckedChange={(checked) => setBillingPeriod(checked ? 'annual' : 'monthly')}
            />
            <Label htmlFor="billing" className={billingPeriod === 'annual' ? 'font-medium' : 'text-muted-foreground'}>
              Annual
              <Badge variant="secondary" className="ml-2">Save 20%</Badge>
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            US pricing in $USD; tax/VAT excluded
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.highlighted ? 'border-[#2F6BFF] shadow-xl scale-105' : ''}`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-[#2F6BFF] text-white">
                    RECOMMENDED
                  </Badge>
                </div>
              )}
              
              <CardHeader className={plan.highlighted ? 'bg-[#2F6BFF]/10 dark:bg-[#2F6BFF]/20' : ''}>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    ${plan.price[billingPeriod]}
                  </span>
                  <span className="text-muted-foreground text-sm ml-2">
                    {plan.name === 'Freelancer' ? '/month' : '/user/month'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {plan.microcopy}
                </p>
              </CardHeader>
              
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {featureCategories.map((category) => (
                    <div key={category}>
                      <h4 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wide">
                        {categoryLabels[category]}
                      </h4>
                      <div className="space-y-2">
                        {plan.features[category].map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            {feature.included ? (
                              <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            ) : (
                              <X className="w-4 h-4 text-gray-300 dark:text-gray-600 mt-0.5 flex-shrink-0" />
                            )}
                            <span className={`text-sm ${feature.included ? '' : 'text-gray-400 dark:text-gray-500'}`}>
                              {feature.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={plan.highlighted ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => {
                    if (plan.name === 'Agency Starter') {
                      if (auth) startCheckout('pro'); else window.location.href = '/signup'
                    } else if (plan.name === 'Agency Growth') {
                      if (auth) startCheckout('enterprise'); else window.location.href = '/signup'
                    } else {
                      window.location.href = auth ? '/billing' : '/signup'
                    }
                  }}
                >
                  {plan.name === 'Freelancer' ? (auth ? 'Go to Billing' : 'Start Free Trial') : (auth ? `Upgrade to ${plan.name.includes('Growth') ? 'Enterprise' : 'Pro'}` : 'Start Free Trial')}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Trust Section */}
        <div className="text-center py-12 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            Built for US freelancers and agencies
          </p>
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">GDPR Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">99.9% Uptime</span>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto py-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="font-semibold mb-2">What's included in the free trial?</h3>
              <p className="text-muted-foreground">
                All plans include a 14-day free trial with full access to features. No credit card required.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">How does privacy-first auto-detect work?</h3>
              <p className="text-muted-foreground">
                We only read URL and page title—no DOM scraping, no screenshots, no keyloggers. Your client data stays private.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-muted-foreground">
                Yes! Upgrade or downgrade at any time. Changes take effect at your next billing cycle.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">What are marketer templates?</h3>
              <p className="text-muted-foreground">
                Pre-built tracking templates for common marketing activities: content creation, campaign management, client meetings, reporting, and more.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
