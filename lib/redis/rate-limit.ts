// Redis-based rate limiting for production
import { HttpError } from '@/lib/errors'

// Redis client configuration
let redis: any | null = null

// Initialize Redis connection
async function getRedisClient(): Promise<any | null> {
  if (typeof window !== 'undefined') return null // Client-side guard
  
  if (!redis && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { Redis } = await import('@upstash/redis')
      redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    } catch (e) {
      console.warn('Redis client not available, rate limiting will use in-memory fallback')
      return null
    }
  }
  
  return redis
}

// Production Redis rate limiter
export class RedisRateLimiter {
  private redis: any | null = null
  private fallbackLimiter: Map<string, { count: number; resetTime: number }> = new Map()
  
  async initialize() {
    this.redis = await getRedisClient()
  }
  
  async limit(
    identifier: string, // Usually userId or IP
    maxRequests: number = 100,
    windowMs: number = 60000, // 1 minute
    context?: string // e.g., 'api:v1:clients'
  ): Promise<{
    success: boolean
    limit: number
    remaining: number
    resetTime: number
  }> {
    const key = context ? `rate_limit:${context}:${identifier}` : `rate_limit:${identifier}`
    const now = Date.now()
    const windowStart = Math.floor(now / windowMs) * windowMs
    const resetTime = windowStart + windowMs
    
    try {
      if (this.redis) {
        return await this.redisLimit(key, maxRequests, windowMs, resetTime)
      } else {
        return this.fallbackLimit(key, maxRequests, windowMs, resetTime, now)
      }
    } catch (error) {
      console.error('Rate limiting error:', error)
      // Fallback to memory-based limiting on Redis errors
      return this.fallbackLimit(key, maxRequests, windowMs, resetTime, now)
    }
  }
  
  private async redisLimit(
    key: string,
    maxRequests: number,
    windowMs: number,
    resetTime: number
  ) {
    if (!this.redis) {
      throw new Error('Redis not initialized')
    }
    const pipeline = this.redis.pipeline()
    
    // Increment counter
    pipeline.incr(key)
    // Set expiration (only if key is new)
    pipeline.expire(key, Math.ceil(windowMs / 1000))
    // Get current count
    pipeline.get(key)
    
    const results = await pipeline.exec()
    const count = results[2] as number || 0
    
    return {
      success: count <= maxRequests,
      limit: maxRequests,
      remaining: Math.max(0, maxRequests - count),
      resetTime
    }
  }
  
  private fallbackLimit(
    key: string,
    maxRequests: number,
    windowMs: number,
    resetTime: number,
    now: number
  ) {
    const existing = this.fallbackLimiter.get(key)
    
    if (!existing || now >= existing.resetTime) {
      // Reset or create new limit
      this.fallbackLimiter.set(key, { count: 1, resetTime })
      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        resetTime
      }
    }
    
    existing.count++
    this.fallbackLimiter.set(key, existing)
    
    return {
      success: existing.count <= maxRequests,
      limit: maxRequests,
      remaining: Math.max(0, maxRequests - existing.count),
      resetTime: existing.resetTime
    }
  }
  
  // Clean up expired entries in fallback limiter
  cleanup() {
    const now = Date.now()
    for (const [key, value] of this.fallbackLimiter.entries()) {
      if (now >= value.resetTime) {
        this.fallbackLimiter.delete(key)
      }
    }
  }
}

// Singleton instance with lazy initialization
let rateLimiterInstance: RedisRateLimiter | null = null

async function getRateLimiter(): Promise<RedisRateLimiter> {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RedisRateLimiter()
    await rateLimiterInstance.initialize()
  }
  return rateLimiterInstance
}

// Enhanced rate limiting middleware with Redis
export async function enhancedRateLimit(
  userId: string,
  context?: string,
  limits?: {
    requests?: number
    window?: number
    burst?: number // Allow burst requests
  }
): Promise<void> {
  const { requests = 100, window = 60000, burst = 10 } = limits || {}
  
  const rateLimiter = await getRateLimiter()
  
  // Check normal rate limit
  const result = await rateLimiter.limit(userId, requests, window, context)
  
  if (!result.success) {
    // Check if burst allowance is available
    if (burst > 0) {
      const burstResult = await rateLimiter.limit(
        userId, 
        burst, 
        5000, // 5 second burst window
        `${context}:burst`
      )
      
      if (burstResult.success) {
        // Allow burst request but log it
        console.warn(`Burst rate limit used for user ${userId} in context ${context}`)
        return
      }
    }
    
    throw new HttpError(429, 'Rate limit exceeded', {
      limit: result.limit,
      remaining: result.remaining,
      resetTime: result.resetTime
    })
  }
}

// IP-based rate limiting for unauthenticated endpoints
export async function ipRateLimit(
  request: Request,
  limits?: { requests?: number; window?: number }
): Promise<void> {
  const { requests = 60, window = 60000 } = limits || {} // Lower limits for IP
  
  // Get IP from various headers (for different proxy setups)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  const rateLimiter = await getRateLimiter()
  const result = await rateLimiter.limit(ip, requests, window, 'ip')
  
  if (!result.success) {
    throw new HttpError(429, 'Too many requests from this IP address', {
      limit: result.limit,
      remaining: result.remaining,
      resetTime: result.resetTime
    })
  }
}

// Route-specific rate limiting
export const routeLimits = {
  'auth:login': { requests: 5, window: 300000 }, // 5 per 5 minutes
  'auth:signup': { requests: 3, window: 3600000 }, // 3 per hour
  'password:reset': { requests: 3, window: 3600000 }, // 3 per hour
  'api:v1:clients': { requests: 200, window: 60000 }, // 200 per minute
  'api:v1:projects': { requests: 200, window: 60000 },
  'api:v1:time-entries': { requests: 300, window: 60000 }, // Higher for time tracking
  'api:v1:invoices': { requests: 100, window: 60000 },
  'uploads': { requests: 20, window: 60000 }, // Limited for file uploads
  'exports': { requests: 10, window: 60000 }, // Very limited for exports
} as const

// Middleware factory for specific route limits
export function createRateLimitMiddleware(routeKey: keyof typeof routeLimits) {
  const limits = routeLimits[routeKey]
  
  return async function rateLimitMiddleware(userId: string): Promise<void> {
    await enhancedRateLimit(userId, routeKey, limits)
  }
}

// Global rate limit cleanup (run periodically)
setInterval(async () => {
  const rateLimiter = await getRateLimiter()
  rateLimiter.cleanup()
}, 300000) // Clean up every 5 minutes