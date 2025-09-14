'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Users,
  RefreshCw,
  ArrowLeft,
  AlertTriangle,
  Target,
  Activity,
  BarChart3,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import ProfitabilityChart from '@/components/charts/ProfitabilityChart'

interface ServiceMargin {
  channel: string
  category: string
  total_hours: number
  billable_hours: number
  total_revenue: number
  average_hourly_rate: number
  effective_rate: number
  margin_percentage: number
  utilization_rate: number
  entries_count: number
  clients_served: number
  trend: 'up' | 'down' | 'stable'
  trend_percentage: number
}

interface MarginSummary {
  best_margin_service: string
  worst_margin_service: string
  highest_volume_service: string
  highest_revenue_service: string
  average_margin: number
  average_effective_rate: number
  total_revenue: number
  total_hours: number
}

function getTrendColor(trend: string, percentage: number) {
  switch (trend) {
    case 'up': return 'text-green-600'
    case 'down': return 'text-red-600'
    default: return 'text-gray-600'
  }
}

function getMarginColor(percentage: number) {
  if (percentage >= 40) return 'text-green-600 bg-green-50 border-green-200'
  if (percentage >= 20) return 'text-blue-600 bg-blue-50 border-blue-200'
  if (percentage >= 0) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  return 'text-red-600 bg-red-50 border-red-200'
}

function getUtilizationColor(rate: number) {
  if (rate >= 80) return 'text-green-600'
  if (rate >= 60) return 'text-blue-600'
  if (rate >= 40) return 'text-yellow-600'
  return 'text-red-600'
}

export default function ServiceMarginsPage() {
  const [services, setServices] = useState<ServiceMargin[]>([])
  const [summary, setSummary] = useState<MarginSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<{ start: string; end: string } | null>(null)

  const fetchMarginData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/services/margins')
      if (!response.ok) {
        throw new Error('Failed to fetch service margin data')
      }
      
      const data = await response.json()
      setServices(data.services)
      setSummary(data.summary)
      setPeriod(data.period)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarginData()
  }, [])

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
              <AlertTriangle className="h-5 w-5" />
              <p>Error loading service margin data: {error}</p>
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
        <div className="flex items-center gap-4">
          <Link href="/reports">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Service Margin Analysis</h1>
            <p className="text-muted-foreground mt-1">
              Profitability analysis by marketing channel and service type
            </p>
            {period && (
              <p className="text-sm text-muted-foreground mt-1">
                Period: {new Date(period.start).toLocaleDateString()} - {new Date(period.end).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <Button onClick={fetchMarginData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Revenue</CardDescription>
              <CardTitle className="text-2xl">${summary.total_revenue}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {summary.total_hours} hours tracked
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Average Margin</CardDescription>
              <CardTitle className={`text-2xl ${getMarginColor(summary.average_margin).split(' ')[0]}`}>
                {summary.average_margin}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={Math.max(0, Math.min(100, summary.average_margin))} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Effective Rate</CardDescription>
              <CardTitle className="text-2xl">${summary.average_effective_rate}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Revenue per total hour
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Best Margin</CardDescription>
              <CardTitle className="text-lg text-green-600">{summary.best_margin_service}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Top Performer
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Key Insights */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                <Target className="h-5 w-5" />
                Best Margin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{summary.best_margin_service}</p>
              <p className="text-sm text-green-600 mt-1">Most profitable service line</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
                <BarChart3 className="h-5 w-5" />
                Highest Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{summary.highest_volume_service}</p>
              <p className="text-sm text-blue-600 mt-1">Most hours tracked</p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
                <DollarSign className="h-5 w-5" />
                Highest Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{summary.highest_revenue_service}</p>
              <p className="text-sm text-amber-600 mt-1">Top revenue generator</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Profitability Visualization */}
      {services.length > 0 && (
        <ProfitabilityChart
          data={services.map(service => ({
            channel: service.channel,
            revenue: service.total_revenue,
            cost: service.total_hours * 60, // Using $60/hr cost assumption
            margin: service.total_revenue - (service.total_hours * 60),
            marginPercentage: service.margin_percentage,
            hours: service.total_hours,
            color: service.margin_percentage >= 40 ? '#10b981' :
                   service.margin_percentage >= 20 ? '#3b82f6' :
                   service.margin_percentage >= 0 ? '#f59e0b' : '#ef4444'
          }))}
          title="Service Profitability Analysis"
          description="Revenue, costs, and margins by marketing channel"
        />
      )}

      {/* Service Cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {services.map((service) => (
          <Card key={service.channel} className={`border-2 ${getMarginColor(service.margin_percentage)}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{service.channel}</CardTitle>
                  <CardDescription>{service.category}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{service.margin_percentage}%</div>
                  <Badge variant="outline" className={`${getMarginColor(service.margin_percentage)}`}>
                    Margin
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Revenue</div>
                  <div className="text-lg font-semibold">${service.total_revenue}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Hours</div>
                  <div className="text-lg font-semibold">{service.total_hours}h</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Avg Rate</div>
                  <div className="text-lg font-semibold">${service.average_hourly_rate}/hr</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Effective Rate</div>
                  <div className="text-lg font-semibold">${service.effective_rate}/hr</div>
                </div>
              </div>

              {/* Secondary Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                <div>
                  <div className="text-sm text-muted-foreground">Utilization</div>
                  <div className={`font-medium ${getUtilizationColor(service.utilization_rate)}`}>
                    {service.utilization_rate}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Entries</div>
                  <div className="font-medium">{service.entries_count}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Clients</div>
                  <div className="font-medium">{service.clients_served}</div>
                </div>
              </div>

              {/* Trend Indicator */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">30-day trend:</span>
                  <div className={`flex items-center gap-1 ${getTrendColor(service.trend, service.trend_percentage)}`}>
                    {service.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : service.trend === 'down' ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : (
                      <Activity className="h-4 w-4" />
                    )}
                    <span className="font-medium">
                      {service.trend_percentage > 0 ? '+' : ''}{service.trend_percentage}%
                    </span>
                  </div>
                </div>
                {service.margin_percentage >= 40 && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Zap className="h-3 w-3 mr-1" />
                    High Margin
                  </Badge>
                )}
                {service.utilization_rate >= 80 && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    High Efficiency
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No service margin data available</p>
              <p className="text-sm mt-1">Start tracking time with marketing channels to see margin analysis</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}