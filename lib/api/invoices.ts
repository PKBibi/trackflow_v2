import { createClient } from '@/lib/supabase/client'
import { getActiveTeamId } from '@/lib/api/team-client'

export interface Invoice {
  id?: string
  user_id?: string
  client_id: string
  invoice_number: string
  issue_date: string
  due_date: string
  subtotal: number // in cents
  tax_amount: number // in cents  
  total_amount: number // in cents
  currency: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  payment_terms: number // days
  notes?: string
  
  // Metadata
  created_at?: string
  updated_at?: string
  sent_at?: string
  paid_at?: string
}

export interface InvoiceItem {
  id?: string
  invoice_id: string
  time_entry_id: string
  description: string
  marketing_channel: string
  marketing_category: string
  hours: number
  rate: number // in cents
  amount: number // in cents
}

export interface InvoiceWithDetails extends Invoice {
  client_name: string
  client_company?: string
  client_email?: string
  items: InvoiceItem[]
  total_hours: number
  item_count: number
}

export interface InvoicePreview {
  client_id: string
  client_name: string
  client_company?: string
  client_email?: string
  time_entries: Array<{
    id: string
    description: string
    marketing_channel: string
    marketing_category: string
    hours: number
    rate: number
    amount: number
    start_time: string
  }>
  total_hours: number
  total_amount: number
  item_count: number
}

export interface InvoiceStats {
  total_outstanding: number
  paid_this_month: number
  overdue_amount: number
  average_payment_days: number
  total_invoices: number
  draft_count: number
  sent_count: number
  paid_count: number
  overdue_count: number
}

class InvoicesAPI {
  private supabase = createClient()

  // Get invoice statistics
  async getInvoiceStats(): Promise<InvoiceStats> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    // Get current month date range
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

    // Get all invoices
    const { data: invoices, error } = await this.supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .eq('team_id', getActiveTeamId() || null)

    if (error) {
      throw new Error(`Failed to get invoice stats: ${error.message}`)
    }

    if (!invoices || invoices.length === 0) {
      return {
        total_outstanding: 0,
        paid_this_month: 0,
        overdue_amount: 0,
        average_payment_days: 0,
        total_invoices: 0,
        draft_count: 0,
        sent_count: 0,
        paid_count: 0,
        overdue_count: 0
      }
    }

    // Calculate stats
    const outstanding = invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + inv.total_amount, 0)
    const paidThisMonth = invoices.filter(inv => 
      inv.status === 'paid' && 
      inv.paid_at && 
      inv.paid_at >= startOfMonth && 
      inv.paid_at <= endOfMonth
    ).reduce((sum, inv) => sum + inv.total_amount, 0)
    
    const overdue = invoices.filter(inv => {
      if (inv.status !== 'sent') return false
      const dueDate = new Date(inv.due_date)
      return dueDate < now
    }).reduce((sum, inv) => sum + inv.total_amount, 0)

    // Calculate average payment days
    const paidInvoices = invoices.filter(inv => inv.status === 'paid' && inv.sent_at && inv.paid_at)
    const avgPaymentDays = paidInvoices.length > 0 ? 
      paidInvoices.reduce((sum, inv) => {
        const sentDate = new Date(inv.sent_at!)
        const paidDate = new Date(inv.paid_at!)
        return sum + Math.floor((paidDate.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24))
      }, 0) / paidInvoices.length : 0

    return {
      total_outstanding: outstanding,
      paid_this_month: paidThisMonth,
      overdue_amount: overdue,
      average_payment_days: Math.round(avgPaymentDays),
      total_invoices: invoices.length,
      draft_count: invoices.filter(inv => inv.status === 'draft').length,
      sent_count: invoices.filter(inv => inv.status === 'sent').length,
      paid_count: invoices.filter(inv => inv.status === 'paid').length,
      overdue_count: invoices.filter(inv => {
        if (inv.status !== 'sent') return false
        const dueDate = new Date(inv.due_date)
        return dueDate < now
      }).length
    }
  }

  // Get all invoices with details
  async getAllInvoices(): Promise<InvoiceWithDetails[]> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('invoices')
      .select(`
        *,
        clients:client_id (
          name,
          email
        ),
        invoice_items (
          *
        )
      `)
      .eq('user_id', user.id)
      .eq('team_id', getActiveTeamId() || null)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get invoices: ${error.message}`)
    }

    return data.map((invoice: any) => ({
      ...invoice,
      client_name: invoice.clients?.name || 'Unknown Client',
      client_company: invoice.clients?.name || '',
      client_email: invoice.clients?.email,
      items: invoice.invoice_items || [],
      total_hours: (invoice.invoice_items || []).reduce((sum: number, item: any) => sum + item.hours, 0),
      item_count: (invoice.invoice_items || []).length
    }))
  }

  // Get unbilled time entries for a client
  async getUnbilledTimeEntries(clientId?: string): Promise<InvoicePreview[]> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    let query = this.supabase
      .from('time_entries')
      .select(`
        *,
        clients:client_id (
          id,
          name,
          email
        )
      `)
      .eq('user_id', user.id)
      .eq('team_id', getActiveTeamId() || null)
      .eq('billable', true)
      .eq('status', 'stopped')
      .is('invoice_id', null) // Not yet invoiced

    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    const { data, error } = await query.order('client_id').order('start_time')

    if (error) {
      throw new Error(`Failed to get unbilled entries: ${error.message}`)
    }

    // Group by client
    const clientMap = new Map<string, {
      client_id: string
      client_name: string
      client_company?: string
      client_email?: string
      time_entries: any[]
    }>()

    data.forEach((entry: any) => {
      const clientId = entry.client_id
      const client = entry.clients

      if (!clientMap.has(clientId)) {
        clientMap.set(clientId, {
          client_id: clientId,
          client_name: client?.name || 'Unknown Client',
          client_company: client?.name || '',
          client_email: client?.email,
          time_entries: []
        })
      }

      clientMap.get(clientId)!.time_entries.push({
        id: entry.id,
        description: entry.task_title || 'Time Entry',
        marketing_channel: entry.marketing_channel,
        marketing_category: entry.marketing_category,
        hours: (entry.duration || 0) / 60, // convert minutes to hours
        rate: entry.hourly_rate,
        amount: entry.amount || 0,
        start_time: entry.start_time
      })
    })

    // Convert to preview format
    const previews: InvoicePreview[] = Array.from(clientMap.values()).map(client => ({
      ...client,
      total_hours: client.time_entries.reduce((sum, entry) => sum + entry.hours, 0),
      total_amount: client.time_entries.reduce((sum, entry) => sum + entry.amount, 0),
      item_count: client.time_entries.length
    }))

    return previews.filter(preview => preview.item_count > 0)
  }

  // Generate invoice number
  private async generateInvoiceNumber(): Promise<string> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    const year = new Date().getFullYear()
    const { count } = await this.supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('team_id', getActiveTeamId() || null)
      .gte('created_at', `${year}-01-01`)
      .lt('created_at', `${year + 1}-01-01`)

    const invoiceNumber = String((count || 0) + 1).padStart(3, '0')
    return `INV-${year}-${invoiceNumber}`
  }

  // Create invoice from time entries
  async createInvoiceFromTimeEntries(
    clientId: string, 
    timeEntryIds: string[], 
    options: {
      dueInDays?: number
      notes?: string
    } = {}
  ): Promise<Invoice> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    // Get client details
    const { data: client, error: clientError } = await this.supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .eq('user_id', user.id)
      .eq('team_id', getActiveTeamId() || null)
      .single()

    if (clientError || !client) {
      throw new Error('Client not found')
    }

    // Get time entries
    const { data: timeEntries, error: entriesError } = await this.supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('team_id', getActiveTeamId() || null)
      .eq('client_id', clientId)
      .in('id', timeEntryIds)
      .is('invoice_id', null)

    if (entriesError || !timeEntries || timeEntries.length === 0) {
      throw new Error('No valid time entries found')
    }

    // Calculate totals
    const subtotal = timeEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0)
    const taxAmount = Math.round(subtotal * (client.tax_rate || 0))
    const totalAmount = subtotal + taxAmount

    // Generate invoice
    const invoiceNumber = await this.generateInvoiceNumber()
    const issueDate = new Date().toISOString().split('T')[0]
    const dueDate = new Date(Date.now() + (options.dueInDays || 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const invoiceData: any = {
      user_id: user.id,
      team_id: getActiveTeamId() || undefined,
      client_id: clientId,
      invoice_number: invoiceNumber,
      issue_date: issueDate,
      due_date: dueDate,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      currency: client.currency,
      status: 'draft',
      payment_terms: options.dueInDays || 30,
      notes: options.notes
    }

    // Create invoice
    const { data: invoice, error: invoiceError } = await this.supabase
      .from('invoices')
      .insert([invoiceData])
      .select()
      .single()

    if (invoiceError) {
      throw new Error(`Failed to create invoice: ${invoiceError.message}`)
    }

    // Create invoice items
    const invoiceItems = timeEntries.map(entry => ({
      invoice_id: invoice.id,
      time_entry_id: entry.id,
      description: entry.task_title || 'Time Entry',
      marketing_channel: entry.marketing_channel,
      marketing_category: entry.marketing_category,
      hours: (entry.duration || 0) / 60,
      rate: entry.hourly_rate,
      amount: entry.amount || 0
    }))

    const { error: itemsError } = await this.supabase
      .from('invoice_items')
      .insert(invoiceItems)

    if (itemsError) {
      throw new Error(`Failed to create invoice items: ${itemsError.message}`)
    }

    // Update time entries with invoice ID
    const { error: updateError } = await this.supabase
      .from('time_entries')
      .update({ invoice_id: invoice.id, status: 'invoiced' })
      .in('id', timeEntryIds)

    if (updateError) {
      throw new Error(`Failed to update time entries: ${updateError.message}`)
    }

    return invoice
  }

  // Update invoice status
  async updateInvoiceStatus(invoiceId: string, status: Invoice['status']): Promise<Invoice> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    const updates: any = { status }
    
    if (status === 'sent' && !updates.sent_at) {
      updates.sent_at = new Date().toISOString()
    }
    
    if (status === 'paid' && !updates.paid_at) {
      updates.paid_at = new Date().toISOString()
    }

    const { data, error } = await this.supabase
      .from('invoices')
      .update(updates)
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .eq('team_id', getActiveTeamId() || null)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update invoice: ${error.message}`)
    }

    return data
  }

  // Delete invoice (only if draft)
  async deleteInvoice(invoiceId: string): Promise<void> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    // Check if invoice is draft
    const { data: invoice } = await this.supabase
      .from('invoices')
      .select('status')
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .eq('team_id', getActiveTeamId() || null)
      .single()

    if (!invoice || invoice.status !== 'draft') {
      throw new Error('Can only delete draft invoices')
    }

    // Delete invoice items first
    await this.supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', invoiceId)

    // Update time entries to remove invoice_id
    await this.supabase
      .from('time_entries')
      .update({ invoice_id: null, status: 'stopped' })
      .eq('invoice_id', invoiceId)
      .eq('team_id', getActiveTeamId() || null)

    // Delete invoice
    const { error } = await this.supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .eq('team_id', getActiveTeamId() || null)

    if (error) {
      throw new Error(`Failed to delete invoice: ${error.message}`)
    }
  }

  // Get single invoice with details
  async getInvoiceById(invoiceId: string): Promise<InvoiceWithDetails | null> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('invoices')
      .select(`
        *,
        clients:client_id (
          name,
          email
        ),
        invoice_items (
          *
        )
      `)
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .eq('team_id', getActiveTeamId() || null)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get invoice: ${error.message}`)
    }

    if (!data) return null

    return {
      ...data,
      client_name: data.clients?.name || 'Unknown Client',
      client_company: data.clients?.name || '',
      client_email: data.clients?.email,
      items: data.invoice_items || [],
      total_hours: (data.invoice_items || []).reduce((sum: number, item: any) => sum + item.hours, 0),
      item_count: (data.invoice_items || []).length
    }
  }
}

export const invoicesAPI = new InvoicesAPI()