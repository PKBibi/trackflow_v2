import { log } from '@/lib/logger';
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  FolderPlus, 
  Target, 
  DollarSign, 
  Calendar, 
  AlertCircle,
  User,
  Flag
} from 'lucide-react'
import { projectsAPI, Project } from '@/lib/api/projects'
import { clientsAPI } from '@/lib/api/clients'

interface ProjectFormProps {
  project?: Project
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSave: (project: Project) => void
  isLoading?: boolean
  selectedClientId?: string
}

const defaultProject: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  client_id: '',
  name: '',
  description: '',
  budget_amount: 0,
  start_date: '',
  end_date: '',
  status: 'active',
  priority: 'medium',
  estimated_hours: 0,
  hourly_rate: 15000, // $150/hour
  // optional fields removed or renamed to match Project type
  tags: [],
  notes: ''
}

const campaignObjectives = [
  'Brand Awareness',
  'Lead Generation', 
  'Sales Conversion',
  'Website Traffic',
  'Engagement',
  'App Downloads',
  'Video Views',
  'Retargeting',
  'Customer Retention',
  'Market Research'
]

const campaignPlatforms = [
  'Google Ads',
  'Facebook Ads',
  'Instagram Ads',
  'LinkedIn Ads',
  'Twitter Ads',
  'TikTok Ads',
  'YouTube Ads',
  'Pinterest Ads',
  'Snapchat Ads',
  'Microsoft Ads',
  'Amazon Ads',
  'Email Marketing',
  'SEO',
  'Content Marketing',
  'Influencer Marketing',
  'Affiliate Marketing',
  'Direct Mail',
  'Print Advertising',
  'Radio/Podcast',
  'TV/Streaming'
]

export function ProjectForm({ project, isOpen, onOpenChange, onSave, isLoading, selectedClientId }: ProjectFormProps) {
  const [formData, setFormData] = useState<typeof defaultProject>(project ? { ...project } : { ...defaultProject, client_id: selectedClientId || '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [clients, setClients] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      loadClients()
      if (project) {
        setFormData({ ...project })
      } else {
        setFormData({ ...defaultProject, client_id: selectedClientId || '' })
      }
      setErrors({})
    }
  }, [isOpen, project, selectedClientId])

  const loadClients = async () => {
    try {
      const clientsData = await clientsAPI.getAll()
      setClients(clientsData.filter(c => c.status === 'active'))
    } catch (err) {
      log.error('Failed to load clients:', err)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.client_id) {
      newErrors.client_id = 'Client is required'
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required'
    }
    if (formData.hourly_rate && formData.hourly_rate <= 0) {
      newErrors.hourly_rate = 'Hourly rate must be greater than 0'
    }
    if (formData.budget_amount && formData.budget_amount < 0) {
      newErrors.budget_amount = 'Budget cannot be negative'
    }
    if (formData.estimated_hours && formData.estimated_hours < 0) {
      newErrors.estimated_hours = 'Estimated hours cannot be negative'
    }
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = 'End date must be after start date'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData as Project)
    }
  }

  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getSelectedClient = () => {
    return clients.find(c => c.id === formData.client_id)
  }

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    updateField('client_id', clientId)
    // Auto-populate hourly rate from client if available
    if (client && client.hourly_rate) {
      updateField('hourly_rate', client.hourly_rate)
    }
  }

  const selectedClient = getSelectedClient()

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5" />
            {project ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
          <DialogDescription>
            {project 
              ? 'Update project details and campaign settings' 
              : 'Create a new project with campaign tracking and budget management'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client">Client *</Label>
                  <Select 
                    value={formData.client_id} 
                    onValueChange={handleClientChange}
                  >
                    <SelectTrigger className={errors.client_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Choose a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                          {client.company && ` (${client.company})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.client_id && (
                    <p className="text-sm text-red-500 mt-1">{errors.client_id}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                    placeholder="e.g., Q1 Brand Awareness Campaign"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe the project objectives and key deliverables..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => updateField('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => updateField('priority', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <Flag className="w-3 h-3 text-green-500" />
                          Low
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <Flag className="w-3 h-3 text-yellow-500" />
                          Medium
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <Flag className="w-3 h-3 text-orange-500" />
                          High
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <div className="flex items-center gap-2">
                          <Flag className="w-3 h-3 text-red-500" />
                          Urgent
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Budget & Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Budget & Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="budget">Project Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget_amount ? formData.budget_amount / 100 : ''}
                    onChange={(e) => updateField('budget_amount', e.target.value ? Math.round(parseFloat(e.target.value) * 100) : 0)}
                    className={errors.budget_amount ? 'border-red-500' : ''}
                    placeholder="0.00"
                  />
                  {errors.budget_amount && (
                    <p className="text-sm text-red-500 mt-1">{errors.budget_amount}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="hourly_rate">Hourly Rate *</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    value={formData.hourly_rate ? formData.hourly_rate / 100 : ''}
                    onChange={(e) => updateField('hourly_rate', Math.round(parseFloat(e.target.value || '0') * 100))}
                    className={errors.hourly_rate ? 'border-red-500' : ''}
                  />
                  {selectedClient && selectedClient.hourly_rate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Client rate: ${selectedClient.hourly_rate / 100}/hr
                    </p>
                  )}
                  {errors.hourly_rate && (
                    <p className="text-sm text-red-500 mt-1">{errors.hourly_rate}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="estimated_hours">Estimated Hours</Label>
                  <Input
                    id="estimated_hours"
                    type="number"
                    value={formData.estimated_hours || ''}
                    onChange={(e) => updateField('estimated_hours', e.target.value ? parseFloat(e.target.value) : 0)}
                    className={errors.estimated_hours ? 'border-red-500' : ''}
                    placeholder="0"
                  />
                  {errors.estimated_hours && (
                    <p className="text-sm text-red-500 mt-1">{errors.estimated_hours}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => updateField('start_date', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => updateField('end_date', e.target.value)}
                    className={errors.end_date ? 'border-red-500' : ''}
                  />
                  {errors.end_date && (
                    <p className="text-sm text-red-500 mt-1">{errors.end_date}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="budget_alert">Budget Alert (%)</Label>
                  <Input
                    id="budget_alert"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.budget_alert_threshold || ''}
                    onChange={(e) => updateField('budget_alert_threshold', e.target.value ? parseInt(e.target.value) : 80)}
                    placeholder="80"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Alert when budget usage reaches this percentage
                  </p>
                </div>
              </div>

              {/* Budget calculation preview */}
              {formData.budget_amount && formData.estimated_hours && formData.hourly_rate && (
                <div className="bg-blue-50 p-4 rounded-lg border">
                  <p className="text-sm font-medium mb-2">Budget Analysis</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Estimated Cost:</span>
                      <p className="font-semibold">
                        ${((formData.estimated_hours * formData.hourly_rate) / 100).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Budget:</span>
                      <p className="font-semibold">${(formData.budget_amount / 100).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Margin:</span>
                      <p className={`font-semibold ${
                        formData.budget_amount >= (formData.estimated_hours * formData.hourly_rate) 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        ${((formData.budget_amount - (formData.estimated_hours * formData.hourly_rate)) / 100).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Project Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Internal notes, special requirements, or additional context..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
