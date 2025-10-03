jest.mock('next/server', () => ({
  NextResponse: { json: jest.fn() },
  NextRequest: class {},
}))

import { rateLimitPerUser } from '@/lib/validation/middleware'
import { HttpError } from '@/lib/errors'

describe('rateLimitPerUser fallback', () => {
  it('allows up to the configured number of requests', async () => {
    const rateLimit = await rateLimitPerUser(2, 1000, 'test')

    await rateLimit('user-1')
    await rateLimit('user-1')

    await expect(rateLimit('user-1')).rejects.toThrow(HttpError)
  })

  it('resets after the window passes', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00Z'))

    const rateLimit = await rateLimitPerUser(1, 1000, 'test')

    await rateLimit('user-2')
    await expect(rateLimit('user-2')).rejects.toThrow(HttpError)

    jest.advanceTimersByTime(1000)

    await expect(rateLimit('user-2')).resolves.toBeUndefined()

    jest.useRealTimers()
  })
})
