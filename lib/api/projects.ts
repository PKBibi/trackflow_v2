import { createClient } from '@/lib/supabase/client'

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
  target_audience?: string
  budget_amount?: number // in cents (matches database column name)
  start_date?: string
  end_date?: string
  
  // Project Management
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimated_hours?: number
  actual_hours?: number
  
  // Billing
  hourly_rate: number // in cents, can override client rate
  budget_alert_threshold?: number // percentage (e.g., 80 for 80%)
  is_billable: boolean
  
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
  private supabase = createClient()

  // Create a new project
  async create(project: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    const projectData = {
      ...project,
      user_id: user.id
    }

    const { data, error } = await this.supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`)
    }

    return data
  }

  // Update an existing project
  async update(id: string, updates: Partial<Project>): Promise<Project> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update project: ${error.message}`)
    }

    return data
  }

  // Get all projects with statistics
  async getAll(filters?: {
    clientId?: string
    status?: Project['status']
    priority?: Project['priority']
  }): Promise<ProjectWithStats[]> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    let query = this.supabase
      .from('projects')
      .select(`
        *,
        clients:client_id (
          name
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.clientId) {
      query = query.eq('client_id', filters.clientId)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`)
    }

    // Get statistics for each project
    const projectsWithStats = await Promise.all(
      data.map(async (project: any) => {
        const stats = await this.getProjectStats(project.id)
        const budgetUsedPercentage = project.budget_amount && stats.total_amount > 0 
          ? Math.round((stats.total_amount / project.budget_amount) * 100) 
          : undefined

        return {
          ...project,
          client_name: project.clients?.name || 'Unknown Client',
          client_company: project.clients?.name || '', // Use name as fallback until company column is available
          total_time_entries: stats.total_time_entries,
          total_hours: stats.total_hours,
          total_amount: stats.total_amount,
          budget_used_percentage: budgetUsedPercentage,
          last_activity: stats.last_activity,
          is_over_budget: budgetUsedPercentage ? budgetUsedPercentage > 100 : false
        }
      })
    )

    return projectsWithStats
  }

  // Get a single project by ID
  async getById(id: string): Promise<ProjectWithStats | null> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('projects')
      .select(`
        *,
        clients:client_id (
          name
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch project: ${error.message}`)
    }

    if (!data) return null

    const stats = await this.getProjectStats(data.id)
    const budgetUsedPercentage = data.budget_amount && stats.total_amount > 0 
      ? Math.round((stats.total_amount / data.budget_amount) * 100) 
      : undefined

    return {
      ...data,
      client_name: data.clients?.name || 'Unknown Client',
      client_company: data.clients?.name || '', // Use name as fallback until company column is available
      total_time_entries: stats.total_time_entries,
      total_hours: stats.total_hours,
      total_amount: stats.total_amount,
      budget_used_percentage: budgetUsedPercentage,
      last_activity: stats.last_activity,
      is_over_budget: budgetUsedPercentage ? budgetUsedPercentage > 100 : false
    }
  }

  // Get projects for a specific client
  async getByClientId(clientId: string): Promise<ProjectWithStats[]> {
    return this.getAll({ clientId })
  }

  // Delete a project (only if no time entries)
  async delete(id: string): Promise<void> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    // Check if project has time entries
    const { count: timeEntriesCount } = await this.supabase
      .from('time_entries')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', id)

    if ((timeEntriesCount || 0) > 0) {
      throw new Error('Cannot delete project with existing time entries. Change status to cancelled instead.')
    }

    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`)
    }
  }

  // Archive a project (set to completed)
  async archive(id: string): Promise<Project> {
    return this.update(id, { status: 'completed' })
  }

  // Get project statistics
  private async getProjectStats(projectId: string): Promise<{
    total_time_entries: number
    total_hours: number
    total_amount: number
    last_activity?: string
  }> {
    // Get time entries for this project
    const { data: timeEntries } = await this.supabase
      .from('time_entries')
      .select('duration, amount, start_time')
      .eq('project_id', projectId)

    // Get last activity
    const { data: lastEntry } = await this.supabase
      .from('time_entries')
      .select('start_time')
      .eq('project_id', projectId)
      .order('start_time', { ascending: false })
      .limit(1)
      .single()

    const totalHours = timeEntries?.reduce((sum, entry) => sum + (entry.duration || 0), 0) || 0
    const totalAmount = timeEntries?.reduce((sum, entry) => sum + (entry.amount || 0), 0) || 0

    return {
      total_time_entries: timeEntries?.length || 0,
      total_hours: totalHours / 60, // convert minutes to hours
      total_amount: totalAmount,
      last_activity: lastEntry?.start_time
    }
  }

  // Get project summary statistics
  async getProjectSummary(): Promise<ProjectSummary> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    const { data: projects, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      throw new Error(`Failed to get project summary: ${error.message}`)
    }

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

    // Get projects with time tracking data to calculate over-budget count
    const projectsWithStats = await this.getAll()
    const projectsOverBudget = projectsWithStats.filter(p => p.is_over_budget).length

    // Calculate completion rate (projects with some work done)
    const projectsWithWork = projectsWithStats.filter(p => p.total_hours > 0).length
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
      project.budget_amount_used_percentage && project.budget_amount_used_percentage >= threshold
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