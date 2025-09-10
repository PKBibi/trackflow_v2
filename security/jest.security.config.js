// Jest configuration for security tests
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  displayName: 'Security Tests',
  testMatch: [
    '<rootDir>/security/tests/**/*.test.{js,ts}',
  ],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/security/setup.js'],
  collectCoverageFrom: [
    'app/api/**/*.{js,ts}',
    'lib/**/*.{js,ts}',
    'middleware.ts',
    '!**/*.d.ts',
    '!**/*.config.{js,ts}',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 30000,
  verbose: true,
  bail: 1, // Stop on first failure for security tests
}

module.exports = createJestConfig(customJestConfig)