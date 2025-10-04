import { log } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getActiveTeam } from '@/lib/auth/team'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

interface Alert {
  id: string
  type: 'utilization' | 'capacity' | 'pricing' | 'client_risk' | 'efficiency'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  value: number
  threshold: number
  suggestion: string
  channel?: string
  client_name?: string
  created_at: string
}

const THRESHOLDS = {
  MIN_UTILIZATION: 60, // Below 60% utilization is concerning
  MAX_WEEKLY_HOURS: 50, // Over 50 hours/week is over-capacity
  MIN_HOURLY_RATE: 75, // Below $75/hr may be under-priced
  MIN_MARGIN: 20, // Below 20% margin is concerning
  MAX_UNPAID_DAYS: 45, // Over 45 days unpaid is risky
  MIN_EFFICIENCY: 0.8 // Below 80% efficiency (contracted vs actual hours)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get team context
    const teamContext = await getActiveTeam(request)
    if (!teamContext.ok) return teamContext.response
    const { teamId } = teamContext

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Fetch time entries for analysis
    const { data: timeEntries, error: timeError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .gte('start_time', thirtyDaysAgo.toISOString())
      .order('start_time', { ascending: false })

    if (timeError) {
      return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 })
    }

    // Fetch clients for payment analysis
    const { data: clients } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .eq('team_id', teamId)

    const alerts: Alert[] = []
    let alertId = 1

    // 1. UTILIZATION ANALYSIS by channel
    const channelMap = new Map<string, {
      totalMinutes: number
      billableMinutes: number
      revenue: number
      entries: any[]
    }>()

    for (const entry of timeEntries || []) {
      const channel = entry.marketing_channel || 'Unspecified'
      if (!channelMap.has(channel)) {
        channelMap.set(channel, {
          totalMinutes: 0,
          billableMinutes: 0,
          revenue: 0,
          entries: []
        })
      }
      
      const data = channelMap.get(channel)!
      data.totalMinutes += entry.duration || 0
      if (entry.billable) {
        data.billableMinutes += entry.duration || 0
      }
      data.revenue += (entry.amount || 0) / 100
      data.entries.push(entry)
    }

    // Check utilization rates
    for (const [channel, data] of channelMap.entries()) {
      if (data.totalMinutes > 120) { // At least 2 hours to be meaningful
        const utilizationRate = (data.billableMinutes / data.totalMinutes) * 100
        
        if (utilizationRate < THRESHOLDS.MIN_UTILIZATION) {
          alerts.push({
            id: `util-${alertId++}`,
            type: 'utilization',
            severity: utilizationRate < 40 ? 'high' : 'medium',
            title: `Low Utilization: ${channel}`,
            description: `Only ${utilizationRate.toFixed(1)}% of time is billable`,
            value: utilizationRate,
            threshold: THRESHOLDS.MIN_UTILIZATION,
            suggestion: 'Focus on billable work or consider reducing time allocation',
            channel,
            created_at: now.toISOString()
          })
        }
      }
    }

    // 2. CAPACITY ANALYSIS - Weekly hours
    const weeklyHours = new Map<string, number>()
    const recentEntries = timeEntries?.filter(e => new Date(e.start_time) >= sevenDaysAgo) || []
    
    for (const entry of recentEntries) {
      const weekKey = new Date(entry.start_time).toISOString().split('T')[0].slice(0, 8) // YYYY-MM format
      weeklyHours.set(weekKey, (weeklyHours.get(weekKey) || 0) + (entry.duration || 0) / 60)
    }

    for (const [week, hours] of weeklyHours.entries()) {
      if (hours > THRESHOLDS.MAX_WEEKLY_HOURS) {
        alerts.push({
          id: `capacity-${alertId++}`,
          type: 'capacity',
          severity: hours > 60 ? 'critical' : 'high',
          title: 'Over-Capacity Warning',
          description: `Working ${hours.toFixed(1)} hours this week`,
          value: hours,
          threshold: THRESHOLDS.MAX_WEEKLY_HOURS,
          suggestion: 'Consider redistributing workload or hiring additional resources',
          created_at: now.toISOString()
        })
      }
    }

    // 3. PRICING ANALYSIS
    for (const [channel, data] of channelMap.entries()) {
      if (data.billableMinutes > 0) {
        const avgHourlyRate = (data.revenue / (data.billableMinutes / 60))
        
        if (avgHourlyRate < THRESHOLDS.MIN_HOURLY_RATE) {
          alerts.push({
            id: `pricing-${alertId++}`,
            type: 'pricing',
            severity: avgHourlyRate < 50 ? 'high' : 'medium',
            title: `Low Pricing: ${channel}`,
            description: `Average rate of $${avgHourlyRate.toFixed(2)}/hr`,
            value: avgHourlyRate,
            threshold: THRESHOLDS.MIN_HOURLY_RATE,
            suggestion: 'Consider increasing rates or focusing on higher-value services',
            channel,
            created_at: now.toISOString()
          })
        }
      }
    }

    // 4. MARGIN ANALYSIS
    const COST_PER_HOUR = 60 // Same as margins API
    for (const [channel, data] of channelMap.entries()) {
      const totalHours = data.totalMinutes / 60
      if (totalHours > 2 && data.revenue > 0) {
        const cost = totalHours * COST_PER_HOUR
        const margin = ((data.revenue - cost) / data.revenue) * 100
        
        if (margin < THRESHOLDS.MIN_MARGIN) {
          alerts.push({
            id: `margin-${alertId++}`,
            type: 'efficiency',
            severity: margin < 0 ? 'critical' : margin < 10 ? 'high' : 'medium',
            title: `Low Margin: ${channel}`,
            description: `Operating at ${margin.toFixed(1)}% margin`,
            value: margin,
            threshold: THRESHOLDS.MIN_MARGIN,
            suggestion: margin < 0 ? 'Service is losing money - urgent review needed' : 'Optimize processes or increase pricing',
            channel,
            created_at: now.toISOString()
          })
        }
      }
    }

    // 5. CLIENT RISK ANALYSIS - Payment delays
    for (const client of clients || []) {
      if (client.last_payment_date) {
        const daysSincePayment = Math.floor((now.getTime() - new Date(client.last_payment_date).getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysSincePayment > THRESHOLDS.MAX_UNPAID_DAYS) {
          alerts.push({
            id: `payment-${alertId++}`,
            type: 'client_risk',
            severity: daysSincePayment > 60 ? 'critical' : 'high',
            title: 'Payment Overdue',
            description: `${client.name} - ${daysSincePayment} days since last payment`,
            value: daysSincePayment,
            threshold: THRESHOLDS.MAX_UNPAID_DAYS,
            suggestion: 'Follow up on outstanding invoices and review payment terms',
            client_name: client.name,
            created_at: now.toISOString()
          })
        }
      }
    }

    // 6. EFFICIENCY ANALYSIS - Actual vs estimated hours
    const projectMap = new Map<string, { actual: number, estimated: number, name: string }>()
    
    for (const entry of timeEntries || []) {
      if (entry.project_id && entry.estimated_hours) {
        const key = entry.project_id
        if (!projectMap.has(key)) {
          projectMap.set(key, {
            actual: 0,
            estimated: entry.estimated_hours,
            name: entry.project_name || 'Unnamed Project'
          })
        }
        projectMap.get(key)!.actual += (entry.duration || 0) / 60
      }
    }

    for (const [projectId, data] of projectMap.entries()) {
      if (data.estimated > 0) {
        const efficiency = data.estimated / data.actual
        
        if (efficiency < THRESHOLDS.MIN_EFFICIENCY && data.actual > 5) {
          alerts.push({
            id: `efficiency-${alertId++}`,
            type: 'efficiency',
            severity: efficiency < 0.6 ? 'high' : 'medium',
            title: 'Project Over-Budget',
            description: `${data.name} - ${(data.actual - data.estimated).toFixed(1)}h over estimate`,
            value: efficiency * 100,
            threshold: THRESHOLDS.MIN_EFFICIENCY * 100,
            suggestion: 'Review project scope and adjust future estimates',
            created_at: now.toISOString()
          })
        }
      }
    }

    // Sort alerts by severity and date
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    alerts.sort((a, b) => {
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity]
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    // Generate summary
    const summary = {
      total_alerts: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      high: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      low: alerts.filter(a => a.severity === 'low').length,
      categories: {
        utilization: alerts.filter(a => a.type === 'utilization').length,
        capacity: alerts.filter(a => a.type === 'capacity').length,
        pricing: alerts.filter(a => a.type === 'pricing').length,
        client_risk: alerts.filter(a => a.type === 'client_risk').length,
        efficiency: alerts.filter(a => a.type === 'efficiency').length
      }
    }

    return NextResponse.json({
      alerts,
      summary,
      thresholds: THRESHOLDS,
      analysis_period: {
        start: thirtyDaysAgo.toISOString(),
        end: now.toISOString()
      }
    })
  } catch (error) {
    log.error('Resource optimization analysis error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}