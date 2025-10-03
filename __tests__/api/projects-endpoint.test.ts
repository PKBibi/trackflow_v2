import { NextRequest } from 'next/server'
import { GET, PUT, DELETE } from '@/app/api/v1/projects/[id]/route'

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}))

jest.mock('@/lib/auth/team', () => ({
  getActiveTeam: jest.fn(),
  requireTeamRole: jest.fn()
}))

jest.mock('@/lib/auth/api-key', () => ({
  getAuthenticatedUser: jest.fn()
}))

describe('Projects [id] Endpoint', () => {
  let mockSupabase: any
  const mockUserId = 'user-123'
  const mockTeamId = 'team-456'
  const mockProjectId = 'project-789'

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mock Supabase
    mockSupabase = {
      from: jest.fn(() => mockSupabase),
      select: jest.fn(() => mockSupabase),
      update: jest.fn(() => mockSupabase),
      delete: jest.fn(() => mockSupabase),
      eq: jest.fn(() => mockSupabase),
      single: jest.fn(() => mockSupabase),
      auth: {
        getUser: jest.fn(() => ({
          data: { user: { id: mockUserId } },
          error: null
        }))
      }
    }

    const { createClient } = require('@/lib/supabase/server')
    createClient.mockResolvedValue(mockSupabase)

    const { getActiveTeam, requireTeamRole } = require('@/lib/auth/team')
    getActiveTeam.mockResolvedValue({
      ok: true,
      teamId: mockTeamId,
      role: 'member'
    })
    requireTeamRole.mockResolvedValue({
      ok: true,
      teamId: mockTeamId,
      role: 'member'
    })

    const { getAuthenticatedUser } = require('@/lib/auth/api-key')
    getAuthenticatedUser.mockResolvedValue({ id: mockUserId, email: 'test@example.com' })
  })

  describe('GET /api/v1/projects/[id]', () => {
    it('should return project with team_id filter', async () => {
      const mockProject = {
        id: mockProjectId,
        name: 'Test Project',
        team_id: mockTeamId,
        user_id: mockUserId
      }

      mockSupabase.single.mockResolvedValue({
        data: mockProject,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/v1/projects/project-789')
      const response = await GET(request, { params: { id: mockProjectId } })

      expect(response.status).toBe(200)
      expect(mockSupabase.eq).toHaveBeenCalledWith('team_id', mockTeamId)
    })

    it('should return 404 for project from different team', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows returned' }
      })

      const request = new NextRequest('http://localhost:3000/api/v1/projects/other-project')
      const response = await GET(request, { params: { id: 'other-project' } })

      expect(response.status).toBe(404)
    })

    it('should require authentication', async () => {
      const { getAuthenticatedUser } = require('@/lib/auth/api-key')
      getAuthenticatedUser.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/v1/projects/project-789')
      const response = await GET(request, { params: { id: mockProjectId } })

      expect(response.status).toBe(401)
    })
  })

  describe('PUT /api/v1/projects/[id]', () => {
    it('should update project with team_id filter', async () => {
      const mockUpdatedProject = {
        id: mockProjectId,
        name: 'Updated Project',
        team_id: mockTeamId,
        user_id: mockUserId
      }

      mockSupabase.single.mockResolvedValue({
        data: mockUpdatedProject,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/v1/projects/project-789', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Project' })
      })

      const response = await PUT(request, { params: { id: mockProjectId } })

      expect(response.status).toBe(200)
      expect(mockSupabase.eq).toHaveBeenCalledWith('team_id', mockTeamId)
    })

    it('should prevent updating project from different team', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'No rows returned' }
      })

      const request = new NextRequest('http://localhost:3000/api/v1/projects/other-project', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Hacked' })
      })

      const response = await PUT(request, { params: { id: 'other-project' } })

      expect(response.status).not.toBe(200)
    })

    it('should require member role', async () => {
      const { requireTeamRole } = require('@/lib/auth/team')
      requireTeamRole.mockResolvedValue({
        ok: false,
        response: new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
      })

      const request = new NextRequest('http://localhost:3000/api/v1/projects/project-789', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' })
      })

      const response = await PUT(request, { params: { id: mockProjectId } })

      expect(response.status).toBe(403)
    })

    it('should validate request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/projects/project-789', {
        method: 'PUT',
        body: JSON.stringify({ invalid_field: 'test' })
      })

      const response = await PUT(request, { params: { id: mockProjectId } })

      // Should validate and reject invalid fields
      expect(response.status).toBe(400)
    })
  })

  describe('DELETE /api/v1/projects/[id]', () => {
    it('should delete project with team_id filter', async () => {
      mockSupabase.delete.mockResolvedValue({
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/v1/projects/project-789', {
        method: 'DELETE'
      })

      const response = await DELETE(request, { params: { id: mockProjectId } })

      expect(response.status).toBe(200)
      expect(mockSupabase.eq).toHaveBeenCalledWith('team_id', mockTeamId)
    })

    it('should prevent deleting project from different team', async () => {
      mockSupabase.delete.mockResolvedValue({
        error: null
      })

      // Mock that no rows were affected (different team)
      mockSupabase.eq.mockReturnValue({
        ...mockSupabase,
        delete: jest.fn().mockResolvedValue({ error: { message: 'No rows deleted' } })
      })

      const request = new NextRequest('http://localhost:3000/api/v1/projects/other-project', {
        method: 'DELETE'
      })

      const response = await DELETE(request, { params: { id: 'other-project' } })

      expect(response.status).not.toBe(200)
    })

    it('should require admin role', async () => {
      const { requireTeamRole } = require('@/lib/auth/team')
      requireTeamRole.mockResolvedValue({
        ok: false,
        response: new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
      })

      const request = new NextRequest('http://localhost:3000/api/v1/projects/project-789', {
        method: 'DELETE'
      })

      const response = await DELETE(request, { params: { id: mockProjectId } })

      expect(response.status).toBe(403)
    })
  })

  describe('Team isolation verification', () => {
    it('should never allow access to other team data', async () => {
      const otherTeamProject = {
        id: 'other-project',
        team_id: 'other-team-id',
        user_id: mockUserId // Same user, different team
      }

      mockSupabase.single.mockResolvedValue({
        data: null, // Should not return data due to team_id filter
        error: { code: 'PGRST116' }
      })

      const request = new NextRequest('http://localhost:3000/api/v1/projects/other-project')
      const response = await GET(request, { params: { id: 'other-project' } })

      // Should return 404 even though project exists (different team)
      expect(response.status).toBe(404)
      expect(mockSupabase.eq).toHaveBeenCalledWith('team_id', mockTeamId)
    })
  })
})
