import { log } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth/api-key'
import { getActiveTeam } from '@/lib/auth/team'
import { HttpError } from '@/lib/errors'

type MetricCountResponse = { count: number }[] | null

function cacheHeaders(isPrivate = true, seconds = 30) {
  return {
    'Cache-Control': `${isPrivate ? 'private' : 'public'}, max-age=${seconds}`,
    'Content-Type': 'application/json',
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)

    if (!user) {
      throw new HttpError(401, 'Unauthorized')
    }

    const teamContext = await getActiveTeam(request)
    if (!teamContext.ok) return teamContext.response
    const { teamId } = teamContext

    const supabase = await createClient()
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    const [
      userActivity,
      timeEntries,
      authEvents,
      errorEvents,
      paymentEvents,
      clientCount,
      projectCount,
    ] = await Promise.all([
      supabase
        .from('audit_logs')
        .select('user_id')
        .eq('user_id', user.id)
        .gte('timestamp', oneDayAgo.toISOString()),
      supabase
        .from('time_entries')
        .select('count')
        .eq('user_id', user.id)
        .eq('team_id', teamId)
        .gte('created_at', oneDayAgo.toISOString()),
      supabase
        .from('audit_logs')
        .select('success')
        .eq('user_id', user.id)
        .eq('event_type', 'auth:login')
        .gte('timestamp', oneHourAgo.toISOString()),
      supabase
        .from('audit_logs')
        .select('count')
        .eq('user_id', user.id)
        .eq('success', false)
        .gte('timestamp', oneHourAgo.toISOString()),
      supabase
        .from('audit_logs')
        .select('success')
        .eq('user_id', user.id)
        .ilike('event_type', 'payment:%')
        .gte('timestamp', oneDayAgo.toISOString()),
      supabase
        .from('clients')
        .select('count')
        .eq('user_id', user.id)
        .eq('team_id', teamId)
        .eq('status', 'active'),
      supabase
        .from('projects')
        .select('count')
        .eq('user_id', user.id)
        .eq('team_id', teamId)
        .eq('status', 'active'),
    ])

    const queryErrors = [
      userActivity.error,
      timeEntries.error,
      authEvents.error,
      errorEvents.error,
      paymentEvents.error,
      clientCount.error,
      projectCount.error,
    ].filter(Boolean) as Error[]

    if (queryErrors.length > 0) {
      throw queryErrors[0]
    }

    const activeUsers = new Set(
      userActivity.data?.map(entry => entry.user_id).filter(Boolean) ?? [],
    ).size

    const totalTimeEntries = (timeEntries.data as MetricCountResponse)?.[0]?.count ?? 0
    const authStats = authEvents.data ?? []
    const errorCount = (errorEvents.data as MetricCountResponse)?.[0]?.count ?? 0
    const paymentStats = paymentEvents.data ?? []
    const totalClients = (clientCount.data as MetricCountResponse)?.[0]?.count ?? 0
    const totalProjects = (projectCount.data as MetricCountResponse)?.[0]?.count ?? 0

    const successfulLogins = authStats.filter(event => event.success).length
    const failedLogins = authStats.length - successfulLogins

    const successfulPayments = paymentStats.filter(event => event.success).length
    const failedPayments = paymentStats.length - successfulPayments

    const authSuccessRate = authStats.length
      ? (successfulLogins / authStats.length) * 100
      : 100

    const paymentSuccessRate = paymentStats.length
      ? (successfulPayments / paymentStats.length) * 100
      : 100

    const errorRate = totalTimeEntries
      ? (errorCount / totalTimeEntries) * 100
      : 0

    const memoryUsage = process.memoryUsage()
    const response = {
      timestamp: now.toISOString(),
      period: {
        start: oneDayAgo.toISOString(),
        end: now.toISOString(),
      },
      business_metrics: {
        active_users_24h: activeUsers,
        time_entries_24h: totalTimeEntries,
        total_clients: totalClients,
        total_projects: totalProjects,
        avg_time_entries_per_user: activeUsers
          ? Math.round(totalTimeEntries / activeUsers)
          : 0,
      },
      performance_metrics: {
        auth_success_rate: Math.round(authSuccessRate * 100) / 100,
        payment_success_rate: Math.round(paymentSuccessRate * 100) / 100,
        error_rate: Math.round(errorRate * 100) / 100,
        successful_logins_1h: successfulLogins,
        failed_logins_1h: failedLogins,
        successful_payments_24h: successfulPayments,
        failed_payments_24h: failedPayments,
      },
      system_metrics: {
        uptime_seconds: Math.round(process.uptime()),
        rss_mb: Math.round(memoryUsage.rss / 1024 / 1024),
        heap_used_mb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heap_total_mb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        node_version: process.version,
        platform: process.platform,
      },
      health_indicators: {
        high_error_rate: errorRate > 5,
        low_auth_success: authSuccessRate < 95,
        payment_issues: paymentSuccessRate < 95,
        memory_pressure:
          memoryUsage.heapTotal > 0
            ? memoryUsage.heapUsed / memoryUsage.heapTotal > 0.9
            : false,
      },
    }

    return NextResponse.json(response, { headers: cacheHeaders(true, 30) })
  } catch (error) {
    log.error('Metrics collection failed:', error)

    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 })
    }

    return NextResponse.json(
      {
        error: 'Failed to collect metrics',
        timestamp: new Date().toISOString(),
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)

    if (!user) {
      throw new HttpError(401, 'Unauthorized')
    }

    const schema = z.object({
      metric_name: z.string().min(1).max(255),
      value: z.number(),
      labels: z.record(z.string(), z.string().max(255)).optional(),
      timestamp: z.string().datetime().optional(),
    })

    const { metric_name, value, labels, timestamp } = schema.parse(await request.json())

    const supabase = await createClient()

    const { error } = await supabase
      .from('audit_logs')
      .insert({
        event_type: 'metrics:custom',
        user_id: user.id,
        metadata: {
          metric_name,
          value,
          labels: labels || {},
          custom_timestamp: timestamp,
        },
        timestamp: new Date().toISOString(),
      })

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    log.error('Custom metric logging failed:', error)

    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid payload', details: error.issues }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to store metric' }, { status: 500 })
  }
}
