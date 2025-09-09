import { NextRequest, NextResponse } from 'next/server'

interface RateLimitOptions {
  windowMs?: number // Time window in milliseconds
  maxRequests?: number // Maximum number of requests per window
  keyGenerator?: (request: NextRequest) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  message?: string
  headers?: boolean
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// Simple in-memory store (use Redis in production)
const store: RateLimitStore = {}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime <= now) {
      delete store[key]
    }
  })
}, 60000) // Cleanup every minute

function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  let ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown'
  
  // For authenticated requests, also include user info if available
  const authorization = request.headers.get('authorization')
  if (authorization) {
    ip += ':' + authorization.substring(0, 20) // Include part of auth token
  }
  
  return ip
}

export function rateLimit(options: RateLimitOptions = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100, // 100 requests per window
    keyGenerator = getClientIdentifier,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    message = 'Too many requests, please try again later.',
    headers = true
  } = options

  return async function rateLimitMiddleware(
    request: NextRequest,
    handler: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    const key = keyGenerator(request)
    const now = Date.now()
    const windowStart = now - windowMs

    // Initialize or get existing record
    if (!store[key] || store[key].resetTime <= now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs
      }
    }

    const record = store[key]

    // Check if limit exceeded
    if (record.count >= maxRequests) {
      const response = NextResponse.json(
        { 
          error: message,
          retryAfter: Math.ceil((record.resetTime - now) / 1000)
        },
        { status: 429 }
      )

      if (headers) {
        response.headers.set('X-RateLimit-Limit', maxRequests.toString())
        response.headers.set('X-RateLimit-Remaining', '0')
        response.headers.set('X-RateLimit-Reset', record.resetTime.toString())
        response.headers.set('Retry-After', Math.ceil((record.resetTime - now) / 1000).toString())
      }

      return response
    }

    // Increment counter (we'll decrement if needed based on response)
    record.count++

    try {
      // Execute the handler
      const response = await handler()
      const status = response.status

      // Decrement counter for skipped requests
      if (
        (skipSuccessfulRequests && status >= 200 && status < 400) ||
        (skipFailedRequests && status >= 400)
      ) {
        record.count--
      }

      // Add rate limit headers to successful responses
      if (headers) {
        response.headers.set('X-RateLimit-Limit', maxRequests.toString())
        response.headers.set('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count).toString())
        response.headers.set('X-RateLimit-Reset', record.resetTime.toString())
      }

      return response
    } catch (error) {
      // Decrement counter on error if configured to skip failed requests
      if (skipFailedRequests) {
        record.count--
      }
      throw error
    }
  }
}

// Predefined rate limiters for different use cases
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: 'Too many API requests, please try again later.'
})

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes  
  maxRequests: 5, // 5 login attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true // Don't count successful logins
})

export const strictRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
  message: 'Rate limit exceeded, please slow down.'
})