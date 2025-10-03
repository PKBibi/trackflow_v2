import { NextResponse } from 'next/server'

export type Plan = 'free' | 'pro' | 'business'

export async function requirePlan(minPlan: Plan, req?: Request | any) {
  // Use team-based plan via active team context
  const ctx = await (await import('./team')).getActiveTeam(req as any)
  if (!ctx.ok) return { ok: false as const, response: ctx.response }

  // Load plan from team_preferences; fallback to 'free' if missing
  const supabase = await (await import('@/lib/supabase/server')).createClient()
  const { data } = await supabase
    .from('team_preferences')
    .select('plan')
    .eq('team_id', ctx.teamId)
    .single()

  const plan = (data?.plan as Plan) || 'free'
  const rank: Record<Plan, number> = { free: 0, pro: 1, business: 2 }
  if (rank[plan] < rank[minPlan]) {
    return { ok: false as const, response: NextResponse.json({ error: 'Payment Required', plan }, { status: 402 }) }
  }
  return { ok: true as const, user: ctx.user, plan }
}

