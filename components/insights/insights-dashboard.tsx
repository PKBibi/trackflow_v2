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
  type: 'productivity' | 'revenue' | 'warning' | 'deadline' | 'summary'
  title: string
  description: string
  action?: string
  confidence: number
  icon: string
  category: string
  priority?: 'high' | 'medium' | 'low'
}

interface InsightsResponse {
  insights: Insight[]
  generated_at: string
  phase: string
  total_insights: number
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
    case 'high': return 'bg-red-100 text-red-800 border-red-200'
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'productivity': return 'bg-green-100 text-green-800 border-green-200'
    case 'revenue': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'deadline': return 'bg-red-100 text-red-800 border-red-200'
    case 'summary': return 'bg-purple-100 text-purple-800 border-purple-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function InsightsDashboard() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [plan, setPlan] = useState<'free' | 'pro' | 'enterprise'>('free')
  const [tab, setTab] = useState<'rule'|'ai'>('rule')
  const [ruleInsights, setRuleInsights] = useState<Insight[]|null>(null)
  const [aiInsights, setAiInsights] = useState<Insight[]|null>(null)

  const fetchInsights = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/insights/rules')
      if (!response.ok) {
        throw new Error('Failed to fetch insights')
      }
      
      const data: InsightsResponse = await response.json()
      setInsights(data.insights)
      setRuleInsights(data.insights)
      setLastUpdated(data.generated_at)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch insights')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()
    // Load user plan (for AI access gating)
    fetch('/api/me/plan').then(r => r.json()).then(d => setPlan((d.plan || 'free'))).catch(() => {})
  }, [])

  const handleRefresh = () => {
    fetchInsights()
  }

  const handleGenerateAI = async () => {
    try {
      setAiLoading(true)
      setError(null)
      try { const { trackEvent } = await import('@/components/analytics'); trackEvent.featureUse('insights_ai_generate'); } catch {}
      // For now, we call the AI endpoint without payload; server can fallback
      const response = await fetch('/api/insights/generate', { method: 'POST' })
      if (!response.ok) {
        throw new Error('Failed to generate AI insights')
      }
      const data: InsightsResponse = await response.json()
      setInsights(data.insights)
      setAiInsights(data.insights)
      setTab('ai')
      setLastUpdated(data.generated_at)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate AI insights')
    } finally {
      setAiLoading(false)
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
          <Button onClick={fetchInsights} variant="outline">
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
          <Button onClick={async () => { try { const { trackEvent } = await import('@/components/analytics'); trackEvent.featureUse('insights_rule_click'); } catch {}; setTab('rule'); if (ruleInsights) { setInsights(ruleInsights) } else { handleRefresh() } }} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Rule-Based
          </Button>
          <Button onClick={() => { if (aiInsights) { setInsights(aiInsights); setTab('ai') } else { handleGenerateAI() } }} variant="default" size="sm" disabled={aiLoading || plan==='free'}>
            {aiLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                AI
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                AI
              </>
            )}
          </Button>
          {plan==='free' && (
            <a href="/pricing/simple" className="text-xs underline text-blue-600" onClick={async (e)=>{ try { const { trackEvent } = await import('@/components/analytics'); trackEvent.featureUse('insights_upgrade_click'); } catch {} }}>
              Upgrade
            </a>
          )}
        </div>
      </div>

      {plan === 'free' && (
        <div className="text-sm text-muted-foreground">
          Upgrade to Pro to unlock AI-generated insights. <a href="/pricing/simple" className="underline" onClick={async (e)=>{ try { const { trackEvent } = await import('@/components/analytics'); trackEvent.featureUse('insights_upgrade_click_notice'); } catch {} }}>Upgrade now</a>.
        </div>
      )}

      {/* Insights Grid */}
      {insights.length === 0 ? (
        <Card className="border-dashed border-gray-300">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {tab==='ai' ? 'Ready for AI Insights?' : 'No Insights Yet'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              {tab==='ai' 
                ? 'Track some time entries to generate personalized AI-powered insights about your productivity and revenue patterns.' 
                : 'Start tracking your time to generate personalized insights about your productivity and revenue patterns.'
              }
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
            const IconComponent = getIconComponent(insight.icon)
            
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
                  
                  {insight.action && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-600">
                        {insight.action}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(insight.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  )}
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
          Powered by rule-based pattern detection
        </p>
        <p className="mt-1">
          These insights are generated automatically from your time tracking data using statistical analysis.
        </p>
      </div>
    </div>
  )
}
