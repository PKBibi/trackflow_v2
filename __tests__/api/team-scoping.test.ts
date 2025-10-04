import { createClient } from '@/lib/supabase/client'
import { getActiveTeamId } from '@/lib/api/team-client'

// Mock the client that the API uses
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/lib/api/team-client', () => ({
  getActiveTeamId: jest.fn(),
}))

describe('Team Scoping', () => {
  const mockUserId = 'user-123'
  const mockTeamId = 'team-456'
  let mockSupabase: any;
  let timeEntriesAPI: any;
  let reportsAPI: any;

  beforeEach(() => {
    jest.resetModules();

    const chain = {
      select: jest.fn(() => chain),
      insert: jest.fn(() => chain),
      update: jest.fn(() => chain),
      delete: jest.fn(() => chain),
      eq: jest.fn(() => chain),
      gte: jest.fn(() => chain),
      lte: jest.fn(() => chain),
      not: jest.fn(() => chain),
      is: jest.fn(() => chain),
      or: jest.fn(() => chain),
      order: jest.fn(() => chain),
      in: jest.fn(() => chain),
      limit: jest.fn(() => chain),
      single: jest.fn().mockResolvedValue({ data: { id: '1' }, error: null }),
      then: (resolve: any) => resolve({ data: [{ id: '1' }], error: null }),
    };

    mockSupabase = {
      from: jest.fn(() => chain),
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        }),
      },
    };

    jest.doMock('@/lib/supabase/client', () => ({
      createClient: () => mockSupabase,
    }));

    jest.doMock('@/lib/api/team-client', () => ({
      getActiveTeamId: () => mockTeamId,
    }));

    // Import modules after mocks are set up
    timeEntriesAPI = require('@/lib/api/time-entries').timeEntriesAPI;
    reportsAPI = require('@/lib/api/reports').reportsAPI;
  });

  describe('Time Entries API', () => {
    it('should filter time entries by team_id on read', async () => {
      await timeEntriesAPI.getAll();
      expect(mockSupabase.from('time_entries').eq).toHaveBeenCalledWith('team_id', mockTeamId);
    });

    it('should include team_id when creating time entry', async () => {
      const newEntry = { client_id: 'client-1', project_id: 'project-1', start_time: new Date().toISOString(), task_title: 'Test' };
      await timeEntriesAPI.create(newEntry);
      expect(mockSupabase.from('time_entries').insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ team_id: mockTeamId }),
        ])
      );
    });

    it('should filter by team_id on update', async () => {
      await timeEntriesAPI.update('entry-1', { task_title: 'Updated' });
      expect(mockSupabase.from('time_entries').eq).toHaveBeenCalledWith('team_id', mockTeamId);
    });
  });

  describe('Reports API', () => {
    it('should scope dashboard stats to team', async () => {
      await reportsAPI.getDashboardStats({});
      expect(mockSupabase.from('time_entries').eq).toHaveBeenCalledWith('team_id', mockTeamId);
    });

    it('should scope channel summary to team', async () => {
      await reportsAPI.getChannelSummary();
      expect(mockSupabase.from('time_entries').eq).toHaveBeenCalledWith('team_id', mockTeamId);
    });
  });
});

