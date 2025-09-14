import { NextRequest } from 'next/server'

describe('Weekly AI PDF API', () => {
  it('POST returns application/pdf', async () => {
    const { POST } = await import('../../app/api/ai/reports/weekly/pdf/route')
    const payload = {
      branding: { companyName: 'Acme', logoUrl: '', contactEmail: '' },
      period: 'Test Period',
      options: { includeCover: true, repeatHeader: true, rowStriping: true },
      report: {
        executiveSummary: 'Summary text goes here',
        reports: [
          { client: 'Client A', totals: { hours: 12.5, amount: 2500 }, highlights: ['Great progress'] },
          { client: 'Client B', totals: { hours: 8.0, amount: 1600 }, highlights: [] }
        ]
      }
    }
    const req = new Request('http://localhost/api/ai/reports/weekly/pdf', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } })
    const res = await (POST as any)(req as NextRequest)
    expect(res.status).toBe(200)
    const ct = res.headers.get('content-type') || res.headers.get('Content-Type')
    expect(ct).toMatch(/application\/pdf/)
    const buf = Buffer.from(await res.arrayBuffer())
    expect(buf.length).toBeGreaterThan(100)
  })
})

