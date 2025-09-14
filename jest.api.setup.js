// Setup for API route tests - Node environment

// Mock Supabase server client for API tests
jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ 
        data: { user: { id: 'test-user-id', email: 'test@example.com' } }, 
        error: null 
      })
    },
    from: jest.fn(() => {
      const chain = {
        select: jest.fn(() => chain),
        eq: jest.fn(() => chain),
        order: jest.fn(() => chain),
        gte: jest.fn(() => chain),
        lte: jest.fn(() => chain),
        in: jest.fn(() => chain),
        upsert: jest.fn().mockResolvedValue({ data: {}, error: null }),
        insert: jest.fn().mockResolvedValue({ data: {}, error: null }),
        update: jest.fn().mockResolvedValue({ data: {}, error: null }),
        delete: jest.fn().mockResolvedValue({ data: {}, error: null }),
        single: jest.fn().mockResolvedValue({ data: {}, error: null }),
      }
      return chain
    }),
    rpc: jest.fn().mockResolvedValue({ data: { success: true }, error: null })
  })
}))

// Mock auth middleware
jest.mock('@/lib/auth/api-key', () => ({
  getAuthenticatedUser: jest.fn().mockResolvedValue({ 
    id: 'test-user-id', 
    email: 'test@example.com' 
  })
}))

// Mock rate limiting
jest.mock('@/lib/validation/middleware', () => ({
  validateInput: (schema) => (request, handler) => handler({}, request),
  rateLimitPerUser: () => () => Promise.resolve(),
  paginationSchema: { parse: (data) => data },
  searchSchema: { parse: (data) => data },
}))

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
}