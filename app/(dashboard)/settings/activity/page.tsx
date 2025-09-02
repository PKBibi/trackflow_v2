'use client'

import { useState, useEffect } from 'react'
import { Activity, Filter, Download, Calendar, Clock, User, FileText, DollarSign, Settings, Trash2, Plus, Edit, Eye, Search, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { toast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'

interface ActivityLog {
  id: string
  timestamp: string
  action: string
  category: 'auth' | 'time' | 'project' | 'invoice' | 'team' | 'settings' | 'api'
  description: string
  user_name: string
  user_email: string
  ip_address: string
  user_agent: string
  metadata: any
  status: 'success' | 'failed' | 'warning'
}

interface ActivityStats {
  total_activities: number
  activities_today: number
  most_active_hour: string
  most_common_action: string
  error_rate: number
}

const categoryIcons = {
  auth: User,
  time: Clock,
  project: FileText,
  invoice: DollarSign,
  team: User,
  settings: Settings,
  api: Activity
}

const categoryColors = {
  auth: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  time: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  project: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  invoice: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  team: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  settings: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  api: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
}

const actionDescriptions: { [key: string]: string } = {
  'auth.login': 'Logged in',
  'auth.logout': 'Logged out',
  'auth.password_reset': 'Reset password',
  'auth.2fa_enabled': 'Enabled 2FA',
  'auth.2fa_disabled': 'Disabled 2FA',
  'time.entry_created': 'Created time entry',
  'time.entry_updated': 'Updated time entry',
  'time.entry_deleted': 'Deleted time entry',
  'time.timer_started': 'Started timer',
  'time.timer_stopped': 'Stopped timer',
  'project.created': 'Created project',
  'project.updated': 'Updated project',
  'project.deleted': 'Deleted project',
  'project.archived': 'Archived project',
  'invoice.created': 'Created invoice',
  'invoice.sent': 'Sent invoice',
  'invoice.paid': 'Marked invoice as paid',
  'invoice.deleted': 'Deleted invoice',
  'team.member_invited': 'Invited team member',
  'team.member_removed': 'Removed team member',
  'team.role_changed': 'Changed member role',
  'settings.profile_updated': 'Updated profile',
  'settings.preferences_changed': 'Changed preferences',
  'api.key_created': 'Created API key',
  'api.key_deleted': 'Deleted API key',
  'api.request': 'API request'
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([])
  const [stats, setStats] = useState<ActivityStats>({
    total_activities: 0,
    activities_today: 0,
    most_active_hour: '',
    most_common_action: '',
    error_rate: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  })
  const supabase = createClient()

  useEffect(() => {
    loadActivityLogs()
  }, [])

  useEffect(() => {
    filterLogs()
  }, [logs, searchQuery, selectedCategory, selectedStatus, dateRange])

  const loadActivityLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load activity logs
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(500)

      if (error) throw error

      const formattedLogs = data?.map(log => ({
        ...log,
        user_name: log.user_name || 'System',
        user_email: log.user_email || 'system@trackflow.app'
      })) || []

      setLogs(formattedLogs)
      calculateStats(formattedLogs)
    } catch (error) {
      console.error('Error loading activity logs:', error)
      toast({
        title: 'Error',
        description: 'Failed to load activity logs',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (logs: ActivityLog[]) => {
    const today = new Date().toDateString()
    const todayLogs = logs.filter(log => 
      new Date(log.timestamp).toDateString() === today
    )

    // Calculate most active hour
    const hourCounts: { [hour: number]: number } = {}
    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })
    const mostActiveHour = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || '0'

    // Calculate most common action
    const actionCounts: { [action: string]: number } = {}
    logs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1
    })
    const mostCommonAction = Object.entries(actionCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || ''

    // Calculate error rate
    const errorCount = logs.filter(log => log.status === 'failed').length
    const errorRate = logs.length > 0 ? (errorCount / logs.length) * 100 : 0

    setStats({
      total_activities: logs.length,
      activities_today: todayLogs.length,
      most_active_hour: `${mostActiveHour}:00`,
      most_common_action: actionDescriptions[mostCommonAction] || mostCommonAction,
      error_rate: Math.round(errorRate * 10) / 10
    })
  }

  const filterLogs = () => {
    let filtered = [...logs]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(log =>
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user_email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(log => log.category === selectedCategory)
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(log => log.status === selectedStatus)
    }

    // Date range filter
    if (dateRange.from) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) >= dateRange.from!
      )
    }
    if (dateRange.to) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) <= dateRange.to!
      )
    }

    setFilteredLogs(filtered)
  }

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'Action', 'Category', 'Description', 'User', 'Status', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.action,
        log.category,
        log.description,
        log.user_email,
        log.status,
        log.ip_address
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()

    toast({
      title: 'Exported',
      description: `Exported ${filteredLogs.length} activity logs`
    })
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedStatus('all')
    setDateRange({ from: undefined, to: undefined })
  }

  const getActionIcon = (action: string) => {
    if (action.startsWith('time.entry_')) return Edit
    if (action.includes('created')) return Plus
    if (action.includes('deleted')) return Trash2
    if (action.includes('updated')) return Edit
    if (action.includes('viewed')) return Eye
    return Activity
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Activity Logs</h1>
        <p className="text-muted-foreground mt-2">
          Track all activities and changes in your account
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_activities.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activities_today}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.most_active_hour}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Common</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium truncate">{stats.most_common_action}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.error_rate}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>
                View and filter all account activities
              </CardDescription>
            </div>
            <Button onClick={exportLogs} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="auth">Authentication</SelectItem>
                <SelectItem value="time">Time Tracking</SelectItem>
                <SelectItem value="project">Projects</SelectItem>
                <SelectItem value="invoice">Invoices</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
                <SelectItem value="api">API</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={(range: any) => setDateRange(range || { from: undefined, to: undefined })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            
            <Button variant="ghost" onClick={clearFilters}>
              Clear
            </Button>
          </div>

          {/* Activity Table */}
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No activities found matching your filters
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.slice(0, 50).map((log) => {
                const Icon = categoryIcons[log.category] || Activity
                const ActionIcon = getActionIcon(log.action)
                
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${categoryColors[log.category]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <ActionIcon className="w-3 h-3 text-muted-foreground" />
                        <p className="font-medium text-sm">
                          {actionDescriptions[log.action] || log.action}
                        </p>
                        {log.status === 'failed' && (
                          <Badge variant="destructive" className="text-xs">
                            Failed
                          </Badge>
                        )}
                        {log.status === 'warning' && (
                          <Badge variant="outline" className="text-xs">
                            Warning
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {log.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{log.user_name}</span>
                        <span>•</span>
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                        <span>•</span>
                        <span>{log.ip_address}</span>
                      </div>
                      
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                          {JSON.stringify(log.metadata, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              
              {filteredLogs.length > 50 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Limited Results</AlertTitle>
                  <AlertDescription>
                    Showing 50 of {filteredLogs.length} results. Export to see all.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

