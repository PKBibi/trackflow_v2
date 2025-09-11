export interface TeamMember {
  id: string
  user_id: string | null
  email: string
  name: string
  avatar: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  status: 'active' | 'invited' | 'inactive'
  permissions: string[]
  joinedAt: string
  lastActive: string
}

export interface TeamInvitation {
  id: string
  email: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  expires_at: string
  token?: string
}

class TeamAPI {
  // Get all team members
  async getMembers(): Promise<{ members: TeamMember[], total: number, team_id: string }> {
    const response = await fetch('/api/team/members')
    if (!response.ok) {
      throw new Error('Failed to fetch team members')
    }
    return response.json()
  }

  // Update team member
  async updateMember(memberId: string, updates: {
    role?: TeamMember['role']
    permissions?: string[]
    status?: TeamMember['status']
  }): Promise<{ member: TeamMember }> {
    const response = await fetch(`/api/team/members/${memberId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update team member')
    }
    return response.json()
  }

  // Remove team member
  async removeMember(memberId: string): Promise<void> {
    const response = await fetch(`/api/team/members/${memberId}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to remove team member')
    }
  }

  // Send invitation
  async sendInvitation(email: string, role: TeamMember['role'] = 'member'): Promise<{
    success: boolean
    invitation: TeamInvitation
  }> {
    const response = await fetch('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role, sendEmail: true })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to send invitation')
    }
    return response.json()
  }

  // Get pending invitations
  async getInvitations(): Promise<{ invitations: TeamInvitation[] }> {
    const response = await fetch('/api/team/invite')
    if (!response.ok) {
      throw new Error('Failed to fetch invitations')
    }
    return response.json()
  }

  // Accept invitation
  async acceptInvitation(token: string): Promise<{
    success: boolean
    member_id: string
    team_id: string
  }> {
    const response = await fetch('/api/team/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to accept invitation')
    }
    return response.json()
  }

  // Cancel invitation
  async cancelInvitation(invitationId: string): Promise<void> {
    const response = await fetch(`/api/team/invite/${invitationId}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to cancel invitation')
    }
  }

  // Resend invitation
  async resendInvitation(invitationId: string): Promise<void> {
    const response = await fetch(`/api/team/invite/${invitationId}/resend`, {
      method: 'POST'
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to resend invitation')
    }
  }
}

export const teamAPI = new TeamAPI()