import { log } from '@/lib/logger';
import { requirePlan } from '@/lib/auth/plan'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getActiveTeam } from '@/lib/auth/team'

interface ServiceMargin {
  channel: string
  category: string
  total_hours: number
  billable_hours: number
  total_revenue: number
  average_hourly_rate: number
  effective_rate: number // Revenue / Total Hours
  margin_percentage: number // (Revenue - Cost) / Revenue
  utilization_rate: number // Billable / Total Hours
  entries_count: number
  clients_served: number
  trend: 'up' | 'down' | 'stable'
  trend_percentage: number
}

interface MarginSummary {
  best_margin_service: string
  worst_margin_service: string
  highest_volume_service: string
  highest_revenue_service: string
  average_margin: number
  average_effective_rate: number
  total_revenue: number
  total_hours: number
}

// Industry standard cost assumptions (can be customized later)
const COST_PER_HOUR = 60 // Base cost per hour for agency operations

export async function GET(request: NextRequest) {
  const gate = await requirePlan('pro')
  if (!gate.ok) return gate.response

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const teamContext = await getActiveTeam(request)
    if (!teamContext.ok) return teamContext.response
    const { teamId } = teamContext

    // Get date ranges for comparison
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Fetch time entries for the last 60 days
    const { data: timeEntries, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .gte('start_time', sixtyDaysAgo.toISOString())
      .order('start_time', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 })
    }

    // Group entries by marketing channel
    const channelMap = new Map<string, {
      category: string
      entries: any[]
      previousEntries: any[]
    }>()

    for (const entry of timeEntries || []) {
      const channel = entry.marketing_channel || 'Unspecified'
      const category = entry.marketing_category || 'Other'
      const entryDate = new Date(entry.start_time)
      
      if (!channelMap.has(channel)) {
        channelMap.set(channel, {
          category,
          entries: [],
          previousEntries: []
        })
      }
      
      const channelData = channelMap.get(channel)!
      if (entryDate >= thirtyDaysAgo) {
        channelData.entries.push(entry)
      } else {
        channelData.previousEntries.push(entry)
      }
    }

    // Calculate margins for each channel
    const serviceMargins: ServiceMargin[] = []
    let totalRevenue = 0
    let totalHours = 0
    let totalMargin = 0

    for (const [channel, data] of channelMap.entries()) {
      const { category, entries, previousEntries } = data
      
      // Current period calculations
      const totalMinutes = entries.reduce((sum, e) => sum + (e.duration || 0), 0)
      const billableMinutes = entries.filter(e => e.billable).reduce((sum, e) => sum + (e.duration || 0), 0)
      const revenue = entries.reduce((sum, e) => sum + (e.amount || 0), 0) / 100
      const hours = totalMinutes / 60
      const billableHours = billableMinutes / 60
      
      // Previous period calculations for trend
      const prevRevenue = previousEntries.reduce((sum, e) => sum + (e.amount || 0), 0) / 100
      
      // Get unique client count
      const uniqueClients = new Set(entries.map(e => e.client_id)).size
      
      // Calculate rates and margins
      const avgHourlyRate = billableHours > 0 ? revenue / billableHours : 0
      const effectiveRate = hours > 0 ? revenue / hours : 0
      const cost = hours * COST_PER_HOUR
      const margin = revenue - cost
      const marginPercentage = revenue > 0 ? (margin / revenue) * 100 : 0
      const utilizationRate = hours > 0 ? (billableHours / hours) * 100 : 0
      
      // Calculate trend
      let trend: 'up' | 'down' | 'stable' = 'stable'
      let trendPercentage = 0
      if (prevRevenue > 0) {
        trendPercentage = ((revenue - prevRevenue) / prevRevenue) * 100
        if (trendPercentage > 5) trend = 'up'
        else if (trendPercentage < -5) trend = 'down'
      } else if (revenue > 0) {
        trend = 'up'
        trendPercentage = 100
      }
      
      serviceMargins.push({
        channel,
        category,
        total_hours: Math.round(hours * 10) / 10,
        billable_hours: Math.round(billableHours * 10) / 10,
        total_revenue: Math.round(revenue * 100) / 100,
        average_hourly_rate: Math.round(avgHourlyRate * 100) / 100,
        effective_rate: Math.round(effectiveRate * 100) / 100,
        margin_percentage: Math.round(marginPercentage * 10) / 10,
        utilization_rate: Math.round(utilizationRate),
        entries_count: entries.length,
        clients_served: uniqueClients,
        trend,
        trend_percentage: Math.round(trendPercentage)
      })
      
      totalRevenue += revenue
      totalHours += hours
      if (revenue > 0) {
        totalMargin += marginPercentage
      }
    }

    // Sort by revenue (highest first)
    serviceMargins.sort((a, b) => b.total_revenue - a.total_revenue)

    // Calculate summary statistics
    const nonZeroMargins = serviceMargins.filter(s => s.total_revenue > 0)
    const summary: MarginSummary = {
      best_margin_service: nonZeroMargins.length > 0 
        ? nonZeroMargins.reduce((best, s) => 
            s.margin_percentage > best.margin_percentage ? s : best
          ).channel
        : 'N/A',
      worst_margin_service: nonZeroMargins.length > 0
        ? nonZeroMargins.reduce((worst, s) => 
            s.margin_percentage < worst.margin_percentage ? s : worst
          ).channel
        : 'N/A',
      highest_volume_service: serviceMargins.length > 0
        ? serviceMargins.reduce((highest, s) => 
            s.total_hours > highest.total_hours ? s : highest
          ).channel
        : 'N/A',
      highest_revenue_service: serviceMargins.length > 0
        ? serviceMargins.reduce((highest, s) => 
            s.total_revenue > highest.total_revenue ? s : highest
          ).channel
        : 'N/A',
      average_margin: nonZeroMargins.length > 0
        ? Math.round(totalMargin / nonZeroMargins.length * 10) / 10
        : 0,
      average_effective_rate: totalHours > 0
        ? Math.round((totalRevenue / totalHours) * 100) / 100
        : 0,
      total_revenue: Math.round(totalRevenue * 100) / 100,
      total_hours: Math.round(totalHours * 10) / 10
    }

    return NextResponse.json({
      services: serviceMargins,
      summary,
      period: {
        start: thirtyDaysAgo.toISOString(),
        end: now.toISOString()
      }
    })
  } catch (error) {
    log.error('Service margin calculation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
