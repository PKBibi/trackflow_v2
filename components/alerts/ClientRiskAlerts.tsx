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
  MessageSquare,
  Target,
  X,
  RefreshCw,
  Shield,
  ShieldAlert,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

interface ClientRiskAlert {
  id: string
  client_id: string
  client_name: string
  risk_type: 'payment_delay' | 'scope_creep' | 'low_satisfaction' | 'declining_revenue' | 'over_budget' | 'communication_gap'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  value: number
  threshold: number
  suggestion: string
  created_at: string
  last_activity?: string
  trend_direction?: 'up' | 'down' | 'stable'
}

interface RiskSummary {
  total_risks: number
  clients_at_risk: number
  critical_risks: number
  high_risks: number
  medium_risks: number
  low_risks: number
  risk_categories: {
    payment_delay: number
    scope_creep: number
    low_satisfaction: number
    declining_revenue: number
    over_budget: number
    communication_gap: number
  }
}

function getRiskIcon(type: string) {
  switch (type) {
    case 'payment_delay': return <DollarSign className="h-4 w-4" />
    case 'scope_creep': return <Target className="h-4 w-4" />
    case 'low_satisfaction': return <Users className="h-4 w-4" />
    case 'declining_revenue': return <TrendingDown className="h-4 w-4" />
    case 'over_budget': return <AlertTriangle className="h-4 w-4" />
    case 'communication_gap': return <MessageSquare className="h-4 w-4" />
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
    case 'critical': return <ShieldAlert className="h-4 w-4 text-red-600" />
    case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />
    case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-600" />
    case 'low': return <AlertCircle className="h-4 w-4 text-blue-600" />
    default: return <Shield className="h-4 w-4 text-gray-600" />
  }
}

function getRiskTypeLabel(type: string) {
  switch (type) {
    case 'payment_delay': return 'Payment Issue'
    case 'scope_creep': return 'Scope Creep'
    case 'low_satisfaction': return 'Satisfaction Risk'
    case 'declining_revenue': return 'Revenue Decline'
    case 'over_budget': return 'Budget Overrun'
    case 'communication_gap': return 'Communication Gap'
    default: return 'Unknown Risk'
  }
}

interface ClientRiskAlertsProps {
  compact?: boolean
  showHeader?: boolean
  maxAlerts?: number
}

export default function ClientRiskAlerts({ 
  compact = false, 
  showHeader = true, 
  maxAlerts = 10 
}: ClientRiskAlertsProps) {
  const [alerts, setAlerts] = useState<ClientRiskAlert[]>([])
  const [summary, setSummary] = useState<RiskSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/alerts/client-risks')
      if (!response.ok) {
        throw new Error('Failed to fetch client risk alerts')
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
              Error loading client risk alerts: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    // Compact view for dashboard
    const criticalRisks = visibleAlerts.filter(a => a.severity === 'critical' || a.severity === 'high')
    
    if (criticalRisks.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-600">
              <Shield className="h-5 w-5" />
              <span className="font-medium">No critical client risks</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              All clients appear healthy
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Client Risk Alerts
            {criticalRisks.length > 0 && (
              <Badge variant="destructive">{criticalRisks.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            {summary?.clients_at_risk || 0} clients need attention
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {criticalRisks.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-md border ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{alert.client_name}</p>
                      <Badge variant="outline" className="text-xs">
                        {getRiskTypeLabel(alert.risk_type)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{alert.description}</p>
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
          {criticalRisks.length > 3 && (
            <p className="text-sm text-muted-foreground">
              +{criticalRisks.length - 3} more client risks
            </p>
          )}
          <Link href="/clients">
            <Button variant="outline" size="sm" className="w-full mt-2">
              Manage Clients
            </Button>
          </Link>
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
            <h2 className="text-2xl font-bold tracking-tight">Client Risk Alerts</h2>
            <p className="text-muted-foreground">
              Proactive monitoring to protect client relationships and revenue
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
        <div className="grid gap-4 md:grid-cols-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Clients at Risk</CardDescription>
              <CardTitle className="text-2xl">{summary.clients_at_risk}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardDescription>Critical</CardDescription>
              <CardTitle className="text-2xl text-red-600">{summary.critical_risks}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-orange-200">
            <CardHeader className="pb-3">
              <CardDescription>High Risk</CardDescription>
              <CardTitle className="text-2xl text-orange-600">{summary.high_risks}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-yellow-200">
            <CardHeader className="pb-3">
              <CardDescription>Medium</CardDescription>
              <CardTitle className="text-2xl text-yellow-600">{summary.medium_risks}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardDescription>Low Risk</CardDescription>
              <CardTitle className="text-2xl text-blue-600">{summary.low_risks}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Risks</CardDescription>
              <CardTitle className="text-2xl">{summary.total_risks}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Risk Category Breakdown */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Risk Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {Object.entries(summary.risk_categories).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {getRiskIcon(category)}
                    <span className="text-sm capitalize">{category.replace('_', ' ')}</span>
                  </div>
                  <Badge variant={count > 0 ? "default" : "secondary"}>
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts List */}
      <div className="space-y-4">
        {visibleAlerts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <p className="text-lg font-medium text-green-600">All clients healthy!</p>
                <p className="text-sm mt-1">No client risk alerts detected</p>
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
                      {getRiskIcon(alert.risk_type)}
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{alert.client_name}</CardTitle>
                        <Badge variant="outline">
                          {getRiskTypeLabel(alert.risk_type)}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-medium">{alert.title}</CardTitle>
                      <CardDescription>{alert.description}</CardDescription>
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
                      {alert.risk_type === 'payment_delay' || alert.risk_type === 'communication_gap' 
                        ? `${alert.value} days`
                        : alert.risk_type === 'declining_revenue'
                        ? `${alert.value.toFixed(1)}%`
                        : alert.value.toFixed(1)
                      }
                    </span>
                    <span className="text-muted-foreground">Threshold:</span>
                    <span className="font-medium">
                      {alert.threshold}
                      {alert.risk_type === 'payment_delay' || alert.risk_type === 'communication_gap' ? ' days' : ''}
                    </span>
                  </div>
                  
                  {alert.last_activity && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Last activity: {new Date(alert.last_activity).toLocaleDateString()}
                    </div>
                  )}
                  
                  <Alert>
                    <Target className="h-4 w-4" />
                    <AlertDescription className="font-medium">
                      {alert.suggestion}
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-2 pt-2">
                    <Link href={`/clients/${alert.client_id}`}>
                      <Button variant="outline" size="sm">
                        View Client
                      </Button>
                    </Link>
                    {alert.risk_type === 'payment_delay' && (
                      <Link href="/invoices">
                        <Button variant="outline" size="sm">
                          Send Invoice
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}