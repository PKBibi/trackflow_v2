'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Clock,
  Target,
  Users,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap
} from 'lucide-react'
import Link from 'next/link'

interface ClientHealthData {
  client_id: string
  client_name: string
  company?: string
  health_score: number
  health_status: 'excellent' | 'good' | 'warning' | 'critical'
  metrics: {
    profitability: number
    efficiency: number
    billable_rate: number
    growth_trend: number
    payment_timeliness: number
    scope_adherence: number
  }
  risk_factors: string[]
  opportunities: string[]
  last_updated: string
}

interface HealthSummary {
  total_clients: number
  excellent: number
  good: number
  warning: number
  critical: number
  average_health: number
}

function getHealthColor(status: string) {
  switch (status) {
    case 'excellent': return 'text-green-600 bg-green-50 border-green-200'
    case 'good': return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'critical': return 'text-red-600 bg-red-50 border-red-200'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

function getHealthIcon(status: string) {
  switch (status) {
    case 'excellent': return <CheckCircle className="h-5 w-5 text-green-600" />
    case 'good': return <Activity className="h-5 w-5 text-blue-600" />
    case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />
    case 'critical': return <XCircle className="h-5 w-5 text-red-600" />
    default: return <AlertCircle className="h-5 w-5 text-gray-600" />
  }
}

function getMetricColor(value: number, metric: string) {
  if (metric === 'growth_trend') {
    if (value > 10) return 'text-green-600'
    if (value > 0) return 'text-blue-600'
    if (value > -10) return 'text-yellow-600'
    return 'text-red-600'
  }
  
  // For percentage metrics
  if (value >= 80) return 'text-green-600'
  if (value >= 60) return 'text-blue-600'
  if (value >= 40) return 'text-yellow-600'
  return 'text-red-600'
}

export default function ClientHealthPage() {
  const [clients, setClients] = useState<ClientHealthData[]>([])
  const [summary, setSummary] = useState<HealthSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'excellent' | 'good' | 'warning' | 'critical'>('all')

  const fetchHealthData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/clients/health')
      if (!response.ok) {
        throw new Error('Failed to fetch client health data')
      }
      
      const data = await response.json()
      setClients(data.clients)
      setSummary(data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthData()
  }, [])

  const filteredClients = filter === 'all' 
    ? clients 
    : clients.filter(c => c.health_status === filter)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
          <div className="h-96 bg-muted rounded-lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <p>Error loading client health data: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Health Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor client profitability, efficiency, and growth trends
          </p>
        </div>
        <Button onClick={fetchHealthData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Average Health</CardDescription>
              <CardTitle className="text-2xl">{summary.average_health}%</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={summary.average_health} className="h-2" />
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" 
                onClick={() => setFilter(filter === 'excellent' ? 'all' : 'excellent')}>
            <CardHeader className="pb-3">
              <CardDescription>Excellent</CardDescription>
              <CardTitle className="text-2xl text-green-600">{summary.excellent}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {Math.round((summary.excellent / summary.total_clients) * 100)}%
              </Badge>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setFilter(filter === 'good' ? 'all' : 'good')}>
            <CardHeader className="pb-3">
              <CardDescription>Good</CardDescription>
              <CardTitle className="text-2xl text-blue-600">{summary.good}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {Math.round((summary.good / summary.total_clients) * 100)}%
              </Badge>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setFilter(filter === 'warning' ? 'all' : 'warning')}>
            <CardHeader className="pb-3">
              <CardDescription>Warning</CardDescription>
              <CardTitle className="text-2xl text-yellow-600">{summary.warning}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                {Math.round((summary.warning / summary.total_clients) * 100)}%
              </Badge>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setFilter(filter === 'critical' ? 'all' : 'critical')}>
            <CardHeader className="pb-3">
              <CardDescription>Critical</CardDescription>
              <CardTitle className="text-2xl text-red-600">{summary.critical}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                {Math.round((summary.critical / summary.total_clients) * 100)}%
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Badge */}
      {filter !== 'all' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtering by:</span>
          <Badge variant="secondary" className="capitalize">
            {filter}
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => setFilter('all')}>
            Clear
          </Button>
        </div>
      )}

      {/* Client Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client) => (
          <Card key={client.client_id} className={`border-2 ${getHealthColor(client.health_status)}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getHealthIcon(client.health_status)}
                    {client.client_name}
                  </CardTitle>
                  {client.company && (
                    <CardDescription>{client.company}</CardDescription>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{client.health_score}</div>
                  <Badge variant="outline" className={`capitalize ${getHealthColor(client.health_status)}`}>
                    {client.health_status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Profit</div>
                  <div className={`font-medium ${getMetricColor(client.metrics.profitability * 100, 'profitability')}`}>
                    {client.metrics.profitability.toFixed(1)}x
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Billable</div>
                  <div className={`font-medium ${getMetricColor(client.metrics.billable_rate, 'billable_rate')}`}>
                    {client.metrics.billable_rate}%
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Growth</div>
                  <div className={`font-medium flex items-center gap-1 ${getMetricColor(client.metrics.growth_trend, 'growth_trend')}`}>
                    {client.metrics.growth_trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(client.metrics.growth_trend)}%
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Efficiency</div>
                  <div className={`font-medium ${getMetricColor(client.metrics.efficiency * 100, 'efficiency')}`}>
                    {(client.metrics.efficiency * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Payment</div>
                  <div className={`font-medium ${getMetricColor(client.metrics.payment_timeliness, 'payment_timeliness')}`}>
                    {client.metrics.payment_timeliness}%
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Scope</div>
                  <div className={`font-medium ${getMetricColor(client.metrics.scope_adherence, 'scope_adherence')}`}>
                    {client.metrics.scope_adherence}%
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              {client.risk_factors.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-red-700 mb-1">Risk Factors</div>
                  <div className="space-y-1">
                    {client.risk_factors.slice(0, 2).map((risk, i) => (
                      <div key={i} className="text-xs text-red-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {risk}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Opportunities */}
              {client.opportunities.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-green-700 mb-1">Opportunities</div>
                  <div className="space-y-1">
                    {client.opportunities.slice(0, 2).map((opp, i) => (
                      <div key={i} className="text-xs text-green-600 flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {opp}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <Link href={`/clients/${client.client_id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No clients found with {filter} health status</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}