import { fetchWithTeam } from '@/lib/api/fetch'
import TeamSwitcher from '@/components/team/TeamSwitcher'
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  Users, 
  Plus, 
  Search, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  Phone,
  Globe,
  Activity,
  Loader2,
  AlertCircle,
  Archive
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import dynamic from 'next/dynamic'
const ClientForm = dynamic(() => import('@/components/dashboard/client-form').then(m => m.ClientForm), { ssr: false, loading: () => <div className="h-64 bg-muted animate-pulse rounded" /> })
import { clientsAPI, ClientWithStats } from '@/lib/api/clients'

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientWithStats | undefined>()
  const [formLoading, setFormLoading] = useState(false)

  // Load clients on component mount
  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setLoading(true)
      setError(null)
      const clientsData = await clientsAPI.getAll()
      setClients(clientsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients')
      console.error('Failed to load clients:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter clients based on search
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.company && client.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Calculate totals
  const activeClients = clients.filter(c => c.status === 'active')
  const totalClients = activeClients.length
  const totalMonthlyRetainers = activeClients
    .filter(c => c.has_retainer)
    .reduce((sum, c) => sum + c.retainer_amount, 0)
  const totalEarnedThisMonth = activeClients.reduce((sum, c) => sum + (c.current_month_earnings || 0), 0)
  const clientsAtRisk = activeClients.filter(c => c.has_retainer && (c.retainer_usage_percent || 0) >= 90).length

  const handleAddClient = async (clientData: any) => {
    try {
      setFormLoading(true)
      setError(null)
      const newClient = await clientsAPI.create(clientData)
      await loadClients() // Reload all clients to get fresh stats
      setIsFormOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client')
      console.error('Failed to create client:', err)
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditClient = async (clientData: any) => {
    try {
      setFormLoading(true)
      setError(null)
      await clientsAPI.update(clientData.id, clientData)
      await loadClients() // Reload all clients to get fresh stats
      setEditingClient(undefined)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update client')
      console.error('Failed to update client:', err)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return
    }

    try {
      setError(null)
      await clientsAPI.delete(clientId)
      await loadClients()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete client')
      console.error('Failed to delete client:', err)
    }
  }

  const handleArchiveClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to archive this client?')) {
      return
    }

    try {
      setError(null)
      await clientsAPI.archive(clientId)
      await loadClients()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive client')
      console.error('Failed to archive client:', err)
    }
  }

  const getRetainerStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-amber-500'
    return 'bg-green-500'
  }

  const getRetainerStatusText = (percentage: number) => {
    if (percentage >= 100) return 'Over Budget'
    if (percentage >= 90) return 'Critical'
    if (percentage >= 75) return 'Warning'
    return 'On Track'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" role="status" aria-live="polite" aria-busy="true">
        <Loader2 className="w-8 h-8 animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading clients…</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your clients and track retainer usage
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/clients/health">
            <Button variant="outline">
              <Activity className="w-4 h-4 mr-2" />
              Health Dashboard
            </Button>
          </Link>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>
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
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Active Clients</span>
              </div>
              <span className="text-2xl font-bold">{totalClients}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">MRR</span>
              </div>
              <span className="text-2xl font-bold">${(totalMonthlyRetainers / 100).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">This Month</span>
              </div>
              <span className="text-2xl font-bold">${(totalEarnedThisMonth / 100).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium">At Risk</span>
              </div>
              <span className="text-2xl font-bold">{clientsAtRisk}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client List */}
      <div className="space-y-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Client Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{client.name}</h3>
                      {client.company && (
                        <p className="text-sm text-muted-foreground">{client.company}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                        {client.status}
                      </Badge>
                      {client.has_retainer && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Retainer
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Client Details Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Contact Info */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Contact</h4>
                      {client.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-3 h-3" />
                          <a href={`mailto:${client.email}`} className="hover:underline">
                            {client.email}
                          </a>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3" />
                          <a href={`tel:${client.phone}`} className="hover:underline">
                            {client.phone}
                          </a>
                        </div>
                      )}
                      {client.website && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="w-3 h-3" />
                          <a 
                            href={client.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            Website
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Billing Info */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Billing</h4>
                      <p className="text-sm">
                        <strong>${client.hourly_rate / 100}/hour</strong>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(client.current_month_hours || 0).toFixed(1)} hours this month
                      </p>
                      <p className="text-sm font-medium text-green-600">
                        ${((client.current_month_earnings || 0) / 100).toLocaleString()} earned
                      </p>
                    </div>

                    {/* Retainer Info */}
                    {client.has_retainer ? (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Retainer</h4>
                        <p className="text-sm">
                          <strong>{client.retainer_hours} hours/month</strong>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${(client.retainer_amount / 100).toLocaleString()} monthly
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getRetainerStatusColor(client.retainer_usage_percent || 0)}`}
                              style={{ width: `${Math.min(client.retainer_usage_percent || 0, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {client.retainer_usage_percent || 0}%
                          </span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={
                            (client.retainer_usage_percent || 0) >= 90 
                              ? 'border-red-500 text-red-700' 
                              : (client.retainer_usage_percent || 0) >= 75
                                ? 'border-amber-500 text-amber-700'
                                : 'border-green-500 text-green-700'
                          }
                        >
                          {getRetainerStatusText(client.retainer_usage_percent || 0)}
                        </Badge>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Billing</h4>
                        <p className="text-sm">Hourly billing</p>
                        <p className="text-sm text-muted-foreground">
                          No active retainer
                        </p>
                      </div>
                    )}

                    {/* Activity */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Activity</h4>
                      <p className="text-sm">
                        Projects: {client.projects_count || 0}
                      </p>
                      {client.last_activity && (
                        <p className="text-sm">
                          Last: {new Date(client.last_activity).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" aria-label="Open client actions menu">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingClient(client)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Client
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleArchiveClient(client.id!)}
                      className="text-amber-600"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archive Client
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteClient(client.id!)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Client
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredClients.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? 'No clients found' : 'No clients yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Add your first client to start tracking time and retainers'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Client
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Client Form */}
      <ClientForm
        client={editingClient}
        isOpen={isFormOpen || !!editingClient}
        onOpenChange={(open) => {
          if (!open) {
            setIsFormOpen(false)
            setEditingClient(undefined)
          }
        }}
        onSave={editingClient ? handleEditClient : handleAddClient}
        isLoading={formLoading}
      />
    </div>
  )
}

