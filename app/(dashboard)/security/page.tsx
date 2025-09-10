'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Shield, AlertTriangle, Activity, Clock, Search, Filter, Download, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

interface AuditLog {
  id: string
  event_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  user_id: string
  user_email: string
  ip_address: string
  resource_type: string
  resource_id: string
  success: boolean
  error_message?: string
  timestamp: string
  metadata: any
}

interface SecurityStats {
  total_events: number
  critical_events: number
  failed_operations: number
  unique_users: number
  top_events: Array<{ event_type: string; count: number }>
}

export default function SecurityDashboard() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<SecurityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    severity: 'all',
    event_type: 'all',
    success: 'all',
    search: '',
    days: 7
  })
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const limit = 50

  const supabase = createClient()

  useEffect(() => {
    loadAuditLogs()
    loadSecurityStats()
  }, [filters, page])

  const loadAuditLogs = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      // Apply filters
      if (filters.severity !== 'all') {
        query = query.eq('severity', filters.severity)
      }
      if (filters.event_type !== 'all') {
        query = query.like('event_type', `%${filters.event_type}%`)
      }
      if (filters.success !== 'all') {
        query = query.eq('success', filters.success === 'true')
      }
      if (filters.search) {
        query = query.or(`user_email.ilike.%${filters.search}%,resource_type.ilike.%${filters.search}%`)
      }
      if (filters.days > 0) {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - filters.days)
        query = query.gte('timestamp', startDate.toISOString())
      }

      const { data, count, error } = await query

      if (error) {
        console.error('Failed to load audit logs:', error)
      } else {
        setLogs(data || [])
        setTotalCount(count || 0)
      }
    } catch (error) {
      console.error('Error loading audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSecurityStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_audit_summary', {
        p_days: filters.days
      })

      if (error) {
        console.error('Failed to load security stats:', error)
      } else if (data && data[0]) {
        setStats(data[0])
      }
    } catch (error) {
      console.error('Error loading security stats:', error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  const getEventTypeIcon = (eventType: string) => {
    if (eventType.startsWith('auth:')) return '🔐'
    if (eventType.startsWith('data:')) return '💾'
    if (eventType.startsWith('security:')) return '🛡️'
    if (eventType.startsWith('admin:')) return '👤'
    return '📋'
  }

  const exportLogs = async () => {
    const csvContent = [
      ['Timestamp', 'Event Type', 'Severity', 'User', 'IP Address', 'Resource', 'Success', 'Error Message'].join(','),
      ...logs.map(log => [
        log.timestamp,
        log.event_type,
        log.severity,
        log.user_email || 'N/A',
        log.ip_address || 'N/A',
        `${log.resource_type || ''}:${log.resource_id || ''}`,
        log.success.toString(),
        log.error_message || ''
      ].map(val => `"${val}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Security Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor security events and audit logs
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => loadAuditLogs()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportLogs} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Security Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_events.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Last {filters.days} days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                Critical Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.critical_events}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Failed Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.failed_operations}</div>
              <p className="text-xs text-muted-foreground">Errors & failures</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unique_users}</div>
              <p className="text-xs text-muted-foreground">Unique users</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Select value={filters.severity} onValueChange={(value) => setFilters({...filters, severity: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.event_type} onValueChange={(value) => setFilters({...filters, event_type: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="auth">Authentication</SelectItem>
                <SelectItem value="data">Data Operations</SelectItem>
                <SelectItem value="security">Security Events</SelectItem>
                <SelectItem value="admin">Admin Actions</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.success} onValueChange={(value) => setFilters({...filters, success: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Success</SelectItem>
                <SelectItem value="false">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.days.toString()} onValueChange={(value) => setFilters({...filters, days: parseInt(value)})}>
              <SelectTrigger>
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Audit Logs
          </CardTitle>
          <CardDescription>
            Showing {logs.length} of {totalCount} total events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No audit logs found for the selected filters
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="text-2xl">{getEventTypeIcon(log.event_type)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{log.event_type}</span>
                      <Badge variant={getSeverityColor(log.severity)}>
                        {log.severity}
                      </Badge>
                      <Badge variant={log.success ? 'default' : 'destructive'}>
                        {log.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {log.user_email && (
                        <div>User: {log.user_email}</div>
                      )}
                      {log.ip_address && (
                        <div>IP: {log.ip_address}</div>
                      )}
                      {log.resource_type && (
                        <div>Resource: {log.resource_type}/{log.resource_id}</div>
                      )}
                      {log.error_message && (
                        <div className="text-destructive">Error: {log.error_message}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalCount > limit && (
            <div className="flex items-center justify-between mt-4">
              <Button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {Math.ceil(totalCount / limit)}
              </span>
              <Button
                onClick={() => setPage(page + 1)}
                disabled={page * limit >= totalCount}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Critical Events Alert */}
      {stats && stats.critical_events > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Security Events Detected</AlertTitle>
          <AlertDescription>
            There are {stats.critical_events} critical security events in the last {filters.days} days that require immediate attention.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}