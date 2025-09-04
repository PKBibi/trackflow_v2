'use client';

import { useState } from 'react';
import { 
  Activity,
  Filter,
  Download,
  Search,
  Calendar,
  Shield,
  Settings,
  Users,
  Clock,
  FileText,
  DollarSign,
  Briefcase,
  LogIn,
  LogOut,
  Key,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { ActivityLog } from '@/types/team';

// Mock activity logs
const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    userId: '1',
    userName: 'John Doe',
    action: 'login',
    category: 'auth',
    description: 'User logged in',
    metadata: { method: '2FA' },
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome 119 on Windows',
    timestamp: new Date(Date.now() - 300000) // 5 minutes ago
  },
  {
    id: '2',
    userId: '1',
    userName: 'John Doe',
    action: 'time_entry_created',
    category: 'time',
    description: 'Created time entry for "Blog Writing" (2 hours)',
    metadata: { duration: 120, activity: 'Blog Writing', project: 'Content Marketing' },
    timestamp: new Date(Date.now() - 900000) // 15 minutes ago
  },
  {
    id: '3',
    userId: '2',
    userName: 'Jane Smith',
    action: 'client_updated',
    category: 'client',
    description: 'Updated client "Acme Corp"',
    metadata: { clientId: '1', changes: ['contact_email', 'billing_address'] },
    timestamp: new Date(Date.now() - 1800000) // 30 minutes ago
  },
  {
    id: '4',
    userId: '1',
    userName: 'John Doe',
    action: 'invoice_generated',
    category: 'invoice',
    description: 'Generated invoice #INV-2024-001 for $5,250',
    metadata: { invoiceId: 'INV-2024-001', amount: 5250, client: 'Tech Startup Inc' },
    timestamp: new Date(Date.now() - 3600000) // 1 hour ago
  },
  {
    id: '5',
    userId: '3',
    userName: 'Bob Wilson',
    action: 'project_created',
    category: 'project',
    description: 'Created project "Website Redesign"',
    metadata: { projectId: '1', client: 'Acme Corp' },
    timestamp: new Date(Date.now() - 7200000) // 2 hours ago
  },
  {
    id: '6',
    userId: '1',
    userName: 'John Doe',
    action: 'password_changed',
    category: 'security',
    description: 'Changed account password',
    metadata: {},
    ipAddress: '192.168.1.100',
    timestamp: new Date(Date.now() - 86400000) // 1 day ago
  },
  {
    id: '7',
    userId: '2',
    userName: 'Jane Smith',
    action: 'team_member_invited',
    category: 'team',
    description: 'Invited newmember@example.com to team',
    metadata: { email: 'newmember@example.com', role: 'member' },
    timestamp: new Date(Date.now() - 172800000) // 2 days ago
  },
  {
    id: '8',
    userId: '1',
    userName: 'John Doe',
    action: 'settings_updated',
    category: 'settings',
    description: 'Updated notification preferences',
    metadata: { changes: ['email_notifications', 'push_notifications'] },
    timestamp: new Date(Date.now() - 259200000) // 3 days ago
  },
  {
    id: '9',
    userId: '3',
    userName: 'Bob Wilson',
    action: 'time_entry_deleted',
    category: 'time',
    description: 'Deleted time entry from Nov 15, 2024',
    metadata: { date: '2024-11-15', duration: 90 },
    timestamp: new Date(Date.now() - 345600000) // 4 days ago
  },
  {
    id: '10',
    userId: '1',
    userName: 'John Doe',
    action: 'logout',
    category: 'auth',
    description: 'User logged out',
    metadata: {},
    ipAddress: '192.168.1.100',
    timestamp: new Date(Date.now() - 432000000) // 5 days ago
  }
];

export default function ActivityLogsPage() {
  const { toast } = useToast();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });

  // Get unique users for filter
  const uniqueUsers = Array.from(new Set(activityLogs.map(log => log.userName || 'Unknown')));

  // Filter logs
  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = searchQuery === '' || 
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    
    const matchesUser = userFilter === 'all' || log.userName === userFilter;
    
    const matchesDateRange = (!dateRange.from || log.timestamp >= dateRange.from) &&
      (!dateRange.to || log.timestamp <= dateRange.to);
    
    return matchesSearch && matchesCategory && matchesUser && matchesDateRange;
  });

  // Export activity logs
  const handleExportLogs = () => {
    // Convert logs to CSV
    const headers = ['Date', 'Time', 'User', 'Category', 'Action', 'Description', 'IP Address'];
    const rows = filteredLogs.map(log => [
      format(log.timestamp, 'yyyy-MM-dd'),
      format(log.timestamp, 'HH:mm:ss'),
      log.userName || 'Unknown',
      log.category,
      log.action,
      log.description,
      log.ipAddress || 'N/A'
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Download CSV
    const element = document.createElement('a');
    const file = new Blob([csv], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = `activity-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Exported",
      description: `Exported ${filteredLogs.length} activity logs`,
    });
  };

  // Get category icon
  const getCategoryIcon = (category: ActivityLog['category']) => {
    switch (category) {
      case 'auth':
        return <Key className="h-4 w-4" />;
      case 'settings':
        return <Settings className="h-4 w-4" />;
      case 'team':
        return <Users className="h-4 w-4" />;
      case 'time':
        return <Clock className="h-4 w-4" />;
      case 'invoice':
        return <FileText className="h-4 w-4" />;
      case 'client':
        return <Briefcase className="h-4 w-4" />;
      case 'project':
        return <DollarSign className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  // Get category badge color
  const getCategoryColor = (category: ActivityLog['category']) => {
    switch (category) {
      case 'auth':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'settings':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'team':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'time':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'invoice':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'client':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'project':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'security':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
    
    return format(date, 'MMM d, yyyy h:mm a');
  };

  // Get action icon for timeline
  const getActionIcon = (action: string) => {
    if (action.includes('login')) return <LogIn className="h-4 w-4" />;
    if (action.includes('logout')) return <LogOut className="h-4 w-4" />;
    if (action.includes('created')) return <Activity className="h-4 w-4" />;
    if (action.includes('updated')) return <Settings className="h-4 w-4" />;
    if (action.includes('deleted')) return <AlertCircle className="h-4 w-4" />;
    if (action.includes('password')) return <Shield className="h-4 w-4" />;
    if (action.includes('invited')) return <Users className="h-4 w-4" />;
    if (action.includes('generated')) return <FileText className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Activity Logs</h1>
        <p className="text-muted-foreground mt-2">
          View all account activity and changes
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Activities</CardDescription>
            <CardTitle className="text-2xl">{activityLogs.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Today</CardDescription>
            <CardTitle className="text-2xl">
              {activityLogs.filter(log => 
                format(log.timestamp, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
              ).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>This Week</CardDescription>
            <CardTitle className="text-2xl">
              {activityLogs.filter(log => 
                log.timestamp >= new Date(Date.now() - 7 * 86400000)
              ).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Users</CardDescription>
            <CardTitle className="text-2xl">{uniqueUsers.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {/* Search */}
            <div className="md:col-span-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="auth">Authentication</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="time">Time Tracking</SelectItem>
                  <SelectItem value="invoice">Invoices</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                  <SelectItem value="project">Projects</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User Filter */}
            <div>
              <Label>User</Label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map(user => (
                    <SelectItem key={user} value={user}>
                      {user}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div>
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd")} -{" "}
                          {format(dateRange.to, "LLL dd")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, yyyy")
                      )
                    ) : (
                      "All time"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="range"
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to
                    }}
                    onSelect={(range: any) => setDateRange(range || { from: undefined, to: undefined })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setUserFilter('all');
                setDateRange({ from: undefined, to: undefined });
              }}
            >
              Clear Filters
            </Button>
            <Button variant="outline" onClick={handleExportLogs}>
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>
            {filteredLogs.length} {filteredLogs.length === 1 ? 'activity' : 'activities'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No activities found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg mt-0.5">
                          {getActionIcon(log.action)}
                        </div>
                        <div>
                          <p className="font-medium">{log.description}</p>
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {Object.entries(log.metadata)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(' • ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{log.userName || 'Unknown'}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(log.category)}>
                        {getCategoryIcon(log.category)}
                        <span className="ml-1 capitalize">{log.category}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {log.ipAddress || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}