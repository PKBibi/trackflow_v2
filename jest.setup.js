const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

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
  createClient: () => {
    const chain = {
      select: jest.fn(() => chain),
      eq: jest.fn(() => chain),
      order: jest.fn(() => chain),
      gte: jest.fn(() => chain),
      lte: jest.fn(() => chain),
      in: jest.fn(() => chain),
      not: jest.fn(() => chain),
      is: jest.fn(() => chain),
      or: jest.fn(() => chain),
      insert: jest.fn(() => chain),
      update: jest.fn(() => chain),
      delete: jest.fn(() => chain),
      single: jest.fn().mockResolvedValue({ data: {}, error: null }),
      then: jest.fn(resolve => resolve({ data: [], error: null }))
    };
    return {
      auth: {
        getUser: jest.fn().mockResolvedValue({ 
          data: { user: { id: 'test-user-id', email: 'test@example.com' } },
          error: null 
        }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
      },
      from: jest.fn(() => chain),
    };
  },
}))

// Mock Supabase server
jest.mock('@/lib/supabase/server', () => ({
  createClient: () => {
    const chain = {
      select: jest.fn(() => chain),
      eq: jest.fn(() => chain),
      order: jest.fn(() => chain),
      gte: jest.fn(() => chain),
      lte: jest.fn(() => chain),
      in: jest.fn(() => chain),
      not: jest.fn(() => chain),
      is: jest.fn(() => chain),
      or: jest.fn(() => chain),
      insert: jest.fn(() => chain),
      update: jest.fn(() => chain),
      delete: jest.fn(() => chain),
      single: jest.fn().mockResolvedValue({ data: {}, error: null }),
      then: jest.fn(resolve => resolve({ data: [], error: null }))
    };
    return {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id', email: 'test@example.com' } }, error: null }),
      },
      from: jest.fn(() => chain),
      rpc: jest.fn().mockResolvedValue({ data: { success: true }, error: null })
    };
  }
}))

// Polyfill for crypto subtle in tests if needed
if (!global.crypto) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { webcrypto } = require('crypto')
  global.crypto = webcrypto
}

// Set up Web APIs for Next.js API route testing
// First, set up ReadableStream from node:stream/web
if (!global.ReadableStream) {
  const { ReadableStream: NodeReadableStream } = require('node:stream/web');
  global.ReadableStream = NodeReadableStream;
}

try {
  const { Request, Response, Headers, fetch } = require('undici')

  // Set up Web APIs globally
  if (!global.Request) global.Request = Request;
  if (!global.Response) global.Response = Response;
  if (!global.Headers) global.Headers = Headers;
  if (!global.fetch) global.fetch = fetch;

} catch (error) {
  console.warn('Could not set up undici polyfills:', error.message)

  // Fallback to basic mock implementations
  if (!global.Request) {
    global.Request = class Request {
      constructor(input, init) {
        this.url = typeof input === 'string' ? input : input.url;
        this.method = init?.method || 'GET';
        this.headers = new Map(Object.entries(init?.headers || {}));
        this.body = init?.body;
      }
      async json() { return JSON.parse(this.body); }
      async text() { return this.body; }
    };
  }

  if (!global.Response) {
    global.Response = class Response {
      constructor(body, init) {
        this.body = body;
        this.status = init?.status || 200;
        this.headers = new Map(Object.entries(init?.headers || {}));
      }
      async json() { return typeof this.body === 'string' ? JSON.parse(this.body) : this.body; }
      async text() { return typeof this.body === 'string' ? this.body : JSON.stringify(this.body); }
    };
  }

  if (!global.Headers) {
    global.Headers = class Headers extends Map {
      get(name) { return super.get(name.toLowerCase()); }
      set(name, value) { return super.set(name.toLowerCase(), value); }
    };
  }

  if (!global.fetch) {
    global.fetch = jest.fn().mockResolvedValue(new global.Response('{}', { status: 200 }));
  }
}

// Override fetch with jest mock for tests
global.fetch = jest.fn().mockResolvedValue(new global.Response('{}', { status: 200 }))

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
