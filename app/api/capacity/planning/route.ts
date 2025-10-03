import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getActiveTeam } from '@/lib/auth/team'

interface CapacityData {
  current_utilization: number
  available_capacity: number
  projected_demand: number
  capacity_status: 'under_utilized' | 'optimal' | 'over_capacity' | 'at_risk'
  weekly_breakdown: WeeklyCapacity[]
  client_workload: ClientWorkload[]
  recommendations: CapacityRecommendation[]
}

interface WeeklyCapacity {
  week_start: string
  week_end: string
  planned_hours: number
  actual_hours: number
  billable_hours: number
  utilization_rate: number
  revenue_target: number
  actual_revenue: number
  status: 'under' | 'optimal' | 'over' | 'critical'
}

interface ClientWorkload {
  client_id: string
  client_name: string
  weekly_hours: number
  retainer_hours: number
  utilization_percentage: number
  revenue_contribution: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  trend: 'increasing' | 'stable' | 'decreasing'
}

interface CapacityRecommendation {
  type: 'hire' | 'redistribute' | 'optimize' | 'negotiate'
  title: string
  description: string
  impact: string
  priority: 'low' | 'medium' | 'high'
  estimated_hours_impact: number
}

const TARGET_UTILIZATION = 75 // 75% target utilization
const MAX_WEEKLY_HOURS = 40
const OPTIMAL_BILLABLE_RATE = 80

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const teamContext = await getActiveTeam(request)
    if (!teamContext.ok) return teamContext.response
    const { teamId } = teamContext

    const now = new Date()
    const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000)
    const fourWeeksFromNow = new Date(now.getTime() + 4 * 7 * 24 * 60 * 60 * 1000)

    // Fetch historical time entries
    const { data: timeEntries, error: timeError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .gte('start_time', twelveWeeksAgo.toISOString())
      .order('start_time', { ascending: false })

    if (timeError) {
      return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 })
    }

    // Fetch clients with retainer information
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .eq('status', 'active')

    if (clientError) {
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
    }

    // Generate weekly breakdown for the last 8 weeks
    const weeklyBreakdown: WeeklyCapacity[] = []
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
      
      // Set to beginning and end of week
      weekStart.setHours(0, 0, 0, 0)
      weekEnd.setHours(23, 59, 59, 999)

      const weekEntries = timeEntries?.filter(e => {
        const entryDate = new Date(e.start_time)
        return entryDate >= weekStart && entryDate <= weekEnd
      }) || []

      const totalMinutes = weekEntries.reduce((sum, e) => sum + (e.duration || 0), 0)
      const billableMinutes = weekEntries.filter(e => e.billable).reduce((sum, e) => sum + (e.duration || 0), 0)
      const actualHours = totalMinutes / 60
      const billableHours = billableMinutes / 60
      const actualRevenue = weekEntries.reduce((sum, e) => sum + (e.amount || 0), 0) / 100

      const utilizationRate = (actualHours / MAX_WEEKLY_HOURS) * 100
      const revenueTarget = MAX_WEEKLY_HOURS * TARGET_UTILIZATION * 0.01 * 100 // Assume $100/hr target

      let status: 'under' | 'optimal' | 'over' | 'critical'
      if (utilizationRate < 50) status = 'under'
      else if (utilizationRate <= TARGET_UTILIZATION) status = 'optimal'
      else if (utilizationRate <= 90) status = 'over'
      else status = 'critical'

      weeklyBreakdown.push({
        week_start: weekStart.toISOString(),
        week_end: weekEnd.toISOString(),
        planned_hours: MAX_WEEKLY_HOURS,
        actual_hours: Math.round(actualHours * 10) / 10,
        billable_hours: Math.round(billableHours * 10) / 10,
        utilization_rate: Math.round(utilizationRate),
        revenue_target: Math.round(revenueTarget),
        actual_revenue: Math.round(actualRevenue),
        status
      })
    }

    // Calculate client workload distribution
    const clientWorkload: ClientWorkload[] = []
    const recentEntries = timeEntries?.filter(e => 
      new Date(e.start_time) >= new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000)
    ) || []

    for (const client of clients || []) {
      const clientEntries = recentEntries.filter(e => e.client_id === client.id)
      const weeklyHours = clientEntries.reduce((sum, e) => sum + (e.duration || 0), 0) / 60 / 4 // Average per week
      const revenueContribution = clientEntries.reduce((sum, e) => sum + (e.amount || 0), 0) / 100

      // Determine trend by comparing last 2 weeks vs previous 2 weeks
      const lastTwoWeeks = new Date(now.getTime() - 2 * 7 * 24 * 60 * 60 * 1000)
      const previousTwoWeeks = new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000)

      const recentHours = clientEntries
        .filter(e => new Date(e.start_time) >= lastTwoWeeks)
        .reduce((sum, e) => sum + (e.duration || 0), 0) / 60

      const previousHours = clientEntries
        .filter(e => new Date(e.start_time) >= previousTwoWeeks && new Date(e.start_time) < lastTwoWeeks)
        .reduce((sum, e) => sum + (e.duration || 0), 0) / 60

      let trend: 'increasing' | 'stable' | 'decreasing'
      const trendDiff = recentHours - previousHours
      if (trendDiff > 2) trend = 'increasing'
      else if (trendDiff < -2) trend = 'decreasing'
      else trend = 'stable'

      // Determine priority based on revenue and retainer status
      let priority: 'low' | 'medium' | 'high' | 'critical'
      if (client.retainer_hours && weeklyHours > client.retainer_hours * 0.8) {
        priority = 'critical'
      } else if (revenueContribution > 5000) {
        priority = 'high'
      } else if (revenueContribution > 2000) {
        priority = 'medium'
      } else {
        priority = 'low'
      }

      const utilizationPercentage = client.retainer_hours 
        ? (weeklyHours / client.retainer_hours) * 100 
        : (weeklyHours / MAX_WEEKLY_HOURS) * 100

      if (weeklyHours > 0.5) { // Only include clients with significant time
        clientWorkload.push({
          client_id: client.id,
          client_name: client.name,
          weekly_hours: Math.round(weeklyHours * 10) / 10,
          retainer_hours: client.retainer_hours || 0,
          utilization_percentage: Math.round(utilizationPercentage),
          revenue_contribution: Math.round(revenueContribution),
          priority,
          trend
        })
      }
    }

    // Sort by revenue contribution
    clientWorkload.sort((a, b) => b.revenue_contribution - a.revenue_contribution)

    // Calculate current capacity metrics
    const recentWeeks = weeklyBreakdown.slice(-4)
    const avgUtilization = recentWeeks.reduce((sum, w) => sum + w.utilization_rate, 0) / recentWeeks.length
    const avgActualHours = recentWeeks.reduce((sum, w) => sum + w.actual_hours, 0) / recentWeeks.length
    const availableCapacity = MAX_WEEKLY_HOURS - avgActualHours

    // Project demand based on trends
    const increasingClients = clientWorkload.filter(c => c.trend === 'increasing')
    const projectedIncrease = increasingClients.reduce((sum, c) => sum + c.weekly_hours * 0.2, 0) // 20% increase
    const projectedDemand = avgActualHours + projectedIncrease

    // Determine capacity status
    let capacityStatus: 'under_utilized' | 'optimal' | 'over_capacity' | 'at_risk'
    if (avgUtilization < 50) capacityStatus = 'under_utilized'
    else if (avgUtilization <= TARGET_UTILIZATION && projectedDemand <= MAX_WEEKLY_HOURS) capacityStatus = 'optimal'
    else if (projectedDemand > MAX_WEEKLY_HOURS * 0.9) capacityStatus = 'at_risk'
    else capacityStatus = 'over_capacity'

    // Generate recommendations
    const recommendations: CapacityRecommendation[] = []

    if (capacityStatus === 'under_utilized') {
      recommendations.push({
        type: 'negotiate',
        title: 'Expand Client Services',
        description: 'You have available capacity. Consider upselling existing clients or acquiring new ones.',
        impact: `Could add ${availableCapacity.toFixed(1)} hours per week`,
        priority: 'high',
        estimated_hours_impact: availableCapacity
      })
    }

    if (capacityStatus === 'over_capacity' || capacityStatus === 'at_risk') {
      if (projectedDemand > MAX_WEEKLY_HOURS) {
        recommendations.push({
          type: 'hire',
          title: 'Consider Additional Resources',
          description: 'Current demand exceeds sustainable capacity. Consider hiring help or contractors.',
          impact: `Need ${(projectedDemand - MAX_WEEKLY_HOURS).toFixed(1)} additional hours per week`,
          priority: 'high',
          estimated_hours_impact: projectedDemand - MAX_WEEKLY_HOURS
        })
      }

      const lowEfficiencyClients = clientWorkload.filter(c => 
        c.retainer_hours > 0 && c.utilization_percentage < 80
      )
      
      if (lowEfficiencyClients.length > 0) {
        recommendations.push({
          type: 'optimize',
          title: 'Optimize Client Work',
          description: 'Some clients are under-utilizing their retainers. Focus on efficiency improvements.',
          impact: 'Improve profitability and free up capacity',
          priority: 'medium',
          estimated_hours_impact: lowEfficiencyClients.reduce((sum, c) => sum + c.weekly_hours * 0.1, 0)
        })
      }
    }

    // Check for clients trending upward that might need attention
    const highGrowthClients = clientWorkload.filter(c => 
      c.trend === 'increasing' && c.priority === 'critical'
    )
    
    if (highGrowthClients.length > 0) {
      recommendations.push({
        type: 'redistribute',
        title: 'Manage High-Growth Clients',
        description: 'Some key clients are increasing demand. Plan resource allocation carefully.',
        impact: 'Prevent capacity overruns and maintain service quality',
        priority: 'high',
        estimated_hours_impact: highGrowthClients.reduce((sum, c) => sum + c.weekly_hours * 0.3, 0)
      })
    }

    const capacityData: CapacityData = {
      current_utilization: Math.round(avgUtilization),
      available_capacity: Math.round(availableCapacity * 10) / 10,
      projected_demand: Math.round(projectedDemand * 10) / 10,
      capacity_status: capacityStatus,
      weekly_breakdown: weeklyBreakdown,
      client_workload: clientWorkload,
      recommendations
    }

    return NextResponse.json({
      ...capacityData,
      analysis_period: {
        start: twelveWeeksAgo.toISOString(),
        end: now.toISOString(),
        projection_end: fourWeeksFromNow.toISOString()
      },
      targets: {
        max_weekly_hours: MAX_WEEKLY_HOURS,
        target_utilization: TARGET_UTILIZATION,
        optimal_billable_rate: OPTIMAL_BILLABLE_RATE
      }
    })
  } catch (error) {
    console.error('Capacity planning analysis error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}