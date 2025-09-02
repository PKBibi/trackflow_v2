'use client'

import { useState } from 'react'
import { Download, FileText, FileSpreadsheet, FileJson, Archive, Calendar, Clock, DollarSign, Users, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'

interface ExportOptions {
  format: 'csv' | 'json' | 'excel' | 'pdf'
  dateRange: 'all' | 'last30' | 'last90' | 'thisYear' | 'lastYear' | 'custom'
  startDate?: string
  endDate?: string
  includeTimeEntries: boolean
  includeProjects: boolean
  includeInvoices: boolean
  includeClients: boolean
  includeReports: boolean
  includeAttachments: boolean
  compression: boolean
}

interface ExportHistory {
  id: string
  created_at: string
  format: string
  size: number
  status: 'completed' | 'failed' | 'processing'
  download_url?: string
  expires_at: string
}

export default function DataExportPage() {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    dateRange: 'all',
    includeTimeEntries: true,
    includeProjects: true,
    includeInvoices: true,
    includeClients: true,
    includeReports: false,
    includeAttachments: false,
    compression: false
  })
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([])
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [preparingExport, setPreparingExport] = useState(false)
  const supabase = createClient()

  const dataCategories = [
    {
      id: 'includeTimeEntries',
      label: 'Time Entries',
      description: 'All your tracked time data',
      icon: Clock,
      size: '~2.3 MB'
    },
    {
      id: 'includeProjects',
      label: 'Projects',
      description: 'Project details and settings',
      icon: FileText,
      size: '~0.5 MB'
    },
    {
      id: 'includeInvoices',
      label: 'Invoices',
      description: 'Invoice records and payment history',
      icon: DollarSign,
      size: '~1.2 MB'
    },
    {
      id: 'includeClients',
      label: 'Clients',
      description: 'Client information and contacts',
      icon: Users,
      size: '~0.3 MB'
    },
    {
      id: 'includeReports',
      label: 'Reports',
      description: 'Generated reports and analytics',
      icon: FileSpreadsheet,
      size: '~0.8 MB'
    },
    {
      id: 'includeAttachments',
      label: 'Attachments',
      description: 'Files and documents',
      icon: Archive,
      size: '~15.4 MB'
    }
  ]

  const formatDescriptions = {
    csv: 'Comma-separated values, compatible with Excel and Google Sheets',
    json: 'JavaScript Object Notation, ideal for developers and APIs',
    excel: 'Microsoft Excel format with multiple sheets',
    pdf: 'Portable Document Format, best for archiving and sharing'
  }

  const startExport = async () => {
    setExporting(true)
    setExportProgress(0)
    setPreparingExport(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      // Make API call to start export
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportOptions)
      })

      if (!response.ok) throw new Error('Export failed')

      const { exportId, downloadUrl } = await response.json()

      clearInterval(progressInterval)
      setExportProgress(100)

      // Add to export history
      const newExport: ExportHistory = {
        id: exportId,
        created_at: new Date().toISOString(),
        format: exportOptions.format,
        size: calculateExportSize(),
        status: 'completed',
        download_url: downloadUrl,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }

      setExportHistory([newExport, ...exportHistory])

      // Trigger download
      if (downloadUrl) {
        window.open(downloadUrl, '_blank')
      }

      toast({
        title: 'Export Complete',
        description: 'Your data export is ready for download'
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting your data',
        variant: 'destructive'
      })
    } finally {
      setExporting(false)
      setPreparingExport(false)
      setExportProgress(0)
    }
  }

  const calculateExportSize = () => {
    let size = 0
    if (exportOptions.includeTimeEntries) size += 2.3
    if (exportOptions.includeProjects) size += 0.5
    if (exportOptions.includeInvoices) size += 1.2
    if (exportOptions.includeClients) size += 0.3
    if (exportOptions.includeReports) size += 0.8
    if (exportOptions.includeAttachments) size += 15.4
    return size * 1024 * 1024 // Convert to bytes
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv': return FileSpreadsheet
      case 'json': return FileJson
      case 'excel': return FileSpreadsheet
      case 'pdf': return FileText
      default: return FileText
    }
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Export Your Data</h1>
        <p className="text-muted-foreground mt-2">
          Download all your data in various formats
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Export Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Format Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Export Format</CardTitle>
              <CardDescription>
                Choose the format for your data export
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={exportOptions.format}
                onValueChange={(value: any) => 
                  setExportOptions({ ...exportOptions, format: value })
                }
              >
                <div className="space-y-3">
                  {(['csv', 'json', 'excel', 'pdf'] as const).map((format) => {
                    const Icon = getFormatIcon(format)
                    return (
                      <div key={format} className="flex items-start gap-3">
                        <RadioGroupItem value={format} id={format} />
                        <Label htmlFor={format} className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-4 h-4" />
                            <span className="font-medium uppercase">{format}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDescriptions[format]}
                          </p>
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card>
            <CardHeader>
              <CardTitle>Date Range</CardTitle>
              <CardDescription>
                Select the time period for your export
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={exportOptions.dateRange}
                onValueChange={(value: any) => 
                  setExportOptions({ ...exportOptions, dateRange: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="last30">Last 30 Days</SelectItem>
                  <SelectItem value="last90">Last 90 Days</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                  <SelectItem value="lastYear">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              {exportOptions.dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={exportOptions.startDate}
                      onChange={(e) => 
                        setExportOptions({ ...exportOptions, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={exportOptions.endDate}
                      onChange={(e) => 
                        setExportOptions({ ...exportOptions, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Data to Export</CardTitle>
              <CardDescription>
                Select which data categories to include
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataCategories.map((category) => {
                  const Icon = category.icon
                  return (
                    <div
                      key={category.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        id={category.id}
                        checked={exportOptions[category.id as keyof ExportOptions] as boolean}
                        onCheckedChange={(checked) => 
                          setExportOptions({ 
                            ...exportOptions, 
                            [category.id]: checked 
                          })
                        }
                      />
                      <Label
                        htmlFor={category.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{category.label}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {category.size}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {category.description}
                        </p>
                      </Label>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 pt-4 border-t">
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={exportOptions.compression}
                    onCheckedChange={(checked) => 
                      setExportOptions({ ...exportOptions, compression: checked as boolean })
                    }
                  />
                  <div>
                    <span className="font-medium">Compress Export</span>
                    <p className="text-sm text-muted-foreground">
                      Create a ZIP archive to reduce file size
                    </p>
                  </div>
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Summary */}
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Export Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Format:</span>
                  <span className="font-medium uppercase">{exportOptions.format}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date Range:</span>
                  <span className="font-medium">
                    {exportOptions.dateRange === 'all' ? 'All Time' :
                     exportOptions.dateRange === 'last30' ? 'Last 30 Days' :
                     exportOptions.dateRange === 'last90' ? 'Last 90 Days' :
                     exportOptions.dateRange === 'thisYear' ? 'This Year' :
                     exportOptions.dateRange === 'lastYear' ? 'Last Year' :
                     'Custom'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Est. Size:</span>
                  <span className="font-medium">
                    {formatFileSize(calculateExportSize())}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Compression:</span>
                  <span className="font-medium">
                    {exportOptions.compression ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              {exporting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Export Progress</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <Progress value={exportProgress} />
                  {preparingExport && (
                    <p className="text-xs text-muted-foreground text-center">
                      Preparing your export...
                    </p>
                  )}
                </div>
              )}

              <Button
                className="w-full"
                onClick={startExport}
                disabled={exporting || (!exportOptions.includeTimeEntries && 
                  !exportOptions.includeProjects && 
                  !exportOptions.includeInvoices && 
                  !exportOptions.includeClients && 
                  !exportOptions.includeReports && 
                  !exportOptions.includeAttachments)}
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Start Export
                  </>
                )}
              </Button>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Privacy Notice</AlertTitle>
                <AlertDescription>
                  Your export will be available for download for 7 days. 
                  The link will expire after that for security reasons.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Recent Exports */}
          {exportHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Exports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exportHistory.slice(0, 3).map((export_) => {
                    const Icon = getFormatIcon(export_.format)
                    return (
                      <div
                        key={export_.id}
                        className="flex items-center justify-between p-2 rounded-lg border"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium uppercase">
                              {export_.format}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(export_.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {export_.status === 'completed' ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(export_.download_url, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Badge variant="outline">
                            {export_.status}
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Your data belongs to you. Export it anytime in standard formats
                that work with other tools.
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <p className="text-sm">GDPR compliant data export</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <p className="text-sm">Encrypted download links</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <p className="text-sm">All data included</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
