import { NextRequest, NextResponse } from 'next/server'
import { requireUserWithPlan } from '@/lib/ai/access'
import { callOpenAIJSON } from '@/lib/ai/openai'
import { createClient as createServerSupabase } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const gate = await requireUserWithPlan('pro')
  if (gate.status !== 200) return NextResponse.json({ error: gate.error }, { status: gate.status })

  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  // Last 7 days, grouped by client
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('time_entries')
    .select('duration, amount, task_title, marketing_channel, client_id, start_time, clients:client_id(name)')
    .eq('user_id', user!.id)
    .gte('start_time', since)
    .order('start_time', { ascending: false })
  if (error) return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })

  const entries = data || []
  const byClient: Record<string, any> = {}
  entries.forEach((e: any) => {
    const name = e.clients?.name || 'Unknown Client'
    if (!byClient[name]) byClient[name] = { name, totalMinutes: 0, totalAmount: 0, items: [] as any[] }
    byClient[name].totalMinutes += e.duration || 0
    byClient[name].totalAmount += e.amount || 0
    byClient[name].items.push({ title: e.task_title, channel: e.marketing_channel, minutes: e.duration || 0 })
  })

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      period: 'last_7_days',
      clients: Object.values(byClient),
      summary: 'Configure OPENAI_API_KEY for narrative report. Fallback returns aggregates only.'
    })
  }

  const messages = [
    { role: 'system', content: 'Generate weekly client report with bullet highlights. Output JSON only.' },
    { role: 'user', content: `Data: ${JSON.stringify({ period: 'last_7_days', clients: Object.values(byClient) }).slice(0,12000)}\nReturn: { reports: [{ client, summary, highlights: string[], totals: { hours, amount } }], executiveSummary }` }
  ]
  try {
    const parsed = await callOpenAIJSON(messages, { maxTokens: 900 })
    return NextResponse.json(parsed)
  } catch (e: any) {
    return NextResponse.json({
      period: 'last_7_days',
      clients: Object.values(byClient),
      summary: 'AI error; returned aggregates only.'
    })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Use POST' }, { status: 405 })
}

