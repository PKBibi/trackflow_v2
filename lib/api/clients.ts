import { createClient } from '@/lib/supabase/client'

export interface Client {
  id?: string
  user_id?: string
  name: string
  email?: string
  company?: string
  phone?: string
  website?: string
  
  // Address
  address?: string
  city?: string
  state?: string
  zip_code?: string
  country: string
  
  // Billing
  hourly_rate: number // in cents
  currency: string
  tax_rate: number
  
  // Retainer
  has_retainer: boolean
  retainer_hours: number
  retainer_amount: number // in cents
  retainer_start_date?: string
  retainer_end_date?: string
  retainer_auto_renew: boolean
  
  // Alerts (temporarily disabled due to schema mismatch)
  // alert_at_75_percent: boolean
  // alert_at_90_percent: boolean
  // alert_at_100_percent: boolean
  
  // Metadata
  status: 'active' | 'inactive' | 'archived'
  notes?: string
  tags?: string[]
  
  created_at?: string
  updated_at?: string
}

export interface ClientWithStats extends Client {
  current_month_hours?: number
  current_month_earnings?: number
  retainer_usage_percent?: number
  projects_count?: number
  last_activity?: string
}

class ClientsAPI {
  private supabase = createClient()

  // Create a new client
  async create(client: Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Client> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    const clientData = {
      ...client,
      user_id: user.id
    }

    const { data, error } = await this.supabase
      .from('clients')
      .insert([clientData])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create client: ${error.message}`)
    }

    return data
  }

  // Update an existing client
  async update(id: string, updates: Partial<Client>): Promise<Client> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update client: ${error.message}`)
    }

    return data
  }

  // Get all clients for the current user
  async getAll(): Promise<ClientWithStats[]> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch clients: ${error.message}`)
    }

    // Get additional stats for each client
    const clientsWithStats = await Promise.all(
      data.map(async (client) => {
        const stats = await this.getClientStats(client.id)
        return {
          ...client,
          ...stats
        }
      })
    )

    return clientsWithStats
  }

  // Get a single client by ID
  async getById(id: string): Promise<Client | null> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to fetch client: ${error.message}`)
    }

    return data || null
  }

  // Get clients with active retainers
  async getRetainerClients(): Promise<ClientWithStats[]> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .eq('has_retainer', true)
      .eq('status', 'active')
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch retainer clients: ${error.message}`)
    }

    // Get retainer usage stats
    const clientsWithStats = await Promise.all(
      data.map(async (client) => {
        const stats = await this.getRetainerStats(client.id)
        return {
          ...client,
          ...stats
        }
      })
    )

    return clientsWithStats
  }

  // Get client statistics
  private async getClientStats(clientId: string): Promise<{
    current_month_hours: number
    current_month_earnings: number
    projects_count: number
    last_activity?: string
  }> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

    // Get time entries for current month
    const { data: timeEntries } = await this.supabase
      .from('time_entries')
      .select('duration, amount, start_time')
      .eq('client_id', clientId)
      .gte('start_time', startOfMonth)
      .lte('start_time', endOfMonth)

    // Get projects count
    const { count: projectsCount } = await this.supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)

    // Get last activity
    const { data: lastEntry } = await this.supabase
      .from('time_entries')
      .select('start_time')
      .eq('client_id', clientId)
      .order('start_time', { ascending: false })
      .limit(1)
      .single()

    const totalHours = timeEntries?.reduce((sum, entry) => sum + (entry.duration || 0), 0) || 0
    const totalEarnings = timeEntries?.reduce((sum, entry) => sum + (entry.amount || 0), 0) || 0

    return {
      current_month_hours: totalHours / 60, // convert minutes to hours
      current_month_earnings: totalEarnings,
      projects_count: projectsCount || 0,
      last_activity: lastEntry?.start_time
    }
  }

  // Get retainer usage statistics
  private async getRetainerStats(clientId: string): Promise<{
    retainer_usage_percent: number
    current_month_hours: number
    current_month_earnings: number
  }> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

    // Get client retainer info
    const { data: client } = await this.supabase
      .from('clients')
      .select('retainer_hours')
      .eq('id', clientId)
      .single()

    if (!client) return { retainer_usage_percent: 0, current_month_hours: 0, current_month_earnings: 0 }

    // Get time entries for current month
    const { data: timeEntries } = await this.supabase
      .from('time_entries')
      .select('duration, amount')
      .eq('client_id', clientId)
      .gte('start_time', startOfMonth)
      .lte('start_time', endOfMonth)

    const totalMinutes = timeEntries?.reduce((sum, entry) => sum + (entry.duration || 0), 0) || 0
    const totalHours = totalMinutes / 60
    const totalEarnings = timeEntries?.reduce((sum, entry) => sum + (entry.amount || 0), 0) || 0

    const usagePercent = client.retainer_hours > 0 
      ? Math.round((totalHours / client.retainer_hours) * 100)
      : 0

    return {
      retainer_usage_percent: usagePercent,
      current_month_hours: totalHours,
      current_month_earnings: totalEarnings
    }
  }

  // Delete a client
  async delete(id: string): Promise<void> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    // Check if client has time entries or projects
    const { count: timeEntriesCount } = await this.supabase
      .from('time_entries')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', id)

    const { count: projectsCount } = await this.supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', id)

    if ((timeEntriesCount || 0) > 0 || (projectsCount || 0) > 0) {
      throw new Error('Cannot delete client with existing time entries or projects. Archive instead.')
    }

    const { error } = await this.supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      throw new Error(`Failed to delete client: ${error.message}`)
    }
  }

  // Archive a client (soft delete)
  async archive(id: string): Promise<Client> {
    return this.update(id, { status: 'archived' })
  }

  // Get clients at risk (retainer usage > threshold)
  async getClientsAtRisk(threshold: number = 90): Promise<ClientWithStats[]> {
    const retainerClients = await this.getRetainerClients()
    return retainerClients.filter(client => 
      (client.retainer_usage_percent || 0) >= threshold
    )
  }

  // Get total MRR (Monthly Recurring Revenue)
  async getTotalMRR(): Promise<number> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('clients')
      .select('retainer_amount')
      .eq('user_id', user.id)
      .eq('has_retainer', true)
      .eq('status', 'active')

    if (error) {
      throw new Error(`Failed to calculate MRR: ${error.message}`)
    }

    return data.reduce((total, client) => total + (client.retainer_amount || 0), 0)
  }
}

export const clientsAPI = new ClientsAPI()