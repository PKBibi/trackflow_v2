import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { log } from '@/lib/logger'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' as any })

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!sig || !whSecret) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  const payload = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, sig, whSecret)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 })
  }

  const admin = createAdminClient()

  const pricePro = process.env.STRIPE_PRICE_ID_PROFESSIONAL
  const priceEnt = process.env.STRIPE_PRICE_ID_ENTERPRISE

  const mapPriceToPlan = (priceId?: string) => {
    if (!priceId) return 'free'
    if (priceEnt && priceId === priceEnt) return 'enterprise'
    if (pricePro && priceId === pricePro) return 'pro'
    return 'free'
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = (session.client_reference_id as string) || (session.metadata?.user_id as string)
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        const subscription = subscriptionId ? await stripe.subscriptions.retrieve(subscriptionId) : null
        const priceId = subscription?.items?.data?.[0]?.price?.id
        const plan = mapPriceToPlan(priceId || (session.metadata?.plan as string))
        if (userId) {
          await admin.auth.admin.updateUserById(userId, { user_metadata: { stripe_customer_id: customerId, stripe_price_id: priceId, plan } })
        }
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const sub = event.data.object as Stripe.Subscription
        const priceId = sub.items?.data?.[0]?.price?.id
        const plan = mapPriceToPlan(priceId)
        // Use metadata.user_id if present
        const userId = (sub.metadata as any)?.user_id as string | undefined
        if (userId) {
          await admin.auth.admin.updateUserById(userId, { user_metadata: { stripe_price_id: priceId, plan } })
        }
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = (sub.metadata as any)?.user_id as string | undefined
        if (userId) {
          await admin.auth.admin.updateUserById(userId, { user_metadata: { stripe_price_id: null, plan: 'free' } as any })
        }
        break
      }
      default:
        break
    }
  } catch (e) {
    log.apiError('webhooks/stripe', e, { eventType: event?.type });
  }

  return NextResponse.json({ received: true })
}

export async function GET() {
  return NextResponse.json({ status: 'ok' })
}

