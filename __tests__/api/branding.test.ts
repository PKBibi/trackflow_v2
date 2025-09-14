import { NextRequest } from 'next/server'

describe('Branding API', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it('GET returns prefs and branding when present', async () => {
    jest.doMock('@/lib/supabase/server', () => ({
      createClient: () => ({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }) },
        from: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              branding_company: 'Acme', branding_logo_url: 'https://logo', branding_contact_email: 'ops@acme.co',
              locale: 'en-US', currency_code: 'USD', pdf_include_cover: true, pdf_repeat_header: true
            }, error: null
          })
        }))
      })
    }))
    const { GET } = await import('../../app/api/me/branding/route')
    const request = new NextRequest('http://localhost:3000/api/me/branding')
    const res = await GET(request)
    const json = await res.json()
    expect(json.branding.companyName).toBe('Acme')
    expect(json.prefs.locale).toBe('en-US')
    expect(json.prefs.includeCover).toBe(true)
  })

  it('PUT upserts branding and prefs', async () => {
    const upsert = jest.fn().mockResolvedValue({ data: {}, error: null })
    jest.doMock('@/lib/supabase/server', () => ({
      createClient: () => ({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }) },
        from: jest.fn(() => ({ upsert }))
      })
    }))
    const { PUT } = await import('../../app/api/me/branding/route')
    const body = { branding: { companyName: 'Acme', logoUrl: '', contactEmail: '' }, prefs: { includeCover: false, repeatHeader: true } }
    const req = new NextRequest('http://localhost:3000/api/me/branding', { 
      method: 'PUT', 
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json' }
    })
    const res = await PUT(req)
    expect(res.status).toBe(200)
    expect(upsert).toHaveBeenCalled()
  })
})

