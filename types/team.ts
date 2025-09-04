export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
  hourlyRate: number;
  avatar?: string;
  joinedAt: Date;
  lastActive?: Date;
  permissions?: TeamPermissions;
  invitedBy?: string;
  status: 'active' | 'pending' | 'inactive';
}

export interface TeamPermissions {
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canEditTimeEntries: boolean;
  canViewAllProjects: boolean;
  canManageClients: boolean;
  canViewReports: boolean;
  canExportData: boolean;
  canManageIntegrations: boolean;
  canViewBilling: boolean;
}

export interface TeamInvite {
  id: string;
  email: string;
  role: 'admin' | 'member';
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired';
  token: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName?: string;
  action: string;
  category: 'auth' | 'settings' | 'team' | 'time' | 'invoice' | 'client' | 'project' | 'security';
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  twoFactorBackupCodes?: string[];
  lastPasswordChange?: Date;
  passwordExpiryDays?: number;
  allowedIpAddresses?: string[];
  sessionTimeout?: number; // in minutes
}

export interface UserSession {
  id: string;
  userId: string;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  lastActive: Date;
  createdAt: Date;
  isCurrent: boolean;
}

