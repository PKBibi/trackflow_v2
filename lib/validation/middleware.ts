import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError, ZodSchema } from 'zod'
import { HttpError } from '@/lib/errors'

// Common validation schemas
export const paginationSchema = z.object({
  page: z.string().optional().transform(val => Math.max(1, parseInt(val || '1'))),
  limit: z.string().optional().transform(val => Math.min(1000, Math.max(1, parseInt(val || '50')))), // Max 1000 records
})

export const searchSchema = z.object({
  search: z.string().max(255).optional().transform(val => 
    val ? val.replace(/[%_\\]/g, '\\$&') : undefined // Escape SQL wildcards
  ),
  status: z.enum(['active', 'inactive', 'archived', 'draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
})

export const idSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
})

// Input validation middleware factory
export function validateInput<T>(schema: ZodSchema<T>) {
  return async function(
    request: NextRequest,
    handler: (validatedData: T, request: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      let data: unknown = {}
      
      // Parse query parameters
      if (request.nextUrl.searchParams.size > 0) {
        const queryData: Record<string, string> = {}
        request.nextUrl.searchParams.forEach((value, key) => {
          queryData[key] = value
        })
        data = { ...data, ...queryData }
      }
      
      // Parse JSON body for POST/PUT/PATCH requests
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          const body = await request.json()
          data = { ...data, ...body }
        } catch (error) {
          // Body might not be JSON, that's okay for some requests
        }
      }
      
      // Parse URL parameters (for dynamic routes like /api/clients/[id])
      const urlParts = request.nextUrl.pathname.split('/')
      const lastPart = urlParts[urlParts.length - 1]
      if (lastPart && lastPart.length > 0 && !['clients', 'projects', 'time-entries'].includes(lastPart)) {
        data = { ...data, id: lastPart }
      }
      
      // Validate the combined data
      const validatedData = schema.parse(data)
      
      return await handler(validatedData, request)
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        return NextResponse.json(
          { 
            error: 'Validation failed', 
            details: errorMessage,
            code: 'VALIDATION_ERROR'
          },
          { status: 400 }
        )
      }
      
      if (error instanceof HttpError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.status }
        )
      }
      
      console.error('Validation middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error', code: 'INTERNAL_ERROR' },
        { status: 500 }
      )
    }
  }
}

// Enhanced rate limiting with Redis fallback
export async function rateLimitPerUser(
  maxRequests: number = 100, 
  windowMs: number = 60000,
  context?: string
) {
  return async function(userId: string): Promise<void> {
    // Use Redis rate limiter in production, fallback to memory in development
    if (process.env.ENABLE_REDIS_RATE_LIMITING === 'true') {
      try {
        const { enhancedRateLimit } = await import('@/lib/redis/rate-limit')
        await enhancedRateLimit(userId, context, {
          requests: maxRequests,
          window: windowMs,
          burst: Math.floor(maxRequests * 0.1) // 10% burst allowance
        })
        return
      } catch (error) {
        console.error('Redis rate limiting failed, falling back to memory:', error)
      }
    }
    
    // Fallback to memory-based rate limiting
    const userRequestCounts = new Map<string, { count: number; resetTime: number }>()
    const now = Date.now()
    const userKey = `${context}:${userId}`
    
    const userLimit = userRequestCounts.get(userKey)
    
    if (!userLimit || now > userLimit.resetTime) {
      userRequestCounts.set(userKey, {
        count: 1,
        resetTime: now + windowMs
      })
      return
    }
    
    if (userLimit.count >= maxRequests) {
      throw new HttpError(429, 'Rate limit exceeded. Try again later.', {
        limit: maxRequests,
        remaining: 0,
        resetTime: userLimit.resetTime
      })
    }
    
    userLimit.count++
    userRequestCounts.set(userKey, userLimit)
  }
}

// Body size validation middleware
export function validateRequestSize(maxSizeBytes: number = 1024 * 1024) { // 1MB default
  return async function(request: NextRequest): Promise<void> {
    const contentLength = request.headers.get('content-length')
    
    if (contentLength && parseInt(contentLength) > maxSizeBytes) {
      throw new HttpError(413, 'Request body too large')
    }
  }
}

// API-specific validation schemas
export const clientCreateSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().optional(),
  company: z.string().max(255).optional(),
  phone: z.string().max(50).optional(),
  website: z.string().url().optional(),
  hourly_rate: z.number().min(0).max(999999).optional(),
  currency: z.string().length(3).optional(),
  has_retainer: z.boolean().optional(),
  retainer_hours: z.number().min(0).max(999).optional(),
  retainer_amount: z.number().min(0).max(999999).optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
}).merge(paginationSchema).merge(searchSchema)

export const projectCreateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  client_id: z.string().uuid(),
  project_type: z.string().max(100).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  budget_type: z.enum(['hourly', 'fixed', 'retainer']).optional(),
  budget_amount: z.number().min(0).max(999999).optional(),
  estimated_hours: z.number().min(0).max(9999).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['planning', 'active', 'paused', 'completed', 'cancelled']).optional(),
  billable: z.boolean().optional(),
  hourly_rate: z.number().min(0).max(999999).optional(),
}).merge(paginationSchema).merge(searchSchema)

export const timeEntryCreateSchema = z.object({
  client_id: z.string().uuid(),
  project_id: z.string().uuid(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime().optional(),
  duration: z.number().min(0).max(1440).optional(), // Max 24 hours in minutes
  marketing_category: z.string().min(1).max(100),
  marketing_channel: z.string().min(1).max(100),
  task_title: z.string().max(255).optional(),
  task_description: z.string().max(2000).optional(),
  billable: z.boolean().optional(),
  hourly_rate: z.number().min(0).max(999999),
  notes: z.string().max(2000).optional(),
}).merge(paginationSchema).merge(searchSchema)