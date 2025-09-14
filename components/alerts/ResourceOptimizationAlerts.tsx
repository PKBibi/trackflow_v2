'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  DollarSign,
  TrendingDown,
  Users,
  Zap,
  X,
  RefreshCw,
  Bell,
  CheckCircle,
  Target,
  Activity
} from 'lucide-react'

interface AlertData {
  id: string
  type: 'utilization' | 'capacity' | 'pricing' | 'client_risk' | 'efficiency'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  value: number
  threshold: number
  suggestion: string
  channel?: string
  client_name?: string
  created_at: string
}

interface AlertSummary {
  total_alerts: number
  critical: number
  high: number
  medium: number
  low: number
  categories: {
    utilization: number
    capacity: number
    pricing: number
    client_risk: number
    efficiency: number
  }
}

function getAlertIcon(type: string) {
  switch (type) {
    case 'utilization': return <Activity className="h-4 w-4" />
    case 'capacity': return <Clock className="h-4 w-4" />
    case 'pricing': return <DollarSign className="h-4 w-4" />
    case 'client_risk': return <Users className="h-4 w-4" />
    case 'efficiency': return <Target className="h-4 w-4" />
    default: return <AlertCircle className="h-4 w-4" />
  }
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'critical': return 'text-red-600 bg-red-50 border-red-200'
    case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />
    case 'high': return <AlertCircle className="h-4 w-4 text-orange-600" />
    case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-600" />
    case 'low': return <AlertCircle className="h-4 w-4 text-blue-600" />
    default: return <AlertCircle className="h-4 w-4 text-gray-600" />
  }
}

interface ResourceOptimizationAlertsProps {
  compact?: boolean
  showHeader?: boolean
  maxAlerts?: number
}

export default function ResourceOptimizationAlerts({ 
  compact = false, 
  showHeader = true, 
  maxAlerts = 10 
}: ResourceOptimizationAlertsProps) {
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [summary, setSummary] = useState<AlertSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/alerts/resource-optimization')
      if (!response.ok) {
        throw new Error('Failed to fetch resource optimization alerts')
      }
      
      const data = await response.json()
      setAlerts(data.alerts)
      setSummary(data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]))
  }

  const visibleAlerts = alerts
    .filter(alert => !dismissedAlerts.has(alert.id))
    .slice(0, maxAlerts)

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error loading alerts: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    // Compact view for dashboard
    const criticalAlerts = visibleAlerts.filter(a => a.severity === 'critical' || a.severity === 'high')
    
    if (criticalAlerts.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">All systems optimal</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              No critical alerts detected
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Resource Alerts
            {criticalAlerts.length > 0 && (
              <Badge variant="destructive">{criticalAlerts.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {criticalAlerts.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-md border ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissAlert(alert.id)}
                  className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
          {criticalAlerts.length > 3 && (
            <p className="text-sm text-muted-foreground">
              +{criticalAlerts.length - 3} more alerts
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  // Full view
  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Resource Optimization Alerts</h2>
            <p className="text-muted-foreground">
              Proactive insights to improve efficiency and profitability
            </p>
          </div>
          <Button onClick={fetchAlerts} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Alerts</CardDescription>
              <CardTitle className="text-2xl">{summary.total_alerts}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardDescription>Critical</CardDescription>
              <CardTitle className="text-2xl text-red-600">{summary.critical}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-orange-200">
            <CardHeader className="pb-3">
              <CardDescription>High</CardDescription>
              <CardTitle className="text-2xl text-orange-600">{summary.high}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-yellow-200">
            <CardHeader className="pb-3">
              <CardDescription>Medium</CardDescription>
              <CardTitle className="text-2xl text-yellow-600">{summary.medium}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardDescription>Low</CardDescription>
              <CardTitle className="text-2xl text-blue-600">{summary.low}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-4">
        {visibleAlerts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <p className="text-lg font-medium text-green-600">All systems optimal!</p>
                <p className="text-sm mt-1">No resource optimization alerts detected</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          visibleAlerts.map((alert) => (
            <Card key={alert.id} className={`border-2 ${getSeverityColor(alert.severity)}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2">
                      {getAlertIcon(alert.type)}
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{alert.title}</CardTitle>
                      <CardDescription>{alert.description}</CardDescription>
                      {(alert.channel || alert.client_name) && (
                        <div className="flex gap-2 mt-2">
                          {alert.channel && (
                            <Badge variant="outline">{alert.channel}</Badge>
                          )}
                          {alert.client_name && (
                            <Badge variant="outline">{alert.client_name}</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">Current:</span>
                    <span className="font-medium">
                      {alert.type === 'pricing' || alert.type === 'efficiency' 
                        ? `${alert.value.toFixed(1)}${alert.type === 'pricing' ? '/hr' : '%'}`
                        : alert.value.toFixed(1)
                      }
                    </span>
                    <span className="text-muted-foreground">Target:</span>
                    <span className="font-medium">
                      {alert.threshold.toFixed(0)}
                      {alert.type === 'pricing' ? '/hr' : alert.type === 'efficiency' ? '%' : ''}
                    </span>
                  </div>
                  
                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertDescription className="font-medium">
                      {alert.suggestion}
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}