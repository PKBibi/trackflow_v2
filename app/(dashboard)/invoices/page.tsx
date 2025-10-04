'use client'

import { log } from '@/lib/logger';
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign,
  FileText,
  Send,
  Download,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Loader2,
  Users,
  Edit,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { invoicesAPI, InvoiceWithDetails, InvoiceStats, InvoicePreview } from '@/lib/api/invoices'
import dynamic from 'next/dynamic'
const InvoiceForm = dynamic(() => import('@/components/dashboard/invoice-form').then(m => m.InvoiceForm), { ssr: false, loading: () => <div className="h-64 bg-muted animate-pulse rounded" /> })

export default function InvoicesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([])
  const [stats, setStats] = useState<InvoiceStats | null>(null)
  const [unbilledPreviews, setUnbilledPreviews] = useState<InvoicePreview[]>([])
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  
  // Load data on component mount
  useEffect(() => {
    loadInvoiceData()
  }, [])

  const loadInvoiceData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [invoicesData, statsData, unbilledData] = await Promise.all([
        invoicesAPI.getAllInvoices(),
        invoicesAPI.getInvoiceStats(),
        invoicesAPI.getUnbilledTimeEntries()
      ])
      
      setInvoices(invoicesData)
      setStats(statsData)
      setUnbilledPreviews(unbilledData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoice data')
      log.error('Failed to load invoice data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateInvoiceStatus = async (invoiceId: string, status: 'sent' | 'paid' | 'cancelled') => {
    try {
      setError(null)
      await invoicesAPI.updateInvoiceStatus(invoiceId, status)
      await loadInvoiceData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update invoice status')
    }
  }

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this draft invoice?')) {
      return
    }
    
    try {
      setError(null)
      await invoicesAPI.deleteInvoice(invoiceId)
      await loadInvoiceData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete invoice')
    }
  }

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const sampleInvoices = [
    {
      id: 'INV-2024-001',
      client: 'Acme Corp',
      date: '2024-01-01',
      dueDate: '2024-01-31',
      amount: '$6,300',
      status: 'paid',
      items: 42
    },
    {
      id: 'INV-2024-002',
      client: 'TechStart',
      date: '2024-01-05',
      dueDate: '2024-02-04',
      amount: '$5,700',
      status: 'sent',
      items: 38
    },
    {
      id: 'INV-2024-003',
      client: 'Growth Co',
      date: '2024-01-10',
      dueDate: '2024-02-09',
      amount: '$4,900',
      status: 'sent',
      items: 35
    },
    {
      id: 'INV-2024-004',
      client: 'Startup Inc',
      date: '2024-01-15',
      dueDate: '2024-02-14',
      amount: '$3,920',
      status: 'draft',
      items: 28
    },
    {
      id: 'INV-2023-045',
      client: 'Digital Agency',
      date: '2023-12-15',
      dueDate: '2024-01-14',
      amount: '$2,850',
      status: 'overdue',
      items: 19
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" role="status" aria-live="polite" aria-busy="true">
        <Loader2 className="w-8 h-8 animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading invoices…</span>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'sent':
        return <Send className="h-4 w-4 text-blue-600" />
      case 'draft':
        return <FileText className="h-4 w-4 text-gray-600" />
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800">Sent</Badge>
      case 'draft':
        return <Badge variant="outline">Draft</Badge>
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Create and manage client invoices
          </p>
        </div>
        <Button onClick={() => setShowInvoiceForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setError(null)}
            className="ml-auto"
          >
            ×
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.total_outstanding || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.sent_count || 0} invoices pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.paid_this_month || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.paid_count || 0} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.overdue_amount || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.overdue_count || 0} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.average_payment_days || 0} days</div>
            <p className="text-xs text-muted-foreground">
              Payment time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-base">Ready to Invoice</CardTitle>
            <CardDescription>{unbilledPreviews.length} clients have unbilled time</CardDescription>
          </CardHeader>
          <CardContent>
            {unbilledPreviews.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No unbilled time entries</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {unbilledPreviews.slice(0, 3).map((preview) => (
                    <div key={preview.client_id} className="flex justify-between items-center">
                      <span className="text-sm">{preview.client_name}</span>
                      <span className="text-sm font-medium">{formatCurrency(preview.total_amount)}</span>
                    </div>
                  ))}
                  {unbilledPreviews.length > 3 && (
                    <div className="text-center text-xs text-muted-foreground">
                      +{unbilledPreviews.length - 3} more clients
                    </div>
                  )}
                </div>
                <Button 
                  className="w-full mt-4" 
                  variant="outline"
                  onClick={() => setShowInvoiceForm(true)}
                >
                  Create Invoices
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-base">Payment Reminders</CardTitle>
            <CardDescription>2 invoices need follow-up</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Digital Agency</span>
                <Badge variant="destructive" className="text-xs">30 days</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">TechStart</span>
                <Badge variant="outline" className="text-xs">7 days</Badge>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              Send Reminders
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-base">Recurring Invoices</CardTitle>
            <CardDescription>Monthly retainer invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Acme Corp</span>
                <span className="text-xs text-muted-foreground">Due Feb 1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Growth Co</span>
                <span className="text-xs text-muted-foreground">Due Feb 1</span>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              Schedule Invoices
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>Your latest invoices and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">Invoice</th>
                  <th className="pb-3 font-medium">Client</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Due Date</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No invoices yet</p>
                      <p className="text-xs">Create your first invoice from unbilled time entries</p>
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-muted/50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(invoice.status)}
                          <span className="font-medium text-sm">{invoice.invoice_number}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div>
                          <p className="font-medium text-sm">{invoice.client_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {invoice.item_count} items • {invoice.total_hours.toFixed(1)}h
                          </p>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(invoice.issue_date)}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="text-sm">{formatDate(invoice.due_date)}</span>
                      </td>
                      <td className="py-3">
                        <span className="font-semibold">{formatCurrency(invoice.total_amount)}</span>
                      </td>
                      <td className="py-3">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          {invoice.status === 'draft' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleUpdateInvoiceStatus(invoice.id!, 'sent')}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteInvoice(invoice.id!)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {invoice.status === 'sent' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleUpdateInvoiceStatus(invoice.id!, 'paid')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Form */}
      <InvoiceForm
        isOpen={showInvoiceForm}
        onOpenChange={setShowInvoiceForm}
        onInvoiceCreated={loadInvoiceData}
      />
    </div>
  )
}
