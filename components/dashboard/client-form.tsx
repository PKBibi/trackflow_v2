'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, DollarSign, Clock, Calendar } from 'lucide-react'
import { ClientWithStats } from '@/lib/api/clients'

interface Client {
  id?: string
  name: string
  email: string
  company: string
  phone: string
  website: string
  
  // Address
  address: string
  city: string
  state: string
  zip_code: string
  country: string
  
  // Billing
  hourly_rate: number // in cents
  currency: string
  tax_rate: number
  
  // Retainer
  has_retainer: boolean
  retainer_hours: number
  retainer_amount: number // in cents
  retainer_start_date: string
  retainer_end_date: string
  retainer_auto_renew: boolean
  
  // Alerts
  alert_at_75_percent: boolean
  alert_at_90_percent: boolean
  alert_at_100_percent: boolean
  
  // Metadata
  status: 'active' | 'inactive' | 'archived'
  notes: string
  tags: string[]
}

interface ClientFormProps {
  client?: ClientWithStats
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSave: (client: Client) => void
  isLoading?: boolean
}

const defaultClient: Client = {
  name: '',
  email: '',
  company: '',
  phone: '',
  website: '',
  address: '',
  city: '',
  state: '',
  zip_code: '',
  country: 'US',
  hourly_rate: 15000, // $150/hour
  currency: 'USD',
  tax_rate: 0,
  has_retainer: false,
  retainer_hours: 0,
  retainer_amount: 0,
  retainer_start_date: '',
  retainer_end_date: '',
  retainer_auto_renew: false,
  alert_at_75_percent: true,
  alert_at_90_percent: true,
  alert_at_100_percent: true,
  status: 'active',
  notes: '',
  tags: []
}

export function ClientForm({ client, isOpen, onOpenChange, onSave, isLoading }: ClientFormProps) {
  const [formData, setFormData] = useState<Client>(client ? {
    id: client.id,
    name: client.name,
    email: client.email || '',
    company: client.company || '',
    phone: client.phone || '',
    website: client.website || '',
    address: client.address || '',
    city: client.city || '',
    state: client.state || '',
    zip_code: client.zip_code || '',
    country: client.country,
    hourly_rate: client.hourly_rate,
    currency: client.currency,
    tax_rate: client.tax_rate,
    has_retainer: client.has_retainer,
    retainer_hours: client.retainer_hours,
    retainer_amount: client.retainer_amount,
    retainer_start_date: client.retainer_start_date || '',
    retainer_end_date: client.retainer_end_date || '',
    retainer_auto_renew: client.retainer_auto_renew,
    alert_at_75_percent: client.alert_at_75_percent,
    alert_at_90_percent: client.alert_at_90_percent,
    alert_at_100_percent: client.alert_at_100_percent,
    status: client.status,
    notes: client.notes || '',
    tags: client.tags || []
  } : defaultClient)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Client name is required'
    }
    
    if (formData.email && !formData.email.includes('@')) {
      newErrors.email = 'Valid email is required'
    }
    
    if (formData.hourly_rate <= 0) {
      newErrors.hourly_rate = 'Hourly rate must be greater than 0'
    }
    
    if (formData.has_retainer) {
      if (formData.retainer_hours <= 0) {
        newErrors.retainer_hours = 'Retainer hours must be greater than 0'
      }
      if (formData.retainer_amount <= 0) {
        newErrors.retainer_amount = 'Retainer amount must be greater than 0'
      }
      if (!formData.retainer_start_date) {
        newErrors.retainer_start_date = 'Start date is required for retainers'
      }
      if (!formData.retainer_end_date) {
        newErrors.retainer_end_date = 'End date is required for retainers'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData)
    }
  }

  const updateField = (field: keyof Client, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const calculateRetainerValue = () => {
    if (formData.retainer_hours && formData.hourly_rate) {
      return formData.retainer_hours * (formData.hourly_rate / 100)
    }
    return 0
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {client ? 'Edit Client' : 'Add New Client'}
          </DialogTitle>
          <DialogDescription>
            {client 
              ? 'Update client information and retainer settings' 
              : 'Add a new client with billing and retainer information'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Client Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => updateField('company', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="https://"
                />
              </div>
            </CardContent>
          </Card>

          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Billing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="hourly_rate">Hourly Rate *</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  value={formData.hourly_rate / 100}
                  onChange={(e) => updateField('hourly_rate', Math.round(parseFloat(e.target.value || '0') * 100))}
                  className={errors.hourly_rate ? 'border-red-500' : ''}
                />
                {errors.hourly_rate && (
                  <p className="text-sm text-red-500 mt-1">{errors.hourly_rate}</p>
                )}
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => updateField('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD (C$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                <Input
                  id="tax_rate"
                  type="number"
                  step="0.01"
                  value={formData.tax_rate * 100}
                  onChange={(e) => updateField('tax_rate', parseFloat(e.target.value || '0') / 100)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Retainer Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Retainer Management
                </CardTitle>
                <Switch
                  checked={formData.has_retainer}
                  onCheckedChange={(checked) => updateField('has_retainer', checked)}
                />
              </div>
              <CardDescription>
                Set up monthly retainer tracking with automatic alerts
              </CardDescription>
            </CardHeader>
            {formData.has_retainer && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="retainer_hours">Monthly Hours *</Label>
                    <Input
                      id="retainer_hours"
                      type="number"
                      value={formData.retainer_hours}
                      onChange={(e) => updateField('retainer_hours', parseInt(e.target.value || '0'))}
                      className={errors.retainer_hours ? 'border-red-500' : ''}
                    />
                    {errors.retainer_hours && (
                      <p className="text-sm text-red-500 mt-1">{errors.retainer_hours}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="retainer_amount">Monthly Amount</Label>
                    <Input
                      id="retainer_amount"
                      type="number"
                      value={formData.retainer_amount / 100}
                      onChange={(e) => updateField('retainer_amount', Math.round(parseFloat(e.target.value || '0') * 100))}
                      className={errors.retainer_amount ? 'border-red-500' : ''}
                    />
                    {errors.retainer_amount && (
                      <p className="text-sm text-red-500 mt-1">{errors.retainer_amount}</p>
                    )}
                  </div>
                </div>

                {calculateRetainerValue() > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm">
                      <strong>Calculated Value:</strong> ${calculateRetainerValue().toFixed(2)}
                      {formData.retainer_amount !== calculateRetainerValue() * 100 && (
                        <span className="text-amber-600 ml-2">
                          (Different from hourly rate × hours)
                        </span>
                      )}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="retainer_start">Start Date *</Label>
                    <Input
                      id="retainer_start"
                      type="date"
                      value={formData.retainer_start_date}
                      onChange={(e) => updateField('retainer_start_date', e.target.value)}
                      className={errors.retainer_start_date ? 'border-red-500' : ''}
                    />
                    {errors.retainer_start_date && (
                      <p className="text-sm text-red-500 mt-1">{errors.retainer_start_date}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="retainer_end">End Date *</Label>
                    <Input
                      id="retainer_end"
                      type="date"
                      value={formData.retainer_end_date}
                      onChange={(e) => updateField('retainer_end_date', e.target.value)}
                      className={errors.retainer_end_date ? 'border-red-500' : ''}
                    />
                    {errors.retainer_end_date && (
                      <p className="text-sm text-red-500 mt-1">{errors.retainer_end_date}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto_renew"
                    checked={formData.retainer_auto_renew}
                    onCheckedChange={(checked) => updateField('retainer_auto_renew', checked)}
                  />
                  <Label htmlFor="auto_renew">Auto-renew monthly</Label>
                </div>

                {/* Alert Settings */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Usage Alerts</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="alert_75"
                        checked={formData.alert_at_75_percent}
                        onCheckedChange={(checked) => updateField('alert_at_75_percent', checked)}
                      />
                      <Label htmlFor="alert_75" className="text-sm">Alert at 75% usage</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="alert_90"
                        checked={formData.alert_at_90_percent}
                        onCheckedChange={(checked) => updateField('alert_at_90_percent', checked)}
                      />
                      <Label htmlFor="alert_90" className="text-sm">Alert at 90% usage</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="alert_100"
                        checked={formData.alert_at_100_percent}
                        onCheckedChange={(checked) => updateField('alert_at_100_percent', checked)}
                      />
                      <Label htmlFor="alert_100" className="text-sm">Alert at 100% usage</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => updateField('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Internal notes about this client..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : client ? 'Update Client' : 'Add Client'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}