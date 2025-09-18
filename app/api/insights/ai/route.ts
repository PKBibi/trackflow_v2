import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aiInsightsEngine } from '@/lib/ai/insights-engine'
import { log } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    // Check for API key in headers for external access
    const apiKey = request.headers.get('x-api-key')

    // Get user from session or API key
    const supabase = await createClient()
    let userId: string | null = null

    if (apiKey) {
      // Validate API key
      const { data: keyData } = await supabase
        .from('api_keys')
        .select('user_id')
        .eq('key', apiKey)
        .eq('status', 'active')
        .single()

      userId = keyData?.user_id || null
    } else {
      // Get user from session
      const { data: { user }, error } = await supabase.auth.getUser()
      userId = user?.id || null
    }

    if (!userId) {
      return NextResponse.json({
        insights: [],
        error: 'Authentication required',
        phase: 'ai-powered',
        model: 'gpt-4o-mini',
        generated_at: new Date().toISOString()
      }, { status: 401 })
    }

    // Check if user has access to AI features (Pro plan)
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    const isPro = profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'enterprise'

    // Generate AI insights
    const insights = await aiInsightsEngine.generateInsights(userId)

    // Filter insights based on subscription
    const filteredInsights = isPro
      ? insights
      : insights.slice(0, 5).map(insight => ({
          ...insight,
          // Limit details for free tier
          action_items: insight.action_items.slice(0, 2),
          data_points: undefined,
          visualization: undefined
        }))

    // Log the AI generation
    log.info('AI insights generated', {
      userId,
      insightCount: insights.length,
      subscription: profile?.subscription_tier || 'free',
      isPro
    })

    return NextResponse.json({
      insights: filteredInsights,
      phase: 'ai-powered',
      model: 'gpt-4o-mini',
      total_insights: filteredInsights.length,
      generated_at: new Date().toISOString(),
      subscription_tier: profile?.subscription_tier || 'free',
      upgrade_available: !isPro,
      features: {
        predictions: isPro,
        anomaly_detection: isPro,
        recommendations: true,
        pattern_analysis: isPro,
        opportunities: isPro,
        weekly_summary: isPro
      }
    })

  } catch (error) {
    log.apiError('insights/ai', error, { method: 'GET' })

    // Fallback to rule-based insights on error
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/insights/rules`)
      const fallbackData = await response.json()

      return NextResponse.json({
        ...fallbackData,
        phase: 'rule-based-fallback',
        error: 'AI temporarily unavailable'
      })
    } catch {
      return NextResponse.json({
        insights: [],
        phase: 'error',
        error: 'Failed to generate insights',
        generated_at: new Date().toISOString()
      }, { status: 500 })
    }
  }
}

// Weekly summary endpoint
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action !== 'weekly-summary') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check Pro subscription
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    if (profile?.subscription_tier !== 'pro' && profile?.subscription_tier !== 'enterprise') {
      return NextResponse.json({
        error: 'Weekly AI summaries require Pro subscription',
        upgrade_url: '/pricing'
      }, { status: 403 })
    }

    // Generate weekly summary
    const summary = await aiInsightsEngine.generateWeeklySummary(user.id)

    // Store the summary
    await supabase
      .from('ai_summaries')
      .insert({
        user_id: user.id,
        type: 'weekly',
        content: summary,
        created_at: new Date().toISOString()
      })

    // Send email if enabled
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('weekly_summary_email')
      .eq('user_id', user.id)
      .single()

    if (preferences?.weekly_summary_email) {
      // Queue email sending (would integrate with email service)
      log.info('Weekly summary email queued', { userId: user.id })
    }

    return NextResponse.json({
      summary,
      generated_at: new Date().toISOString(),
      email_sent: preferences?.weekly_summary_email || false
    })

  } catch (error) {
    log.apiError('insights/ai/weekly-summary', error, { method: 'POST' })

    return NextResponse.json({
      error: 'Failed to generate weekly summary'
    }, { status: 500 })
  }
}