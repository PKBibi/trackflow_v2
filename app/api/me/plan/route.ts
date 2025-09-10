import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ plan: 'free', authenticated: false })

  // 1) Direct metadata plan if present
  let plan = (user.user_metadata?.plan || user.app_metadata?.plan || '') as string

  // 2) Stripe price mapping from metadata if available
  const pricePro = process.env.STRIPE_PRICE_ID_PROFESSIONAL
  const priceEnt = process.env.STRIPE_PRICE_ID_ENTERPRISE
  const metaPrice = (user.user_metadata?.stripe_price_id || user.app_metadata?.stripe_price_id || '') as string
  if (!plan && metaPrice) {
    if (priceEnt && metaPrice === priceEnt) plan = 'enterprise'
    else if (pricePro && metaPrice === pricePro) plan = 'pro'
  }

  // 3) Tier metadata shortcut
  const tier = (user.user_metadata?.stripe_tier || user.app_metadata?.stripe_tier || '') as string
  if (!plan && tier) {
    if (tier.toLowerCase().includes('enterprise')) plan = 'enterprise'
    else if (tier.toLowerCase().includes('pro')) plan = 'pro'
  }

  if (!plan) plan = 'free'
  return NextResponse.json({ plan, authenticated: true })
}
