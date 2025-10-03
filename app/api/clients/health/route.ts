import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getActiveTeam } from '@/lib/auth/team'

interface ClientHealthScore {
  client_id: string
  client_name: string
  company?: string
  health_score: number // 0-100
  health_status: 'excellent' | 'good' | 'warning' | 'critical'
  metrics: {
    profitability: number // Revenue / (Hours * Cost) ratio
    efficiency: number // Contracted Hours / Actual Hours ratio
    billable_rate: number // Billable Time / Total Time percentage
    growth_trend: number // Month-over-month revenue change percentage
    payment_timeliness: number // On-time payment percentage
    scope_adherence: number // Projects within scope percentage
  }
  risk_factors: string[]
  opportunities: string[]
  last_updated: string
}

function calculateHealthStatus(score: number): ClientHealthScore['health_status'] {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'warning'
  return 'critical'
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

    // Get date ranges
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Fetch all active clients
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .eq('status', 'active')

    if (clientError) {
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
    }

    // Fetch time entries for the last 60 days
    const { data: timeEntries, error: timeError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .gte('start_time', sixtyDaysAgo.toISOString())

    if (timeError) {
      return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 })
    }

    // Fetch projects for scope tracking
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .eq('team_id', teamId)

    if (projectError) {
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }

    // Calculate health scores for each client
    const healthScores: ClientHealthScore[] = []

    for (const client of clients || []) {
      // Filter data for this client
      const clientTimeEntries = timeEntries?.filter(e => e.client_id === client.id) || []
      const clientProjects = projects?.filter(p => p.client_id === client.id) || []
      
      // Split entries by time period
      const recentEntries = clientTimeEntries.filter(e => 
        new Date(e.start_time) >= thirtyDaysAgo
      )
      const previousEntries = clientTimeEntries.filter(e => 
        new Date(e.start_time) < thirtyDaysAgo
      )

      // Calculate metrics
      const totalHours = recentEntries.reduce((sum, e) => sum + (e.duration || 0), 0) / 60
      const billableHours = recentEntries.filter(e => e.billable).reduce((sum, e) => sum + (e.duration || 0), 0) / 60
      const totalRevenue = recentEntries.reduce((sum, e) => sum + (e.amount || 0), 0) / 100
      const previousRevenue = previousEntries.reduce((sum, e) => sum + (e.amount || 0), 0) / 100

      // Profitability (using client hourly rate as cost basis)
      const hourlyRate = client.hourly_rate / 100 || 100
      const profitability = totalHours > 0 ? (totalRevenue / (totalHours * hourlyRate * 0.6)) : 0 // Assuming 60% cost

      // Efficiency (for retainer clients)
      let efficiency = 1
      if (client.has_retainer && client.retainer_hours) {
        efficiency = Math.min(client.retainer_hours / Math.max(totalHours, 1), 2)
      }

      // Billable rate
      const billableRate = totalHours > 0 ? (billableHours / totalHours) : 0

      // Growth trend
      const growthTrend = previousRevenue > 0 
        ? ((totalRevenue - previousRevenue) / previousRevenue) 
        : totalRevenue > 0 ? 1 : 0

      // Payment timeliness (simplified - would need invoice data)
      const paymentTimeliness = 0.85 // Placeholder

      // Scope adherence
      const projectsOverBudget = clientProjects.filter(p => {
        if (!p.budget_amount) return false
        const projectEntries = clientTimeEntries.filter(e => e.project_id === p.id)
        const projectRevenue = projectEntries.reduce((sum, e) => sum + (e.amount || 0), 0) / 100
        return projectRevenue > p.budget_amount
      }).length
      const scopeAdherence = clientProjects.length > 0 
        ? 1 - (projectsOverBudget / clientProjects.length)
        : 1

      // Calculate weighted health score
      const healthScore = Math.round(
        profitability * 25 +
        efficiency * 20 +
        billableRate * 100 * 20 +
        (growthTrend + 1) * 50 * 15 +
        paymentTimeliness * 100 * 10 +
        scopeAdherence * 100 * 10
      )

      // Identify risk factors
      const riskFactors: string[] = []
      if (profitability < 0.8) riskFactors.push('Low profitability margin')
      if (billableRate < 0.6) riskFactors.push('Low billable rate')
      if (growthTrend < -0.1) riskFactors.push('Declining revenue trend')
      if (efficiency < 0.8 && client.has_retainer) riskFactors.push('Exceeding retainer hours')
      if (scopeAdherence < 0.7) riskFactors.push('Frequent scope creep')
      if (totalHours === 0) riskFactors.push('No recent activity')

      // Identify opportunities
      const opportunities: string[] = []
      if (billableRate > 0.8) opportunities.push('High billable efficiency')
      if (growthTrend > 0.2) opportunities.push('Growing account')
      if (profitability > 1.5) opportunities.push('Highly profitable client')
      if (efficiency > 1.2 && client.has_retainer) opportunities.push('Underutilized retainer')

      healthScores.push({
        client_id: client.id,
        client_name: client.name,
        company: client.company,
        health_score: Math.min(Math.max(healthScore, 0), 100),
        health_status: calculateHealthStatus(healthScore),
        metrics: {
          profitability: Math.round(profitability * 100) / 100,
          efficiency: Math.round(efficiency * 100) / 100,
          billable_rate: Math.round(billableRate * 100),
          growth_trend: Math.round(growthTrend * 100),
          payment_timeliness: Math.round(paymentTimeliness * 100),
          scope_adherence: Math.round(scopeAdherence * 100)
        },
        risk_factors: riskFactors,
        opportunities: opportunities,
        last_updated: new Date().toISOString()
      })
    }

    // Sort by health score
    healthScores.sort((a, b) => b.health_score - a.health_score)

    return NextResponse.json({
      clients: healthScores,
      summary: {
        total_clients: healthScores.length,
        excellent: healthScores.filter(c => c.health_status === 'excellent').length,
        good: healthScores.filter(c => c.health_status === 'good').length,
        warning: healthScores.filter(c => c.health_status === 'warning').length,
        critical: healthScores.filter(c => c.health_status === 'critical').length,
        average_health: Math.round(
          healthScores.reduce((sum, c) => sum + c.health_score, 0) / Math.max(healthScores.length, 1)
        )
      }
    })
  } catch (error) {
    console.error('Client health calculation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}