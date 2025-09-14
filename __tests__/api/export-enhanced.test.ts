import { NextRequest } from 'next/server'

describe('Enhanced Export API', () => {
  beforeEach(() => jest.resetModules())

  it('CSV includes branded header', async () => {
    // Mock Supabase server client for auth and query
    jest.doMock('@/lib/supabase/server', () => ({
      createClient: () => ({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1', email: 'u@example.com' } }, error: null }) },
        from: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          in: jest.fn().mockReturnThis(),
          then: undefined,
          // time entries data shape for mapping
          // Return minimal fields needed by route
          // Using resolved value on await query
          // @ts-ignore
          async [Symbol.asyncIterator]() {}
        })),
        // direct query resolution via await query
      })
    }))
    const { POST } = await import('../../app/api/export/enhanced/route')
    const body = {
      format: 'csv', dataType: 'time_entries', dateRange: { start: '2025-01-01', end: '2025-01-07' },
      branding: { companyName: 'Acme Agency', logoUrl: 'https://logo', contactEmail: 'ops@acme.co' }
    }
    const req = new NextRequest('http://localhost:3000/api/export/enhanced', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(body) 
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text.startsWith('# Report for: Acme Agency')).toBe(true)
  })
})

