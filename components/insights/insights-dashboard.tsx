import { log } from '@/lib/logger';
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  BarChart3, 
  RefreshCw,
  Lightbulb,
  Zap
} from 'lucide-react'

interface Insight {
  id: string
  type: 'prediction' | 'anomaly' | 'recommendation' | 'analysis' | 'warning' | 'opportunity' | 'productivity' | 'revenue' | 'summary'
  category: 'productivity' | 'revenue' | 'efficiency' | 'growth' | 'risk'
  title: string
  description: string
  impact: string
  action_items: string[]
  confidence: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  icon?: string
  data_points?: Record<string, any>
  predicted_value?: number
  predicted_date?: string
  comparison?: {
    current: number
    predicted: number
    change_percent: number
  }
  visualization?: {
    type: 'chart' | 'metric' | 'timeline'
    data: any
  }
}

interface InsightsResponse {
  insights: Insight[]
  generated_at: string
  phase: string
  model?: string
  total_insights: number
  subscription_tier?: string
  upgrade_available?: boolean
  features?: {
    predictions: boolean
    anomaly_detection: boolean
    recommendations: boolean
    pattern_analysis: boolean
    opportunities: boolean
    weekly_summary: boolean
  }
  error?: string
}

const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    clock: Clock,
    'trending-up': TrendingUp,
    'alert-triangle': AlertTriangle,
    calendar: Calendar,
    'bar-chart-3': BarChart3,
    zap: Zap
  }
  return iconMap[iconName] || Lightbulb
}

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'critical': return 'bg-red-200 text-red-900 border-red-300'
    case 'high': return 'bg-red-100 text-red-800 border-red-200'
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'prediction': return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'anomaly': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'recommendation': return 'bg-green-100 text-green-800 border-green-200'
    case 'analysis': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
    case 'opportunity': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'productivity': return 'bg-green-100 text-green-800 border-green-200'
    case 'revenue': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'summary': return 'bg-purple-100 text-purple-800 border-purple-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function InsightsDashboard() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [insightsData, setInsightsData] = useState<InsightsResponse | null>(null)
  const [weeklyLoading, setWeeklyLoading] = useState(false)

  const fetchInsights = useCallback(async (useAI: boolean = aiEnabled) => {
    try {
      setLoading(true)
      setError(null)

      const endpoint = useAI ? '/api/insights/ai' : '/api/insights/rules'
      const response = await fetch(endpoint)

      if (!response.ok) {
        throw new Error('Failed to fetch insights')
      }

      const data: InsightsResponse = await response.json()
      setInsights(data.insights)
      setLastUpdated(data.generated_at)
      setInsightsData(data)

      // Update AI enabled state based on response
      if (data.phase === 'ai-powered') {
        setAiEnabled(true)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch insights')

      // Fallback to basic insights on error
      if (useAI) {
        try {
          const fallbackResponse = await fetch('/api/insights/rules')
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            setInsights(fallbackData.insights)
            setLastUpdated(fallbackData.generated_at)
            setInsightsData({ ...fallbackData, error: 'AI temporarily unavailable' })
          }
        } catch {
          // Ignore fallback errors
        }
      }
    } finally {
      setLoading(false)
    }
  }, [aiEnabled])

  useEffect(() => {
    fetchInsights()
  }, [fetchInsights])

  const handleRefresh = () => {
    fetchInsights()
  }

  const toggleAI = () => {
    const newAiState = !aiEnabled
    setAiEnabled(newAiState)
    fetchInsights(newAiState)
  }

  const generateWeeklySummary = async () => {
    setWeeklyLoading(true)
    try {
      const response = await fetch('/api/insights/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'weekly-summary' })
      })

      if (!response.ok) {
        throw new Error('Failed to generate weekly summary')
      }

      const data = await response.json()

      // Show summary in a modal or download
      const element = document.createElement('a')
      const file = new Blob([data.summary], { type: 'text/markdown' })
      element.href = URL.createObjectURL(file)
      element.download = `weekly-summary-${new Date().toISOString().split('T')[0]}.md`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)

    } catch (error) {
      log.error('Failed to generate weekly summary:', error)
    } finally {
      setWeeklyLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Error Loading Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => fetchInsights()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Insights</h2>
          <p className="text-gray-600">
            {insights.length} insights generated from your data
            {lastUpdated && (
              <span className="text-sm text-gray-500 ml-2">
                • Last updated {new Date(lastUpdated).toLocaleString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={toggleAI}
            variant={aiEnabled ? "default" : "secondary"}
            size="sm"
            title={aiEnabled ? "Using AI-powered insights" : "Switch to AI insights"}
          >
            <Zap className="w-4 h-4 mr-2" />
            {aiEnabled ? 'AI Enabled' : 'Enable AI'}
          </Button>
          {insightsData?.features?.weekly_summary && (
            <Button
              onClick={generateWeeklySummary}
              variant="outline"
              size="sm"
              disabled={weeklyLoading}
            >
              {weeklyLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Calendar className="w-4 h-4 mr-2" />
              )}
              Weekly Summary
            </Button>
          )}
        </div>
      </div>

      {insightsData && (
        <Card className={`border-dashed ${
          insightsData.phase === 'ai-powered'
            ? 'border-green-200 bg-green-50'
            : 'border-blue-200 bg-blue-50'
        }`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-semibold ${
              insightsData.phase === 'ai-powered' ? 'text-green-700' : 'text-blue-700'
            }`}>
              {insightsData.phase === 'ai-powered' ? '🚀 AI-Powered Insights Active' : 'TrackFlow AI Roadmap'}
            </CardTitle>
            <CardDescription className={`text-xs ${
              insightsData.phase === 'ai-powered' ? 'text-green-600' : 'text-blue-600'
            }`}>
              {insightsData.phase === 'ai-powered'
                ? `Advanced AI insights powered by ${insightsData.model}. Predictions, anomaly detection, and intelligent recommendations.`
                : 'Today\'s insights are rule-based. Predictive and generative guidance is in active development for upcoming releases.'
              }
            </CardDescription>
            {insightsData.upgrade_available && (
              <div className="mt-2">
                <Button asChild size="sm" variant="outline">
                  <a href="/pricing">
                    ⚡ Upgrade for Full AI Features
                  </a>
                </Button>
              </div>
            )}
          </CardHeader>
        </Card>
      )}

      {/* Insights Grid */}
      {insights.length === 0 ? (
        <Card className="border-dashed border-gray-300">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Insights Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Track time or log past work to unlock personalized productivity and revenue insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <a href="/timer">
                  <Clock className="w-4 h-4 mr-2" />
                  Start Tracking Time
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/timesheet">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Log Past Work
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {insights.map((insight, index) => {
            const IconComponent = getIconComponent(insight.icon || 'lightbulb')
            
            return (
              <Card 
                key={index} 
                className={`border transition-all duration-200 hover:shadow-lg ${
                  insight.priority === 'high' ? 'border-red-200 bg-red-50/50' : 
                  insight.priority === 'medium' ? 'border-yellow-200 bg-yellow-50/50' : 
                  'border-gray-200'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex gap-2">
                      <Badge className={`text-xs ${getTypeColor(insight.type)}`}>
                        {insight.type}
                      </Badge>
                      {insight.priority && (
                        <Badge className={`text-xs ${getPriorityColor(insight.priority)}`}>
                          {insight.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-base mt-3">{insight.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm text-gray-600 mb-3">
                    {insight.description}
                  </CardDescription>

                  {insight.impact && (
                    <div className="text-sm font-medium text-blue-700 mb-2">
                      💡 {insight.impact}
                    </div>
                  )}

                  {insight.predicted_value && (
                    <div className="text-sm text-gray-600 mb-2">
                      📊 Predicted: {insight.predicted_value}
                      {insight.predicted_date && ` by ${new Date(insight.predicted_date).toLocaleDateString()}`}
                    </div>
                  )}

                  {insight.comparison && (
                    <div className="text-sm text-gray-600 mb-2">
                      📈 Change: {insight.comparison.change_percent > 0 ? '+' : ''}{insight.comparison.change_percent}%
                    </div>
                  )}

                  {insight.action_items && insight.action_items.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">Action Items:</div>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {insight.action_items.slice(0, 3).map((action, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-blue-500">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(insight.confidence * 100)}% confidence
                    </Badge>
                    {insight.type === 'prediction' && (
                      <Badge className="text-xs bg-purple-100 text-purple-800">
                        AI Prediction
                      </Badge>
                    )}
                    {insight.type === 'anomaly' && (
                      <Badge className="text-xs bg-orange-100 text-orange-800">
                        Anomaly
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-500 border-t pt-6">
        <p className="flex items-center justify-center gap-2">
          <Zap className="w-4 h-4" />
          {insightsData?.phase === 'ai-powered'
            ? `Powered by ${insightsData.model} AI with advanced analytics`
            : 'Powered by rule-based pattern detection'
          }
        </p>
        <p className="mt-1">
          {insightsData?.phase === 'ai-powered'
            ? 'AI insights include predictions, anomaly detection, recommendations, and growth opportunities.'
            : 'Today\'s insights use statistical analysis of your time tracking data. AI-powered insights available with Pro subscription.'
          }
        </p>
        {insightsData?.error && (
          <p className="mt-1 text-yellow-600">
            ⚠️ {insightsData.error}
          </p>
        )}
      </div>
    </div>
  )
}
