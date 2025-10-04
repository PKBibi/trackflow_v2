import { log } from '@/lib/logger';
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Clock, DollarSign, Mail, X, RefreshCw, Plus } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { toastUtils } from '@/lib/toast-utils'

interface RetainerAlert {
  client_id: string
  client_name: string
  client_email: string
  user_id: string
  usage_percentage: number
  used_hours: number
  allocated_hours: number
  period_start: string
  period_end: string
  alert_type: string
  retainer_usage_id: string
}

interface RetainerUsage {
  id: string
  client_id: string
  usage_percentage: number
  used_hours: number
  allocated_hours: number
  period_start: string
  period_end: string
  clients: {
    name: string
    email: string
    retainer_hours: number
    retainer_amount: number
  }
}

export function RetainerAlerts() {
  const [alerts, setAlerts] = useState<RetainerAlert[]>([])
  const [usage, setUsage] = useState<RetainerUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const { toast } = useToast()

  const loadRetainerData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Load both alerts and usage data
      const [alertsResponse, usageResponse] = await Promise.all([
        fetch('/api/retainer/alerts'),
        fetch('/api/retainer/alerts', { method: 'PUT' })
      ])

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json()
        setAlerts(alertsData.alerts || [])
      }

      if (usageResponse.ok) {
        const usageData = await usageResponse.json()
        setUsage(usageData.usage || [])
      }
    } catch (error) {
      log.error('Failed to load retainer data:', error)
      toastUtils.error({
        title: 'Failed to load retainer data',
        description: 'Please try refreshing the page',
        action: { label: 'Retry', onClick: () => loadRetainerData() }
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRetainerData()
  }, [loadRetainerData])

  const sendAlerts = async () => {
    setSending(true)
    try {
      const response = await fetch('/api/retainer/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sendEmail: true })
      })

      const result = await response.json()

      if (response.ok) {
        toastUtils.success({
          title: 'Alerts sent successfully',
          description: `Sent ${result.results.alertsSent} alerts (${result.results.emailsSent} emails)`
        })
        
        // Reload data to reflect sent alerts
        await loadRetainerData()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toastUtils.error({
        title: 'Failed to send alerts',
        description: error instanceof Error ? error.message : 'Please try again',
        action: { label: 'Retry', onClick: sendAlerts }
      })
    } finally {
      setSending(false)
    }
  }

  const getAlertColor = (percentage: number) => {
    if (percentage >= 100) return 'destructive'
    if (percentage >= 90) return 'secondary'
    return 'default'
  }

  const getAlertIcon = (percentage: number) => {
    if (percentage >= 90) return <AlertTriangle className="h-4 w-4" />
    return <Clock className="h-4 w-4" />
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading Retainer Data...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  // Show alerts if any exist
  if (alerts.length > 0) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Retainer Alerts ({alerts.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadRetainerData}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={sendAlerts}
                disabled={sending}
              >
                {sending ? (
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-1" />
                )}
                Send Alerts
              </Button>
            </div>
          </div>
          <CardDescription>
            Clients who have reached 75%, 90%, or 100% of their retainer allocation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts.map((alert) => (
            <Alert key={alert.retainer_usage_id}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <strong>{alert.client_name}</strong> has used{' '}
                    <Badge variant={getAlertColor(alert.usage_percentage)}>
                      {alert.usage_percentage}%
                    </Badge>{' '}
                    of their retainer ({alert.used_hours}/{alert.allocated_hours} hours)
                  </div>
                  <Badge variant="outline">
                    {alert.alert_type} Alert
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>
    )
  }

  // Show usage overview if no alerts but have usage data
  if (usage.length > 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Retainer Usage This Month
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={loadRetainerData}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
          <CardDescription>
            Current month's retainer usage across all clients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {usage.map((item) => (
            <div key={item.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.clients.name}</span>
                <span className="text-muted-foreground">
                  {item.used_hours}h / {item.allocated_hours}h
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Progress 
                  value={Math.min(item.usage_percentage, 100)} 
                  className="flex-1"
                />
                <Badge 
                  variant={getAlertColor(item.usage_percentage)}
                  className="text-xs"
                >
                  {item.usage_percentage}%
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  // No retainer clients
  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              No Retainer Clients
            </CardTitle>
            <CardDescription className="mt-2">
              Set up retainer agreements with your clients to track usage and receive alerts.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/clients">
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </a>
          </Button>
        </div>
      </CardHeader>
    </Card>
  )
}