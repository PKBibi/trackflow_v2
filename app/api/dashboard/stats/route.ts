import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getActiveTeam } from '@/lib/auth/team'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get team context
    const teamContext = await getActiveTeam(request as any)
    if (!('ok' in teamContext) || !teamContext.ok) {
      return (teamContext as any).response
    }
    const teamId = teamContext.teamId

    // Get today's date range
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
    
    // Get this week's date range (Monday to Sunday)
    const weekStart = new Date(todayStart)
    const dayOfWeek = weekStart.getDay()
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    weekStart.setDate(weekStart.getDate() - daysToMonday)
    
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Get yesterday's date range for comparison
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000)
    const yesterdayEnd = new Date(yesterdayStart.getTime() + 24 * 60 * 60 * 1000)

    // Fetch today's time entries
    const { data: todayEntries } = await supabase
      .from('time_entries')
      .select('duration, amount, billable')
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .gte('start_time', todayStart.toISOString())
      .lt('start_time', todayEnd.toISOString())

    // Fetch yesterday's time entries for comparison
    const { data: yesterdayEntries } = await supabase
      .from('time_entries')
      .select('duration')
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .gte('start_time', yesterdayStart.toISOString())
      .lt('start_time', yesterdayEnd.toISOString())

    // Fetch this week's time entries
    const { data: weekEntries } = await supabase
      .from('time_entries')
      .select('duration, amount, billable')
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .gte('start_time', weekStart.toISOString())
      .lt('start_time', weekEnd.toISOString())

    // Fetch active clients count
    const { data: activeClients, count: activeClientsCount } = await supabase
      .from('clients')
      .select('id, has_retainer', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .eq('status', 'active')

    // Calculate today's statistics
    const todayHours = (todayEntries || []).reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60
    const todayRevenue = (todayEntries || []).reduce((sum, entry) => sum + (entry.amount || 0), 0) / 100

    // Calculate yesterday's hours for comparison
    const yesterdayHours = (yesterdayEntries || []).reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60
    
    // Calculate today vs yesterday percentage change
    const todayVsYesterday = yesterdayHours > 0 
      ? ((todayHours - yesterdayHours) / yesterdayHours) * 100 
      : todayHours > 0 ? 100 : 0

    // Calculate this week's statistics
    const weekHours = (weekEntries || []).reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60
    const weekRevenue = (weekEntries || []).reduce((sum, entry) => sum + (entry.amount || 0), 0) / 100
    const weekBillableMinutes = (weekEntries || []).reduce((sum, entry) => 
      entry.billable ? sum + (entry.duration || 0) : sum, 0
    )
    const weekTotalMinutes = (weekEntries || []).reduce((sum, entry) => sum + (entry.duration || 0), 0)
    const billableRate = weekTotalMinutes > 0 ? (weekBillableMinutes / weekTotalMinutes) * 100 : 0

    // Count retainer vs project clients
    const retainerClients = (activeClients || []).filter(client => client.has_retainer).length
    const projectClients = (activeClientsCount || 0) - retainerClients

    // Get last week's revenue for comparison
    const lastWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000)
    const { data: lastWeekEntries } = await supabase
      .from('time_entries')
      .select('amount')
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .gte('start_time', lastWeekStart.toISOString())
      .lt('start_time', weekStart.toISOString())

    const lastWeekRevenue = (lastWeekEntries || []).reduce((sum, entry) => sum + (entry.amount || 0), 0) / 100
    const weekVsLastWeek = lastWeekRevenue > 0 
      ? ((weekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100 
      : weekRevenue > 0 ? 100 : 0

    return NextResponse.json({
      today: {
        hours: Math.round(todayHours * 10) / 10,
        revenue: Math.round(todayRevenue * 100) / 100,
        changeFromYesterday: Math.round(todayVsYesterday)
      },
      week: {
        hours: Math.round(weekHours * 10) / 10,
        revenue: Math.round(weekRevenue * 100) / 100,
        billableRate: Math.round(billableRate),
        changeFromLastWeek: Math.round(weekVsLastWeek)
      },
      clients: {
        total: activeClientsCount || 0,
        retainers: retainerClients,
        projects: projectClients
      },
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}