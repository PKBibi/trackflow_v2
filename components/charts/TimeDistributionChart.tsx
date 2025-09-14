'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, PieChart } from 'lucide-react'

interface TimeDistributionData {
  label: string
  hours: number
  percentage: number
  color: string
  billable?: boolean
}

interface TimeDistributionChartProps {
  data: TimeDistributionData[]
  title?: string
  description?: string
  size?: number
}

export default function TimeDistributionChart({ 
  data, 
  title = "Time Distribution", 
  description = "How your time is allocated",
  size = 200 
}: TimeDistributionChartProps) {
  const chartData = useMemo(() => {
    if (!data?.length) return []
    
    let cumulativePercentage = 0
    return data.map(item => {
      const startAngle = (cumulativePercentage * 360) / 100
      const endAngle = ((cumulativePercentage + item.percentage) * 360) / 100
      cumulativePercentage += item.percentage
      
      // Calculate path for SVG arc
      const radius = size / 2 - 10
      const centerX = size / 2
      const centerY = size / 2
      
      const startAngleRad = (startAngle - 90) * (Math.PI / 180)
      const endAngleRad = (endAngle - 90) * (Math.PI / 180)
      
      const x1 = centerX + radius * Math.cos(startAngleRad)
      const y1 = centerY + radius * Math.sin(startAngleRad)
      const x2 = centerX + radius * Math.cos(endAngleRad)
      const y2 = centerY + radius * Math.sin(endAngleRad)
      
      const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ')
      
      return {
        ...item,
        pathData,
        startAngle,
        endAngle
      }
    })
  }, [data, size])

  const totalHours = data.reduce((sum, d) => sum + d.hours, 0)
  const billableHours = data.filter(d => d.billable).reduce((sum, d) => sum + d.hours, 0)
  const billablePercentage = totalHours > 0 ? (billableHours / totalHours) * 100 : 0

  if (!data?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No time distribution data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        
        {/* Summary Stats */}
        <div className="flex gap-4 mt-2">
          <div className="text-sm">
            <span className="text-muted-foreground">Total Hours: </span>
            <span className="font-medium">{totalHours.toFixed(1)}h</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Billable: </span>
            <span className="font-medium text-green-600">{billablePercentage.toFixed(1)}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          {/* Pie Chart */}
          <div className="flex-shrink-0">
            <svg width={size} height={size} className="drop-shadow-sm">
              {chartData.map((item, index) => (
                <g key={item.label}>
                  <path
                    d={item.pathData}
                    fill={item.color || '#3b82f6'}
                    stroke="white"
                    strokeWidth="2"
                    className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                    title={`${item.label}: ${item.hours}h (${item.percentage.toFixed(1)}%)`}
                  />
                </g>
              ))}
              
              {/* Center circle for donut effect */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={size / 6}
                fill="white"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              
              {/* Center text */}
              <text
                x={size / 2}
                y={size / 2 - 8}
                textAnchor="middle"
                className="text-sm font-medium fill-current"
              >
                {totalHours.toFixed(1)}h
              </text>
              <text
                x={size / 2}
                y={size / 2 + 8}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                Total
              </text>
            </svg>
          </div>

          {/* Legend and Details */}
          <div className="flex-1 space-y-3 min-w-0">
            {data
              .sort((a, b) => b.hours - a.hours)
              .map((item, index) => (
              <div key={item.label} className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color || '#3b82f6' }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{item.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.hours.toFixed(1)} hours • {item.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.billable !== undefined && (
                    <Badge variant={item.billable ? "default" : "secondary"} className="text-xs">
                      {item.billable ? "Billable" : "Non-billable"}
                    </Badge>
                  )}
                  
                  {/* Progress bar */}
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: item.color || '#3b82f6'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Insights */}
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="text-sm font-medium mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Quick Insights
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                {data.length > 0 && (
                  <>
                    <div>
                      • Top activity: {data.sort((a, b) => b.hours - a.hours)[0]?.label} 
                      ({data.sort((a, b) => b.hours - a.hours)[0]?.percentage.toFixed(1)}%)
                    </div>
                    <div>
                      • Billable rate: {billablePercentage.toFixed(1)}% 
                      ({billablePercentage >= 80 ? "Excellent" : billablePercentage >= 60 ? "Good" : "Needs improvement"})
                    </div>
                    <div>
                      • Activities tracked: {data.length} categories
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}