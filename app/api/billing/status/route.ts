import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' as any })

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ plan: 'free', authenticated: false })

    // Check if Stripe is properly configured
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey || stripeKey === 'your_stripe_secret_key') {
      // Return mock data for local development when Stripe is not configured
      return NextResponse.json({ 
        plan: 'free', 
        subscription: null, 
        prices: [
          { id: 'price_mock_pro', nickname: 'Pro Plan', unitAmount: 2900, interval: 'month' },
          { id: 'price_mock_enterprise', nickname: 'Enterprise Plan', unitAmount: 4900, interval: 'month' }
        ], 
        authenticated: true 
      })
    }

    // Determine plan via existing plan endpoint logic would be ideal, but inline for simplicity
    let plan = (user.user_metadata?.plan || user.app_metadata?.plan || '') as string
    const pricePro = process.env.STRIPE_PRICE_ID_PROFESSIONAL
    const priceEnt = process.env.STRIPE_PRICE_ID_ENTERPRISE
    const metaPrice = (user.user_metadata?.stripe_price_id || user.app_metadata?.stripe_price_id || '') as string
    if (!plan && metaPrice) {
      if (priceEnt && metaPrice === priceEnt) plan = 'enterprise'
      else if (pricePro && metaPrice === pricePro) plan = 'pro'
    }
    if (!plan) plan = 'free'

    // Fetch customer by stored id or by email
    let customerId = (user.user_metadata as any)?.stripe_customer_id as string | undefined
    if (!customerId && user.email) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 })
      customerId = customers.data[0]?.id
    }

    let subscription: any = null
    if (customerId) {
      const subs = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 1 })
      const sub = subs.data[0]
      if (sub) {
        subscription = {
          id: sub.id,
          status: sub.status,
          currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
          priceId: sub.items?.data?.[0]?.price?.id,
          nickname: sub.items?.data?.[0]?.price?.nickname,
          unitAmount: sub.items?.data?.[0]?.price?.unit_amount,
          interval: sub.items?.data?.[0]?.price?.recurring?.interval
        }
      }
    }

    // Available prices (from env if set; else list active recurring prices)
    let prices: any[] = []
    if (pricePro || priceEnt) {
      const ids = [pricePro, priceEnt].filter(Boolean) as string[]
      const fetched = await Promise.all(ids.map(id => stripe.prices.retrieve(id)))
      prices = fetched.map(p => ({ id: p.id, nickname: p.nickname, unitAmount: p.unit_amount, interval: p.recurring?.interval }))
    } else {
      const list = await stripe.prices.list({ active: true, type: 'recurring', limit: 10 })
      prices = list.data.map(p => ({ id: p.id, nickname: p.nickname, unitAmount: p.unit_amount, interval: p.recurring?.interval }))
    }

    return NextResponse.json({ plan, subscription, prices, authenticated: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Billing status error' }, { status: 500 })
  }
}

