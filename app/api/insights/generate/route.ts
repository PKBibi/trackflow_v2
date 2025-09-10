import { NextRequest, NextResponse } from 'next/server'
import { requireUserWithPlan, getRecentEntriesForUser } from '@/lib/ai/access'
import { callOpenAIJSON } from '@/lib/ai/openai'

type Insight = {
  type: 'productivity' | 'revenue' | 'warning' | 'deadline' | 'summary'
  title: string
  description: string
  action?: string
  confidence: number
  icon: string
  category: string
  priority?: 'high' | 'medium' | 'low'
}

type GenerateBody = {
  entries?: Array<{
    start_time?: string
    duration?: number // minutes
    billable?: boolean
    hourly_rate?: number
    marketing_channel?: string
    marketing_category?: string
    client_name?: string
    project_name?: string
    task_title?: string
  }>
}

export async function POST(req: NextRequest) {
  let payload: GenerateBody | undefined
  try { payload = await req.json().catch(() => undefined) } catch {}

  // Enforce plan: Pro or higher
  const gate = await requireUserWithPlan('pro')
  if (gate.status !== 200) {
    return NextResponse.json({ error: gate.error || 'Forbidden' }, { status: gate.status })
  }

  // Use OpenAI if configured; otherwise simple heuristics
  const hasOpenAI = !!process.env.OPENAI_API_KEY
  if (!hasOpenAI) {
    const now = new Date().toISOString()
    const entries = payload?.entries || await getRecentEntriesForUser(gate.supabase!, 30)
    const total = entries.length
    const billableRate = total
      ? Math.round((entries.filter(e => e.billable).length / total) * 100)
      : 0

    const insights: Insight[] = [
      {
        type: 'summary',
        title: 'AI fallback: configure OPENAI_API_KEY for richer insights',
        description: 'Displaying rule-of-thumb insights without AI due to missing API key.',
        confidence: 0.3,
        icon: 'zap',
        category: 'summary',
        priority: 'low',
      },
      {
        type: 'productivity',
        title: 'Consistent tracking improves accuracy',
        description: 'Log tasks as you work to reduce manual edits and boost reporting quality.',
        confidence: 0.7,
        icon: 'clock',
        category: 'productivity',
        priority: 'medium',
      },
      {
        type: 'revenue',
        title: `Billable mix: ${billableRate}%`,
        description: 'Aim for > 75% billable ratio for strong margins; adjust scope or rates if needed.',
        confidence: 0.6,
        icon: 'bar-chart-3',
        category: 'revenue',
        priority: 'medium',
      },
    ]

    return NextResponse.json({
      insights,
      phase: 'ai-fallback',
      total_insights: insights.length,
      generated_at: now,
    })
  }

  // With OpenAI key: compose a JSON-only request
  const now = new Date().toISOString()

  const prompt = `
You are a marketing operations analyst. Produce 5-8 concise, actionable insights from the provided time tracking data.
Return ONLY a JSON object with this schema:
{
  "insights": [
    {
      "type": "productivity|revenue|warning|deadline|summary",
      "title": string,
      "description": string,
      "confidence": number (0..1),
      "icon": "clock|trending-up|alert-triangle|calendar|bar-chart-3|zap",
      "category": string,
      "priority": "high|medium|low"
    }
  ]
}
Use marketing context (channels, billable mix, rates, durations). Prefer specific, non-generic recommendations.
`

  // Fetch entries server-side when no payload provided
  const serverEntries = payload?.entries && payload.entries.length > 0
    ? payload.entries
    : await getRecentEntriesForUser(gate.supabase!, 30)

  const messages = [
    { role: 'system', content: 'You analyze time tracking for digital marketing teams and output strict JSON.' },
    { role: 'user', content: `${prompt}\n\nDATA:\n${JSON.stringify({ entries: serverEntries }).slice(0, 12000)}` },
  ]

  try {
    const parsed = await callOpenAIJSON(messages, { maxTokens: 900 })
    const insights: Insight[] = Array.isArray(parsed.insights) ? parsed.insights : []
    return NextResponse.json({
      insights,
      phase: 'ai-generated',
      total_insights: insights.length,
      generated_at: now,
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'AI generation error', details: String(e) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Use POST' }, { status: 405 })
}
