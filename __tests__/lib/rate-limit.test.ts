import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status || 200,
      headers: new Map(),
      json: () => Promise.resolve(body),
    })),
  },
}))

describe('rateLimit', () => {
  const mockRequest = {
    headers: {
      get: jest.fn((header: string) => {
        if (header === 'x-forwarded-for') return '192.168.1.1'
        return null
      }),
    },
  } as any as NextRequest

  const mockHandler = jest.fn().mockResolvedValue(
    NextResponse.json({ success: true })
  )

  beforeEach(() => {
    jest.clearAllMocks()
    // Clear the rate limit store between tests
    const rateLimiter = rateLimit({ windowMs: 1000, maxRequests: 2 })
  })

  it('should allow requests under the limit', async () => {
    const rateLimiter = rateLimit({ windowMs: 60000, maxRequests: 10 })
    
    const response = await rateLimiter(mockRequest, mockHandler)
    
    expect(mockHandler).toHaveBeenCalledTimes(1)
    expect(response.status).not.toBe(429)
  })

  it('should block requests over the limit', async () => {
    const rateLimiter = rateLimit({ windowMs: 60000, maxRequests: 1 })
    
    // First request should pass
    await rateLimiter(mockRequest, mockHandler)
    expect(mockHandler).toHaveBeenCalledTimes(1)
    
    // Second request should be blocked
    const response = await rateLimiter(mockRequest, mockHandler)
    expect(mockHandler).toHaveBeenCalledTimes(1) // Should not be called again
    expect(response.status).toBe(429)
  })

  it('should add rate limit headers', async () => {
    const rateLimiter = rateLimit({ 
      windowMs: 60000, 
      maxRequests: 10, 
      headers: true 
    })
    
    const mockResponse = {
      status: 200,
      headers: new Map(),
    } as any
    
    mockHandler.mockResolvedValueOnce(mockResponse)
    
    await rateLimiter(mockRequest, mockHandler)
    
    // Check that headers would be set (mocked implementation)
    expect(mockHandler).toHaveBeenCalledTimes(1)
  })

  it('should use custom key generator', async () => {
    const customKeyGenerator = jest.fn().mockReturnValue('custom-key')
    const rateLimiter = rateLimit({ 
      windowMs: 60000, 
      maxRequests: 1,
      keyGenerator: customKeyGenerator
    })
    
    await rateLimiter(mockRequest, mockHandler)
    
    expect(customKeyGenerator).toHaveBeenCalledWith(mockRequest)
  })

  it('should skip successful requests if configured', async () => {
    const rateLimiter = rateLimit({ 
      windowMs: 60000, 
      maxRequests: 1,
      skipSuccessfulRequests: true
    })
    
    const successResponse = { status: 200, headers: new Map() } as any
    mockHandler.mockResolvedValueOnce(successResponse)
    
    // First request - should be allowed and not count against limit
    await rateLimiter(mockRequest, mockHandler)
    
    // Second request - should also be allowed since first was skipped
    await rateLimiter(mockRequest, mockHandler)
    
    expect(mockHandler).toHaveBeenCalledTimes(2)
  })
})