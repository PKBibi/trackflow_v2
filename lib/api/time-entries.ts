import { createClient } from '@/lib/supabase/client'

export interface TimeEntry {
  id?: string
  user_id?: string
  client_id: string
  project_id: string
  start_time: string
  end_time?: string
  duration?: number // in minutes
  marketing_category: string
  marketing_channel: string
  task_title: string
  task_description?: string
  // campaign_id?: string // Column doesn't exist in production DB
  // campaign_platform?: string // Column doesn't exist in production DB
  billable: boolean
  hourly_rate: number // in cents
  amount?: number // calculated amount in cents
  // status: 'running' | 'stopped' | 'invoiced' | 'paid' // Column doesn't exist in DB
  // is_timer_running: boolean // Temporarily disabled due to schema mismatch
  notes?: string
  tags?: string[]
  created_at?: string
  updated_at?: string
}

export interface TimeEntryWithDetails extends TimeEntry {
  client_name?: string
  project_name?: string
  channel_name?: string
  category_name?: string
}

class TimeEntriesAPI {
  private supabase = createClient()

  // Create a new time entry
  async create(timeEntry: Omit<TimeEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<TimeEntry> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    // Calculate duration if end_time is provided
    let duration = timeEntry.duration
    if (timeEntry.end_time && timeEntry.start_time && !duration) {
      const start = new Date(timeEntry.start_time)
      const end = new Date(timeEntry.end_time)
      duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60)) // minutes
    }

    const entryData = {
      ...timeEntry,
      user_id: user.id,
      duration
    }

    const { data, error } = await this.supabase
      .from('time_entries')
      .insert([entryData])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create time entry: ${error.message}`)
    }

    return data
  }

  // Update an existing time entry
  async update(id: string, updates: Partial<TimeEntry>): Promise<TimeEntry> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    // Calculate duration if end_time is being updated
    if (updates.end_time && !updates.duration) {
      // Get the current entry to get start_time
      const { data: currentEntry } = await this.supabase
        .from('time_entries')
        .select('start_time')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (currentEntry) {
        const start = new Date(currentEntry.start_time)
        const end = new Date(updates.end_time)
        updates.duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60))
      }
    }

    const { data, error } = await this.supabase
      .from('time_entries')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update time entry: ${error.message}`)
    }

    return data
  }

  // Get all time entries for the current user
  async getAll(filters?: {
    startDate?: string
    endDate?: string
    clientId?: string
    projectId?: string
    channel?: string
    billableOnly?: boolean
  }): Promise<TimeEntryWithDetails[]> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    let query = this.supabase
      .from('time_entries')
      .select(`
        *,
        clients:client_id (
          name
        ),
        projects:project_id (
          name
        )
      `)
      .eq('user_id', user.id)
      .order('start_time', { ascending: false })

    // Apply filters
    if (filters?.startDate) {
      query = query.gte('start_time', filters.startDate)
    }
    if (filters?.endDate) {
      query = query.lte('start_time', filters.endDate)
    }
    if (filters?.clientId) {
      query = query.eq('client_id', filters.clientId)
    }
    if (filters?.projectId) {
      query = query.eq('project_id', filters.projectId)
    }
    if (filters?.channel) {
      query = query.eq('marketing_channel', filters.channel)
    }
    if (filters?.billableOnly) {
      query = query.eq('billable', true)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch time entries: ${error.message}`)
    }

    // Transform the data to include client and project names
    return data.map((entry: any) => ({
      ...entry,
      client_name: entry.clients?.name || 'Unknown Client',
      project_name: entry.projects?.name || 'Unknown Project'
    }))
  }

  // Get time entries for today
  async getToday(): Promise<TimeEntryWithDetails[]> {
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    return this.getAll({
      startDate: today,
      endDate: tomorrow
    })
  }

  // Get time entries for current month
  async getCurrentMonth(): Promise<TimeEntryWithDetails[]> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
    
    return this.getAll({
      startDate: startOfMonth,
      endDate: endOfMonth
    })
  }

  // Get running timer (if any)
  async getRunningTimer(): Promise<TimeEntry | null> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', user.id)
      .is('end_time', null)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to get running timer: ${error.message}`)
    }

    return data || null
  }

  // Stop all running timers (safety measure)
  async stopAllRunningTimers(): Promise<void> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    const now = new Date().toISOString()

    const { error } = await this.supabase
      .from('time_entries')
      .update({
        end_time: now
      })
      .eq('user_id', user.id)
      .is('end_time', null)

    if (error) {
      throw new Error(`Failed to stop running timers: ${error.message}`)
    }
  }

  // Delete a time entry
  async delete(id: string): Promise<void> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    const { error } = await this.supabase
      .from('time_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      throw new Error(`Failed to delete time entry: ${error.message}`)
    }
  }

  // Get time summary by channel
  async getChannelSummary(startDate?: string, endDate?: string): Promise<{
    channel: string
    category: string
    total_hours: number
    total_amount: number
    entry_count: number
  }[]> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    let query = this.supabase
      .from('time_entries')
      .select('marketing_channel, marketing_category, duration, amount')
      .eq('user_id', user.id)
      .not('duration', 'is', null)

    if (startDate) {
      query = query.gte('start_time', startDate)
    }
    if (endDate) {
      query = query.lte('start_time', endDate)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to get channel summary: ${error.message}`)
    }

    // Group by channel
    const summary = data.reduce((acc: any, entry) => {
      const key = entry.marketing_channel
      if (!acc[key]) {
        acc[key] = {
          channel: entry.marketing_channel,
          category: entry.marketing_category,
          total_hours: 0,
          total_amount: 0,
          entry_count: 0
        }
      }
      
      acc[key].total_hours += (entry.duration || 0) / 60 // convert minutes to hours
      acc[key].total_amount += entry.amount || 0
      acc[key].entry_count += 1
      
      return acc
    }, {})

    return Object.values(summary)
  }
}

export const timeEntriesAPI = new TimeEntriesAPI()