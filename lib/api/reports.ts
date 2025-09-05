import { createClient } from '@/lib/supabase/client'
import { getAllChannels } from '@/lib/constants/marketing-channels'

export interface ReportFilters {
  startDate?: string
  endDate?: string
  clientId?: string
  projectId?: string
  channel?: string
  category?: string
}

export interface ChannelSummary {
  channel: string
  category: string
  channel_name: string
  category_name: string
  total_hours: number
  total_amount: number
  entry_count: number
  billable_hours: number
  billable_amount: number
  avg_hourly_rate: number
  color: string
}

export interface ClientSummary {
  client_id: string
  client_name: string
  company: string
  total_hours: number
  total_amount: number
  billable_amount: number
  avg_hourly_rate: number
  has_retainer: boolean
  retainer_amount: number
  projects_count: number
  status: string
}

export interface TimeDistribution {
  label: string
  hours: number
  percentage: number
  amount: number
  color: string
}

export interface DashboardStats {
  total_revenue: number
  total_hours: number
  billable_hours: number
  billable_rate: number
  avg_hourly_rate: number
  active_clients: number
  active_projects: number
  total_mrr: number
}

class ReportsAPI {
  private supabase = createClient()

  // Get dashboard overview stats
  async getDashboardStats(filters?: ReportFilters): Promise<DashboardStats> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    // Default to current month if no filters
    const now = new Date()
    const startDate = filters?.startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const endDate = filters?.endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

    // Get time entries for the period
    let query = this.supabase
      .from('time_entries')
      .select('duration, amount, billable, hourly_rate')
      .eq('user_id', user.id)
      .gte('start_time', startDate)
      .lte('start_time', endDate)
      .not('duration', 'is', null)

    const { data: timeEntries, error } = await query

    if (error) {
      throw new Error(`Failed to get stats: ${error.message}`)
    }

    // Get client counts
    const { count: activeClients } = await this.supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'active')

    // Get project counts
    const { count: activeProjects } = await this.supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'active')

    // Get MRR from retainer clients
    const { data: retainerClients } = await this.supabase
      .from('clients')
      .select('retainer_amount')
      .eq('user_id', user.id)
      .eq('has_retainer', true)
      .eq('status', 'active')

    const totalMRR = retainerClients?.reduce((sum, client) => sum + (client.retainer_amount || 0), 0) || 0

    // Calculate stats from time entries
    const totalHours = timeEntries?.reduce((sum, entry) => sum + (entry.duration || 0), 0) || 0
    const totalRevenue = timeEntries?.reduce((sum, entry) => sum + (entry.amount || 0), 0) || 0
    const billableEntries = timeEntries?.filter(entry => entry.billable) || []
    const billableHours = billableEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0)
    const billableAmount = billableEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0)

    const billableRate = totalHours > 0 ? (billableHours / totalHours) * 100 : 0
    const avgHourlyRate = billableHours > 0 ? (billableAmount / (billableHours / 60)) : 0

    return {
      total_revenue: totalRevenue,
      total_hours: totalHours / 60, // convert to hours
      billable_hours: billableHours / 60,
      billable_rate: Math.round(billableRate),
      avg_hourly_rate: Math.round(avgHourlyRate),
      active_clients: activeClients || 0,
      active_projects: activeProjects || 0,
      total_mrr: totalMRR
    }
  }

  // Get revenue and time breakdown by marketing channel
  async getChannelSummary(filters?: ReportFilters): Promise<ChannelSummary[]> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    // Default to current month if no filters
    const now = new Date()
    const startDate = filters?.startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const endDate = filters?.endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

    let query = this.supabase
      .from('time_entries')
      .select('marketing_channel, marketing_category, duration, amount, billable, hourly_rate')
      .eq('user_id', user.id)
      .gte('start_time', startDate)
      .lte('start_time', endDate)
      .not('duration', 'is', null)

    // Apply filters
    if (filters?.clientId) {
      query = query.eq('client_id', filters.clientId)
    }
    if (filters?.projectId) {
      query = query.eq('project_id', filters.projectId)
    }
    if (filters?.channel) {
      query = query.eq('marketing_channel', filters.channel)
    }
    if (filters?.category) {
      query = query.eq('marketing_category', filters.category)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to get channel summary: ${error.message}`)
    }

    // Group by channel and calculate stats
    const channelMap = new Map<string, {
      category: string
      total_hours: number
      total_amount: number
      billable_hours: number
      billable_amount: number
      entry_count: number
    }>()

    data.forEach(entry => {
      const channel = entry.marketing_channel
      const existing = channelMap.get(channel) || {
        category: entry.marketing_category,
        total_hours: 0,
        total_amount: 0,
        billable_hours: 0,
        billable_amount: 0,
        entry_count: 0
      }

      existing.total_hours += (entry.duration || 0) / 60 // convert to hours
      existing.total_amount += entry.amount || 0
      existing.entry_count += 1

      if (entry.billable) {
        existing.billable_hours += (entry.duration || 0) / 60
        existing.billable_amount += entry.amount || 0
      }

      channelMap.set(channel, existing)
    })

    // Convert to array and enrich with channel metadata
    const results: ChannelSummary[] = Array.from(channelMap.entries()).map(([channel, stats]) => {
      const channelInfo = getAllChannels().find(c => c.id === channel) || {
        name: channel,
        category: stats.category,
        color: '#6b7280'
      }

      const avgHourlyRate = stats.billable_hours > 0 ? stats.billable_amount / stats.billable_hours : 0

      return {
        channel,
        category: stats.category,
        channel_name: channelInfo.name,
        category_name: channelInfo.category,
        total_hours: Math.round(stats.total_hours * 10) / 10,
        total_amount: stats.total_amount,
        billable_hours: Math.round(stats.billable_hours * 10) / 10,
        billable_amount: stats.billable_amount,
        entry_count: stats.entry_count,
        avg_hourly_rate: Math.round(avgHourlyRate),
        color: channelInfo.color
      }
    })

    // Sort by total amount descending
    return results.sort((a, b) => b.total_amount - a.total_amount)
  }

  // Get client performance summary
  async getClientSummary(filters?: ReportFilters): Promise<ClientSummary[]> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    // Default to current month if no filters
    const now = new Date()
    const startDate = filters?.startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const endDate = filters?.endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

    let query = this.supabase
      .from('time_entries')
      .select(`
        client_id,
        duration,
        amount,
        billable,
        clients:client_id (
          name,
          company,
          has_retainer,
          retainer_amount,
          status
        )
      `)
      .eq('user_id', user.id)
      .gte('start_time', startDate)
      .lte('start_time', endDate)
      .not('duration', 'is', null)

    if (filters?.clientId) {
      query = query.eq('client_id', filters.clientId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to get client summary: ${error.message}`)
    }

    // Group by client
    const clientMap = new Map<string, {
      client_name: string
      company: string
      has_retainer: boolean
      retainer_amount: number
      status: string
      total_hours: number
      total_amount: number
      billable_amount: number
      projects_count: number
    }>()

    data.forEach((entry: any) => {
      const clientId = entry.client_id
      const client = entry.clients
      if (!client) return

      const existing = clientMap.get(clientId) || {
        client_name: client.name,
        company: client.company || '',
        has_retainer: client.has_retainer,
        retainer_amount: client.retainer_amount || 0,
        status: client.status,
        total_hours: 0,
        total_amount: 0,
        billable_amount: 0,
        projects_count: 0
      }

      existing.total_hours += (entry.duration || 0) / 60
      existing.total_amount += entry.amount || 0

      if (entry.billable) {
        existing.billable_amount += entry.amount || 0
      }

      clientMap.set(clientId, existing)
    })

    // Get project counts for each client
    const clientIds = Array.from(clientMap.keys())
    if (clientIds.length > 0) {
      const { data: projectCounts } = await this.supabase
        .from('projects')
        .select('client_id')
        .eq('user_id', user.id)
        .in('client_id', clientIds)

      const projectCountMap = new Map<string, number>()
      projectCounts?.forEach(project => {
        const count = projectCountMap.get(project.client_id) || 0
        projectCountMap.set(project.client_id, count + 1)
      })

      // Update project counts
      clientMap.forEach((client, clientId) => {
        client.projects_count = projectCountMap.get(clientId) || 0
      })
    }

    // Convert to array and calculate averages
    const results: ClientSummary[] = Array.from(clientMap.entries()).map(([clientId, client]) => {
      const avgHourlyRate = client.total_hours > 0 ? client.billable_amount / client.total_hours : 0

      return {
        client_id: clientId,
        client_name: client.client_name,
        company: client.company,
        total_hours: Math.round(client.total_hours * 10) / 10,
        total_amount: client.total_amount,
        billable_amount: client.billable_amount,
        avg_hourly_rate: Math.round(avgHourlyRate),
        has_retainer: client.has_retainer,
        retainer_amount: client.retainer_amount,
        projects_count: client.projects_count,
        status: client.status
      }
    })

    return results.sort((a, b) => b.total_amount - a.total_amount)
  }

  // Get time distribution (billable vs non-billable, different types)
  async getTimeDistribution(filters?: ReportFilters): Promise<TimeDistribution[]> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    // Default to current month if no filters
    const now = new Date()
    const startDate = filters?.startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const endDate = filters?.endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

    const { data, error } = await this.supabase
      .from('time_entries')
      .select('marketing_category, duration, amount, billable')
      .eq('user_id', user.id)
      .gte('start_time', startDate)
      .lte('start_time', endDate)
      .not('duration', 'is', null)

    if (error) {
      throw new Error(`Failed to get time distribution: ${error.message}`)
    }

    // Group by category
    const categoryMap = new Map<string, { hours: number; amount: number }>()
    let totalHours = 0

    data.forEach(entry => {
      const category = entry.marketing_category
      const hours = (entry.duration || 0) / 60
      totalHours += hours

      const existing = categoryMap.get(category) || { hours: 0, amount: 0 }
      existing.hours += hours
      existing.amount += entry.amount || 0
      categoryMap.set(category, existing)
    })

    // Convert to distribution array with colors
    const categoryColors: Record<string, string> = {
      'paid-advertising': '#3b82f6', // blue
      'seo-content': '#10b981', // green  
      'social-media': '#8b5cf6', // purple
      'email-marketing': '#f59e0b', // amber
      'analytics-tools': '#ef4444', // red
      'client-communication': '#6b7280' // gray
    }

    const results: TimeDistribution[] = Array.from(categoryMap.entries()).map(([category, stats]) => {
      const percentage = totalHours > 0 ? (stats.hours / totalHours) * 100 : 0
      
      return {
        label: category.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        hours: Math.round(stats.hours * 10) / 10,
        percentage: Math.round(percentage),
        amount: stats.amount,
        color: categoryColors[category] || '#6b7280'
      }
    })

    return results.sort((a, b) => b.hours - a.hours)
  }
}

export const reportsAPI = new ReportsAPI()