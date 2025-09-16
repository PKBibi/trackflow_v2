import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ 
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null 
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  }),
}))

// Mock Supabase server
jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id', email: 'test@example.com' } }, error: null }),
    },
    from: jest.fn(() => {
      const chain = {
        select: jest.fn(() => chain),
        eq: jest.fn(() => chain),
        order: jest.fn(() => chain),
        gte: jest.fn(() => chain),
        lte: jest.fn(() => chain),
        in: jest.fn(() => chain),
        single: jest.fn().mockResolvedValue({ data: {}, error: null }),
      }
      return chain
    }),
    rpc: jest.fn().mockResolvedValue({ data: { success: true }, error: null })
  })
}))

// Polyfill for crypto subtle in tests if needed
if (!global.crypto) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { webcrypto } = require('crypto')
  global.crypto = webcrypto
}

// Set up Web APIs for Next.js API route testing
try {
  const { Request, Response, Headers, fetch } = require('undici')

  // Set up Web APIs globally before any imports
  Object.assign(globalThis, {
    Request,
    Response,
    Headers,
    fetch
  })

  // Also set on global for compatibility
  global.Request = Request
  global.Response = Response
  global.Headers = Headers
  global.fetch = fetch

} catch (error) {
  console.warn('Could not set up undici polyfills:', error.message)
}

// Mock fetch for tests that need mocking
global.fetch = jest.fn()

// Setup window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated  
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
