import { NextRequest, NextResponse } from 'next/server'
import { requireUserWithPlan, getRecentEntriesForUser } from '@/lib/ai/access'
import { callOpenAIJSON } from '@/lib/ai/openai'

export async function POST(req: NextRequest) {
  const gate = await requireUserWithPlan('pro')
  if (gate.status !== 200) return NextResponse.json({ error: gate.error }, { status: gate.status })

  let body: { channelId?: string, title?: string, description?: string } = {}
  try { body = await req.json() } catch {}
  const { channelId, title = '', description = '' } = body
  if (!channelId) return NextResponse.json({ error: 'channelId required' }, { status: 400 })

  // Simple stats from history
  const entries = await getRecentEntriesForUser(gate.supabase!, 90)
  const byChannel = entries.filter((e: any) => e.marketing_channel === channelId && (e.duration || 0) > 0)
  const durations = byChannel.map((e: any) => e.duration as number).sort((a, b) => a - b)
  const avg = durations.length ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length) : 45
  const median = durations.length ? durations[Math.floor(durations.length / 2)] : avg
  const baseEstimate = Math.round((avg * 0.5 + median * 0.5) || 45)

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ predictedMinutes: baseEstimate, confidence: 0.5, rationale: 'Fallback: avg/median of historical entries.' })
  }

  const messages = [
    { role: 'system', content: 'You estimate task durations for marketing work from history and give JSON only.' },
    { role: 'user', content: `History durations (minutes) for ${channelId}: ${JSON.stringify(durations.slice(0, 200))}.\nTask: ${title}\nDesc: ${description}\nReturn: { predictedMinutes, confidence (0..1), rationale }` }
  ]
  try {
    const parsed = await callOpenAIJSON(messages, { maxTokens: 300 })
    if (!parsed.predictedMinutes) parsed.predictedMinutes = baseEstimate
    return NextResponse.json(parsed)
  } catch (e: any) {
    return NextResponse.json({ predictedMinutes: baseEstimate, confidence: 0.5, rationale: 'AI error; using historical baseline.' })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Use POST' }, { status: 405 })
}

