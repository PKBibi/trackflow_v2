'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  FolderPlus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Archive,
  Trash2,
  Calendar,
  DollarSign,
  Clock,
  AlertTriangle,
  TrendingUp,
  Loader2,
  AlertCircle,
  Folder,
  Target,
  Flag,
  Eye
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import dynamic from 'next/dynamic'
const ProjectForm = dynamic(() => import('@/components/dashboard/project-form').then(m => m.ProjectForm), { ssr: false, loading: () => <div className="h-64 bg-muted animate-pulse rounded" /> })
import { projectsAPI, ProjectWithStats, ProjectSummary, Project } from '@/lib/api/projects'
import { clientsAPI } from '@/lib/api/clients'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<ProjectSummary | null>(null)
  const [clients, setClients] = useState<any[]>([])
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectWithStats | undefined>()
  const [formLoading, setFormLoading] = useState(false)
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [clientFilter, setClientFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  // Load data on component mount
  useEffect(() => {
    loadProjectData()
    loadClients()
  }, [])

  const loadProjectData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [projectsData, summaryData] = await Promise.all([
        projectsAPI.getAll({
          status: statusFilter as any,
          priority: priorityFilter as any
        }),
        projectsAPI.getProjectSummary()
      ])
      
      setProjects(projectsData)
      setSummary(summaryData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project data')
      console.error('Failed to load project data:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadClients = async () => {
    try {
      const clientsData = await clientsAPI.getAll()
      setClients(clientsData.filter(c => c.status === 'active'))
    } catch (err) {
      console.error('Failed to load clients:', err)
    }
  }

  // Reload data when filters change
  useEffect(() => {
    if (!loading) {
      loadProjectData()
    }
  }, [statusFilter, priorityFilter])

  const handleCreateProject = async (projectData: Project) => {
    try {
      setFormLoading(true)
      setError(null)
      await projectsAPI.create(projectData)
      await loadProjectData()
      setIsFormOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditProject = async (projectData: Project) => {
    try {
      setFormLoading(true)
      setError(null)
      await projectsAPI.update(projectData.id!, projectData)
      await loadProjectData()
      setEditingProject(undefined)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project')
    } finally {
      setFormLoading(false)
    }
  }

  const handleArchiveProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to archive this project?')) {
      return
    }

    try {
      setError(null)
      await projectsAPI.archive(projectId)
      await loadProjectData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive project')
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    try {
      setError(null)
      await projectsAPI.delete(projectId)
      await loadProjectData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project')
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('')
    setClientFilter('')
    setPriorityFilter('')
  }

  // Filter projects based on search and filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      project.client_name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesClient = !clientFilter || project.client_id === clientFilter
    
    return matchesSearch && matchesClient
  })

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'planning': return 'bg-purple-100 text-purple-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-orange-600'
      case 'urgent': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`
  }

  const formatDate = (dateString?: string) => {
    return dateString ? new Date(dateString).toLocaleDateString() : 'Not set'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" role="status" aria-live="polite" aria-busy="true">
        <Loader2 className="w-8 h-8 animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading projects…</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage marketing campaigns and client projects
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <FolderPlus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setError(null)}
            className="ml-auto"
          >
            ×
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Total Projects</span>
              </div>
              <span className="text-2xl font-bold">{summary?.total_projects || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Active</span>
              </div>
              <span className="text-2xl font-bold">{summary?.active_projects || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Total Value</span>
              </div>
              <span className="text-2xl font-bold">{formatCurrency(summary?.total_project_value || 0)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium">Over Budget</span>
              </div>
              <span className="text-2xl font-bold">{summary?.projects_over_budget || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            {(statusFilter || clientFilter || priorityFilter) && (
              <Button variant="ghost" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Client</label>
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All clients</SelectItem>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Folder className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? 'No projects found' : 'No projects yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms or filters'
                  : 'Create your first project to start tracking campaigns and work'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsFormOpen(true)}>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Create Your First Project
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Project Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">{project.client_name}</p>
                        {project.description && (
                          <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                        <Flag className={`w-3 h-3 ${getPriorityColor(project.priority)}`} />
                        {project.is_over_budget && (
                          <Badge variant="destructive">Over Budget</Badge>
                        )}
                      </div>
                    </div>

                    {/* Project Details Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      {/* Timeline */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Timeline</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(project.start_date)}</span>
                        </div>
                        {project.end_date && (
                          <div className="text-sm text-muted-foreground">
                            End: {formatDate(project.end_date)}
                          </div>
                        )}
                      </div>

                      {/* Budget & Hours */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Budget & Time</h4>
                        {project.budget_amount && (
                          <div className="text-sm">
                            <strong>{formatCurrency(project.budget_amount)}</strong>
                            {project.budget_used_percentage && (
                              <span className="text-muted-foreground ml-2">
                                ({project.budget_used_percentage}% used)
                              </span>
                            )}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          {project.total_hours.toFixed(1)}h tracked
                          {project.estimated_hours && ` / ${project.estimated_hours}h est`}
                        </div>
                      </div>


                      {/* Performance */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Performance</h4>
                        <p className="text-sm font-medium text-green-600">
                          {formatCurrency(project.total_amount)} earned
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {project.total_time_entries} time entries
                        </p>
                        {project.last_activity && (
                          <p className="text-sm text-muted-foreground">
                            Last: {formatDate(project.last_activity)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Budget Progress Bar */}
                    {project.budget_amount && project.budget_used_percentage !== undefined && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Budget Usage</span>
                          <span className="text-sm font-medium">{project.budget_used_percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              project.budget_used_percentage >= 100 
                                ? 'bg-red-500' 
                                : project.budget_used_percentage >= 80 
                                  ? 'bg-yellow-500' 
                                  : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(project.budget_used_percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" aria-label="Open project actions menu">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingProject(project)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Project
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleArchiveProject(project.id!)}>
                        <Archive className="w-4 h-4 mr-2" />
                        Archive Project
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteProject(project.id!)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Project Form */}
      <ProjectForm
        project={editingProject}
        isOpen={isFormOpen || !!editingProject}
        onOpenChange={(open) => {
          if (!open) {
            setIsFormOpen(false)
            setEditingProject(undefined)
          }
        }}
        onSave={editingProject ? handleEditProject : handleCreateProject}
        isLoading={formLoading}
      />
    </div>
  )
}
