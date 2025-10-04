import { log } from '@/lib/logger';
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
const XLSXPromise = import('xlsx');
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle, 
  AlertCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Save,
  FileText,
  Calendar,
  Clock,
  DollarSign,
  Briefcase,
  User,
  Hash
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface ImportField {
  label: string;
  key: string;
  type: 'text' | 'number' | 'date' | 'time' | 'boolean';
  required: boolean;
  icon: React.ReactNode;
  description: string;
}

const timeEntryFields: ImportField[] = [
  { label: 'Date', key: 'date', type: 'date', required: true, icon: <Calendar className="h-4 w-4" />, description: 'Date of the time entry' },
  { label: 'Start Time', key: 'startTime', type: 'time', required: false, icon: <Clock className="h-4 w-4" />, description: 'Start time (optional)' },
  { label: 'End Time', key: 'endTime', type: 'time', required: false, icon: <Clock className="h-4 w-4" />, description: 'End time (optional)' },
  { label: 'Duration (minutes)', key: 'duration', type: 'number', required: true, icon: <Clock className="h-4 w-4" />, description: 'Duration in minutes' },
  { label: 'Activity', key: 'activity', type: 'text', required: true, icon: <FileText className="h-4 w-4" />, description: 'Activity or task name' },
  { label: 'Category', key: 'category', type: 'text', required: false, icon: <Hash className="h-4 w-4" />, description: 'Category (optional)' },
  { label: 'Description', key: 'description', type: 'text', required: false, icon: <FileText className="h-4 w-4" />, description: 'Task description' },
  { label: 'Client', key: 'client', type: 'text', required: false, icon: <Briefcase className="h-4 w-4" />, description: 'Client name' },
  { label: 'Project', key: 'project', type: 'text', required: false, icon: <Briefcase className="h-4 w-4" />, description: 'Project name' },
  { label: 'Billable', key: 'billable', type: 'boolean', required: false, icon: <DollarSign className="h-4 w-4" />, description: 'Is billable?' },
  { label: 'Rate', key: 'rate', type: 'number', required: false, icon: <DollarSign className="h-4 w-4" />, description: 'Hourly rate' },
];

const clientFields: ImportField[] = [
  { label: 'Name', key: 'name', type: 'text', required: true, icon: <User className="h-4 w-4" />, description: 'Client name' },
  { label: 'Email', key: 'email', type: 'text', required: true, icon: <User className="h-4 w-4" />, description: 'Email address' },
  { label: 'Phone', key: 'phone', type: 'text', required: false, icon: <User className="h-4 w-4" />, description: 'Phone number' },
  { label: 'Company', key: 'company', type: 'text', required: false, icon: <Briefcase className="h-4 w-4" />, description: 'Company name' },
  { label: 'Address', key: 'address', type: 'text', required: false, icon: <User className="h-4 w-4" />, description: 'Address' },
  { label: 'Hourly Rate', key: 'hourlyRate', type: 'number', required: false, icon: <DollarSign className="h-4 w-4" />, description: 'Default hourly rate' },
];

export default function ImportPage() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [importType, setImportType] = useState<'time_entries' | 'clients'>('time_entries');
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const fields = importType === 'time_entries' ? timeEntryFields : clientFields;
  const totalSteps = 4;
  const [progressText, setProgressText] = useState('');

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    // Validate file type
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!validTypes.includes(uploadedFile.type) && !uploadedFile.name.match(/\.(csv|xlsx|xls)$/)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a CSV or Excel file',
        variant: 'destructive',
      });
      return;
    }

    setFile(uploadedFile);
    parseFile(uploadedFile);
  };

  // Parse uploaded file
  const parseFile = async (uploadedFile: File) => {
    setIsProcessing(true);
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const data = e.target?.result;
        
        if (uploadedFile.name.endsWith('.csv')) {
          // Parse CSV
          const text = data as string;
          const rows = text.split('\n').map(row => row.split(','));
          const headers = rows[0].map(h => h.trim());
          const dataRows = rows.slice(1).map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = row[index]?.trim() || '';
            });
            return obj;
          }).filter(row => Object.values(row).some(v => v)); // Remove empty rows
          
          setHeaders(headers);
          setRawData(dataRows);
        } else {
          // Parse Excel
          // Lazy import xlsx to avoid adding it to the main bundle
          // @ts-ignore
          const XLSX = await XLSXPromise;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          if (jsonData.length > 0) {
            const headers = jsonData[0].map((h: any) => String(h).trim());
            const dataRows = jsonData.slice(1).map(row => {
              const obj: any = {};
              headers.forEach((header, index) => {
                obj[header] = row[index] || '';
              });
              return obj;
            }).filter(row => Object.values(row).some(v => v)); // Remove empty rows
            
            setHeaders(headers);
            setRawData(dataRows);
          }
        }
        
        // Auto-map fields based on header names
        autoMapFields();
        
      };
      
      if (uploadedFile.name.endsWith('.csv')) {
        reader.readAsText(uploadedFile);
      } else {
        reader.readAsBinaryString(uploadedFile);
      }
    } catch (error) {
      log.error('Error parsing file:', error);
      toast({
        title: 'Error parsing file',
        description: 'Failed to parse the uploaded file. Please check the format.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-map fields based on header similarity
  const autoMapFields = () => {
    const newMappings: Record<string, string> = {};
    
    fields.forEach(field => {
      const matchingHeader = headers.find(header => {
        const headerLower = header.toLowerCase();
        const fieldLower = field.label.toLowerCase();
        
        // Exact match
        if (headerLower === fieldLower) return true;
        
        // Partial match
        if (headerLower.includes(fieldLower) || fieldLower.includes(headerLower)) return true;
        
        // Common variations
        const variations: Record<string, string[]> = {
          'date': ['date', 'day', 'when'],
          'startTime': ['start', 'start time', 'begin', 'from'],
          'endTime': ['end', 'end time', 'finish', 'to'],
          'duration': ['duration', 'time', 'hours', 'minutes'],
          'activity': ['activity', 'task', 'description', 'what'],
          'client': ['client', 'customer', 'company'],
          'project': ['project', 'job'],
          'billable': ['billable', 'bill', 'invoice'],
          'rate': ['rate', 'price', 'hourly'],
        };
        
        const fieldVariations = variations[field.key] || [];
        return fieldVariations.some(v => headerLower.includes(v));
      });
      
      if (matchingHeader) {
        newMappings[field.key] = matchingHeader;
      }
    });
    
    setMappings(newMappings);
  };

  // Process and validate data
  const processData = () => {
    const errors: string[] = [];
    const processed: any[] = [];
    
    rawData.forEach((row, rowIndex) => {
      const processedRow: any = {};
      let rowHasError = false;
      
      fields.forEach(field => {
        const sourceColumn = mappings[field.key];
        
        if (!sourceColumn) {
          if (field.required) {
            errors.push(`Row ${rowIndex + 2}: Missing required field "${field.label}"`);
            rowHasError = true;
          }
          return;
        }
        
        let value = row[sourceColumn];
        
        // Type conversion and validation
        switch (field.type) {
          case 'number':
            value = parseFloat(value) || 0;
            if (isNaN(value) && field.required) {
              errors.push(`Row ${rowIndex + 2}: Invalid number for "${field.label}"`);
              rowHasError = true;
            }
            break;
          case 'date':
            // Try to parse date
            const date = new Date(value);
            if (isNaN(date.getTime()) && field.required) {
              errors.push(`Row ${rowIndex + 2}: Invalid date for "${field.label}"`);
              rowHasError = true;
            } else {
              value = date.toISOString().split('T')[0];
            }
            break;
          case 'boolean':
            value = ['true', 'yes', '1', 'y'].includes(String(value).toLowerCase());
            break;
          case 'time':
            // Validate time format (HH:MM)
            if (value && !/^\d{1,2}:\d{2}$/.test(value)) {
              errors.push(`Row ${rowIndex + 2}: Invalid time format for "${field.label}"`);
              rowHasError = true;
            }
            break;
        }
        
        processedRow[field.key] = value;
      });
      
      if (!rowHasError) {
        processed.push(processedRow);
      }
    });
    
    setValidationErrors(errors);
    setProcessedData(processed);
    
    if (errors.length === 0) {
      toast({
        title: 'Data validated',
        description: `${processed.length} rows ready to import`,
      });
    }
  };

  // Import data to API
  const importData = async () => {
    setIsProcessing(true);
    setProgressText('Starting import...');
    
    try {
      const endpoint = importType === 'time_entries' 
        ? '/api/import/time-entries'
        : '/api/import/clients';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: processedData,
          mappings: mappings
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Import failed');
      }
      
      if (result.success) {
        const { results } = result;
        let description = `Successfully imported ${results.successful} ${importType === 'time_entries' ? 'time entries' : 'clients'}`;
        
        if (results.clientsCreated > 0) {
          description += `, created ${results.clientsCreated} new clients`;
        }
        if (results.projectsCreated > 0) {
          description += `, created ${results.projectsCreated} new projects`;
        }
        if (results.failed > 0) {
          description += `. ${results.failed} entries failed.`;
        }
        if (results.skipped > 0) {
          description += `. ${results.skipped} entries skipped (duplicates).`;
        }
        
        toast({
          title: 'Import completed',
          description
        });
        
        // Show errors if any
        if (results.errors.length > 0) {
          log.error('Import errors:', results.errors);
          setValidationErrors(results.errors);
        } else {
          // Move to success step if no errors
          setCurrentStep(4);
        }
      }
      
    } catch (error) {
      log.error('Import error:', error);
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Failed to import data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  // Reset import
  const resetImport = () => {
    setCurrentStep(1);
    setFile(null);
    setRawData([]);
    setHeaders([]);
    setMappings({});
    setProcessedData([]);
    setValidationErrors([]);
  };

  // Download sample CSV
  const downloadSample = () => {
    const sampleData = importType === 'time_entries' 
      ? 'Date,Activity,Duration,Client,Project,Description,Billable,Rate\n2024-01-15,Blog Writing,120,Acme Corp,Content Marketing,Created blog post,Yes,100\n2024-01-16,SEO Optimization,90,Tech Inc,Website,Optimized pages,Yes,120'
      : 'Name,Email,Phone,Company,Hourly Rate\nJohn Doe,john@example.com,555-0100,Acme Corp,150\nJane Smith,jane@example.com,555-0200,Tech Inc,120';
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sample_${importType}.csv`;
    link.click();
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
  return (
    <div className="space-y-6" aria-busy={isProcessing}>
      <div className="sr-only" aria-live="polite">{isProcessing ? progressText || 'Import in progress' : ''}</div>
            {/* Import Type Selection */}
            <Tabs value={importType} onValueChange={(v) => setImportType(v as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="time_entries">Time Entries</TabsTrigger>
                <TabsTrigger value="clients">Clients</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* File Upload */}
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                {file ? (
                  <>
                    <FileSpreadsheet className="h-12 w-12 text-green-600 mb-4" />
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {rawData.length} rows detected
                    </p>
                    <Button variant="outline" size="sm" className="mt-4">
                      Change File
                    </Button>
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="font-medium mb-1">Drop your CSV or Excel file here</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse
                    </p>
                    <Button variant="outline" size="sm">
                      Select File
                    </Button>
                  </>
                )}
              </label>
            </div>

            {/* Sample Download */}
            <div className="flex justify-center">
              <Button
                variant="link"
                onClick={downloadSample}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download Sample CSV
              </Button>
            </div>

            {/* Instructions */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Import Instructions</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p>• Ensure your file has column headers in the first row</p>
                <p>• Dates should be in YYYY-MM-DD format</p>
                <p>• Times should be in HH:MM format (24-hour)</p>
                <p>• Duration should be in minutes</p>
                <p>• Maximum 1000 rows per import</p>
              </AlertDescription>
            </Alert>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Map Your Columns</h3>
              <p className="text-sm text-muted-foreground">
                Match your file columns to TrackFlow fields
              </p>
            </div>

            <div className="space-y-3">
              {fields.map((field) => (
                <div key={field.key} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-1/3">
                    {field.icon}
                    <div>
                      <p className="font-medium text-sm">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{field.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <Select
                      value={mappings[field.key] || ''}
                      onValueChange={(value) => setMappings({ ...mappings, [field.key]: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Auto-mapping</AlertTitle>
              <AlertDescription>
                We've automatically matched columns based on their names. Please review and adjust as needed.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Preview Import</h3>
              <p className="text-sm text-muted-foreground">
                Review the data before importing
              </p>
            </div>

            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Validation Errors</AlertTitle>
                <AlertDescription>
                  <ul className="mt-2 space-y-1 text-sm">
                    {validationErrors.slice(0, 5).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {validationErrors.length > 5 && (
                      <li>...and {validationErrors.length - 5} more errors</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {processedData.length > 0 && (
              <>
                <div className="rounded-md border overflow-auto max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        {fields.filter(f => mappings[f.key]).map((field) => (
                          <TableHead key={field.key}>{field.label}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedData.slice(0, 10).map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          {fields.filter(f => mappings[f.key]).map((field) => (
                            <TableCell key={field.key}>
                              {field.type === 'boolean' 
                                ? row[field.key] ? 'Yes' : 'No'
                                : row[field.key] || '-'
                              }
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {processedData.length > 10 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Showing 10 of {processedData.length} rows
                  </p>
                )}
              </>
            )}

            {processedData.length === 0 && validationErrors.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No data to preview</AlertTitle>
                <AlertDescription>
                  Please go back and map at least one column.
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Import Complete!</h3>
              <p className="text-muted-foreground">
                Successfully imported {processedData.length} {importType === 'time_entries' ? 'time entries' : 'clients'}
              </p>
              
              <div className="mt-8 space-y-3">
                <Button
                  onClick={resetImport}
                  variant="outline"
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Import More Data
                </Button>
                
                <p className="text-sm text-muted-foreground">or</p>
                
                <Button
                  onClick={() => window.location.href = importType === 'time_entries' ? '/timesheet' : '/clients'}
                  className="gap-2"
                >
                  View {importType === 'time_entries' ? 'Time Entries' : 'Clients'}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Handle step navigation
  const handleNext = () => {
    if (currentStep === 2) {
      processData();
    }
    if (currentStep === 3 && validationErrors.length === 0) {
      importData();
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isNextDisabled = () => {
    switch (currentStep) {
      case 1:
        return !file || rawData.length === 0;
      case 2:
        return Object.keys(mappings).filter(k => fields.find(f => f.key === k && f.required)).length === 0;
      case 3:
        return validationErrors.length > 0 || processedData.length === 0;
      default:
        return false;
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Import Data</h1>
        <p className="text-muted-foreground mt-2">
          Import time entries or clients from CSV or Excel files
        </p>
      </div>

      {/* Progress */}
      {currentStep < 4 && (
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span>Step {currentStep} of {totalSteps - 1}</span>
          </div>
          <Progress value={(currentStep / (totalSteps - 1)) * 100} className="h-2" />
          <div className="flex justify-between mt-2">
            {['Upload', 'Map Columns', 'Preview'].map((label, index) => (
              <span
                key={label}
                className={cn(
                  "text-xs font-medium",
                  index + 1 === currentStep 
                    ? "text-primary" 
                    : index + 1 < currentStep
                    ? "text-green-600 dark:text-green-400"
                    : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <Card>
        <CardContent className="p-8">
          {renderStepContent()}
        </CardContent>
        
        {/* Navigation */}
        {currentStep < 4 && (
          <div className="border-t px-8 py-4">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={isNextDisabled() || isProcessing}
              >
                {isProcessing ? 'Processing...' : (
                  currentStep === 3 ? 'Import' : 'Next'
                )}
                {!isProcessing && <ChevronRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}


