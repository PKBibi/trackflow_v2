'use client'

import { useState, useEffect } from 'react'
import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Clock,
  Users,
  FileText,
  ChevronRight,
  PieChart,
  Loader2,
  Filter,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { reportsAPI, DashboardStats, ChannelSummary, ClientSummary, TimeDistribution, ReportFilters } from '@/lib/api/reports'
import { clientsAPI } from '@/lib/api/clients'
import { getAllChannels } from '@/lib/constants/marketing-channels'

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [channelData, setChannelData] = useState<ChannelSummary[]>([])
  const [clientData, setClientData] = useState<ClientSummary[]>([])
  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution[]>([])
  const [filters, setFilters] = useState<ReportFilters>({})
  const [clients, setClients] = useState<any[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Load initial data
  useEffect(() => {
    loadReportData()
    loadClients()
  }, [])

  // Reload data when filters change
  useEffect(() => {
    if (!loading) {
      loadReportData()
    }
  }, [filters])

  const loadClients = async () => {
    try {
      const clientsData = await clientsAPI.getAll()
      setClients(clientsData)
    } catch (err) {
      console.error('Failed to load clients:', err)
    }
  }

  const loadReportData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [statsData, channelsData, clientsData, distributionData] = await Promise.all([
        reportsAPI.getDashboardStats(filters),
        reportsAPI.getChannelSummary(filters),
        reportsAPI.getClientSummary(filters),
        reportsAPI.getTimeDistribution(filters)
      ])
      
      setStats(statsData)
      setChannelData(channelsData)
      setClientData(clientsData)
      setTimeDistribution(distributionData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report data')
      console.error('Failed to load report data:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateFilters = (newFilters: Partial<ReportFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`
  }

  const getDefaultDateRange = () => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    return {
      start: startOfMonth.toISOString().split('T')[0],
      end: endOfMonth.toISOString().split('T')[0]
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Analytics and insights for your marketing work
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
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

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Report Filters</CardTitle>
            <CardDescription>Customize your report data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate?.split('T')[0] || getDefaultDateRange().start}
                  onChange={(e) => updateFilters({ startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate?.split('T')[0] || getDefaultDateRange().end}
                  onChange={(e) => updateFilters({ endDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="client">Client</Label>
                <Select value={filters.clientId || ''} onValueChange={(value) => updateFilters({ clientId: value || undefined })}>
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
              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.total_revenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.billable_rate || 0}% billable rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Tracked</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((stats?.total_hours || 0) * 10) / 10} hrs</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats?.billable_hours || 0) * 10) / 10} billable
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hourly Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.avg_hourly_rate || 0}</div>
            <p className="text-xs text-muted-foreground">
              MRR: {formatCurrency(stats?.total_mrr || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_clients || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.active_projects || 0} active projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue by Channel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Revenue by Channel
            </CardTitle>
            <CardDescription>Where your time generates the most value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {channelData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No channel data available</p>
                  <p className="text-xs">Start tracking time to see channel breakdown</p>
                </div>
              ) : (
                channelData.slice(0, 8).map((channel, index) => {
                  const totalRevenue = stats?.total_revenue || 0
                  const percentage = totalRevenue > 0 ? ((channel.total_amount / totalRevenue) * 100).toFixed(1) : '0'
                  
                  return (
                    <div key={channel.channel} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: channel.color }}
                        />
                        <span className="text-sm">{channel.channel_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {channel.total_hours}h
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(channel.total_amount)}</p>
                        <p className="text-xs text-muted-foreground">{percentage}%</p>
                      </div>
                    </div>
                  )
                })
              )}
              {channelData.length > 8 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm">
                    View All Channels
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Time Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Time by Category
            </CardTitle>
            <CardDescription>How your time is distributed across marketing categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeDistribution.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No time distribution data</p>
                  <p className="text-xs">Start tracking time to see category breakdown</p>
                </div>
              ) : (
                timeDistribution.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">{item.label}</span>
                      <span className="text-sm font-medium">{item.hours} hrs ({item.percentage}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full" 
                        style={{ 
                          width: `${Math.min(item.percentage, 100)}%`,
                          backgroundColor: item.color
                        }} 
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Client Performance</CardTitle>
          <CardDescription>Revenue and time breakdown by client</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {clientData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No client performance data</p>
                <p className="text-xs">Start tracking time for clients to see performance metrics</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Client</th>
                    <th className="pb-3 font-medium">Hours</th>
                    <th className="pb-3 font-medium">Revenue</th>
                    <th className="pb-3 font-medium">Avg Rate</th>
                    <th className="pb-3 font-medium">Projects</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {clientData.slice(0, 10).map((client) => (
                    <tr key={client.client_id} className="hover:bg-muted/50">
                      <td className="py-3">
                        <div>
                          <p className="font-medium">{client.client_name}</p>
                          {client.company && (
                            <p className="text-xs text-muted-foreground">{client.company}</p>
                          )}
                          {client.has_retainer && (
                            <Badge variant="outline" className="text-xs mt-1">
                              Retainer
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3">{client.total_hours} hrs</td>
                      <td className="py-3 font-medium">{formatCurrency(client.total_amount)}</td>
                      <td className="py-3">${client.avg_hourly_rate}/hr</td>
                      <td className="py-3">{client.projects_count}</td>
                      <td className="py-3">
                        <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                          {client.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Reports */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Weekly Summary
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
            <CardDescription>Generated weekly on Monday</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              View Report
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Monthly Invoice
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
            <CardDescription>Ready for 3 clients</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/invoices">
              <Button className="w-full" variant="outline">
                Generate Invoices
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Performance Report
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
            <CardDescription>Campaign ROI analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              View Analysis
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
