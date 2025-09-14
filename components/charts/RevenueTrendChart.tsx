'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, BarChart3, Minus } from 'lucide-react'

interface RevenueTrendData {
  period: string
  revenue: number
  hours: number
  averageRate: number
  billableRate: number
}

interface RevenueTrendChartProps {
  data: RevenueTrendData[]
  title?: string
  description?: string
  height?: number
}

export default function RevenueTrendChart({ 
  data, 
  title = "Revenue Trend", 
  description = "Revenue and efficiency over time",
  height = 300 
}: RevenueTrendChartProps) {
  const chartData = useMemo(() => {
    if (!data?.length) return { points: [], maxRevenue: 0, maxHours: 0, trend: 'stable' }
    
    const maxRevenue = Math.max(...data.map(d => d.revenue))
    const maxHours = Math.max(...data.map(d => d.hours))
    const chartWidth = 100 // percentage
    const chartHeight = height * 0.8
    
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * chartWidth
      const revenueY = chartHeight - (item.revenue / maxRevenue) * chartHeight
      const hoursY = chartHeight - (item.hours / maxHours) * chartHeight
      
      return {
        ...item,
        x,
        revenueY,
        hoursY,
        index
      }
    })

    // Calculate overall trend
    const firstRevenue = data[0]?.revenue || 0
    const lastRevenue = data[data.length - 1]?.revenue || 0
    const trendPercentage = firstRevenue > 0 ? ((lastRevenue - firstRevenue) / firstRevenue) * 100 : 0
    const trend = trendPercentage > 5 ? 'up' : trendPercentage < -5 ? 'down' : 'stable'
    
    return { points, maxRevenue, maxHours, trend, trendPercentage }
  }, [data, height])

  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)
  const totalHours = data.reduce((sum, d) => sum + d.hours, 0)
  const averageRate = totalHours > 0 ? totalRevenue / totalHours : 0
  const averageBillableRate = data.length > 0 
    ? data.reduce((sum, d) => sum + d.billableRate, 0) / data.length 
    : 0

  // Generate SVG path for revenue line
  const revenueLinePath = chartData.points.length > 1 
    ? `M ${chartData.points.map(p => `${p.x} ${p.revenueY}`).join(' L ')}`
    : ''

  // Generate SVG path for hours line
  const hoursLinePath = chartData.points.length > 1
    ? `M ${chartData.points.map(p => `${p.x} ${p.hoursY}`).join(' L ')}`
    : ''

  if (!data?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No trend data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {title}
          <div className="flex items-center gap-1 ml-2">
            {chartData.trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : chartData.trend === 'down' ? (
              <TrendingDown className="h-4 w-4 text-red-600" />
            ) : (
              <Minus className="h-4 w-4 text-gray-600" />
            )}
            <span className={`text-sm font-medium ${
              chartData.trend === 'up' ? 'text-green-600' : 
              chartData.trend === 'down' ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {chartData.trendPercentage > 0 ? '+' : ''}{chartData.trendPercentage.toFixed(1)}%
            </span>
          </div>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
          <div>
            <span className="text-muted-foreground">Total Revenue: </span>
            <span className="font-medium">${totalRevenue.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total Hours: </span>
            <span className="font-medium">{totalHours.toFixed(1)}h</span>
          </div>
          <div>
            <span className="text-muted-foreground">Avg Rate: </span>
            <span className="font-medium">${averageRate.toFixed(0)}/hr</span>
          </div>
          <div>
            <span className="text-muted-foreground">Billable Rate: </span>
            <span className="font-medium text-green-600">{averageBillableRate.toFixed(1)}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Chart */}
          <div className="relative" style={{ height: `${height}px` }}>
            <svg width="100%" height="100%" viewBox={`0 0 100 ${height}`} className="overflow-visible">
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="20" height={height/5} patternUnits="userSpaceOnUse">
                  <path d={`M 20 0 L 0 0 0 ${height/5}`} fill="none" stroke="#f1f5f9" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height={height} fill="url(#grid)" />
              
              {/* Revenue area fill */}
              {revenueLinePath && (
                <path
                  d={`${revenueLinePath} L 100 ${height * 0.8} L 0 ${height * 0.8} Z`}
                  fill="url(#revenueGradient)"
                  opacity="0.1"
                />
              )}
              
              {/* Revenue line */}
              {revenueLinePath && (
                <path
                  d={revenueLinePath}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  className="drop-shadow-sm"
                />
              )}
              
              {/* Hours line */}
              {hoursLinePath && (
                <path
                  d={hoursLinePath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="4,2"
                  className="drop-shadow-sm"
                />
              )}
              
              {/* Data points */}
              {chartData.points.map((point, index) => (
                <g key={index}>
                  {/* Revenue point */}
                  <circle
                    cx={point.x}
                    cy={point.revenueY}
                    r="3"
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth="2"
                    className="cursor-pointer hover:r-4 transition-all"
                    title={`${point.period}: $${point.revenue.toLocaleString()}`}
                  />
                  
                  {/* Hours point */}
                  <circle
                    cx={point.x}
                    cy={point.hoursY}
                    r="3"
                    fill="#10b981"
                    stroke="white"
                    strokeWidth="2"
                    className="cursor-pointer hover:r-4 transition-all"
                    title={`${point.period}: ${point.hours}h`}
                  />
                </g>
              ))}

              {/* Gradients */}
              <defs>
                <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground py-2 -ml-12">
              <span>${(chartData.maxRevenue || 0).toLocaleString()}</span>
              <span className="transform -rotate-90 origin-center whitespace-nowrap">Revenue ($)</span>
              <span>$0</span>
            </div>
            
            {/* Right Y-axis for hours */}
            <div className="absolute right-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground py-2 -mr-12">
              <span>{(chartData.maxHours || 0).toFixed(0)}h</span>
              <span className="transform rotate-90 origin-center whitespace-nowrap">Hours</span>
              <span>0h</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-blue-500 rounded-full" />
              <span>Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-green-500 rounded-full border-dashed border border-green-500" />
              <span>Hours</span>
            </div>
          </div>

          {/* Period breakdown */}
          <div className="grid gap-2">
            <h4 className="font-medium">Period Breakdown</h4>
            <div className="space-y-1">
              {data.map((item, index) => (
                <div key={item.period} className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50">
                  <div className="font-medium">{item.period}</div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <div className="font-medium">${item.revenue.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Revenue</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{item.hours}h</div>
                      <div className="text-xs text-muted-foreground">Hours</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${item.averageRate}/hr</div>
                      <div className="text-xs text-muted-foreground">Rate</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">{item.billableRate}%</div>
                      <div className="text-xs text-muted-foreground">Billable</div>
                    </div>
                    <Badge 
                      variant={item.billableRate >= 80 ? "default" : item.billableRate >= 60 ? "secondary" : "outline"}
                      className="ml-2"
                    >
                      {item.billableRate >= 80 ? "Excellent" : item.billableRate >= 60 ? "Good" : "Low"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}