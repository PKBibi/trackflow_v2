'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, ChevronRight, Zap } from 'lucide-react'
import Link from 'next/link'
import { trackEvent } from '@/components/analytics'

// Client component - no revalidate needed
// export const revalidate = 86400

type Price = { id: string; nickname?: string | null; unitAmount?: number | null; interval?: string | null }

export default function SimplePricingPage() {
  const [plan, setPlan] = useState<'free'|'pro'|'enterprise'>('free')
  const [auth, setAuth] = useState(false)
  const [loading, setLoading] = useState(false)
  const [prices, setPrices] = useState<Price[]>([])
  const [variant, setVariant] = useState<'A'|'B'|'C'>('A')

  useEffect(() => {
    fetch('/api/me/plan').then(r=>r.json()).then(d=>{ setPlan(d.plan||'free'); setAuth(!!d.authenticated) }).catch(()=>{})
    fetch('/api/billing/status').then(r=>r.json()).then(d=>{ if (Array.isArray(d.prices)) setPrices(d.prices) }).catch(()=>{})
    // Simple A/B variant: query param ?exp=B overrides; else localStorage bucket
    try {
      const url = new URL(window.location.href)
      const qp = (url.searchParams.get('exp') || '').toUpperCase()
      if (qp === 'A' || qp === 'B' || qp === 'C') {
        setVariant(qp as 'A'|'B'|'C')
        localStorage.setItem('pricing_simple_variant', qp)
      } else {
        const stored = localStorage.getItem('pricing_simple_variant') as 'A'|'B'|'C' | null
        if (stored === 'A' || stored === 'B' || stored === 'C') setVariant(stored)
        else {
          const r = Math.random();
          const assigned = r < 1/3 ? 'A' : (r < 2/3 ? 'B' : 'C')
          localStorage.setItem('pricing_simple_variant', assigned)
          setVariant(assigned)
        }
      }
    } catch {}
    try { trackEvent.experiment('pricing_simple', variant, 'view') } catch {}
  }, [variant])

  const [proPrice, entPrice] = useMemo(() => {
    if (!prices || prices.length === 0) return [null, null]
    // Heuristics: try to map by nickname; else by amount ascending
    const byNickPro = prices.find(p => (p.nickname||'').toLowerCase().includes('pro')) || null
    const byNickEnt = prices.find(p => (p.nickname||'').toLowerCase().includes('ent')) || null
    if (byNickPro || byNickEnt) {
      return [byNickPro, byNickEnt]
    }
    const sorted = [...prices].sort((a,b)=> (a.unitAmount||0) - (b.unitAmount||0))
    return [sorted[0] || null, sorted[1] || null]
  }, [prices]) as any

  const startCheckout = async (target: 'pro'|'enterprise') => {
    try { trackEvent.experiment('pricing_simple', variant, 'cta') } catch {}
    setLoading(true)
    try {
      const res = await fetch('/api/billing/create-checkout-session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: target })
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(false)
    }
  }

  const PriceText = ({ p }:{ p: Price|null }) => (
    <div className="mt-1 text-3xl font-bold">
      {p?.unitAmount ? <>${(p.unitAmount/100).toFixed(0)}<span className="text-sm text-muted-foreground">/{p.interval || 'mo'}</span></> : '—'}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <main className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Breadcrumb JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://track-flow.app/' },
                { '@type': 'ListItem', position: 2, name: 'Pricing', item: 'https://track-flow.app/pricing' },
                { '@type': 'ListItem', position: 3, name: 'Simple Pricing', item: 'https://track-flow.app/pricing/simple' }
              ]
            })
          }}
        />
        {typeof window !== 'undefined' && (new URLSearchParams(window.location.search).get('debug') === '1') && (
          <div className="text-xs text-muted-foreground text-right">Variant: {variant}</div>
        )}
        <div className="text-center mb-8">
          <Badge className="mb-3" variant={variant==='A' ? 'secondary' : 'default'}><Zap className="w-3 h-3 mr-1"/> AI Features</Badge>
          <h1 className="text-3xl font-bold mb-2">
            {variant==='A' ? 'Upgrade for AI‑Powered Productivity' : variant==='B' ? 'Work Smarter with Pro AI' : 'Save Hours Every Week with AI'}
          </h1>
          <p className="text-muted-foreground">
            {variant==='A' ? 'Unlock AI insights, time‑entry suggestions, estimates, and weekly client reports.' : variant==='B' ? 'Get insights, suggestions and automated summaries that save hours every week.' : 'Pro includes AI insights, smart suggestions, estimates, and weekly client summaries.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className={plan==='pro' ? 'border-2 border-primary' : ''}>
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>For freelancers and small teams</CardDescription>
              <PriceText p={proPrice} />
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2"><Check className="w-4 h-4 text-green-600 mt-0.5"/> AI Insights</div>
              <div className="flex items-start gap-2"><Check className="w-4 h-4 text-green-600 mt-0.5"/> AI time‑entry suggestions</div>
              <div className="flex items-start gap-2"><Check className="w-4 h-4 text-green-600 mt-0.5"/> AI duration estimates</div>
              <div className="flex items-start gap-2"><Check className="w-4 h-4 text-green-600 mt-0.5"/> Weekly AI report</div>
              <div className={variant==='A' ? 'pt-2' : 'pt-2 flex flex-col gap-2'}>
                {auth ? (
                  <>
                    <Button className="w-full" onClick={()=>startCheckout('pro')} disabled={loading || plan!=='free' && plan!=='enterprise'} variant={variant==='A' ? 'default' : 'outline'}>
                      {plan==='pro' ? 'Current Plan' : (variant==='A' ? 'Upgrade to Pro' : 'Get Pro Now')}
                      <ChevronRight className="w-4 h-4 ml-2"/>
                    </Button>
                    {(variant==='B' || variant==='C') && (
                      <Button className="w-full" variant="default" onClick={()=>window.location.href='/dashboard/billing'}>
                        Go to Billing
                        <ChevronRight className="w-4 h-4 ml-2"/>
                      </Button>
                    )}
                    {variant==='C' && (
                      <div className="text-xs text-muted-foreground text-center">14‑day trial. Cancel anytime.</div>
                    )}
                  </>
                ) : (
                  <>
                    <Link href="/signup"><Button className="w-full" variant={variant==='A' ? 'default' : 'outline'}>{variant==='A' ? 'Start Free Trial' : 'Start Your 14‑Day Trial'}<ChevronRight className="w-4 h-4 ml-2"/></Button></Link>
                    {variant==='C' && (
                      <div className="text-xs text-muted-foreground text-center mt-1">No credit card required</div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className={plan==='enterprise' ? 'border-2 border-primary' : ''}>
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <CardDescription>Advanced controls & support</CardDescription>
              <PriceText p={entPrice} />
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2"><Check className="w-4 h-4 text-green-600 mt-0.5"/> Everything in Pro</div>
              <div className="flex items-start gap-2"><Check className="w-4 h-4 text-green-600 mt-0.5"/> Higher limits, priority support</div>
              <div className="flex items-start gap-2"><Check className="w-4 h-4 text-green-600 mt-0.5"/> Team features & SSO</div>
              <div className="pt-2">
                {auth ? (
                  <Button className="w-full" onClick={()=>startCheckout('enterprise')} disabled={loading || plan==='enterprise'}>
                    {plan==='enterprise' ? 'Current Plan' : 'Upgrade to Enterprise'}
                    <ChevronRight className="w-4 h-4 ml-2"/>
                  </Button>
                ) : (
                  <Link href="/signup"><Button className="w-full" variant="outline">Start Free Trial<ChevronRight className="w-4 h-4 ml-2"/></Button></Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-10 text-sm text-muted-foreground">
          Prefer full details? <Link href="/pricing" className="underline">See the complete pricing page</Link>.
        </div>
      </main>
    </div>
  )
}
