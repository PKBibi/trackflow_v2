import { createClient as createServerSupabase } from '@/lib/supabase/server'

export type Plan = 'free' | 'pro' | 'enterprise'

const order: Record<Plan, number> = { free: 0, pro: 1, enterprise: 2 }

function meetsPlan(userPlan: Plan, minPlan: Plan) {
  return order[userPlan] >= order[minPlan]
}

export async function requireUserWithPlan(minPlan: Plan) {
  const supabase = await createServerSupabase()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return { status: 401 as const, error: 'Not authenticated' }
  }
  // Read plan from user metadata (fallback to free)
  const plan = ((user.user_metadata?.plan || user.app_metadata?.plan || 'free') as Plan)
  if (!meetsPlan(plan, minPlan)) {
    return { status: 403 as const, error: `Requires ${minPlan} plan`, user, plan }
  }
  return { status: 200 as const, user, plan, supabase }
}

export async function getRecentEntriesForUser(supabase: Awaited<ReturnType<typeof createServerSupabase>>, days = 30) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from('time_entries')
    .select('start_time,duration,billable,hourly_rate,marketing_channel,marketing_category,task_title,client_id,project_id')
    .eq('user_id', user.id)
    .gte('start_time', since)
    .order('start_time', { ascending: false })
  return data || []
}

