import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getActiveTeam } from '@/lib/auth/team'

interface ClientRiskAlert {
  id: string
  client_id: string
  client_name: string
  risk_type: 'payment_delay' | 'scope_creep' | 'low_satisfaction' | 'declining_revenue' | 'over_budget' | 'communication_gap'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  value: number
  threshold: number
  suggestion: string
  created_at: string
  last_activity?: string
  trend_direction?: 'up' | 'down' | 'stable'
}

interface RiskSummary {
  total_risks: number
  clients_at_risk: number
  critical_risks: number
  high_risks: number
  medium_risks: number
  low_risks: number
  risk_categories: {
    payment_delay: number
    scope_creep: number
    low_satisfaction: number
    declining_revenue: number
    over_budget: number
    communication_gap: number
  }
}

const RISK_THRESHOLDS = {
  PAYMENT_OVERDUE_DAYS: 30, // Over 30 days is concerning
  CRITICAL_PAYMENT_DAYS: 60, // Over 60 days is critical
  SCOPE_CREEP_PERCENTAGE: 20, // Over 20% of estimated hours
  SATISFACTION_THRESHOLD: 80, // Below 80% satisfaction score
  REVENUE_DECLINE_PERCENTAGE: -15, // 15% decline month-over-month
  COMMUNICATION_GAP_DAYS: 14, // No communication for 14+ days
  BUDGET_OVERRUN_PERCENTAGE: 10 // Over 10% budget overrun
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get team context
    const { teamId } = await getActiveTeam(request)
    if (!teamId) {
      return NextResponse.json({ error: 'No active team' }, { status: 403 })
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Fetch clients with related data
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .eq('status', 'active')

    if (clientError) {
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
    }

    // Fetch time entries for analysis
    const { data: timeEntries, error: timeError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .gte('start_time', sixtyDaysAgo.toISOString())
      .order('start_time', { ascending: false })

    if (timeError) {
      return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 })
    }

    const alerts: ClientRiskAlert[] = []
    let alertId = 1

    for (const client of clients || []) {
      const clientEntries = timeEntries?.filter(e => e.client_id === client.id) || []
      const recentEntries = clientEntries.filter(e => new Date(e.start_time) >= thirtyDaysAgo)
      const previousEntries = clientEntries.filter(e => 
        new Date(e.start_time) >= sixtyDaysAgo && new Date(e.start_time) < thirtyDaysAgo
      )

      // 1. PAYMENT DELAY RISK
      if (client.last_payment_date) {
        const daysSincePayment = Math.floor(
          (now.getTime() - new Date(client.last_payment_date).getTime()) / (1000 * 60 * 60 * 24)
        )
        
        if (daysSincePayment > RISK_THRESHOLDS.PAYMENT_OVERDUE_DAYS) {
          alerts.push({
            id: `payment-${client.id}-${alertId++}`,
            client_id: client.id,
            client_name: client.name,
            risk_type: 'payment_delay',
            severity: daysSincePayment > RISK_THRESHOLDS.CRITICAL_PAYMENT_DAYS ? 'critical' : 'high',
            title: 'Payment Overdue',
            description: `${daysSincePayment} days since last payment`,
            value: daysSincePayment,
            threshold: RISK_THRESHOLDS.PAYMENT_OVERDUE_DAYS,
            suggestion: 'Send payment reminder and review payment terms',
            created_at: now.toISOString(),
            last_activity: client.last_payment_date
          })
        }
      }

      // 2. SCOPE CREEP RISK
      if (client.retainer_hours && recentEntries.length > 0) {
        const totalHours = recentEntries.reduce((sum, e) => sum + (e.duration || 0), 0) / 60
        const scopeCreepPercentage = ((totalHours - client.retainer_hours) / client.retainer_hours) * 100
        
        if (scopeCreepPercentage > RISK_THRESHOLDS.SCOPE_CREEP_PERCENTAGE) {
          alerts.push({
            id: `scope-${client.id}-${alertId++}`,
            client_id: client.id,
            client_name: client.name,
            risk_type: 'scope_creep',
            severity: scopeCreepPercentage > 50 ? 'critical' : 'high',
            title: 'Scope Creep Detected',
            description: `${scopeCreepPercentage.toFixed(1)}% over allocated hours`,
            value: scopeCreepPercentage,
            threshold: RISK_THRESHOLDS.SCOPE_CREEP_PERCENTAGE,
            suggestion: 'Discuss scope changes and update retainer terms',
            created_at: now.toISOString()
          })
        }
      }

      // 3. DECLINING REVENUE RISK
      const recentRevenue = recentEntries.reduce((sum, e) => sum + (e.amount || 0), 0) / 100
      const previousRevenue = previousEntries.reduce((sum, e) => sum + (e.amount || 0), 0) / 100
      
      if (previousRevenue > 0 && recentRevenue > 0) {
        const revenueChange = ((recentRevenue - previousRevenue) / previousRevenue) * 100
        
        if (revenueChange < RISK_THRESHOLDS.REVENUE_DECLINE_PERCENTAGE) {
          alerts.push({
            id: `revenue-${client.id}-${alertId++}`,
            client_id: client.id,
            client_name: client.name,
            risk_type: 'declining_revenue',
            severity: revenueChange < -30 ? 'critical' : 'high',
            title: 'Declining Revenue',
            description: `${Math.abs(revenueChange).toFixed(1)}% decrease in monthly revenue`,
            value: revenueChange,
            threshold: RISK_THRESHOLDS.REVENUE_DECLINE_PERCENTAGE,
            suggestion: 'Schedule client check-in to understand changing needs',
            created_at: now.toISOString(),
            trend_direction: 'down'
          })
        }
      }

      // 4. COMMUNICATION GAP RISK
      if (recentEntries.length > 0) {
        const lastEntry = recentEntries[0]
        const daysSinceLastWork = Math.floor(
          (now.getTime() - new Date(lastEntry.start_time).getTime()) / (1000 * 60 * 60 * 24)
        )
        
        if (daysSinceLastWork > RISK_THRESHOLDS.COMMUNICATION_GAP_DAYS) {
          alerts.push({
            id: `communication-${client.id}-${alertId++}`,
            client_id: client.id,
            client_name: client.name,
            risk_type: 'communication_gap',
            severity: daysSinceLastWork > 30 ? 'high' : 'medium',
            title: 'Communication Gap',
            description: `${daysSinceLastWork} days since last work logged`,
            value: daysSinceLastWork,
            threshold: RISK_THRESHOLDS.COMMUNICATION_GAP_DAYS,
            suggestion: 'Reach out to client for status update and next steps',
            created_at: now.toISOString(),
            last_activity: lastEntry.start_time
          })
        }
      }

      // 5. BUDGET OVERRUN RISK (for project-based work)
      const projectEntries = recentEntries.filter(e => e.project_id && e.estimated_hours)
      if (projectEntries.length > 0) {
        const projectMap = new Map<string, { actual: number, estimated: number, name: string }>()
        
        for (const entry of projectEntries) {
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

        for (const [projectId, data] of Array.from(projectMap.entries())) {
          const overrunPercentage = ((data.actual - data.estimated) / data.estimated) * 100
          
          if (overrunPercentage > RISK_THRESHOLDS.BUDGET_OVERRUN_PERCENTAGE) {
            alerts.push({
              id: `budget-${client.id}-${projectId}-${alertId++}`,
              client_id: client.id,
              client_name: client.name,
              risk_type: 'over_budget',
              severity: overrunPercentage > 25 ? 'critical' : 'high',
              title: 'Project Over Budget',
              description: `${data.name} - ${overrunPercentage.toFixed(1)}% over estimated hours`,
              value: overrunPercentage,
              threshold: RISK_THRESHOLDS.BUDGET_OVERRUN_PERCENTAGE,
              suggestion: 'Review project scope and communicate budget impact',
              created_at: now.toISOString()
            })
          }
        }
      }

      // 6. LOW SATISFACTION RISK (based on utilization and efficiency patterns)
      if (recentEntries.length > 5) { // Need sufficient data
        const avgHourlyRate = recentRevenue / (recentEntries.reduce((sum, e) => sum + (e.duration || 0), 0) / 60)
        const billablePercentage = (recentEntries.filter(e => e.billable).length / recentEntries.length) * 100
        
        // Synthetic satisfaction score based on payment timeliness, billable rate, and project success
        let satisfactionScore = 100
        
        if (client.last_payment_date) {
          const paymentDays = Math.floor(
            (now.getTime() - new Date(client.last_payment_date).getTime()) / (1000 * 60 * 60 * 24)
          )
          satisfactionScore -= Math.min(paymentDays * 2, 40) // Max 40 point deduction
        }
        
        if (billablePercentage < 70) {
          satisfactionScore -= (70 - billablePercentage) // Deduct for low billable rate
        }
        
        if (avgHourlyRate < 75) {
          satisfactionScore -= (75 - avgHourlyRate) * 0.5 // Deduct for low rates
        }

        if (satisfactionScore < RISK_THRESHOLDS.SATISFACTION_THRESHOLD) {
          alerts.push({
            id: `satisfaction-${client.id}-${alertId++}`,
            client_id: client.id,
            client_name: client.name,
            risk_type: 'low_satisfaction',
            severity: satisfactionScore < 60 ? 'critical' : satisfactionScore < 70 ? 'high' : 'medium',
            title: 'Low Client Satisfaction Risk',
            description: `Estimated satisfaction score: ${satisfactionScore.toFixed(0)}%`,
            value: satisfactionScore,
            threshold: RISK_THRESHOLDS.SATISFACTION_THRESHOLD,
            suggestion: 'Schedule client feedback session and address concerns proactively',
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
    const clientsAtRisk = new Set(alerts.map(a => a.client_id)).size
    const summary: RiskSummary = {
      total_risks: alerts.length,
      clients_at_risk: clientsAtRisk,
      critical_risks: alerts.filter(a => a.severity === 'critical').length,
      high_risks: alerts.filter(a => a.severity === 'high').length,
      medium_risks: alerts.filter(a => a.severity === 'medium').length,
      low_risks: alerts.filter(a => a.severity === 'low').length,
      risk_categories: {
        payment_delay: alerts.filter(a => a.risk_type === 'payment_delay').length,
        scope_creep: alerts.filter(a => a.risk_type === 'scope_creep').length,
        low_satisfaction: alerts.filter(a => a.risk_type === 'low_satisfaction').length,
        declining_revenue: alerts.filter(a => a.risk_type === 'declining_revenue').length,
        over_budget: alerts.filter(a => a.risk_type === 'over_budget').length,
        communication_gap: alerts.filter(a => a.risk_type === 'communication_gap').length
      }
    }

    return NextResponse.json({
      alerts,
      summary,
      thresholds: RISK_THRESHOLDS,
      analysis_period: {
        start: sixtyDaysAgo.toISOString(),
        end: now.toISOString()
      }
    })
  } catch (error) {
    console.error('Client risk analysis error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}