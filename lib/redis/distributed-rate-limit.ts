/**
 * Distributed rate limiting using Redis with sliding window algorithm
 * Provides accurate rate limiting across multiple instances
 */

import { HttpError } from '@/lib/errors'

interface RateLimitOptions {
  requests: number      // Number of allowed requests
  window: number       // Time window in milliseconds
  burst?: number       // Additional burst capacity
  keyPrefix?: string   // Custom key prefix
}

interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: Date
  retryAfter?: number
}

/**
 * Redis client interface (compatible with ioredis or node-redis)
 */
interface RedisClient {
  eval(script: string, numKeys: number, ...args: any[]): Promise<any>
  del(key: string): Promise<number>
  ttl(key: string): Promise<number>
}

/**
 * Distributed rate limiter using Redis
 */
export class DistributedRateLimiter {
  private redis: RedisClient | null = null
  private script: string

  constructor() {
    // Lua script for atomic rate limit checking
    // Uses sliding window algorithm for accurate rate limiting
    this.script = `
      local key = KEYS[1]
      local now = tonumber(ARGV[1])
      local window = tonumber(ARGV[2])
      local limit = tonumber(ARGV[3])
      local burst = tonumber(ARGV[4])

      -- Clean old entries
      redis.call('ZREMRANGEBYSCORE', key, 0, now - window)

      -- Count current requests in window
      local current = redis.call('ZCARD', key)

      -- Check if request is allowed (including burst)
      if current < limit + burst then
        -- Add current request
        redis.call('ZADD', key, now, now .. ':' .. math.random())
        redis.call('EXPIRE', key, math.ceil(window / 1000))

        return {1, limit, math.max(0, limit + burst - current - 1), 0}
      else
        -- Get oldest entry to calculate retry time
        local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
        local retryAfter = 0

        if #oldest > 0 then
          retryAfter = math.ceil((oldest[2] + window - now) / 1000)
        end

        return {0, limit, 0, retryAfter}
      end
    `

    this.initializeRedis()
  }

  private async initializeRedis() {
    // Only initialize Redis if configuration is available
    if (!process.env.REDIS_URL) {
      console.warn('Redis URL not configured, rate limiting will use in-memory fallback')
      return
    }

    try {
      const redis = await this.createRedisClient()
      if (redis) {
        this.redis = redis
        console.log('Redis connected for distributed rate limiting')
      }
    } catch (error) {
      console.error('Failed to initialize Redis:', error)
    }
  }

  private async createRedisClient(): Promise<RedisClient | null> {
    try {
      // Try to import ioredis first
      const { default: Redis } = await import('ioredis')
      return new Redis(process.env.REDIS_URL!, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
      })
    } catch {
      try {
        // Fallback to node-redis
        const { createClient } = await import('redis')
        const client = createClient({ url: process.env.REDIS_URL })
        await client.connect()
        return client as any
      } catch (error) {
        console.error('No Redis client available:', error)
        return null
      }
    }
  }

  /**
   * Check rate limit for a given identifier
   */
  async checkLimit(
    identifier: string,
    options: RateLimitOptions
  ): Promise<RateLimitResult> {
    const key = `${options.keyPrefix || 'rate'}:${identifier}`
    const now = Date.now()

    if (this.redis) {
      try {
        const result = await this.redis.eval(
          this.script,
          1,
          key,
          now,
          options.window,
          options.requests,
          options.burst || 0
        )

        return {
          allowed: result[0] === 1,
          limit: result[1],
          remaining: result[2],
          resetAt: new Date(now + options.window),
          retryAfter: result[3] > 0 ? result[3] : undefined
        }
      } catch (error) {
        console.error('Redis rate limit check failed:', error)
        // Fall through to in-memory implementation
      }
    }

    // Fallback to in-memory rate limiting
    return this.checkLimitInMemory(identifier, options)
  }

  /**
   * In-memory rate limiting fallback
   */
  private memoryStore = new Map<string, { count: number; resetAt: number }>()

  private checkLimitInMemory(
    identifier: string,
    options: RateLimitOptions
  ): RateLimitResult {
    const key = `${options.keyPrefix || 'rate'}:${identifier}`
    const now = Date.now()
    const resetAt = now + options.window

    let entry = this.memoryStore.get(key)

    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt }
      this.memoryStore.set(key, entry)
    }

    const limit = options.requests + (options.burst || 0)
    const allowed = entry.count < limit

    if (allowed) {
      entry.count++
    }

    // Clean up old entries periodically
    if (this.memoryStore.size > 10000) {
      for (const [k, v] of this.memoryStore.entries()) {
        if (now >= v.resetAt) {
          this.memoryStore.delete(k)
        }
      }
    }

    return {
      allowed,
      limit: options.requests,
      remaining: Math.max(0, limit - entry.count),
      resetAt: new Date(entry.resetAt),
      retryAfter: allowed ? undefined : Math.ceil((entry.resetAt - now) / 1000)
    }
  }

  /**
   * Reset rate limit for an identifier
   */
  async resetLimit(identifier: string, keyPrefix?: string): Promise<void> {
    const key = `${keyPrefix || 'rate'}:${identifier}`

    if (this.redis) {
      try {
        await this.redis.del(key)
      } catch (error) {
        console.error('Failed to reset rate limit:', error)
      }
    }

    // Also reset in memory store
    this.memoryStore.delete(key)
  }

  /**
   * Get remaining TTL for a rate limit key
   */
  async getTTL(identifier: string, keyPrefix?: string): Promise<number> {
    const key = `${keyPrefix || 'rate'}:${identifier}`

    if (this.redis) {
      try {
        return await this.redis.ttl(key)
      } catch (error) {
        console.error('Failed to get TTL:', error)
      }
    }

    // Check memory store
    const entry = this.memoryStore.get(key)
    if (entry) {
      const ttl = Math.ceil((entry.resetAt - Date.now()) / 1000)
      return ttl > 0 ? ttl : -1
    }

    return -1
  }
}

// Create singleton instance
const rateLimiter = new DistributedRateLimiter()

/**
 * Enhanced rate limiting with multiple strategies
 */
export async function enhancedRateLimit(
  identifier: string,
  context?: string,
  options?: RateLimitOptions
): Promise<void> {
  const defaultOptions: RateLimitOptions = {
    requests: options?.requests || 100,
    window: options?.window || 60000,
    burst: options?.burst || 10,
    keyPrefix: context || 'api'
  }

  const result = await rateLimiter.checkLimit(identifier, defaultOptions)

  if (!result.allowed) {
    throw new HttpError(429, 'Rate limit exceeded', {
      limit: result.limit,
      remaining: result.remaining,
      resetAt: result.resetAt,
      retryAfter: result.retryAfter
    })
  }
}

/**
 * Rate limiting middleware for different strategies
 */
export class RateLimitStrategies {
  /**
   * Per-user rate limiting
   */
  static async perUser(
    userId: string,
    options?: Partial<RateLimitOptions>
  ): Promise<RateLimitResult> {
    return rateLimiter.checkLimit(`user:${userId}`, {
      requests: 1000,
      window: 60000,
      burst: 50,
      ...options
    })
  }

  /**
   * Per-IP rate limiting
   */
  static async perIP(
    ip: string,
    options?: Partial<RateLimitOptions>
  ): Promise<RateLimitResult> {
    return rateLimiter.checkLimit(`ip:${ip}`, {
      requests: 100,
      window: 60000,
      burst: 10,
      ...options
    })
  }

  /**
   * Per-API key rate limiting
   */
  static async perApiKey(
    apiKey: string,
    options?: Partial<RateLimitOptions>
  ): Promise<RateLimitResult> {
    return rateLimiter.checkLimit(`key:${apiKey}`, {
      requests: 5000,
      window: 3600000, // 1 hour
      burst: 100,
      ...options
    })
  }

  /**
   * Per-endpoint rate limiting
   */
  static async perEndpoint(
    endpoint: string,
    identifier: string,
    options?: Partial<RateLimitOptions>
  ): Promise<RateLimitResult> {
    return rateLimiter.checkLimit(`${endpoint}:${identifier}`, {
      requests: 10,
      window: 60000,
      burst: 2,
      ...options
    })
  }

  /**
   * Global rate limiting (for DDoS protection)
   */
  static async global(options?: Partial<RateLimitOptions>): Promise<RateLimitResult> {
    return rateLimiter.checkLimit('global', {
      requests: 10000,
      window: 60000,
      burst: 1000,
      ...options
    })
  }
}

/**
 * Decorator for rate limiting class methods
 */
export function RateLimit(options: RateLimitOptions & { strategy?: 'user' | 'ip' | 'global' }) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      // Extract identifier based on strategy
      let identifier = 'unknown'

      if (options.strategy === 'user' && args[0]?.userId) {
        identifier = args[0].userId
      } else if (options.strategy === 'ip' && args[0]?.ip) {
        identifier = args[0].ip
      } else {
        identifier = `${target.constructor.name}.${propertyKey}`
      }

      const result = await rateLimiter.checkLimit(identifier, options)

      if (!result.allowed) {
        throw new HttpError(429, 'Rate limit exceeded', {
          limit: result.limit,
          remaining: result.remaining,
          resetAt: result.resetAt,
          retryAfter: result.retryAfter
        })
      }

      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

/**
 * Express/Next.js middleware for rate limiting
 */
export function rateLimitMiddleware(options?: Partial<RateLimitOptions>) {
  return async (req: any, res: any, next: any) => {
    try {
      // Extract identifier (user ID, API key, or IP)
      const identifier =
        req.user?.id ||
        req.headers['x-api-key'] ||
        req.headers['x-forwarded-for']?.split(',')[0] ||
        req.ip ||
        'anonymous'

      const result = await rateLimiter.checkLimit(identifier, {
        requests: 100,
        window: 60000,
        burst: 10,
        ...options
      })

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', result.limit)
      res.setHeader('X-RateLimit-Remaining', result.remaining)
      res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString())

      if (!result.allowed) {
        if (result.retryAfter) {
          res.setHeader('Retry-After', result.retryAfter)
        }

        return res.status(429).json({
          error: 'Rate limit exceeded',
          limit: result.limit,
          remaining: result.remaining,
          resetAt: result.resetAt,
          retryAfter: result.retryAfter
        })
      }

      next()
    } catch (error) {
      console.error('Rate limiting error:', error)
      next() // Don't block on rate limiting errors
    }
  }
}

// Export singleton and utilities
export { rateLimiter, DistributedRateLimiter as RateLimiter }
export default rateLimiter