'use client';

import { useState } from 'react';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileDown
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
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
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

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newExport: ExportHistory = {
        id: Date.now().toString(),
        fileName: `${exportOptions.dataType}_${format(new Date(), 'yyyy_MM_dd')}.${exportOptions.format}`,
        format: exportOptions.format.toUpperCase(),
        dataType: exportOptions.dataType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        size: '512 KB',
        createdAt: new Date(),
        status: 'completed',
        downloadUrl: '#'
      };
      
      setExportHistory([newExport, ...exportHistory]);
      
      toast({
        title: "Export completed",
        description: "Your data has been exported successfully.",
      });
      
      // Trigger download (in real app, would download the actual file)
      const link = document.createElement('a');
      link.href = '#';
      link.download = newExport.fileName;
      link.click();
      
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