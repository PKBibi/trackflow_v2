# Settings & Preferences Features Guide

## Overview

The Settings & Preferences section provides comprehensive account management capabilities including team management, data export, security settings, and activity logs. All features are designed with mobile responsiveness and user experience in mind.

## Features

### 1. Team Management (`/settings/team`)

Located at `/app/(dashboard)/settings/team/page.tsx`

#### Features:
- **Team Overview**: View team size, active members, pending invites, and average hourly rate
- **Invite Members**: Send email invitations with role assignment and default hourly rate
- **Member Management**:
  - Edit member details (name, email, role, hourly rate)
  - View last active time
  - Remove team members (except owner)
- **Pending Invitations**:
  - Track invitation status
  - Resend or cancel invitations
  - 7-day expiration on invites

#### Roles & Permissions:
- **Owner**: Full access, cannot be removed
- **Admin**: Manage team, settings, and all data
- **Member**: Limited to assigned projects and own data

#### UI Features:
- Search and filter team members
- Real-time activity indicators
- Color-coded role badges
- Responsive grid layout for stats

### 2. Data Export (`/settings/export`)

Located at `/app/(dashboard)/settings/export/page.tsx`

#### Export Options:
- **Data Types**:
  - Time Entries
  - Clients
  - Projects
  - Invoices
  - All Data (complete backup)

- **Formats**:
  - CSV (Excel compatible)
  - Excel (XLSX)
  - PDF (formatted reports)
  - JSON (raw data)

- **View Types**:
  - Detailed (all fields)
  - Summary (aggregated data)

#### Filtering Options:
- Date range selection
- Filter by client/project
- Billable entries only
- Include/exclude descriptions and rates
- Group by date, client, project, or activity

#### Export History:
- Track previous exports
- 30-day retention
- Re-download capability
- File size and format indicators

### 3. Security Settings (`/settings/security`)

Located at `/app/(dashboard)/settings/security/page.tsx`

#### Password Management:
- **Change Password**:
  - Current password verification
  - Password strength meter
  - Real-time validation
  - Requirements checker

- **Password Requirements**:
  - Minimum 8 characters
  - Mix of upper/lowercase
  - Numbers and special characters
  - Strength indicator (Weak/Fair/Good/Strong)

#### Two-Factor Authentication (2FA):
- **Setup Process**:
  - QR code generation
  - Manual secret key option
  - Verification code validation
  - Backup codes generation

- **Backup Codes**:
  - 8 recovery codes
  - One-time use only
  - Download/copy options
  - Regeneration capability

#### Session Management:
- **Active Sessions**:
  - Device and browser information
  - IP address and location
  - Last active timestamp
  - Current session indicator

- **Session Controls**:
  - End individual sessions
  - Sign out all other sessions
  - Real-time activity tracking
  - Unrecognized session alerts

### 4. Activity Logs (`/settings/activity`)

Located at `/app/(dashboard)/settings/activity/page.tsx`

#### Log Categories:
- **Authentication**: Login/logout events
- **Settings**: Configuration changes
- **Team**: Member invitations and removals
- **Time Tracking**: Entry creation/modification/deletion
- **Invoices**: Generation and updates
- **Clients**: Client management actions
- **Projects**: Project creation and updates
- **Security**: Password changes and 2FA events

#### Features:
- **Filtering**:
  - Search by description or action
  - Filter by category
  - Filter by user
  - Date range selection
  - Clear all filters

- **Statistics**:
  - Total activities count
  - Today's activity count
  - Weekly activity count
  - Active users count

- **Export**:
  - Export filtered logs to CSV
  - Include metadata and IP addresses
  - Timestamped filenames

#### Log Details:
- User identification
- Action description
- Category badge with icon
- IP address tracking
- Timestamp with relative time
- Metadata display

## API Integration

### Export API (`/app/api/export/route.ts`)

#### POST `/api/export`
Generates export files based on specified parameters:
```typescript
{
  format: 'csv' | 'excel' | 'pdf' | 'json',
  dataType: 'time_entries' | 'clients' | 'projects' | 'invoices' | 'all',
  dateRange: { from: Date, to: Date },
  filters: {
    clientId?: string,
    projectId?: string,
    billableOnly?: boolean,
    includeDescription?: boolean,
    includeRates?: boolean
  },
  viewType: 'detailed' | 'summary',
  groupBy?: 'none' | 'date' | 'client' | 'project' | 'activity'
}
```

#### GET `/api/export`
Returns export history for the current user.

## Types

All TypeScript types are defined in `/types/team.ts`:

- `TeamMember`: Complete team member profile
- `TeamPermissions`: Granular permission settings
- `TeamInvite`: Pending invitation details
- `ActivityLog`: Activity log entry structure
- `SecuritySettings`: 2FA and security configurations
- `UserSession`: Active session information

## Security Considerations

1. **Password Security**:
   - Passwords should be hashed using bcrypt
   - Implement rate limiting on password changes
   - Force logout on password change

2. **2FA Implementation**:
   - Use TOTP (Time-based One-Time Password)
   - Store secrets encrypted in database
   - Backup codes should be hashed

3. **Session Management**:
   - Use secure, httpOnly cookies
   - Implement CSRF protection
   - Regular session expiration

4. **Activity Logging**:
   - Log all sensitive actions
   - Include IP and user agent
   - Implement retention policies

## Mobile Optimization

All settings pages are fully responsive with:
- Touch-friendly controls
- Mobile-optimized layouts
- Collapsible sections
- Swipeable tabs
- Adaptive modals/dialogs

## Best Practices

1. **Team Management**:
   - Regularly review team permissions
   - Remove inactive members
   - Use appropriate roles

2. **Data Export**:
   - Schedule regular backups
   - Verify export completeness
   - Store exports securely

3. **Security**:
   - Enable 2FA for all team members
   - Regular password updates
   - Monitor unrecognized sessions

4. **Activity Monitoring**:
   - Review logs for suspicious activity
   - Export logs for compliance
   - Set up alerts for critical actions

## Future Enhancements

- SSO (Single Sign-On) integration
- Advanced role customization
- Automated export scheduling
- Real-time activity alerts
- IP whitelisting
- Audit log webhooks
- Biometric authentication support

