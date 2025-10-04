'use client';

import { log } from '@/lib/logger';
import { useState, useEffect } from 'react';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileDown,
  Clock,
  Plus,
  Settings,
  Play,
  Pause,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  dataType: 'time_entries' | 'clients' | 'projects' | 'invoices' | 'all';
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  filters: {
    clientId?: string;
    projectId?: string;
    billableOnly?: boolean;
    includeDescription?: boolean;
    includeRates?: boolean;
  };
  viewType: 'detailed' | 'summary';
  groupBy?: 'none' | 'date' | 'client' | 'project' | 'activity';
}

interface BrandingOptions {
  companyName: string
  logoUrl: string
  contactEmail: string
}

interface ExportHistory {
  id: string;
  fileName: string;
  format: string;
  dataType: string;
  size: string;
  createdAt: Date;
  status: 'completed' | 'failed' | 'processing';
  downloadUrl?: string;
}

interface ScheduledExport {
  id: string;
  name: string;
  description?: string;
  format: 'csv' | 'excel' | 'pdf';
  data_type: 'time_entries' | 'clients' | 'projects';
  filters: Record<string, any>;
  frequency: 'daily' | 'weekly' | 'monthly';
  day_of_week?: number;
  day_of_month?: number;
  time_of_day: string;
  email_to: string;
  email_subject: string;
  email_body: string;
  is_active: boolean;
  next_run_at?: string;
  last_run_at?: string;
  last_run_status?: string;
  created_at: string;
}

// Mock clients and projects
const mockClients = [
  { id: '1', name: 'Acme Corp' },
  { id: '2', name: 'Tech Startup Inc' },
  { id: '3', name: 'Global Enterprises' }
];

const mockProjects = [
  { id: '1', name: 'Website Redesign', clientId: '1' },
  { id: '2', name: 'Marketing Campaign', clientId: '2' },
  { id: '3', name: 'SEO Optimization', clientId: '3' }
];

const mockExportHistory: ExportHistory[] = [
  {
    id: '1',
    fileName: 'time_entries_nov_2024.csv',
    format: 'CSV',
    dataType: 'Time Entries',
    size: '245 KB',
    createdAt: new Date(Date.now() - 86400000),
    status: 'completed',
    downloadUrl: '#'
  },
  {
    id: '2',
    fileName: 'monthly_report_oct_2024.pdf',
    format: 'PDF',
    dataType: 'Summary Report',
    size: '1.2 MB',
    createdAt: new Date(Date.now() - 172800000),
    status: 'completed',
    downloadUrl: '#'
  }
];

export default function DataExportPage() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>(mockExportHistory);
  const [scheduledExports, setScheduledExports] = useState<ScheduledExport[]>([]);
  const [isLoadingScheduled, setIsLoadingScheduled] = useState(true);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
  
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    dataType: 'time_entries',
    dateRange: {
      from: new Date(Date.now() - 30 * 86400000), // 30 days ago
      to: new Date()
    },
    filters: {
      billableOnly: false,
      includeDescription: true,
      includeRates: true
    },
    viewType: 'detailed',
    groupBy: 'none'
  });

  const [scheduleForm, setScheduleForm] = useState<{
    name: string
    description: string
    format: 'csv' | 'excel' | 'pdf'
    dataType: 'time_entries' | 'clients' | 'projects'
    frequency: 'daily' | 'weekly' | 'monthly'
    dayOfWeek: number
    dayOfMonth: number
    timeOfDay: string
    emailTo: string
    emailSubject: string
    emailBody: string
  }>({
    name: '',
    description: '',
    format: 'csv',
    dataType: 'time_entries',
    frequency: 'weekly',
    dayOfWeek: 1, // Monday
    dayOfMonth: 1,
    timeOfDay: '09:00',
    emailTo: '',
    emailSubject: '',
    emailBody: ''
  });

  // Optional white-label branding
  const [branding, setBranding] = useState<BrandingOptions>({
    companyName: '',
    logoUrl: '',
    contactEmail: ''
  })

  useEffect(() => {
    loadScheduledExports();
    // Load branding preferences
    (async ()=>{
      try {
        const res = await fetch('/api/me/branding')
        if (res.ok) {
          const d = await res.json()
          if (d.branding) setBranding(d.branding)
          else {
            const local = localStorage.getItem('branding_prefs')
            if (local) setBranding(JSON.parse(local))
          }
        }
      } catch {
        const local = localStorage.getItem('branding_prefs')
        if (local) setBranding(JSON.parse(local))
      }
    })()
  }, []);

  const loadScheduledExports = async () => {
    try {
      setIsLoadingScheduled(true);
      const response = await fetch('/api/scheduled-exports');
      if (response.ok) {
        const data = await response.json();
        setScheduledExports(data.scheduledExports || []);
      }
    } catch (error) {
      log.error('Failed to load scheduled exports:', error);
    } finally {
      setIsLoadingScheduled(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const requestBody = {
        format: exportOptions.format,
        dataType: exportOptions.dataType,
        dateRange: {
          start: exportOptions.dateRange.from?.toISOString(),
          end: exportOptions.dateRange.to?.toISOString()
        },
        clientIds: exportOptions.filters.clientId ? [exportOptions.filters.clientId] : undefined,
        projectIds: exportOptions.filters.projectId ? [exportOptions.filters.projectId] : undefined,
        includeBillableOnly: exportOptions.filters.billableOnly,
        branding: (branding.companyName || branding.logoUrl || branding.contactEmail) ? branding : undefined
      };

      const response = await fetch('/api/export/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Export failed');
      }

      const timestamp = format(new Date(), 'yyyy_MM_dd');
      const filename = `${exportOptions.dataType}_${timestamp}.${exportOptions.format}`;

      if (exportOptions.format === 'pdf') {
        // Handle PDF response (JSON with data)
        const result = await response.json();
        // For now, just show success - PDF generation can be added later
        toast({
          title: "PDF Export Ready",
          description: `Generated report with ${result.recordCount} records. PDF generation coming soon!`,
        });
      } else {
        // Handle file download for CSV/Excel
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Export completed",
          description: `Your ${exportOptions.format.toUpperCase()} file has been downloaded.`,
        });
      }

      // Add to export history
      const newExport: ExportHistory = {
        id: Date.now().toString(),
        fileName: filename,
        format: exportOptions.format.toUpperCase(),
        dataType: exportOptions.dataType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        size: '---',
        createdAt: new Date(),
        status: 'completed',
        downloadUrl: '#'
      };
      
      setExportHistory([newExport, ...exportHistory]);
      
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const createScheduledExport = async () => {
    setIsCreatingSchedule(true);
    
    try {
      const response = await fetch('/api/scheduled-exports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: scheduleForm.name,
          description: scheduleForm.description,
          format: scheduleForm.format,
          dataType: scheduleForm.dataType,
          filters: {
            dateRange: exportOptions.dateRange,
            clientIds: exportOptions.filters.clientId ? [exportOptions.filters.clientId] : undefined,
            projectIds: exportOptions.filters.projectId ? [exportOptions.filters.projectId] : undefined,
            includeBillableOnly: exportOptions.filters.billableOnly
          },
          branding: (branding.companyName || branding.logoUrl || branding.contactEmail) ? branding : undefined,
          frequency: scheduleForm.frequency,
          dayOfWeek: scheduleForm.frequency === 'weekly' ? scheduleForm.dayOfWeek : undefined,
          dayOfMonth: scheduleForm.frequency === 'monthly' ? scheduleForm.dayOfMonth : undefined,
          timeOfDay: scheduleForm.timeOfDay,
          emailTo: scheduleForm.emailTo,
          emailSubject: scheduleForm.emailSubject || `TrackFlow ${scheduleForm.dataType} Export - ${scheduleForm.name}`,
          emailBody: scheduleForm.emailBody || `Please find your ${scheduleForm.dataType.replace('_', ' ')} export attached.`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create scheduled export');
      }

      toast({
        title: "Scheduled export created",
        description: "Your export will run automatically according to the schedule.",
      });

      setShowScheduleDialog(false);
      setScheduleForm({
        name: '',
        description: '',
        format: 'csv',
        dataType: 'time_entries',
        frequency: 'weekly',
        dayOfWeek: 1,
        dayOfMonth: 1,
        timeOfDay: '09:00',
        emailTo: '',
        emailSubject: '',
        emailBody: ''
      });
      await loadScheduledExports();
      
    } catch (error) {
      toast({
        title: "Failed to create scheduled export",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingSchedule(false);
    }
  };

  const toggleScheduledExport = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/scheduled-exports/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update scheduled export');
      }

      await loadScheduledExports();
      
      toast({
        title: isActive ? "Scheduled export enabled" : "Scheduled export disabled",
        description: isActive ? "Export will run according to schedule" : "Export has been paused",
      });
    } catch (error) {
      toast({
        title: "Failed to update scheduled export",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteScheduledExport = async (id: string) => {
    try {
      const response = await fetch(`/api/scheduled-exports/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete scheduled export');
      }

      await loadScheduledExports();
      
      toast({
        title: "Scheduled export deleted",
        description: "The scheduled export has been removed.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete scheduled export",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const runScheduledExport = async (id: string) => {
    try {
      const response = await fetch(`/api/scheduled-exports/${id}/execute`, {
        method: 'POST'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to run scheduled export');
      }

      const result = await response.json();
      
      toast({
        title: "Export executed successfully",
        description: result.message,
      });
    } catch (error) {
      toast({
        title: "Failed to execute export",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatFrequency = (export_: ScheduledExport) => {
    if (export_.frequency === 'daily') {
      return `Daily at ${export_.time_of_day}`;
    } else if (export_.frequency === 'weekly') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `${days[export_.day_of_week || 0]} at ${export_.time_of_day}`;
    } else {
      return `Monthly on day ${export_.day_of_month} at ${export_.time_of_day}`;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'csv':
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileDown className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: ExportHistory['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
    }
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Data Export</h1>
        <p className="text-muted-foreground mt-2">
          Export your data in various formats for backup or analysis
        </p>
      </div>

      <Tabs defaultValue="export" className="space-y-4">
        <TabsList>
          <TabsTrigger value="export">Export Data</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Exports</TabsTrigger>
          <TabsTrigger value="history">Export History</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configure Export</CardTitle>
              <CardDescription>
                Select the data you want to export and choose your preferred format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Type Selection */}
              <div className="space-y-3">
                <Label>What would you like to export?</Label>
                <RadioGroup 
                  value={exportOptions.dataType}
                  onValueChange={(value: ExportOptions['dataType']) => 
                    setExportOptions({...exportOptions, dataType: value})
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="time_entries" id="time_entries" />
                    <Label htmlFor="time_entries" className="cursor-pointer">
                      Time Entries
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="clients" id="clients" />
                    <Label htmlFor="clients" className="cursor-pointer">
                      Clients
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="projects" id="projects" />
                    <Label htmlFor="projects" className="cursor-pointer">
                      Projects
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="invoices" id="invoices" />
                    <Label htmlFor="invoices" className="cursor-pointer">
                      Invoices
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="cursor-pointer">
                      All Data
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Format Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select 
                    value={exportOptions.format}
                    onValueChange={(value: ExportOptions['format']) => 
                      setExportOptions({...exportOptions, format: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                      <SelectItem value="excel">Excel (XLSX)</SelectItem>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="json">JSON (Raw Data)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>View Type</Label>
                  <Select 
                    value={exportOptions.viewType}
                    onValueChange={(value: ExportOptions['viewType']) => 
                      setExportOptions({...exportOptions, viewType: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="detailed">Detailed (All Fields)</SelectItem>
                      <SelectItem value="summary">Summary (Aggregated)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <Label>Date Range</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">From</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !exportOptions.dateRange.from && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {exportOptions.dateRange.from ? (
                            format(exportOptions.dateRange.from, "PPP")
                          ) : (
                            "Select date"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={exportOptions.dateRange.from}
                          onSelect={(date) => 
                            setExportOptions({
                              ...exportOptions, 
                              dateRange: {...exportOptions.dateRange, from: date}
                            })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">To</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !exportOptions.dateRange.to && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {exportOptions.dateRange.to ? (
                            format(exportOptions.dateRange.to, "PPP")
                          ) : (
                            "Select date"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={exportOptions.dateRange.to}
                          onSelect={(date) => 
                            setExportOptions({
                              ...exportOptions, 
                              dateRange: {...exportOptions.dateRange, to: date}
                            })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Filters (for time entries) */}
              {exportOptions.dataType === 'time_entries' && (
                <div className="space-y-3">
                  <Label>Filters</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Client</Label>
                      <Select 
                        value={exportOptions.filters.clientId || 'all'}
                        onValueChange={(value) => 
                          setExportOptions({
                            ...exportOptions, 
                            filters: {
                              ...exportOptions.filters, 
                              clientId: value === 'all' ? undefined : value
                            }
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Clients</SelectItem>
                          {mockClients.map(client => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Project</Label>
                      <Select 
                        value={exportOptions.filters.projectId || 'all'}
                        onValueChange={(value) => 
                          setExportOptions({
                            ...exportOptions, 
                            filters: {
                              ...exportOptions.filters, 
                              projectId: value === 'all' ? undefined : value
                            }
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Projects</SelectItem>
                          {mockProjects.map(project => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="billable"
                        checked={exportOptions.filters.billableOnly}
                        onCheckedChange={(checked) => 
                          setExportOptions({
                            ...exportOptions, 
                            filters: {...exportOptions.filters, billableOnly: checked as boolean}
                          })
                        }
                      />
                      <Label htmlFor="billable" className="cursor-pointer">
                        Only billable entries
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="description"
                        checked={exportOptions.filters.includeDescription}
                        onCheckedChange={(checked) => 
                          setExportOptions({
                            ...exportOptions, 
                            filters: {...exportOptions.filters, includeDescription: checked as boolean}
                          })
                        }
                      />
                      <Label htmlFor="description" className="cursor-pointer">
                        Include descriptions
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="rates"
                        checked={exportOptions.filters.includeRates}
                        onCheckedChange={(checked) => 
                          setExportOptions({
                            ...exportOptions, 
                            filters: {...exportOptions.filters, includeRates: checked as boolean}
                          })
                        }
                      />
                      <Label htmlFor="rates" className="cursor-pointer">
                        Include rates and amounts
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Branding (optional) */}
              <div className="space-y-3">
                <Label>Branding (optional)</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Company Name</Label>
                    <Input
                      placeholder="e.g., Acme Agency"
                      value={branding.companyName}
                      onChange={(e)=>setBranding({...branding, companyName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Logo URL</Label>
                    <Input
                      placeholder="https://example.com/logo.png"
                      value={branding.logoUrl}
                      onChange={(e)=>setBranding({...branding, logoUrl: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Contact Email</Label>
                    <Input
                      type="email"
                      placeholder="ops@agency.com"
                      value={branding.contactEmail}
                      onChange={(e)=>setBranding({...branding, contactEmail: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-muted-foreground flex-1">Branding appears in CSV/Excel headers and PDF metadata.</p>
                  <Button type="button" variant="outline" size="sm" onClick={async ()=>{
                    try {
                      const res = await fetch('/api/me/branding', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ branding }) })
                      if (!res.ok) throw new Error('Save failed')
                      localStorage.setItem('branding_prefs', JSON.stringify(branding))
                      toast({ title: 'Branding saved' })
                    } catch {
                      localStorage.setItem('branding_prefs', JSON.stringify(branding))
                      toast({ title: 'Branding saved locally' })
                    }
                  }}>Save Branding</Button>
                </div>
              </div>

              {/* Group By (for summary view) */}
              {exportOptions.viewType === 'summary' && (
                <div className="space-y-2">
                  <Label>Group By</Label>
                  <Select 
                    value={exportOptions.groupBy || 'none'}
                    onValueChange={(value: NonNullable<ExportOptions['groupBy']>) => 
                      setExportOptions({...exportOptions, groupBy: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Grouping</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="activity">Activity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  onClick={handleExport}
                  disabled={isExporting}
                  className="min-w-[120px]"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Export Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Export Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <div className="text-blue-500">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">CSV Format</p>
                  <p className="text-muted-foreground">
                    Best for importing into spreadsheet applications like Excel or Google Sheets
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-green-500">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">PDF Format</p>
                  <p className="text-muted-foreground">
                    Ideal for sharing reports with clients or for archival purposes
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-purple-500">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">Summary View</p>
                  <p className="text-muted-foreground">
                    Groups and aggregates data for easier analysis and reporting
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold">Scheduled Exports</h2>
              <p className="text-muted-foreground">Automate your data exports with recurring schedules</p>
            </div>
            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Export
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Schedule Export</DialogTitle>
                  <DialogDescription>
                    Set up an automated export that runs on a recurring schedule
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Export Name *</Label>
                      <Input
                        value={scheduleForm.name}
                        onChange={(e) => setScheduleForm({...scheduleForm, name: e.target.value})}
                        placeholder="Weekly Time Report"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address *</Label>
                      <Input
                        type="email"
                        value={scheduleForm.emailTo}
                        onChange={(e) => setScheduleForm({...scheduleForm, emailTo: e.target.value})}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={scheduleForm.description}
                      onChange={(e) => setScheduleForm({...scheduleForm, description: e.target.value})}
                      placeholder="Optional description..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data Type</Label>
                      <Select 
                        value={scheduleForm.dataType}
                        onValueChange={(value: typeof scheduleForm.dataType) => 
                          setScheduleForm({...scheduleForm, dataType: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="time_entries">Time Entries</SelectItem>
                          <SelectItem value="clients">Clients</SelectItem>
                          <SelectItem value="projects">Projects</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Format</Label>
                      <Select 
                        value={scheduleForm.format}
                        onValueChange={(value: typeof scheduleForm.format) => 
                          setScheduleForm({...scheduleForm, format: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select 
                        value={scheduleForm.frequency}
                        onValueChange={(value: typeof scheduleForm.frequency) => 
                          setScheduleForm({...scheduleForm, frequency: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {scheduleForm.frequency === 'weekly' && (
                      <div className="space-y-2">
                        <Label>Day of Week</Label>
                        <Select 
                          value={scheduleForm.dayOfWeek.toString()}
                          onValueChange={(value) => 
                            setScheduleForm({...scheduleForm, dayOfWeek: parseInt(value)})
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Sunday</SelectItem>
                            <SelectItem value="1">Monday</SelectItem>
                            <SelectItem value="2">Tuesday</SelectItem>
                            <SelectItem value="3">Wednesday</SelectItem>
                            <SelectItem value="4">Thursday</SelectItem>
                            <SelectItem value="5">Friday</SelectItem>
                            <SelectItem value="6">Saturday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {scheduleForm.frequency === 'monthly' && (
                      <div className="space-y-2">
                        <Label>Day of Month</Label>
                        <Select 
                          value={scheduleForm.dayOfMonth.toString()}
                          onValueChange={(value) => 
                            setScheduleForm({...scheduleForm, dayOfMonth: parseInt(value)})
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({length: 28}, (_, i) => i + 1).map(day => (
                              <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={scheduleForm.timeOfDay}
                        onChange={(e) => setScheduleForm({...scheduleForm, timeOfDay: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email Subject</Label>
                    <Input
                      value={scheduleForm.emailSubject}
                      onChange={(e) => setScheduleForm({...scheduleForm, emailSubject: e.target.value})}
                      placeholder={`TrackFlow ${scheduleForm.dataType} Export - ${scheduleForm.name}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email Body</Label>
                    <Textarea
                      value={scheduleForm.emailBody}
                      onChange={(e) => setScheduleForm({...scheduleForm, emailBody: e.target.value})}
                      placeholder={`Please find your ${scheduleForm.dataType.replace('_', ' ')} export attached.`}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Branding in schedule */}
                <div className="mt-2 p-3 border rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Branding (optional)</Label>
                    <Button variant="outline" size="sm" type="button" onClick={async ()=>{
                      try { const r = await fetch('/api/me/branding'); if (r.ok){ const d = await r.json(); if (d.branding) setBranding(d.branding) } } catch {}
                    }}>Use Saved</Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input value={branding.companyName} onChange={(e)=>setBranding({...branding, companyName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Logo URL</Label>
                      <Input value={branding.logoUrl} onChange={(e)=>setBranding({...branding, logoUrl: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Email</Label>
                      <Input type="email" value={branding.contactEmail} onChange={(e)=>setBranding({...branding, contactEmail: e.target.value})} />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={createScheduledExport}
                    disabled={isCreatingSchedule || !scheduleForm.name || !scheduleForm.emailTo}
                  >
                    {isCreatingSchedule ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Schedule'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Scheduled Exports</CardTitle>
              <CardDescription>
                Manage your automated export schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingScheduled ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading scheduled exports...
                </div>
              ) : scheduledExports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">No scheduled exports yet</p>
                  <p className="text-sm">Create your first automated export to save time!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduledExports.map((export_) => (
                    <div key={export_.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium">{export_.name}</h3>
                            <Badge variant={export_.is_active ? "default" : "secondary"}>
                              {export_.is_active ? "Active" : "Paused"}
                            </Badge>
                            <Badge variant="outline">
                              {export_.format.toUpperCase()}
                            </Badge>
                          </div>
                          
                          {export_.description && (
                            <p className="text-sm text-muted-foreground mb-2">{export_.description}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{export_.data_type.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>{formatFrequency(export_)}</span>
                            <span>•</span>
                            <span>{export_.email_to}</span>
                          </div>
                          
                          {export_.next_run_at && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Next run: {format(new Date(export_.next_run_at), 'MMM d, yyyy h:mm a')}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => runScheduledExport(export_.id)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => toggleScheduledExport(export_.id, !export_.is_active)}
                          >
                            {export_.is_active ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => deleteScheduledExport(export_.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export History</CardTitle>
              <CardDescription>
                Previously exported files (available for 30 days)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {exportHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No export history available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {exportHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                          {getFormatIcon(item.format)}
                        </div>
                        <div>
                          <p className="font-medium">{item.fileName}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.dataType} • {item.size} • {format(item.createdAt, 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(item.status)}
                        {item.status === 'completed' && item.downloadUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={item.downloadUrl} download={item.fileName}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
