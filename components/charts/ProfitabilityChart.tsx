'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

interface ProfitabilityData {
  channel: string
  revenue: number
  cost: number
  margin: number
  marginPercentage: number
  hours: number
  color: string
}

interface ProfitabilityChartProps {
  data: ProfitabilityData[]
  title?: string
  description?: string
  height?: number
}

export default function ProfitabilityChart({ 
  data, 
  title = "Service Profitability", 
  description = "Revenue and margin by service channel",
  height = 300 
}: ProfitabilityChartProps) {
  const chartData = useMemo(() => {
    if (!data?.length) return []
    
    const maxRevenue = Math.max(...data.map(d => d.revenue))
    const maxMargin = Math.max(...data.map(d => Math.abs(d.margin)))
    
    return data.map(item => ({
      ...item,
      revenueBarHeight: (item.revenue / maxRevenue) * height * 0.8,
      marginBarHeight: Math.abs(item.margin / maxMargin) * height * 0.8,
      isPositiveMargin: item.margin >= 0
    }))
  }, [data, height])

  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)
  const totalMargin = data.reduce((sum, d) => sum + d.margin, 0)
  const averageMarginPercentage = data.length > 0 
    ? data.reduce((sum, d) => sum + d.marginPercentage, 0) / data.length 
    : 0

  if (!data?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No profitability data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        
        {/* Summary Stats */}
        <div className="flex gap-4 mt-2">
          <div className="text-sm">
            <span className="text-muted-foreground">Total Revenue: </span>
            <span className="font-medium">${totalRevenue.toLocaleString()}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Total Margin: </span>
            <span className={`font-medium ${totalMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalMargin.toLocaleString()}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Avg Margin: </span>
            <span className={`font-medium ${averageMarginPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {averageMarginPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart */}
          <div className="relative" style={{ height: `${height}px` }}>
            <div className="absolute inset-0 flex items-end justify-around gap-2 px-4">
              {chartData.map((item, index) => (
                <div key={item.channel} className="flex flex-col items-center gap-2 flex-1 max-w-20">
                  {/* Bars Container */}
                  <div className="flex gap-1 items-end h-full">
                    {/* Revenue Bar */}
                    <div className="relative flex flex-col items-center">
                      <div
                        className="w-8 rounded-t-sm transition-all duration-300 hover:opacity-80"
                        style={{
                          height: `${item.revenueBarHeight}px`,
                          backgroundColor: item.color || '#3b82f6',
                          minHeight: '4px'
                        }}
                        title={`Revenue: $${item.revenue.toLocaleString()}`}
                      />
                    </div>
                    
                    {/* Margin Bar */}
                    <div className="relative flex flex-col items-center">
                      <div
                        className={`w-6 rounded-t-sm transition-all duration-300 hover:opacity-80 ${
                          item.isPositiveMargin ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{
                          height: `${item.marginBarHeight}px`,
                          minHeight: '4px'
                        }}
                        title={`Margin: $${item.margin.toLocaleString()} (${item.marginPercentage.toFixed(1)}%)`}
                      />
                    </div>
                  </div>
                  
                  {/* Channel Label */}
                  <div className="text-xs text-center text-muted-foreground font-medium rotate-45 origin-bottom whitespace-nowrap">
                    {item.channel.length > 12 ? `${item.channel.slice(0, 10)}...` : item.channel}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground py-2">
              <span>${Math.max(...data.map(d => d.revenue)).toLocaleString()}</span>
              <span className="transform -rotate-90 origin-center">Revenue</span>
              <span>$0</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-sm" />
              <span>Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-sm" />
              <span>Positive Margin</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-sm" />
              <span>Negative Margin</span>
            </div>
          </div>

          {/* Detailed Data Table */}
          <div className="mt-6">
            <h4 className="font-medium mb-3">Detailed Breakdown</h4>
            <div className="grid gap-2">
              {data
                .sort((a, b) => b.marginPercentage - a.marginPercentage)
                .map((item, index) => (
                <div key={item.channel} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color || '#3b82f6' }}
                    />
                    <div>
                      <div className="font-medium">{item.channel}</div>
                      <div className="text-xs text-muted-foreground">{item.hours} hours</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <div className="font-medium">${item.revenue.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Revenue</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium flex items-center gap-1 ${
                        item.marginPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.marginPercentage >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {item.marginPercentage.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Margin</div>
                    </div>
                    <Badge 
                      variant={item.marginPercentage >= 20 ? "default" : item.marginPercentage >= 0 ? "secondary" : "destructive"}
                      className="ml-2"
                    >
                      {item.marginPercentage >= 40 ? "Excellent" : 
                       item.marginPercentage >= 20 ? "Good" : 
                       item.marginPercentage >= 0 ? "Low" : "Loss"}
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