import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import Stripe from 'stripe'

// Stripe webhook handler with signature verification
// Validates webhook signatures to ensure requests come from Stripe
export async function POST(req: NextRequest) {
  try {
    const sig = headers().get('stripe-signature')
    const secret = process.env.STRIPE_WEBHOOK_SECRET
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    // Validate environment variables
    if (!secret) {
      logger?.error?.('stripe_webhook_missing_secret', {
        message: 'STRIPE_WEBHOOK_SECRET not configured'
      })
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    if (!sig) {
      logger?.warn?.('stripe_webhook_missing_signature', {
        message: 'Missing stripe-signature header'
      })
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    if (!stripeSecretKey) {
      logger?.error?.('stripe_webhook_missing_api_key', {
        message: 'STRIPE_SECRET_KEY not configured'
      })
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    // Verify webhook signature
    let event: Stripe.Event
    try {
      const body = await req.text()
      event = stripe.webhooks.constructEvent(body, sig, secret)

      logger?.info?.('stripe_webhook_verified', {
        eventType: event.type,
        eventId: event.id
      })
    } catch (err: any) {
      logger?.error?.('stripe_webhook_verification_failed', {
        error: err.message
      })
      return NextResponse.json({
        error: 'Webhook signature verification failed'
      }, { status: 400 })
    }

    const eventType = event.type
    const json = event

    const supabase = await createClient()

    const subscription = json.data.object as Stripe.Subscription
    const userId = subscription?.metadata?.team_id || subscription?.metadata?.user_id

    if (!userId) {
      logger?.warn?.('stripe_webhook_missing_user', {
        eventType,
        subscriptionId: subscription.id,
        customerId: subscription.customer
      })
      return NextResponse.json({ received: true })
    }

    let plan: string | null = null
    let status: string | null = null
    switch (eventType) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        plan = subscription?.items?.data?.[0]?.price?.nickname || subscription?.items?.data?.[0]?.price?.id || 'pro'
        status = subscription?.status || 'active'
        break
      case 'invoice.payment_succeeded':
        status = 'active'
        break
      case 'invoice.payment_failed':
      case 'customer.subscription.paused':
        status = 'past_due'
        break
      case 'customer.subscription.deleted':
        status = 'canceled'
        plan = 'free'
        break
      default:
        return NextResponse.json({ received: true })
    }

    const updates: Record<string, any> = {}
    if (plan) updates.plan = plan
    if (status) updates.plan_status = status

    const { error } = await supabase
      .from('team_preferences')
      .upsert({ team_id: userId, ...updates }, { onConflict: 'team_id' })

    if (error) {
      logger?.error?.('stripe_webhook_upsert_error', {
        error: error.message,
        userId,
        eventType
      })
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    logger?.info?.('stripe_webhook_processed', {
      eventType,
      userId,
      updates
    })

    return NextResponse.json({ received: true })
  } catch (err: any) {
    logger?.error?.('stripe_webhook_unhandled_error', {
      message: err?.message,
      stack: err?.stack
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

