import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' as any })

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    // Try to get customer from user metadata, else search by email
    const admin = createAdminClient()
    let customerId = (user.user_metadata as any)?.stripe_customer_id as string | undefined
    if (!customerId && user.email) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 })
      customerId = customers.data[0]?.id
      if (customerId) {
        await admin.auth.admin.updateUserById(user.id, { user_metadata: { stripe_customer_id: customerId } })
      }
    }
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId!,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/billing`,
    })
    return NextResponse.json({ url: portal.url })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Stripe error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Use POST' }, { status: 405 })
}

