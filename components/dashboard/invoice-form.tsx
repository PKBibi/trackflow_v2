'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  FileText, 
  Clock, 
  DollarSign, 
  Calendar, 
  AlertCircle,
  CheckCircle2,
  User
} from 'lucide-react'
import { invoicesAPI, InvoicePreview } from '@/lib/api/invoices'

interface InvoiceFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onInvoiceCreated: () => void
  selectedClientId?: string
}

export function InvoiceForm({ 
  isOpen, 
  onOpenChange, 
  onInvoiceCreated,
  selectedClientId 
}: InvoiceFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previews, setPreviews] = useState<InvoicePreview[]>([])
  const [selectedClientPreview, setSelectedClientPreview] = useState<InvoicePreview | null>(null)
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({
    dueInDays: 30,
    notes: ''
  })

  // Load unbilled time entries when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadUnbilledEntries()
      setError(null)
      setSelectedEntries(new Set())
    }
  }, [isOpen, selectedClientId])

  const loadUnbilledEntries = async () => {
    try {
      setLoading(true)
      const data = await invoicesAPI.getUnbilledTimeEntries(selectedClientId)
      setPreviews(data)
      
      // Auto-select client if only one option or if selectedClientId provided
      if (data.length === 1 || (selectedClientId && data.length > 0)) {
        const targetPreview = selectedClientId 
          ? data.find(p => p.client_id === selectedClientId) || data[0]
          : data[0]
        setSelectedClientPreview(targetPreview)
        // Auto-select all entries for the client
        const allEntryIds = new Set(targetPreview.time_entries.map(entry => entry.id))
        setSelectedEntries(allEntryIds)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load unbilled time entries')
    } finally {
      setLoading(false)
    }
  }

  const handleClientSelect = (clientId: string) => {
    const preview = previews.find(p => p.client_id === clientId)
    setSelectedClientPreview(preview || null)
    setSelectedEntries(new Set())
  }

  const handleEntryToggle = (entryId: string, checked: boolean) => {
    const newSelected = new Set(selectedEntries)
    if (checked) {
      newSelected.add(entryId)
    } else {
      newSelected.delete(entryId)
    }
    setSelectedEntries(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (!selectedClientPreview) return
    
    if (checked) {
      const allEntryIds = new Set(selectedClientPreview.time_entries.map(entry => entry.id))
      setSelectedEntries(allEntryIds)
    } else {
      setSelectedEntries(new Set())
    }
  }

  const calculateSelectedTotals = () => {
    if (!selectedClientPreview) return { hours: 0, amount: 0 }
    
    const selectedEntriesData = selectedClientPreview.time_entries.filter(entry => 
      selectedEntries.has(entry.id)
    )
    
    return {
      hours: selectedEntriesData.reduce((sum, entry) => sum + entry.hours, 0),
      amount: selectedEntriesData.reduce((sum, entry) => sum + entry.amount, 0)
    }
  }

  const handleCreateInvoice = async () => {
    if (!selectedClientPreview || selectedEntries.size === 0) {
      setError('Please select a client and time entries')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      await invoicesAPI.createInvoiceFromTimeEntries(
        selectedClientPreview.client_id,
        Array.from(selectedEntries),
        {
          dueInDays: formData.dueInDays,
          notes: formData.notes || undefined
        }
      )
      
      onInvoiceCreated()
      onOpenChange(false)
      
      // Reset form
      setSelectedClientPreview(null)
      setSelectedEntries(new Set())
      setFormData({ dueInDays: 30, notes: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const selectedTotals = calculateSelectedTotals()

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Create Invoice
          </DialogTitle>
          <DialogDescription>
            Generate an invoice from unbilled time entries
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Client Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Select Client
              </CardTitle>
              <CardDescription>
                Choose a client with unbilled time entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No unbilled time entries found</p>
                  <p className="text-xs">Make sure you have stopped time entries marked as billable</p>
                </div>
              ) : (
                <Select 
                  value={selectedClientPreview?.client_id || ''} 
                  onValueChange={handleClientSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {previews.map((preview) => (
                      <SelectItem key={preview.client_id} value={preview.client_id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{preview.client_name}</span>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge variant="outline">{preview.item_count} entries</Badge>
                            <Badge variant="secondary">
                              {formatCurrency(preview.total_amount)}
                            </Badge>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* Time Entries Selection */}
          {selectedClientPreview && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Time Entries
                    </CardTitle>
                    <CardDescription>
                      Select entries to include in invoice for {selectedClientPreview.client_name}
                      {selectedClientPreview.client_company && ` (${selectedClientPreview.client_company})`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="selectAll"
                      checked={selectedEntries.size === selectedClientPreview.time_entries.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label htmlFor="selectAll" className="text-sm">
                      Select all ({selectedClientPreview.time_entries.length})
                    </Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {selectedClientPreview.time_entries.map((entry) => (
                    <div key={entry.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                      <Checkbox
                        id={entry.id}
                        checked={selectedEntries.has(entry.id)}
                        onCheckedChange={(checked) => handleEntryToggle(entry.id, !!checked)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{entry.description}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <span>{entry.marketing_channel}</span>
                              <span>•</span>
                              <span>{formatDate(entry.start_time)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(entry.amount)}</p>
                            <p className="text-xs text-muted-foreground">
                              {entry.hours.toFixed(1)}h × ${entry.rate / 100}/hr
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selection Summary */}
                {selectedEntries.size > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">
                          {selectedEntries.size} entries selected
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(selectedTotals.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedTotals.hours.toFixed(1)} hours total
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Invoice Settings */}
          {selectedClientPreview && selectedEntries.size > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Invoice Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="dueInDays">Payment Terms (Days)</Label>
                  <Select 
                    value={formData.dueInDays.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, dueInDays: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 days (Net 15)</SelectItem>
                      <SelectItem value="30">30 days (Net 30)</SelectItem>
                      <SelectItem value="45">45 days (Net 45)</SelectItem>
                      <SelectItem value="60">60 days (Net 60)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Invoice Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any additional notes or payment instructions..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateInvoice} 
            disabled={loading || !selectedClientPreview || selectedEntries.size === 0}
          >
            {loading ? 'Creating...' : `Create Invoice (${formatCurrency(selectedTotals.amount)})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}