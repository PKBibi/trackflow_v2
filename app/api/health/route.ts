import { log } from '@/lib/logger';
// Health Check API Endpoint
import { NextRequest, NextResponse } from 'next/server'
import { getHealthStatus } from '@/lib/monitoring/alerts'
import { createClient } from '@/lib/supabase/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get health status from monitoring system
    const healthStatus = await getHealthStatus()
    
    // Check database connectivity
    let databaseStatus = 'healthy'
    try {
      const supabase = await createClient()
      const { error } = await supabase.from('profiles').select('count').limit(1)
      if (error) {
        databaseStatus = 'degraded'
      }
    } catch {
      databaseStatus = 'unhealthy'
    }
    
    // Check authentication service
    let authStatus = 'healthy'
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.getSession()
      if (error) {
        authStatus = 'degraded'
      }
    } catch {
      authStatus = 'unhealthy'
    }
    
    // Determine overall status
    const overallStatus = 
      healthStatus.status === 'critical' || databaseStatus === 'unhealthy' || authStatus === 'unhealthy' ? 'unhealthy' :
      healthStatus.status === 'degraded' || databaseStatus === 'degraded' || authStatus === 'degraded' ? 'degraded' :
      healthStatus.status === 'warning' ? 'warning' :
      'healthy'
    
    // Build response
    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        monitoring: healthStatus.status,
        database: databaseStatus,
        authentication: authStatus
      },
      metrics: healthStatus.metrics,
      alerts: healthStatus.alerts,
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }
    
    // Set appropriate status code
    const statusCode = 
      overallStatus === 'unhealthy' ? 503 :
      overallStatus === 'degraded' ? 200 :
      200
    
    return NextResponse.json(response, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Status': overallStatus
      }
    })
  } catch (error) {
    log.error('Health check error:', error)
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Status': 'unhealthy'
      }
    })
  }
}

// HEAD request for simple health check
export async function HEAD(request: NextRequest) {
  try {
    const healthStatus = await getHealthStatus()
    const statusCode = healthStatus.status === 'critical' ? 503 : 200
    
    return new NextResponse(null, { 
      status: statusCode,
      headers: {
        'X-Health-Status': healthStatus.status
      }
    })
  } catch {
    return new NextResponse(null, { status: 503 })
  }
}