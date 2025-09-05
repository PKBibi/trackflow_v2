import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get user ID from auth context
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const insights: any[] = []
    
    // 1. Most Productive Hours Pattern Detection
    const { data: productivityPatterns, error: productivityError } = await supabase
      .from('time_entries')
      .select('start_time, duration')
      .eq('user_id', user.id)
      .not('start_time', 'is', null)
      .not('duration', 'is', null)

    if (!productivityError && productivityPatterns && productivityPatterns.length > 0) {
      // Group by hour and calculate averages
      const hourlyStats: { [key: number]: { totalDuration: number, count: number } } = {}
      
      productivityPatterns.forEach(entry => {
        if (entry.start_time) {
          const hour = new Date(entry.start_time).getHours()
          if (!hourlyStats[hour]) {
            hourlyStats[hour] = { totalDuration: 0, count: 0 }
          }
          hourlyStats[hour].totalDuration += entry.duration || 0
          hourlyStats[hour].count += 1
        }
      })

      // Find most productive hour
      let mostProductiveHour = 9 // Default to 9 AM
      let maxAvgDuration = 0
      
      Object.entries(hourlyStats).forEach(([hour, stats]) => {
        const avgDuration = stats.totalDuration / stats.count
        if (avgDuration > maxAvgDuration) {
          maxAvgDuration = avgDuration
          mostProductiveHour = parseInt(hour)
        }
      })

      if (maxAvgDuration > 0) {
        insights.push({
          type: 'productivity',
          title: `You're most productive at ${mostProductiveHour}:00`,
          description: `You complete ${Math.round(maxAvgDuration)}% more tasks during this hour`,
          confidence: 0.85,
          icon: 'clock',
          category: 'productivity'
        })
      }
    }

    // 2. Channel Efficiency & ROI Analysis
    const { data: channelData, error: channelError } = await supabase
      .from('time_entries')
      .select(`
        marketing_channel,
        duration,
        hourly_rate,
        billable
      `)
      .eq('user_id', user.id)
      .eq('billable', true)
      .not('duration', 'is', null)

    if (!channelError && channelData && channelData.length > 0) {
      // Calculate effective hourly rate by channel
      const channelStats: { [key: string]: { totalEarnings: number, totalHours: number } } = {}
      
      channelData.forEach(entry => {
        const channel = entry.marketing_channel || 'Unknown'
        const earnings = (entry.duration || 0) * (entry.hourly_rate || 0) / 100 // Assuming duration is in minutes
        const hours = (entry.duration || 0) / 60
        
        if (!channelStats[channel]) {
          channelStats[channel] = { totalEarnings: 0, totalHours: 0 }
        }
        channelStats[channel].totalEarnings += earnings
        channelStats[channel].totalHours += hours
      })

      // Find most profitable channel
      let mostProfitableChannel = 'Unknown'
      let maxEffectiveRate = 0
      
      Object.entries(channelStats).forEach(([channel, stats]) => {
        if (stats.totalHours > 0) {
          const effectiveRate = stats.totalEarnings / stats.totalHours
          if (effectiveRate > maxEffectiveRate) {
            maxEffectiveRate = effectiveRate
            mostProfitableChannel = channel
          }
        }
      })

      if (maxEffectiveRate > 0) {
        insights.push({
          type: 'revenue',
          title: `${mostProfitableChannel} is your most profitable channel`,
          description: `You earn $${maxEffectiveRate.toFixed(2)}/hour on ${mostProfitableChannel} work`,
          action: 'Focus more time here',
          confidence: 0.90,
          icon: 'trending-up',
          category: 'revenue'
        })
      }
    }

    // 3. Retainer Usage Warnings
    const { data: retainerData, error: retainerError } = await supabase
      .from('clients')
      .select(`
        id,
        name,
        retainer_hours,
        time_entries (
          duration
        )
      `)
      .eq('user_id', user.id)
      .not('retainer_hours', 'is', null)

    if (!retainerError && retainerData) {
      retainerData.forEach(client => {
        if (client.retainer_hours && client.time_entries) {
          const totalHours = client.time_entries.reduce((sum: number, entry: any) => 
            sum + ((entry.duration || 0) / 60), 0
          )
          const usagePercent = (totalHours / client.retainer_hours) * 100
          
          if (usagePercent > 75) {
            insights.push({
              type: 'warning',
              priority: usagePercent > 90 ? 'high' : 'medium',
              title: `${client.name} retainer at ${Math.round(usagePercent)}%`,
              description: `${Math.round(client.retainer_hours - totalHours)} hours remaining`,
              action: 'Send progress report',
              confidence: 0.95,
              icon: 'alert-triangle',
              category: 'retainer'
            })
          }
        }
      })
    }

    // 4. Project Deadline Warnings
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        deadline,
        estimated_hours,
        time_entries (
          duration
        )
      `)
      .eq('user_id', user.id)
      .not('deadline', 'is', null)

    if (!projectError && projectData) {
      const now = new Date()
      projectData.forEach(project => {
        if (project.deadline) {
          const deadline = new Date(project.deadline)
          const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          
          if (daysUntilDeadline <= 7 && daysUntilDeadline > 0) {
            const totalHours = project.time_entries?.reduce((sum: number, entry: any) => 
              sum + ((entry.duration || 0) / 60), 0
            ) || 0
            const estimatedHours = project.estimated_hours || 0
            const progressPercent = estimatedHours > 0 ? (totalHours / estimatedHours) * 100 : 0
            
            insights.push({
              type: 'deadline',
              priority: daysUntilDeadline <= 3 ? 'high' : 'medium',
              title: `${project.name} due in ${daysUntilDeadline} days`,
              description: `Progress: ${Math.round(progressPercent)}% (${Math.round(totalHours)}/${Math.round(estimatedHours)} hours)`,
              action: 'Review project timeline',
              confidence: 0.98,
              icon: 'calendar',
              category: 'deadline'
            })
          }
        }
      })
    }

    // 5. Weekly Productivity Summary
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const { data: weeklyData, error: weeklyError } = await supabase
      .from('time_entries')
      .select('duration, billable, hourly_rate')
      .eq('user_id', user.id)
      .gte('start_time', oneWeekAgo.toISOString())

    if (!weeklyError && weeklyData && weeklyData.length > 0) {
      const totalHours = weeklyData.reduce((sum: number, entry: any) => 
        sum + ((entry.duration || 0) / 60), 0
      )
      const billableHours = weeklyData
        .filter((entry: any) => entry.billable)
        .reduce((sum: number, entry: any) => 
          sum + ((entry.duration || 0) / 60), 0
        )
      const totalEarnings = weeklyData
        .filter((entry: any) => entry.billable)
        .reduce((sum: number, entry: any) => 
          sum + ((entry.duration || 0) * (entry.hourly_rate || 0) / 100), 0
        )

      insights.push({
        type: 'summary',
        title: 'Weekly Productivity Summary',
        description: `${Math.round(totalHours)} total hours, ${Math.round(billableHours)} billable hours`,
        action: `$${totalEarnings.toFixed(2)} earned this week`,
        confidence: 0.99,
        icon: 'bar-chart-3',
        category: 'summary'
      })
    }

    // Sort insights by priority and confidence
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    insights.sort((a, b) => {
      const priorityDiff = (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                           (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
      if (priorityDiff !== 0) return priorityDiff
      return (b.confidence || 0) - (a.confidence || 0)
    })

    return NextResponse.json({ 
      insights,
      generated_at: new Date().toISOString(),
      phase: 'rule-based',
      total_insights: insights.length
    })

  } catch (error) {
    console.error('Error generating insights:', error)
    return NextResponse.json({ 
      error: 'Failed to generate insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
