import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock modules used inside ReportsPage
jest.mock('@/lib/api/reports', () => ({
  reportsAPI: {
    getDashboardStats: jest.fn().mockResolvedValue({ totalHours: 0 }),
    getChannelSummary: jest.fn().mockResolvedValue([]),
    getClientSummary: jest.fn().mockResolvedValue([]),
    getTimeDistribution: jest.fn().mockResolvedValue([]),
  }
}))
jest.mock('@/lib/api/clients', () => ({
  clientsAPI: { getAll: jest.fn().mockResolvedValue([]) }
}))

// Component under test
import ReportsPage from '../../app/(dashboard)/reports/page'

describe('ReportsPage', () => {
  const originalFetch = global.fetch as any

  beforeEach(() => {
    global.fetch = jest.fn(async (input: RequestInfo) => {
      const url = String(input)
      if (url.endsWith('/api/me/plan')) {
        return new Response(JSON.stringify({ plan: 'pro' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
      if (url.endsWith('/api/me/branding')) {
        return new Response(JSON.stringify({ branding: { companyName: 'Acme', logoUrl: '', contactEmail: '' }, prefs: { includeCover: true, repeatHeader: true } }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
      if (url.endsWith('/api/ai/reports/weekly')) {
        return new Response(JSON.stringify({ executiveSummary: 'ok', reports: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
      if (url.endsWith('/api/ai/reports/weekly/pdf')) {
        // Return a tiny PDF-like buffer
        const bytes = new Uint8Array([0x25,0x50,0x44,0x46]) // %PDF
        return new Response(bytes, { status: 200, headers: { 'Content-Type': 'application/pdf' } })
      }
      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } })
    }) as any
  })

  afterEach(() => { global.fetch = originalFetch })

  it('shows Preferences button', async () => {
    render(<ReportsPage />)
    // Wait for loading to flip
    await waitFor(() => expect(screen.queryByText('Loading reports…')).not.toBeInTheDocument())
    expect(screen.getByTitle('Report Preferences')).toBeInTheDocument()
  })

  it('opens Preview PDF dialog after generating report', async () => {
    render(<ReportsPage />)
    await waitFor(() => expect(screen.queryByText('Loading reports…')).not.toBeInTheDocument())

    // Generate Weekly (AI)
    fireEvent.click(screen.getByText('Generate Weekly (AI)'))
    
    // Wait for the loading state to resolve
    await waitFor(() => {
      expect(screen.queryByText('Generating…')).not.toBeInTheDocument()
    })

    // Now the button should be present
    expect(screen.getByText('Preview PDF')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Preview PDF'))
    // Dialog title present
    await waitFor(() => expect(screen.getByText('Weekly Report Preview')).toBeInTheDocument())
  })
})

