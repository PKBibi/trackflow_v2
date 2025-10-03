import { createClient } from '@/lib/supabase/server'
import { rateLimitPerUser } from '@/lib/validation/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { requireUserWithPlan } from '@/lib/ai/access'
import { callOpenAIJSON } from '@/lib/ai/openai'

export async function POST(req: NextRequest) {
  await rateLimitPerUser()
  const gate = await requireUserWithPlan('pro')
  if (gate.status !== 200) return NextResponse.json({ error: gate.error }, { status: gate.status })

  let body: { text?: string } = {}
  try { body = await req.json() } catch {}
  const text = (body.text || '').trim()
  if (!text) return NextResponse.json({ error: 'Missing text' }, { status: 400 })

  if (!process.env.OPENAI_API_KEY) {
    // Simple heuristic fallback
    return NextResponse.json({
      channelId: 'strategy-planning',
      categoryId: 'strategy-analytics',
      suggestedTitle: text.slice(0, 60),
      billable: true,
      confidence: 0.3,
    })
  }

  const messages = [
    { role: 'system', content: 'Classify marketing time entry. Output strict JSON.' },
    { role: 'user', content: `Text: ${text}\nReturn JSON with: { channelId, categoryId, suggestedTitle, billable (boolean), confidence (0..1) }.\nUse these categories: content-seo, advertising-paid, social-community, web-tech, email-direct, strategy-analytics.\nUse channel ids consistent with those categories (e.g., google-ads, blog-writing, analytics-reporting, strategy-planning, etc.)` }
  ]

  try {
    const parsed = await callOpenAIJSON(messages, { maxTokens: 300 })
    return NextResponse.json(parsed)
  } catch (e: any) {
    return NextResponse.json({ error: 'AI parsing error', details: String(e) }, { status: 500 })
  }
}

export async function GET() {
  await rateLimitPerUser()
  return NextResponse.json({ error: 'Use POST' }, { status: 405 })
}



