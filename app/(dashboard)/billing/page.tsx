'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Check, Zap } from 'lucide-react'

export default function BillingPage() {
  const [plan, setPlan] = useState<'free'|'pro'|'enterprise'>('free')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<any | null>(null)

  useEffect(() => {
    fetch('/api/me/plan').then(r=>r.json()).then(d=>setPlan(d.plan||'free')).catch(()=>{})
    fetch('/api/billing/status').then(r=>r.json()).then(setStatus).catch(()=>{})
  }, [])

  const startCheckout = async (target: 'pro'|'enterprise') => {
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

  const openPortal = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/create-portal-session', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally { setLoading(false) }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your plan and payment details</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your active subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{plan.toUpperCase()}</Badge>
            {plan === 'free' && <span className="text-sm text-muted-foreground">Upgrade to unlock AI features</span>}
            {plan !== 'free' && <span className="text-sm text-green-600 flex items-center gap-1"><Check className="w-4 h-4"/> AI features enabled</span>}
          </div>
          {status?.subscription && (
            <div className="mt-2 text-sm text-muted-foreground">
              <div>Status: {status.subscription.status}</div>
              {status.subscription.nickname && (
                <div>Price: {status.subscription.nickname} ({(status.subscription.unitAmount/100).toFixed(2)} / {status.subscription.interval})</div>
              )}
              {status.subscription.currentPeriodEnd && (
                <div>Renews: {new Date(status.subscription.currentPeriodEnd).toLocaleDateString()}</div>
              )}
            </div>
          )}
          {plan !== 'free' && (
            <Button className="mt-4" variant="outline" onClick={openPortal} disabled={loading}>
              <CreditCard className="w-4 h-4 mr-2" /> Manage Subscription
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className={plan==='pro' ? 'border-2 border-primary' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Pro <Zap className="w-4 h-4 text-amber-500"/></CardTitle>
            <CardDescription>AI insights, suggestions, and estimates</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 text-sm text-muted-foreground mb-4">
              <li>AI Insights (per-user)</li>
              <li>AI time-entry suggestions</li>
              <li>AI duration estimates</li>
              <li>Weekly AI report</li>
            </ul>
            <Button onClick={() => startCheckout('pro')} disabled={loading || plan==='pro' || plan==='enterprise'}>
              {plan==='pro' ? 'Current Plan' : 'Upgrade to Pro'}
            </Button>
          </CardContent>
        </Card>

        <Card className={plan==='enterprise' ? 'border-2 border-primary' : ''}>
          <CardHeader>
            <CardTitle>Enterprise</CardTitle>
            <CardDescription>All Pro features + priority support</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 text-sm text-muted-foreground mb-4">
              <li>Everything in Pro</li>
              <li>Priority support</li>
              <li>Higher limits</li>
            </ul>
            <Button onClick={() => startCheckout('enterprise')} disabled={loading || plan==='enterprise'}>
              {plan==='enterprise' ? 'Current Plan' : 'Upgrade to Enterprise'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
