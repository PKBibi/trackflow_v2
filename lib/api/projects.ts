import { fetchWithTeam } from '@/lib/api/fetch'

export interface Project {
  id?: string
  user_id?: string
  client_id: string
  name: string
  description?: string

  // Marketing Campaign Details
  campaign_id?: string
  campaign_platform?: string
  campaign_objective?: string
  budget_amount?: number // in cents (matches database column name)
  budget_alert_threshold?: number // percentage for budget alerts
  start_date?: string
  end_date?: string

  // Project Management
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimated_hours?: number
  actual_hours?: number

  // Billing
  hourly_rate?: number // in cents, can override client rate
  billable?: boolean

  // Metadata
  tags?: string[]
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface ProjectWithStats extends Project {
  client_name: string
  client_company?: string
  total_time_entries: number
  total_hours: number
  total_amount: number
  budget_used_percentage?: number
  last_activity?: string
  is_over_budget: boolean
}

export interface ProjectSummary {
  total_projects: number
  active_projects: number
  completed_projects: number
  projects_over_budget: number
  total_project_value: number
  avg_project_completion_rate: number
}

class ProjectsAPI {
  private baseUrl = '/api/v1/projects'

  // Create a new project
  async create(project: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const response = await fetchWithTeam(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create project')
    }

    const { data } = await response.json()
    return data
  }

  // Update an existing project
  async update(id: string, updates: Partial<Project>): Promise<Project> {
    const response = await fetchWithTeam(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update project')
    }

    const { data } = await response.json()
    return data
  }

  // Get all projects with statistics
  async getAll(filters?: {
    clientId?: string
    status?: Project['status']
    priority?: Project['priority']
  }): Promise<ProjectWithStats[]> {
    const params = new URLSearchParams()
    if (filters?.clientId) params.append('client_id', filters.clientId)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.priority) params.append('priority', filters.priority)

    const url = params.toString() ? `${this.baseUrl}?${params}` : this.baseUrl
    const response = await fetchWithTeam(url)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch projects')
    }

    const { data } = await response.json()
    return data
  }

  // Get a single project by ID
  async getById(id: string): Promise<ProjectWithStats | null> {
    const response = await fetchWithTeam(`${this.baseUrl}/${id}`)

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch project')
    }

    const { data } = await response.json()
    return data
  }

  // Get projects for a specific client
  async getByClientId(clientId: string): Promise<ProjectWithStats[]> {
    return this.getAll({ clientId })
  }

  // Delete a project (only if no time entries)
  async delete(id: string): Promise<void> {
    const response = await fetchWithTeam(`${this.baseUrl}/${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete project')
    }
  }

  // Archive a project (set to completed)
  async archive(id: string): Promise<Project> {
    return this.update(id, { status: 'completed' })
  }

  // Get project summary statistics
  async getProjectSummary(): Promise<ProjectSummary> {
    const projects = await this.getAll()

    if (!projects || projects.length === 0) {
      return {
        total_projects: 0,
        active_projects: 0,
        completed_projects: 0,
        projects_over_budget: 0,
        total_project_value: 0,
        avg_project_completion_rate: 0
      }
    }

    const totalProjects = projects.length
    const activeProjects = projects.filter(p => p.status === 'active').length
    const completedProjects = projects.filter(p => p.status === 'completed').length
    const totalProjectValue = projects.reduce((sum, p) => sum + (p.budget_amount || 0), 0)
    const projectsOverBudget = projects.filter(p => p.is_over_budget).length

    // Calculate completion rate (projects with some work done)
    const projectsWithWork = projects.filter(p => p.total_hours > 0).length
    const avgCompletionRate = totalProjects > 0
      ? Math.round((projectsWithWork / totalProjects) * 100)
      : 0

    return {
      total_projects: totalProjects,
      active_projects: activeProjects,
      completed_projects: completedProjects,
      projects_over_budget: projectsOverBudget,
      total_project_value: totalProjectValue,
      avg_project_completion_rate: avgCompletionRate
    }
  }

  // Get projects that are over budget or approaching budget limit
  async getProjectsAtRisk(threshold: number = 80): Promise<ProjectWithStats[]> {
    const projects = await this.getAll({ status: 'active' })
    return projects.filter(project =>
      project.budget_used_percentage && project.budget_used_percentage >= threshold
    )
  }

  // Get projects with no recent activity (for follow-up)
  async getInactiveProjects(daysSinceLastActivity: number = 7): Promise<ProjectWithStats[]> {
    const projects = await this.getAll({ status: 'active' })
    const cutoffDate = new Date(Date.now() - daysSinceLastActivity * 24 * 60 * 60 * 1000)

    return projects.filter(project => {
      if (!project.last_activity) return true // No activity at all
      const lastActivity = new Date(project.last_activity)
      return lastActivity < cutoffDate
    })
  }
}

export const projectsAPI = new ProjectsAPI()
