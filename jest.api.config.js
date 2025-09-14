const nextJest = require('next/jest')

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  dir: './',
})

// API-specific Jest config
const config = {
  displayName: 'API Routes',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.api.setup.js'],
  testMatch: ['**/__tests__/api/**/*.test.{js,ts,tsx}'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
}

module.exports = createJestConfig(config)