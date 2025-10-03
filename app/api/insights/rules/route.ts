import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getActiveTeam } from '@/lib/auth/team'

export async function GET(req: NextRequest) {
  const teamCtx = await getActiveTeam(req)
  if (!teamCtx.ok) return teamCtx.response

  const { user, teamId } = teamCtx
  const supabase = await createClient()

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data, error: e2 } = await supabase
    .from('time_entries')
    .select('start_time,duration,billable,amount,hourly_rate,marketing_channel,marketing_category,client_id,project_id')
    .eq('user_id', user.id)
    .eq('team_id', teamId)
    .gte('start_time', since)

  if (e2) {
    return NextResponse.json({ insights: [], phase: 'rule-based', total_insights: 0, generated_at: new Date().toISOString() })
  }
  const entries = data || []

  // Compute simple rule-based insights
  const byHour: Record<string, { count: number, totalMin: number }> = {}
  const byChannel: Record<string, { totalAmt: number, totalMin: number, count: number }> = {}
  const byDay: Record<number, { count: number, totalMin: number }> = {}
  let billableMin = 0, totalMin = 0
  for (const e of entries) {
    const d = e.duration || 0
    totalMin += d
    if (e.billable) billableMin += d
    const hour = e.start_time ? new Date(e.start_time).getHours() : 0
    byHour[hour] = byHour[hour] || { count: 0, totalMin: 0 }
    byHour[hour].count += 1
    byHour[hour].totalMin += d
    const ch = e.marketing_channel || 'unknown'
    byChannel[ch] = byChannel[ch] || { totalAmt: 0, totalMin: 0, count: 0 }
    byChannel[ch].totalAmt += e.amount || 0
    byChannel[ch].totalMin += d
    byChannel[ch].count += 1
    const day = e.start_time ? new Date(e.start_time).getDay() : 0
    byDay[day] = byDay[day] || { count: 0, totalMin: 0 }
    byDay[day].count += 1
    byDay[day].totalMin += d
  }

  const bestHour = Object.entries(byHour).sort((a,b)=> b[1].totalMin - a[1].totalMin)[0]
  const bestChannel = Object.entries(byChannel).sort((a,b)=> b[1].totalAmt - a[1].totalAmt)[0]
  const bestDay = Object.entries(byDay).sort((a,b)=> b[1].totalMin - a[1].totalMin)[0]
  const billableRate = totalMin > 0 ? Math.round((billableMin / totalMin) * 100) : 0
  const avgDuration = entries.length > 0 ? Math.round(totalMin / entries.length) : 0
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const insights: any[] = []
  if (bestHour) {
    insights.push({
      type: 'productivity',
      title: `You're most productive at ${String(bestHour[0]).padStart(2,'0')}:00`,
      description: `You log the most minutes during this hour over last 30 days`,
      confidence: 0.8,
      icon: 'clock',
      category: 'productivity',
      priority: 'medium'
    })
  }
  if (bestChannel) {
    insights.push({
      type: 'revenue',
      title: `${bestChannel[0]} drives the most revenue`,
      description: `Highest total billed amount among channels over last 30 days`,
      confidence: 0.75,
      icon: 'bar-chart-3',
      category: 'revenue',
      priority: 'high'
    })
  }
  if (bestDay) {
    insights.push({
      type: 'productivity',
      title: `${dayNames[Number(bestDay[0])]} is your focus day`,
      description: `You log the most minutes on ${dayNames[Number(bestDay[0])]} compared to the rest of the week.`,
      confidence: 0.7,
      icon: 'calendar',
      category: 'productivity',
      priority: 'medium'
    })
  }
  insights.push({
    type: 'summary',
    title: `Billable ratio: ${billableRate}%`,
    description: `Aim for > 75% for strong margin.`,
    confidence: 0.7,
    icon: 'trending-up',
    category: 'revenue',
    priority: 'medium'
  })
  if (avgDuration > 0) {
    insights.push({
      type: 'summary',
      title: `Average session length: ${avgDuration} min`,
      description: `Short sessions? Batch work into ≥45 minute blocks to reduce context switching.`,
      confidence: 0.6,
      icon: 'clock',
      category: 'productivity',
      priority: 'low'
    })
  }
  if (billableRate > 0 && billableRate < 60) {
    insights.push({
      type: 'warning',
      title: `Billable time below target`,
      description: `Only ${billableRate}% of the last 30 days were billable. Review non-billable work or adjust retainers.`,
      confidence: 0.6,
      icon: 'alert-triangle',
      category: 'revenue',
      priority: 'high'
    })
  }

  return NextResponse.json({ insights, phase: 'rule-based', total_insights: insights.length, generated_at: new Date().toISOString() })
}
