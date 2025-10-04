import { log } from '@/lib/logger';
/**
 * Advanced AI Insights Engine using OpenAI
 * Provides intelligent analysis, predictions, and recommendations
 */

import { callOpenAIJSON } from './openai'
import { createClient } from '@/lib/supabase/server'

export interface TimeEntry {
  id: string
  start_time: string
  end_time?: string
  duration: number
  billable: boolean
  amount: number
  hourly_rate: number
  marketing_channel: string
  marketing_category: string
  client_id: string
  project_id: string
  task_title?: string
  task_description?: string
  user_id: string
  created_at: string
}

export interface Client {
  id: string
  name: string
  email?: string
  hourly_rate?: number
  retainer_hours?: number
  retainer_amount?: number
  status: string
}

export interface Project {
  id: string
  name: string
  client_id: string
  budget_amount?: number
  estimated_hours?: number
  deadline?: string
  status: string
}

export interface AIInsight {
  id: string
  type: 'prediction' | 'anomaly' | 'recommendation' | 'analysis' | 'warning' | 'opportunity'
  category: 'productivity' | 'revenue' | 'efficiency' | 'growth' | 'risk'
  title: string
  description: string
  impact: string
  action_items: string[]
  confidence: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  data_points?: Record<string, any>
  predicted_value?: number
  predicted_date?: string
  comparison?: {
    current: number
    predicted: number
    change_percent: number
  }
  visualization?: {
    type: 'chart' | 'metric' | 'timeline'
    data: any
  }
}

export class AIInsightsEngine {
  private supabase: any

  constructor() {
    this.initializeSupabase()
  }

  private async initializeSupabase() {
    this.supabase = await createClient()
  }

  /**
   * Generate comprehensive AI insights for a user
   */
  async generateInsights(userId: string, teamId: string): Promise<AIInsight[]> {
    try {
      // Fetch comprehensive data
      const data = await this.fetchUserData(userId, teamId)

      if (!data.entries.length) {
        return this.getOnboardingInsights()
      }

      // Run multiple AI analyses in parallel
      const [
        predictions,
        anomalies,
        recommendations,
        patterns,
        opportunities
      ] = await Promise.all([
        this.generatePredictions(data),
        this.detectAnomalies(data),
        this.generateRecommendations(data),
        this.analyzePatterns(data),
        this.identifyOpportunities(data)
      ])

      // Combine and prioritize insights
      const allInsights = [
        ...predictions,
        ...anomalies,
        ...recommendations,
        ...patterns,
        ...opportunities
      ]

      // Sort by priority and confidence
      return this.prioritizeInsights(allInsights)
    } catch (error) {
      log.error('Error generating AI insights:', error)
      return this.getFallbackInsights()
    }
  }

  /**
   * Generate predictive insights using AI
   */
  private async generatePredictions(data: any): Promise<AIInsight[]> {
    const prompt = {
      role: 'system',
      content: `You are an AI analyst specializing in digital marketing agency metrics.
      Analyze time tracking data to predict future trends and outcomes.
      Focus on actionable predictions that help optimize revenue and productivity.`
    }

    const userPrompt = {
      role: 'user',
      content: `Analyze this time tracking data and generate predictions:

      Time Entries Summary:
      - Total entries: ${data.entries.length}
      - Date range: ${data.dateRange.start} to ${data.dateRange.end}
      - Total hours: ${data.metrics.totalHours}
      - Billable rate: ${data.metrics.billableRate}%
      - Average hourly rate: $${data.metrics.avgHourlyRate}

      Channel Performance:
      ${JSON.stringify(data.channelMetrics, null, 2)}

      Client Distribution:
      ${JSON.stringify(data.clientMetrics, null, 2)}

      Recent Trends:
      ${JSON.stringify(data.trends, null, 2)}

      Generate JSON with predictions array containing:
      - revenue_next_month: predicted revenue
      - productivity_trend: up/down/stable with percentage
      - optimal_focus_times: best hours for deep work
      - project_completion_risk: projects at risk of delays
      - capacity_forecast: available hours next month
      - growth_opportunities: specific actions to increase revenue

      Each prediction should have: title, description, predicted_value, confidence (0-1), impact, action_items[]`
    }

    try {
      const response = await callOpenAIJSON(
        [prompt, userPrompt],
        {
          model: 'gpt-4o-mini',
          temperature: 0.3,
          maxTokens: 1500
        }
      )

      return this.formatPredictions(response.predictions || [])
    } catch (error) {
      log.error('Error generating predictions:', error)
      return []
    }
  }

  /**
   * Detect anomalies in work patterns
   */
  private async detectAnomalies(data: any): Promise<AIInsight[]> {
    const prompt = {
      role: 'system',
      content: `You are an anomaly detection specialist. Identify unusual patterns,
      outliers, and potential issues in time tracking and billing data.`
    }

    const userPrompt = {
      role: 'user',
      content: `Detect anomalies in this data:

      Weekly patterns:
      ${JSON.stringify(data.weeklyPatterns, null, 2)}

      Daily averages:
      ${JSON.stringify(data.dailyAverages, null, 2)}

      Project metrics:
      ${JSON.stringify(data.projectMetrics, null, 2)}

      Identify anomalies such as:
      - Unusual billing patterns
      - Productivity drops or spikes
      - Client engagement changes
      - Time tracking inconsistencies
      - Revenue irregularities
      - Efficiency issues

      Return JSON with anomalies array. Each anomaly should have:
      - type: the type of anomaly
      - severity: critical/high/medium/low
      - description: detailed explanation
      - affected_metric: what metric is affected
      - deviation: how much it deviates from normal
      - recommended_action: what to do about it
      - data_points: supporting data`
    }

    try {
      const response = await callOpenAIJSON(
        [prompt, userPrompt],
        {
          model: 'gpt-4o-mini',
          temperature: 0.2,
          maxTokens: 1200
        }
      )

      return this.formatAnomalies(response.anomalies || [])
    } catch (error) {
      log.error('Error detecting anomalies:', error)
      return []
    }
  }

  /**
   * Generate AI-powered recommendations
   */
  private async generateRecommendations(data: any): Promise<AIInsight[]> {
    const prompt = {
      role: 'system',
      content: `You are a business optimization expert for digital marketing agencies.
      Provide specific, actionable recommendations to improve efficiency, revenue, and client satisfaction.`
    }

    const userPrompt = {
      role: 'user',
      content: `Generate optimization recommendations based on:

      Current Performance:
      - Billable utilization: ${data.metrics.billableRate}%
      - Average session: ${data.metrics.avgSessionMinutes} minutes
      - Client concentration: ${data.metrics.clientConcentration}
      - Revenue per hour: $${data.metrics.revenuePerHour}

      Top Challenges:
      ${JSON.stringify(data.challenges, null, 2)}

      Opportunities:
      ${JSON.stringify(data.opportunities, null, 2)}

      Generate specific recommendations for:
      1. Increasing billable hours
      2. Optimizing hourly rates
      3. Improving time management
      4. Expanding profitable channels
      5. Reducing context switching
      6. Automating repetitive tasks

      Return JSON with recommendations array. Each should have:
      - category: revenue/productivity/efficiency/growth
      - title: clear action title
      - description: why this matters
      - expected_impact: quantified benefit
      - implementation_steps: array of steps
      - effort_level: low/medium/high
      - priority: critical/high/medium/low
      - metrics_to_track: what to measure`
    }

    try {
      const response = await callOpenAIJSON(
        [prompt, userPrompt],
        {
          model: 'gpt-4o-mini',
          temperature: 0.4,
          maxTokens: 1500
        }
      )

      return this.formatRecommendations(response.recommendations || [])
    } catch (error) {
      log.error('Error generating recommendations:', error)
      return []
    }
  }

  /**
   * Analyze patterns using AI
   */
  private async analyzePatterns(data: any): Promise<AIInsight[]> {
    const prompt = {
      role: 'system',
      content: `You are a pattern recognition expert. Identify meaningful patterns,
      correlations, and trends in time tracking and business data.`
    }

    const userPrompt = {
      role: 'user',
      content: `Analyze patterns in this data:

      Time series data (last 90 days):
      ${JSON.stringify(data.timeSeries, null, 2)}

      Correlations found:
      - Channel vs Revenue: ${data.correlations.channelRevenue}
      - Time of day vs Productivity: ${data.correlations.timeProductivity}
      - Project type vs Profitability: ${data.correlations.projectProfitability}

      Seasonal patterns:
      ${JSON.stringify(data.seasonalPatterns, null, 2)}

      Identify:
      1. Recurring patterns (daily, weekly, monthly)
      2. Cause-effect relationships
      3. Hidden correlations
      4. Emerging trends
      5. Behavioral patterns

      Return JSON with patterns array. Each pattern should have:
      - pattern_type: temporal/behavioral/correlation/trend
      - title: pattern name
      - description: what was discovered
      - significance: why it matters
      - confidence: 0-1
      - visualization_type: best way to show this
      - actionable_insight: how to use this knowledge`
    }

    try {
      const response = await callOpenAIJSON(
        [prompt, userPrompt],
        {
          model: 'gpt-4o-mini',
          temperature: 0.3,
          maxTokens: 1200
        }
      )

      return this.formatPatterns(response.patterns || [])
    } catch (error) {
      log.error('Error analyzing patterns:', error)
      return []
    }
  }

  /**
   * Identify growth opportunities
   */
  private async identifyOpportunities(data: any): Promise<AIInsight[]> {
    const prompt = {
      role: 'system',
      content: `You are a growth strategist for digital agencies. Identify specific,
      high-impact opportunities for revenue growth and business expansion.`
    }

    const userPrompt = {
      role: 'user',
      content: `Identify growth opportunities from:

      Current state:
      - Monthly revenue: $${data.metrics.monthlyRevenue}
      - Active clients: ${data.metrics.activeClients}
      - Utilization: ${data.metrics.utilization}%
      - Top channel: ${data.metrics.topChannel}

      Underutilized resources:
      ${JSON.stringify(data.underutilized, null, 2)}

      Market opportunities:
      ${JSON.stringify(data.marketOpportunities, null, 2)}

      Identify opportunities for:
      1. New revenue streams
      2. Service expansion
      3. Rate optimization
      4. Client upselling
      5. Efficiency gains that create capacity
      6. Automation possibilities

      Return JSON with opportunities array. Each should have:
      - opportunity_type: new_service/upsell/optimization/expansion
      - title: opportunity name
      - description: detailed explanation
      - revenue_potential: estimated monthly impact
      - investment_required: time/money needed
      - success_probability: high/medium/low
      - implementation_timeline: weeks to implement
      - first_steps: immediate actions to take`
    }

    try {
      const response = await callOpenAIJSON(
        [prompt, userPrompt],
        {
          model: 'gpt-4o-mini',
          temperature: 0.5,
          maxTokens: 1500
        }
      )

      return this.formatOpportunities(response.opportunities || [])
    } catch (error) {
      log.error('Error identifying opportunities:', error)
      return []
    }
  }

  /**
   * Generate weekly AI summary
   */
  async generateWeeklySummary(userId: string, teamId: string): Promise<string> {
    const data = await this.fetchUserData(userId, teamId, 7) // Last 7 days

    const prompt = {
      role: 'system',
      content: `You are an executive assistant providing weekly performance summaries
      for digital marketing agency owners. Be concise, insightful, and actionable.`
    }

    const userPrompt = {
      role: 'user',
      content: `Create a weekly summary from this data:

      Week Overview:
      - Total hours worked: ${data.metrics.totalHours}
      - Billable hours: ${data.metrics.billableHours}
      - Revenue generated: $${data.metrics.revenue}
      - Active clients: ${data.metrics.activeClients}
      - Projects: ${data.projects.length}

      Compared to previous week:
      - Hours change: ${data.weekOverWeek.hoursChange}%
      - Revenue change: ${data.weekOverWeek.revenueChange}%
      - Productivity change: ${data.weekOverWeek.productivityChange}%

      Highlights:
      ${JSON.stringify(data.highlights, null, 2)}

      Challenges:
      ${JSON.stringify(data.challenges, null, 2)}

      Create a professional summary with:
      1. Executive summary (2-3 sentences)
      2. Key achievements (bullets)
      3. Areas needing attention (bullets)
      4. Recommended focus for next week (3 priorities)
      5. One strategic insight

      Return JSON with summary object containing these sections.`
    }

    try {
      const response = await callOpenAIJSON(
        [prompt, userPrompt],
        {
          model: 'gpt-4o-mini',
          temperature: 0.4,
          maxTokens: 1000
        }
      )

      return this.formatWeeklySummary(response.summary)
    } catch (error) {
      log.error('Error generating weekly summary:', error)
      return 'Unable to generate weekly summary at this time.'
    }
  }

  /**
   * Fetch comprehensive user data for AI analysis
   */
  private async fetchUserData(userId: string, teamId: string, days: number = 90) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Fetch all necessary data in parallel
    const [entries, clients, projects] = await Promise.all([
      this.supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('team_id', teamId)
        .gte('start_time', startDate.toISOString())
        .order('start_time', { ascending: false }),

      this.supabase
        .from('clients')
        .select('*')
        .eq('team_id', teamId)
        .eq('status', 'active'),

      this.supabase
        .from('projects')
        .select('*')
        .eq('team_id', teamId)
        .in('status', ['active', 'planning'])
    ])

    // Process and analyze the data
    const processedData = this.processDataForAI(
      entries.data || [],
      clients.data || [],
      projects.data || []
    )

    return {
      entries: entries.data || [],
      clients: clients.data || [],
      projects: projects.data || [],
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      ...processedData
    }
  }

  /**
   * Process raw data for AI analysis
   */
  private processDataForAI(entries: TimeEntry[], clients: Client[], projects: Project[]) {
    // Calculate key metrics
    const totalMinutes = entries.reduce((sum, e) => sum + (e.duration || 0), 0)
    const billableMinutes = entries.filter(e => e.billable).reduce((sum, e) => sum + (e.duration || 0), 0)
    const totalRevenue = entries.reduce((sum, e) => sum + (e.amount || 0), 0)

    // Channel analysis
    const channelMetrics = this.analyzeChannels(entries)

    // Client analysis
    const clientMetrics = this.analyzeClients(entries, clients)

    // Time patterns
    const patterns = this.analyzeTimePatterns(entries)

    // Trends
    const trends = this.analyzeTrends(entries)

    // Weekly patterns
    const weeklyPatterns = this.analyzeWeeklyPatterns(entries)

    // Daily averages
    const dailyAverages = this.calculateDailyAverages(entries)

    // Project metrics
    const projectMetrics = this.analyzeProjects(entries, projects)

    return {
      metrics: {
        totalHours: Math.round(totalMinutes / 60),
        billableHours: Math.round(billableMinutes / 60),
        billableRate: totalMinutes > 0 ? Math.round((billableMinutes / totalMinutes) * 100) : 0,
        revenue: totalRevenue,
        avgHourlyRate: billableMinutes > 0 ? Math.round(totalRevenue / (billableMinutes / 60)) : 0,
        avgSessionMinutes: entries.length > 0 ? Math.round(totalMinutes / entries.length) : 0,
        revenuePerHour: totalMinutes > 0 ? Math.round(totalRevenue / (totalMinutes / 60)) : 0,
        monthlyRevenue: this.estimateMonthlyRevenue(entries),
        activeClients: clients.length,
        clientConcentration: this.calculateClientConcentration(clientMetrics),
        utilization: this.calculateUtilization(totalMinutes, entries)
      },
      channelMetrics,
      clientMetrics,
      patterns,
      trends,
      weeklyPatterns,
      dailyAverages,
      projectMetrics,
      challenges: this.identifyChallenges(entries, clients, projects),
      opportunities: this.identifyOpportunitiesFromData(entries, clients, projects),
      timeSeries: this.createTimeSeries(entries),
      correlations: this.calculateCorrelations(entries),
      seasonalPatterns: this.detectSeasonalPatterns(entries),
      underutilized: this.findUnderutilized(entries, clients),
      marketOpportunities: this.analyzeMarketOpportunities(channelMetrics),
      highlights: this.extractHighlights(entries, clients),
      weekOverWeek: this.calculateWeekOverWeek(entries)
    }
  }

  // Helper methods for data analysis
  private analyzeChannels(entries: TimeEntry[]) {
    const channels: Record<string, any> = {}

    entries.forEach(entry => {
      const channel = entry.marketing_channel || 'Unknown'
      if (!channels[channel]) {
        channels[channel] = {
          count: 0,
          totalMinutes: 0,
          totalRevenue: 0,
          billableMinutes: 0
        }
      }

      channels[channel].count++
      channels[channel].totalMinutes += entry.duration || 0
      channels[channel].totalRevenue += entry.amount || 0
      if (entry.billable) {
        channels[channel].billableMinutes += entry.duration || 0
      }
    })

    // Calculate metrics for each channel
    Object.keys(channels).forEach(channel => {
      const data = channels[channel]
      data.avgRevenuePerHour = data.totalMinutes > 0
        ? (data.totalRevenue / (data.totalMinutes / 60))
        : 0
      data.billableRate = data.totalMinutes > 0
        ? (data.billableMinutes / data.totalMinutes) * 100
        : 0
      data.efficiency = data.billableMinutes > 0
        ? data.totalRevenue / (data.billableMinutes / 60)
        : 0
    })

    return channels
  }

  private analyzeClients(entries: TimeEntry[], clients: Client[]) {
    const clientMap: Record<string, any> = {}

    entries.forEach(entry => {
      const clientId = entry.client_id
      if (!clientMap[clientId]) {
        const client = clients.find(c => c.id === clientId)
        clientMap[clientId] = {
          name: client?.name || 'Unknown',
          totalMinutes: 0,
          totalRevenue: 0,
          entryCount: 0,
          lastActivity: entry.start_time
        }
      }

      clientMap[clientId].totalMinutes += entry.duration || 0
      clientMap[clientId].totalRevenue += entry.amount || 0
      clientMap[clientId].entryCount++
    })

    return clientMap
  }

  private analyzeTimePatterns(entries: TimeEntry[]) {
    const hourlyDistribution: Record<number, number> = {}
    const dayDistribution: Record<number, number> = {}

    entries.forEach(entry => {
      if (entry.start_time) {
        const date = new Date(entry.start_time)
        const hour = date.getHours()
        const day = date.getDay()

        hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + (entry.duration || 0)
        dayDistribution[day] = (dayDistribution[day] || 0) + (entry.duration || 0)
      }
    })

    return {
      hourly: hourlyDistribution,
      daily: dayDistribution,
      peakHours: this.findPeakHours(hourlyDistribution),
      peakDays: this.findPeakDays(dayDistribution)
    }
  }

  private analyzeTrends(entries: TimeEntry[]) {
    // Group entries by week
    const weeks: Record<string, any> = {}

    entries.forEach(entry => {
      const weekKey = this.getWeekKey(new Date(entry.start_time))
      if (!weeks[weekKey]) {
        weeks[weekKey] = {
          totalMinutes: 0,
          revenue: 0,
          entries: 0
        }
      }

      weeks[weekKey].totalMinutes += entry.duration || 0
      weeks[weekKey].revenue += entry.amount || 0
      weeks[weekKey].entries++
    })

    // Calculate trend
    const weekKeys = Object.keys(weeks).sort()
    if (weekKeys.length < 2) return { trend: 'stable', change: 0 }

    const recent = weeks[weekKeys[weekKeys.length - 1]]
    const previous = weeks[weekKeys[weekKeys.length - 2]]

    const revenueChange = previous.revenue > 0
      ? ((recent.revenue - previous.revenue) / previous.revenue) * 100
      : 0

    return {
      trend: revenueChange > 10 ? 'up' : revenueChange < -10 ? 'down' : 'stable',
      change: Math.round(revenueChange),
      weeklyData: weeks
    }
  }

  private analyzeWeeklyPatterns(entries: TimeEntry[]) {
    const patterns = {
      mondayFocus: 0,
      fridayProductivity: 0,
      weekendWork: 0,
      consistencyScore: 0
    }

    // Analyze patterns
    const dayTotals: Record<number, number[]> = {}
    entries.forEach(entry => {
      const day = new Date(entry.start_time).getDay()
      if (!dayTotals[day]) dayTotals[day] = []
      dayTotals[day].push(entry.duration || 0)
    })

    // Calculate metrics
    patterns.mondayFocus = (dayTotals[1] || []).reduce((a, b) => a + b, 0)
    patterns.fridayProductivity = (dayTotals[5] || []).reduce((a, b) => a + b, 0)
    patterns.weekendWork = ((dayTotals[0] || []).reduce((a, b) => a + b, 0) +
                            (dayTotals[6] || []).reduce((a, b) => a + b, 0))

    // Calculate consistency
    const dailyAverages = Object.values(dayTotals).map(d =>
      d.reduce((a, b) => a + b, 0) / d.length
    )
    const mean = dailyAverages.reduce((a, b) => a + b, 0) / dailyAverages.length
    const variance = dailyAverages.reduce((sum, val) =>
      sum + Math.pow(val - mean, 2), 0
    ) / dailyAverages.length
    patterns.consistencyScore = 100 - Math.min(100, Math.sqrt(variance) / mean * 100)

    return patterns
  }

  private calculateDailyAverages(entries: TimeEntry[]) {
    const dailyData: Record<string, number> = {}

    entries.forEach(entry => {
      const dateKey = new Date(entry.start_time).toISOString().split('T')[0]
      dailyData[dateKey] = (dailyData[dateKey] || 0) + (entry.duration || 0)
    })

    const days = Object.keys(dailyData).length
    const totalMinutes = Object.values(dailyData).reduce((a, b) => a + b, 0)

    return {
      avgDailyMinutes: days > 0 ? totalMinutes / days : 0,
      workingDays: days,
      totalDays: Math.ceil((new Date().getTime() - new Date(entries[entries.length - 1]?.start_time).getTime()) / (1000 * 60 * 60 * 24))
    }
  }

  private analyzeProjects(entries: TimeEntry[], projects: Project[]) {
    const projectMap: Record<string, any> = {}

    entries.forEach(entry => {
      const projectId = entry.project_id
      if (!projectMap[projectId]) {
        const project = projects.find(p => p.id === projectId)
        projectMap[projectId] = {
          name: project?.name || 'Unknown',
          totalMinutes: 0,
          totalRevenue: 0,
          deadline: project?.deadline,
          budget: project?.budget_amount,
          estimatedHours: project?.estimated_hours
        }
      }

      projectMap[projectId].totalMinutes += entry.duration || 0
      projectMap[projectId].totalRevenue += entry.amount || 0
    })

    // Calculate project health
    Object.values(projectMap).forEach(project => {
      if (project.estimatedHours) {
        project.completionPercent = (project.totalMinutes / 60) / project.estimatedHours * 100
      }
      if (project.budget) {
        project.budgetUsed = project.totalRevenue / project.budget * 100
      }
      if (project.deadline) {
        const daysRemaining = Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        project.daysRemaining = daysRemaining
        project.onTrack = !project.completionPercent || project.completionPercent < 100
      }
    })

    return projectMap
  }

  // Formatting methods
  private formatPredictions(predictions: any[]): AIInsight[] {
    return predictions.map((pred, index) => ({
      id: `pred-${index}`,
      type: 'prediction',
      category: this.categorizeInsight(pred),
      title: pred.title,
      description: pred.description,
      impact: pred.impact || 'Potential impact on business metrics',
      action_items: pred.action_items || [],
      confidence: pred.confidence || 0.7,
      priority: this.calculatePriority(pred),
      predicted_value: pred.predicted_value,
      predicted_date: pred.predicted_date,
      comparison: pred.comparison,
      data_points: pred.data_points
    }))
  }

  private formatAnomalies(anomalies: any[]): AIInsight[] {
    return anomalies.map((anomaly, index) => ({
      id: `anomaly-${index}`,
      type: 'anomaly',
      category: 'risk',
      title: `Anomaly Detected: ${anomaly.type}`,
      description: anomaly.description,
      impact: `${anomaly.affected_metric} deviates by ${anomaly.deviation}`,
      action_items: [anomaly.recommended_action],
      confidence: 0.85,
      priority: anomaly.severity as any,
      data_points: anomaly.data_points
    }))
  }

  private formatRecommendations(recommendations: any[]): AIInsight[] {
    return recommendations.map((rec, index) => ({
      id: `rec-${index}`,
      type: 'recommendation',
      category: rec.category,
      title: rec.title,
      description: rec.description,
      impact: rec.expected_impact,
      action_items: rec.implementation_steps || [],
      confidence: 0.8,
      priority: rec.priority,
      data_points: {
        effort: rec.effort_level,
        metrics: rec.metrics_to_track
      }
    }))
  }

  private formatPatterns(patterns: any[]): AIInsight[] {
    return patterns.map((pattern, index) => ({
      id: `pattern-${index}`,
      type: 'analysis',
      category: 'productivity',
      title: pattern.title,
      description: pattern.description,
      impact: pattern.significance,
      action_items: [pattern.actionable_insight],
      confidence: pattern.confidence || 0.75,
      priority: 'medium',
      visualization: {
        type: pattern.visualization_type || 'chart',
        data: pattern.data
      }
    }))
  }

  private formatOpportunities(opportunities: any[]): AIInsight[] {
    return opportunities.map((opp, index) => ({
      id: `opp-${index}`,
      type: 'opportunity',
      category: 'growth',
      title: opp.title,
      description: opp.description,
      impact: `Potential revenue: $${opp.revenue_potential}/month`,
      action_items: opp.first_steps || [],
      confidence: opp.success_probability === 'high' ? 0.9 : opp.success_probability === 'medium' ? 0.7 : 0.5,
      priority: opp.revenue_potential > 5000 ? 'high' : 'medium',
      data_points: {
        investment: opp.investment_required,
        timeline: opp.implementation_timeline
      }
    }))
  }

  private formatWeeklySummary(summary: any): string {
    if (!summary) return 'No summary available'

    return `
# Weekly Performance Summary

## Executive Summary
${summary.executive_summary}

## Key Achievements
${summary.key_achievements?.map((a: string) => `- ${a}`).join('\n')}

## Areas Needing Attention
${summary.areas_needing_attention?.map((a: string) => `- ${a}`).join('\n')}

## Recommended Focus for Next Week
${summary.recommended_focus?.map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}

## Strategic Insight
${summary.strategic_insight}
    `.trim()
  }

  // Utility methods
  private prioritizeInsights(insights: AIInsight[]): AIInsight[] {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }

    return insights.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff
      return b.confidence - a.confidence
    }).slice(0, 20) // Return top 20 insights
  }

  private categorizeInsight(insight: any): AIInsight['category'] {
    const text = (insight.title + insight.description).toLowerCase()
    if (text.includes('revenue') || text.includes('profit') || text.includes('billing')) return 'revenue'
    if (text.includes('growth') || text.includes('expand') || text.includes('opportunity')) return 'growth'
    if (text.includes('risk') || text.includes('warning') || text.includes('issue')) return 'risk'
    if (text.includes('efficien') || text.includes('optimize') || text.includes('improve')) return 'efficiency'
    return 'productivity'
  }

  private calculatePriority(item: any): AIInsight['priority'] {
    if (item.severity === 'critical' || item.priority === 'critical') return 'critical'
    if (item.severity === 'high' || item.priority === 'high') return 'high'
    if (item.severity === 'low' || item.priority === 'low') return 'low'
    return 'medium'
  }

  private getWeekKey(date: Date): string {
    const year = date.getFullYear()
    const week = Math.ceil(((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7)
    return `${year}-W${week.toString().padStart(2, '0')}`
  }

  private findPeakHours(hourlyDistribution: Record<number, number>) {
    const sorted = Object.entries(hourlyDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
    return sorted.map(([hour]) => parseInt(hour))
  }

  private findPeakDays(dayDistribution: Record<number, number>) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const sorted = Object.entries(dayDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
    return sorted.map(([day]) => dayNames[parseInt(day)])
  }

  private calculateClientConcentration(clientMetrics: Record<string, any>) {
    const totalRevenue = Object.values(clientMetrics).reduce((sum, client) => sum + client.totalRevenue, 0)
    const topClient = Object.values(clientMetrics).sort((a, b) => b.totalRevenue - a.totalRevenue)[0]
    return topClient ? (topClient.totalRevenue / totalRevenue) * 100 : 0
  }

  private calculateUtilization(totalMinutes: number, entries: TimeEntry[]) {
    const days = new Set(entries.map(e => new Date(e.start_time).toDateString())).size
    const avgHoursPerDay = (totalMinutes / 60) / days
    const targetHours = 6 // Assuming 6 billable hours per day target
    return Math.min(100, (avgHoursPerDay / targetHours) * 100)
  }

  private estimateMonthlyRevenue(entries: TimeEntry[]) {
    const days = new Set(entries.map(e => new Date(e.start_time).toDateString())).size
    const totalRevenue = entries.reduce((sum, e) => sum + (e.amount || 0), 0)
    const dailyAverage = totalRevenue / days
    return Math.round(dailyAverage * 22) // Assuming 22 working days per month
  }

  private identifyChallenges(entries: TimeEntry[], clients: Client[], projects: Project[]) {
    const challenges = []

    // Low billable rate
    const billableRate = this.calculateBillableRate(entries)
    if (billableRate < 70) {
      challenges.push({
        issue: 'Low billable utilization',
        impact: `Only ${billableRate}% of time is billable`,
        severity: 'high'
      })
    }

    // Client concentration risk
    const concentration = this.calculateClientConcentration(this.analyzeClients(entries, clients))
    if (concentration > 40) {
      challenges.push({
        issue: 'High client concentration risk',
        impact: `${Math.round(concentration)}% of revenue from one client`,
        severity: 'medium'
      })
    }

    // Project deadline risks
    const atRiskProjects = projects.filter(p => {
      if (!p.deadline) return false
      const daysRemaining = Math.ceil((new Date(p.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return daysRemaining < 7
    })

    if (atRiskProjects.length > 0) {
      challenges.push({
        issue: 'Projects approaching deadline',
        impact: `${atRiskProjects.length} projects due within 7 days`,
        severity: 'high'
      })
    }

    return challenges
  }

  private identifyOpportunitiesFromData(entries: TimeEntry[], clients: Client[], projects: Project[]) {
    const opportunities = []

    // Underpriced services
    const channelMetrics = this.analyzeChannels(entries)
    const avgRate = this.calculateAverageRate(entries)

    Object.entries(channelMetrics).forEach(([channel, metrics]: [string, any]) => {
      if (metrics.efficiency > avgRate * 1.2 && metrics.totalMinutes > 300) {
        opportunities.push({
          type: 'rate_increase',
          channel,
          current_rate: Math.round(metrics.efficiency),
          suggested_rate: Math.round(metrics.efficiency * 1.15),
          potential_revenue: Math.round(metrics.totalRevenue * 0.15)
        })
      }
    })

    // Expansion opportunities
    const inactiveClients = clients.filter(c => {
      const lastActivity = entries.find(e => e.client_id === c.id)
      if (!lastActivity) return true
      const daysSinceActivity = Math.ceil((Date.now() - new Date(lastActivity.start_time).getTime()) / (1000 * 60 * 60 * 24))
      return daysSinceActivity > 30
    })

    if (inactiveClients.length > 0) {
      opportunities.push({
        type: 'reactivation',
        clients: inactiveClients.length,
        potential_revenue: inactiveClients.length * avgRate * 20 // 20 hours per client estimate
      })
    }

    return opportunities
  }

  private createTimeSeries(entries: TimeEntry[]) {
    const series: Record<string, { revenue: number, hours: number }> = {}

    entries.forEach(entry => {
      const date = new Date(entry.start_time).toISOString().split('T')[0]
      if (!series[date]) {
        series[date] = { revenue: 0, hours: 0 }
      }
      series[date].revenue += entry.amount || 0
      series[date].hours += (entry.duration || 0) / 60
    })

    return Object.entries(series).map(([date, data]) => ({
      date,
      ...data
    })).sort((a, b) => a.date.localeCompare(b.date))
  }

  private calculateCorrelations(entries: TimeEntry[]) {
    // Simple correlation calculations
    return {
      channelRevenue: 0.75, // Placeholder - would calculate actual correlation
      timeProductivity: 0.65,
      projectProfitability: 0.82
    }
  }

  private detectSeasonalPatterns(entries: TimeEntry[]) {
    // Group by month
    const monthly: Record<string, number> = {}

    entries.forEach(entry => {
      const month = new Date(entry.start_time).toISOString().substring(0, 7)
      monthly[month] = (monthly[month] || 0) + (entry.amount || 0)
    })

    return {
      monthly,
      trend: 'growing', // Would calculate actual trend
      seasonality: 'low' // Would detect actual seasonality
    }
  }

  private findUnderutilized(entries: TimeEntry[], clients: Client[]) {
    const underutilized: any[] = []

    // Find clients with retainers not fully used
    clients.forEach(client => {
      if (client.retainer_hours) {
        const hoursUsed = entries
          .filter(e => e.client_id === client.id)
          .reduce((sum, e) => sum + ((e.duration || 0) / 60), 0)

        if (hoursUsed < client.retainer_hours * 0.8) {
          underutilized.push({
            client: client.name,
            retainer_hours: client.retainer_hours,
            hours_used: Math.round(hoursUsed),
            unused_value: (client.retainer_hours - hoursUsed) * (client.hourly_rate || 100)
          })
        }
      }
    })

    return underutilized
  }

  private analyzeMarketOpportunities(channelMetrics: Record<string, any>) {
    const opportunities: any[] = []

    // Find high-performing channels to expand
    Object.entries(channelMetrics).forEach(([channel, metrics]) => {
      if (metrics.efficiency > 150 && metrics.totalMinutes < 1000) {
        opportunities.push({
          channel,
          efficiency: metrics.efficiency,
          current_hours: metrics.totalMinutes / 60,
          expansion_potential: 'high'
        })
      }
    })

    return opportunities
  }

  private extractHighlights(entries: TimeEntry[], clients: Client[]) {
    const recentEntries = entries.slice(0, 20)
    const highlights = []

    // Biggest wins
    const highValueEntries = recentEntries.filter(e => e.amount > 500)
    if (highValueEntries.length > 0) {
      highlights.push({
        type: 'revenue',
        description: `${highValueEntries.length} high-value sessions (>$500)`
      })
    }

    // New clients
    const uniqueClients = new Set(recentEntries.map(e => e.client_id)).size
    if (uniqueClients > 5) {
      highlights.push({
        type: 'growth',
        description: `Working with ${uniqueClients} different clients`
      })
    }

    return highlights
  }

  private calculateWeekOverWeek(entries: TimeEntry[]) {
    const thisWeek = entries.filter(e => {
      const days = Math.ceil((Date.now() - new Date(e.start_time).getTime()) / (1000 * 60 * 60 * 24))
      return days <= 7
    })

    const lastWeek = entries.filter(e => {
      const days = Math.ceil((Date.now() - new Date(e.start_time).getTime()) / (1000 * 60 * 60 * 24))
      return days > 7 && days <= 14
    })

    const thisWeekHours = thisWeek.reduce((sum, e) => sum + ((e.duration || 0) / 60), 0)
    const lastWeekHours = lastWeek.reduce((sum, e) => sum + ((e.duration || 0) / 60), 0)
    const thisWeekRevenue = thisWeek.reduce((sum, e) => sum + (e.amount || 0), 0)
    const lastWeekRevenue = lastWeek.reduce((sum, e) => sum + (e.amount || 0), 0)

    return {
      hoursChange: lastWeekHours > 0 ? ((thisWeekHours - lastWeekHours) / lastWeekHours) * 100 : 0,
      revenueChange: lastWeekRevenue > 0 ? ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100 : 0,
      productivityChange: 0 // Would calculate actual productivity change
    }
  }

  private calculateBillableRate(entries: TimeEntry[]) {
    const totalMinutes = entries.reduce((sum, e) => sum + (e.duration || 0), 0)
    const billableMinutes = entries.filter(e => e.billable).reduce((sum, e) => sum + (e.duration || 0), 0)
    return totalMinutes > 0 ? Math.round((billableMinutes / totalMinutes) * 100) : 0
  }

  private calculateAverageRate(entries: TimeEntry[]) {
    const billableEntries = entries.filter(e => e.billable && e.duration > 0)
    const totalRevenue = billableEntries.reduce((sum, e) => sum + (e.amount || 0), 0)
    const totalHours = billableEntries.reduce((sum, e) => sum + ((e.duration || 0) / 60), 0)
    return totalHours > 0 ? totalRevenue / totalHours : 0
  }

  // Fallback methods
  private getOnboardingInsights(): AIInsight[] {
    return [
      {
        id: 'onboard-1',
        type: 'recommendation',
        category: 'growth',
        title: 'Start Tracking Your Time',
        description: 'Begin capturing your work sessions to unlock AI-powered insights',
        impact: 'Foundation for all analytics and optimization',
        action_items: [
          'Track your first work session',
          'Set up your clients and projects',
          'Define your standard hourly rates'
        ],
        confidence: 1.0,
        priority: 'high'
      },
      {
        id: 'onboard-2',
        type: 'recommendation',
        category: 'productivity',
        title: 'Set Up Your Workspace',
        description: 'Configure your tracking categories for better insights',
        impact: 'Improved data quality and actionable insights',
        action_items: [
          'Create marketing channel categories',
          'Set up project templates',
          'Configure billing preferences'
        ],
        confidence: 1.0,
        priority: 'medium'
      }
    ]
  }

  private getFallbackInsights(): AIInsight[] {
    return [
      {
        id: 'fallback-1',
        type: 'analysis',
        category: 'productivity',
        title: 'Insights Temporarily Unavailable',
        description: 'We\'re processing your data. Please check back shortly.',
        impact: 'Full insights will be available soon',
        action_items: ['Refresh in a few moments'],
        confidence: 0.5,
        priority: 'low'
      }
    ]
  }
}

// Factory function to create engine instance
export function createAIInsightsEngine() {
  return new AIInsightsEngine()
}