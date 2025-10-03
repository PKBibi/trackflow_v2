import { HttpError } from '@/lib/errors'
import { fetchWithTeam } from '@/lib/api/fetch'

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

  // Alerts
  alert_at_75_percent: boolean
  alert_at_90_percent: boolean
  alert_at_100_percent: boolean

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
  private baseUrl = '/api/v1/clients'

  // Create a new client
  async create(client: Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Client> {
    const response = await fetchWithTeam(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create client')
    }

    const { data } = await response.json()
    return data
  }

  // Update an existing client
  async update(id: string, updates: Partial<Client>): Promise<Client> {
    const response = await fetchWithTeam(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update client')
    }

    const { data } = await response.json()
    return data
  }

  // Get all clients for the current user
  async getAll(): Promise<ClientWithStats[]> {
    const response = await fetchWithTeam(this.baseUrl)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch clients')
    }

    const { data } = await response.json()
    return data
  }

  // Get a single client by ID
  async getById(id: string): Promise<Client | null> {
    const response = await fetchWithTeam(`${this.baseUrl}/${id}`)

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch client')
    }

    const { data } = await response.json()
    return data
  }

  // Get clients with active retainers
  async getRetainerClients(): Promise<ClientWithStats[]> {
    const clients = await this.getAll()
    return clients.filter(c => c.has_retainer && c.status === 'active')
  }

  // Delete a client
  async delete(id: string): Promise<void> {
    const response = await fetchWithTeam(`${this.baseUrl}/${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete client')
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
    const clients = await this.getAll()
    return clients
      .filter(c => c.has_retainer && c.status === 'active')
      .reduce((total, client) => total + (client.retainer_amount || 0), 0)
  }
}

export const clientsAPI = new ClientsAPI()
