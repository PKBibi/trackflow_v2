'use client'

import { useState, useEffect } from 'react'
import { Plus, Mail, UserPlus, UserMinus, Shield, Users, Settings, Trash2, Check, X, MoreVertical, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'

interface TeamMember {
  id: string
  email: string
  full_name: string
  avatar_url: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  status: 'active' | 'invited' | 'inactive'
  joined_at: string
  last_active: string
  permissions: string[]
}

interface TeamInvite {
  id: string
  email: string
  role: string
  invited_by: string
  invited_at: string
  expires_at: string
  status: 'pending' | 'accepted' | 'expired'
}

export default function TeamSettingsPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invites, setInvites] = useState<TeamInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<string>('member')
  const [searchQuery, setSearchQuery] = useState('')
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [sendingInvite, setSendingInvite] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadTeamData()
  }, [])

  const loadTeamData = async () => {
    try {
      // Load team members
      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select('*, profiles(*)')
        .order('joined_at', { ascending: false })

      if (membersError) throw membersError

      const formattedMembers = membersData?.map(member => ({
        id: member.id,
        email: member.profiles?.email || member.email,
        full_name: member.profiles?.full_name || 'Unknown',
        avatar_url: member.profiles?.avatar_url || '',
        role: member.role,
        status: member.status,
        joined_at: member.joined_at,
        last_active: member.last_active,
        permissions: member.permissions || []
      })) || []

      setMembers(formattedMembers)

      // Load pending invites
      const { data: invitesData, error: invitesError } = await supabase
        .from('team_invites')
        .select('*')
        .eq('status', 'pending')
        .order('invited_at', { ascending: false })

      if (invitesError) throw invitesError
      setInvites(invitesData || [])
    } catch (error) {
      console.error('Error loading team data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load team data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const sendInvite = async () => {
    setSendingInvite(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create invite record
      const { data, error } = await supabase
        .from('team_invites')
        .insert({
          email: inviteEmail,
          role: inviteRole,
          invited_by: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .select()
        .single()

      if (error) throw error

      // Send invite email via API
      await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          inviteId: data.id
        })
      })

      toast({
        title: 'Invitation Sent',
        description: `Invitation sent to ${inviteEmail}`
      })

      setInvites([data, ...invites])
      setInviteEmail('')
      setInviteDialogOpen(false)
    } catch (error) {
      console.error('Error sending invite:', error)
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive'
      })
    } finally {
      setSendingInvite(false)
    }
  }

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role: newRole })
        .eq('id', memberId)

      if (error) throw error

      setMembers(members.map(m => 
        m.id === memberId ? { ...m, role: newRole as any } : m
      ))

      toast({
        title: 'Role Updated',
        description: 'Member role has been updated'
      })
    } catch (error) {
      console.error('Error updating role:', error)
      toast({
        title: 'Error',
        description: 'Failed to update member role',
        variant: 'destructive'
      })
    }
  }

  const removeMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      setMembers(members.filter(m => m.id !== memberId))

      toast({
        title: 'Member Removed',
        description: 'Team member has been removed'
      })
    } catch (error) {
      console.error('Error removing member:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove team member',
        variant: 'destructive'
      })
    }
  }

  const cancelInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('team_invites')
        .update({ status: 'expired' })
        .eq('id', inviteId)

      if (error) throw error

      setInvites(invites.filter(i => i.id !== inviteId))

      toast({
        title: 'Invite Cancelled',
        description: 'The invitation has been cancelled'
      })
    } catch (error) {
      console.error('Error cancelling invite:', error)
      toast({
        title: 'Error',
        description: 'Failed to cancel invitation',
        variant: 'destructive'
      })
    }
  }

  const resendInvite = async (inviteId: string) => {
    try {
      const invite = invites.find(i => i.id === inviteId)
      if (!invite) return

      // Send reminder email
      await fetch('/api/team/invite/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId })
      })

      toast({
        title: 'Reminder Sent',
        description: `Reminder sent to ${invite.email}`
      })
    } catch (error) {
      console.error('Error resending invite:', error)
      toast({
        title: 'Error',
        description: 'Failed to resend invitation',
        variant: 'destructive'
      })
    }
  }

  const filteredMembers = members.filter(member =>
    member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'member': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'viewer': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      default: return ''
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Team Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your team members and their permissions
        </p>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="w-4 h-4 mr-2" />
            Members ({members.length})
          </TabsTrigger>
          <TabsTrigger value="invites">
            <Mail className="w-4 h-4 mr-2" />
            Pending Invites ({invites.length})
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Shield className="w-4 h-4 mr-2" />
            Permissions
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage your team members and their roles
                  </CardDescription>
                </div>
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                      <DialogDescription>
                        Send an invitation to join your team
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="invite-email">Email Address</Label>
                        <Input
                          id="invite-email"
                          type="email"
                          placeholder="colleague@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="invite-role">Role</Label>
                        <Select value={inviteRole} onValueChange={setInviteRole}>
                          <SelectTrigger id="invite-role">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setInviteDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={sendInvite}
                        disabled={!inviteEmail || sendingInvite}
                      >
                        {sendingInvite ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send Invitation'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={member.avatar_url} alt={member.full_name} />
                        <AvatarFallback>
                          {member.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{member.full_name}</p>
                          <Badge className={getRoleBadgeColor(member.role)}>
                            {member.role}
                          </Badge>
                          {member.status === 'invited' && (
                            <Badge variant="outline">Invited</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {member.role !== 'owner' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => updateMemberRole(member.id, 'admin')}
                            disabled={member.role === 'admin'}
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateMemberRole(member.id, 'member')}
                            disabled={member.role === 'member'}
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Make Member
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateMemberRole(member.id, 'viewer')}
                            disabled={member.role === 'viewer'}
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Make Viewer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => removeMember(member.id)}
                          >
                            <UserMinus className="w-4 h-4 mr-2" />
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invites Tab */}
        <TabsContent value="invites" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>
                Manage pending team invitations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invites.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending invitations
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Invited By</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invites.map((invite) => (
                      <TableRow key={invite.id}>
                        <TableCell>{invite.email}</TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(invite.role)}>
                            {invite.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{invite.invited_by}</TableCell>
                        <TableCell>
                          {new Date(invite.invited_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(invite.expires_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resendInvite(invite.id)}
                            >
                              Resend
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => cancelInvite(invite.id)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>
                Configure permissions for each role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {['owner', 'admin', 'member', 'viewer'].map((role) => (
                  <div key={role} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleBadgeColor(role)}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-4">
                      {role === 'owner' && (
                        <>
                          <Label className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            All permissions
                          </Label>
                        </>
                      )}
                      {role === 'admin' && (
                        <>
                          <Label className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            Manage projects
                          </Label>
                          <Label className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            Manage team
                          </Label>
                          <Label className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            View reports
                          </Label>
                          <Label className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            Manage invoices
                          </Label>
                          <Label className="flex items-center gap-2">
                            <X className="w-4 h-4 text-red-600" />
                            Billing settings
                          </Label>
                        </>
                      )}
                      {role === 'member' && (
                        <>
                          <Label className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            Track time
                          </Label>
                          <Label className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            View projects
                          </Label>
                          <Label className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            Edit own entries
                          </Label>
                          <Label className="flex items-center gap-2">
                            <X className="w-4 h-4 text-red-600" />
                            Manage team
                          </Label>
                          <Label className="flex items-center gap-2">
                            <X className="w-4 h-4 text-red-600" />
                            Manage invoices
                          </Label>
                        </>
                      )}
                      {role === 'viewer' && (
                        <>
                          <Label className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            View projects
                          </Label>
                          <Label className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            View reports
                          </Label>
                          <Label className="flex items-center gap-2">
                            <X className="w-4 h-4 text-red-600" />
                            Track time
                          </Label>
                          <Label className="flex items-center gap-2">
                            <X className="w-4 h-4 text-red-600" />
                            Edit entries
                          </Label>
                          <Label className="flex items-center gap-2">
                            <X className="w-4 h-4 text-red-600" />
                            Manage team
                          </Label>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

