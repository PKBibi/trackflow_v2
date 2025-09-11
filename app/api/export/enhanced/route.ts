import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      format: exportFormat = 'csv', 
      dataType = 'time_entries', 
      dateRange,
      clientIds,
      projectIds,
      includeBillableOnly = false
    } = body

    let data: any[] = []

    if (dataType === 'time_entries') {
      // Build query for time entries
      let query = supabase
        .from('time_entries')
        .select(`
          id,
          start_time,
          end_time,
          duration,
          task_title,
          task_description,
          marketing_category,
          marketing_channel,
          billable,
          hourly_rate,
          amount,
          clients:client_id (name, email),
          projects:project_id (name)
        `)
        .eq('user_id', user.id)
        .order('start_time', { ascending: false })

      // Apply filters
      if (dateRange) {
        if (dateRange.start) {
          query = query.gte('start_time', dateRange.start)
        }
        if (dateRange.end) {
          query = query.lte('start_time', dateRange.end)
        }
      }

      if (clientIds && clientIds.length > 0) {
        query = query.in('client_id', clientIds)
      }

      if (projectIds && projectIds.length > 0) {
        query = query.in('project_id', projectIds)
      }

      if (includeBillableOnly) {
        query = query.eq('billable', true)
      }

      const { data: timeEntries, error } = await query

      if (error) {
        throw new Error(`Failed to fetch time entries: ${error.message}`)
      }

      // Format data for export
      data = (timeEntries || []).map(entry => ({
        Date: new Date(entry.start_time).toLocaleDateString(),
        'Start Time': new Date(entry.start_time).toLocaleTimeString(),
        'End Time': entry.end_time ? new Date(entry.end_time).toLocaleTimeString() : '',
        'Duration (hours)': (entry.duration || 0) / 60,
        'Task Title': entry.task_title,
        'Description': entry.task_description || '',
        'Client': entry.clients?.name || '',
        'Project': entry.projects?.name || '',
        'Category': entry.marketing_category,
        'Channel': entry.marketing_channel,
        'Billable': entry.billable ? 'Yes' : 'No',
        'Hourly Rate': entry.hourly_rate ? `$${(entry.hourly_rate / 100).toFixed(2)}` : '',
        'Amount': entry.amount ? `$${(entry.amount / 100).toFixed(2)}` : ''
      }))

    } else if (dataType === 'clients') {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (error) {
        throw new Error(`Failed to fetch clients: ${error.message}`)
      }

      data = (clients || []).map(client => ({
        Name: client.name,
        Email: client.email,
        Company: client.company || '',
        Phone: client.phone || '',
        'Hourly Rate': client.hourly_rate ? `$${(client.hourly_rate / 100).toFixed(2)}` : '',
        'Has Retainer': client.has_retainer ? 'Yes' : 'No',
        'Retainer Hours': client.retainer_hours || 0,
        'Retainer Amount': client.retainer_amount ? `$${(client.retainer_amount / 100).toFixed(2)}` : '',
        Status: client.status,
        'Created': new Date(client.created_at).toLocaleDateString()
      }))

    } else if (dataType === 'projects') {
      const { data: projects, error } = await supabase
        .from('projects')
        .select(`
          *,
          clients:client_id (name)
        `)
        .eq('user_id', user.id)
        .order('name')

      if (error) {
        throw new Error(`Failed to fetch projects: ${error.message}`)
      }

      data = (projects || []).map(project => ({
        Name: project.name,
        Client: project.clients?.name || '',
        Description: project.description || '',
        Status: project.status,
        'Budget Type': project.budget_type,
        'Budget Hours': project.budget_hours || 0,
        'Budget Amount': project.budget_amount ? `$${(project.budget_amount / 100).toFixed(2)}` : '',
        'Start Date': project.start_date ? new Date(project.start_date).toLocaleDateString() : '',
        'End Date': project.end_date ? new Date(project.end_date).toLocaleDateString() : '',
        'Created': new Date(project.created_at).toLocaleDateString()
      }))
    }

    if (data.length === 0) {
      return NextResponse.json({ error: 'No data to export' }, { status: 400 })
    }

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `trackflow_${dataType}_${timestamp}`

    if (exportFormat === 'csv') {
      // Generate CSV
      const headers = Object.keys(data[0]).join(',')
      const rows = data.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value
        ).join(',')
      )
      const csv = [headers, ...rows].join('\\n')

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}.csv"`
        }
      })

    } else if (exportFormat === 'excel') {
      // Generate Excel with formatting
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(data)

      // Auto-size columns
      const columnWidths = Object.keys(data[0]).map(key => ({
        wch: Math.max(
          key.length,
          ...data.map(row => String(row[key]).length)
        )
      }))
      worksheet['!cols'] = columnWidths

      // Add some basic styling for headers
      const headerRow = XLSX.utils.encode_range({
        s: { c: 0, r: 0 },
        e: { c: Object.keys(data[0]).length - 1, r: 0 }
      })

      XLSX.utils.book_append_sheet(workbook, worksheet, dataType)
      
      const excelBuffer = XLSX.write(workbook, { 
        type: 'buffer', 
        bookType: 'xlsx',
        cellStyles: true 
      })

      return new NextResponse(excelBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}.xlsx"`
        }
      })

    } else if (exportFormat === 'pdf') {
      // For PDF, we'll return the data and let the client generate it
      // This avoids adding heavy PDF generation libraries to the server
      return NextResponse.json({
        success: true,
        data,
        filename: `${filename}.pdf`,
        metadata: {
          title: `${dataType.replace('_', ' ').toUpperCase()} Export`,
          generatedAt: new Date().toISOString(),
          recordCount: data.length,
          filters: {
            dateRange,
            clientIds,
            projectIds,
            includeBillableOnly
          }
        }
      })

    } else {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })
    }

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ 
      error: 'Export failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to return export templates/options
export async function GET() {
  return NextResponse.json({
    formats: [
      { 
        value: 'csv', 
        label: 'CSV', 
        description: 'Comma-separated values file',
        icon: 'FileText'
      },
      { 
        value: 'excel', 
        label: 'Excel', 
        description: 'Formatted Excel spreadsheet',
        icon: 'FileSpreadsheet'
      },
      { 
        value: 'pdf', 
        label: 'PDF Report', 
        description: 'Formatted PDF document',
        icon: 'FileImage'
      }
    ],
    dataTypes: [
      { 
        value: 'time_entries', 
        label: 'Time Entries', 
        description: 'Export your time tracking data'
      },
      { 
        value: 'clients', 
        label: 'Clients', 
        description: 'Export client information'
      },
      { 
        value: 'projects', 
        label: 'Projects', 
        description: 'Export project details'
      }
    ]
  })
}