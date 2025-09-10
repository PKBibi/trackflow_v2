// Security test setup
const { TextEncoder, TextDecoder } = require('util')

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock crypto for Node.js
const { webcrypto } = require('crypto')
global.crypto = webcrypto

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.ENABLE_REDIS_RATE_LIMITING = 'false'
process.env.ENABLE_AUDIT_LOGGING = 'true'

// Mock console methods for cleaner test output
const originalWarn = console.warn
const originalError = console.error

console.warn = jest.fn()
console.error = jest.fn()

// Restore console methods after all tests
afterAll(() => {
  console.warn = originalWarn
  console.error = originalError
})

// Global test timeout
jest.setTimeout(30000)