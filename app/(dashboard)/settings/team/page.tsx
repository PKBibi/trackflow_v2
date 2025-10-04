'use client';

import { log } from '@/lib/logger';
import { useState, useEffect, useCallback } from 'react';
import { 
  UserPlus, 
  Search, 
  MoreVertical, 
  Shield, 
  Clock,
  DollarSign,
  Mail,
  X,
  Check,
  AlertCircle,
  Users
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { teamAPI, type TeamMember, type TeamInvitation } from '@/lib/api/team';
import { Loader2 } from 'lucide-react';

export default function TeamManagementPage() {
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<TeamInvitation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string>('member');
  const [teamId, setTeamId] = useState<string>('');

  // Check subscription plan
  const [plan, setPlan] = useState<'free' | 'pro' | 'enterprise'>('free');
  const teamLimit = plan === 'enterprise' ? 999 : plan === 'pro' ? 10 : 3;
  const currentTeamSize = teamMembers.length;
  const hasTeamFeatures = plan !== 'free';
  
  const loadPlan = useCallback(async () => {
    try {
      const response = await fetch('/api/me/plan');
      const data = await response.json();
      setPlan(data.plan || 'free');
    } catch (error) {
      log.error('Failed to load plan:', error);
    }
  }, []);
  
  const loadTeamData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load team members
      const { members, team_id } = await teamAPI.getMembers();
      setTeamMembers(members);
      setTeamId(team_id);
      
      // Find current user's role
      const currentUserEmail = await getCurrentUserEmail();
      const currentMember = members.find(m => m.email === currentUserEmail);
      if (currentMember) {
        setCurrentUserRole(currentMember.role);
      }
      
      // Load pending invitations if user is admin/owner
      if (currentMember && ['owner', 'admin'].includes(currentMember.role)) {
        const { invitations } = await teamAPI.getInvitations();
        setPendingInvites(invitations);
      }
    } catch (error) {
      log.error('Failed to load team data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load team data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Load team data on mount
  useEffect(() => {
    loadTeamData();
    loadPlan();
  }, [loadTeamData, loadPlan]);
  
  const getCurrentUserEmail = async () => {
    try {
      const response = await fetch('/api/me/plan');
      const data = await response.json();
      return data.email || '';
    } catch {
      return '';
    }
  };

  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member' as 'admin' | 'member',
    message: ''
  });

  // Filter team members based on search
  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Send invite
  const handleSendInvite = async () => {
    setIsLoading(true);
    try {
      const { invitation } = await teamAPI.sendInvitation(
        inviteForm.email,
        inviteForm.role as 'owner' | 'admin' | 'member' | 'viewer'
      );
      
      setPendingInvites([...pendingInvites, invitation]);
      
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${inviteForm.email}`,
      });
      
      setInviteDialogOpen(false);
      setInviteForm({
        email: '',
        role: 'member',
        message: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel invite
  const handleCancelInvite = async (inviteId: string) => {
    try {
      await teamAPI.cancelInvitation(inviteId);
      setPendingInvites(pendingInvites.filter(inv => inv.id !== inviteId));
      toast({
        title: "Invitation cancelled",
        description: "The invitation has been cancelled.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel invitation.",
        variant: "destructive",
      });
    }
  };

  // Update member
  const handleUpdateMember = async (memberId: string, updates: { role?: TeamMember['role'], status?: TeamMember['status'] }) => {
    try {
      const { member } = await teamAPI.updateMember(memberId, updates);
      setTeamMembers(teamMembers.map(m => 
        m.id === memberId ? { ...m, ...updates } : m
      ));
      
      toast({
        title: "Member updated",
        description: "Team member details have been updated.",
      });
      
      setEditingMember(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update member.",
        variant: "destructive",
      });
    }
  };

  // Remove member
  const handleRemoveMember = async (memberId: string) => {
    try {
      await teamAPI.removeMember(memberId);
      setTeamMembers(teamMembers.filter(member => member.id !== memberId));
      
      toast({
        title: "Member removed",
        description: "Team member has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove member.",
        variant: "destructive",
      });
    }
  };

  // Format last active time
  const formatLastActive = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getRoleBadgeColor = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (!hasTeamFeatures) {
    return (
      <div className="container max-w-6xl py-8">
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Team Management</CardTitle>
            <CardDescription>
              Upgrade to an Agency plan to invite team members and collaborate
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button className="mt-4" onClick={() => window.location.href = '/pricing'}>
              Upgrade to Pro Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Team Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your team members and their permissions
        </p>
      </div>

      {/* Team Overview */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Team Members</CardDescription>
            <CardTitle className="text-2xl">
              {currentTeamSize}/{teamLimit}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Now</CardDescription>
            <CardTitle className="text-2xl">
              {teamMembers.filter(m => Date.now() - new Date(m.lastActive).getTime() < 300000).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Invites</CardDescription>
            <CardTitle className="text-2xl">{pendingInvites.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg. Hourly Rate</CardDescription>
            <CardTitle className="text-2xl">
              $0
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="invites">Pending Invites</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Team Members</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
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
                      <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Email Address</Label>
                          <Input
                            type="email"
                            placeholder="colleague@company.com"
                            value={inviteForm.email}
                            onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Select 
                            value={inviteForm.role}
                            onValueChange={(value: 'admin' | 'member') => 
                              setInviteForm({...inviteForm, role: value})
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Hourly rate removed - not supported in current schema */}
                        <div className="space-y-2">
                          <Label>Personal Message (Optional)</Label>
                          <textarea
                            className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                            placeholder="Welcome to the team!"
                            value={inviteForm.message}
                            onChange={(e) => setInviteForm({...inviteForm, message: e.target.value})}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setInviteDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleSendInvite}
                            disabled={!inviteForm.email || isLoading}
                          >
                            {isLoading ? 'Sending...' : 'Send Invitation'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Hourly Rate</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <div className="bg-gradient-to-br from-blue-500 to-purple-500 h-full w-full rounded-full flex items-center justify-center text-white font-medium">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(member.role)}>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>No rate set</TableCell>
                      <TableCell>{new Date(member.joinedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatLastActive(member.lastActive!)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" aria-label="Open member actions menu">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => setEditingMember(member)}
                            >
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              View Activity
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={member.role === 'owner'}
                            >
                              Change Permissions
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              disabled={member.role === 'owner'}
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>
                Manage pending team invitations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingInvites.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending invitations</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingInvites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-lg">
                          <Clock className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                        </div>
                        <div>
                          <p className="font-medium">{invite.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Invited as {invite.role} • Expires {new Date(invite.expires_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Resend
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCancelInvite(invite.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Member Dialog */}
      {editingMember && (
        <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Team Member</DialogTitle>
              <DialogDescription>
                Update member details and permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editingMember.email}
                  onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select 
                  value={editingMember.role}
                  disabled={editingMember.role === 'owner'}
                  onValueChange={(value: TeamMember['role']) => 
                    setEditingMember({...editingMember, role: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner" disabled>Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Hourly rate removed - not supported in current schema */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingMember(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleUpdateMember(editingMember.id, editingMember)}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
