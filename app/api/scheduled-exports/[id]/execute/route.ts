import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get the scheduled export
    const { data: scheduledExport, error: fetchError } = await supabase
      .from('scheduled_exports')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Scheduled export not found' }, { status: 404 })
      }
      throw new Error(`Failed to fetch scheduled export: ${fetchError.message}`)
    }

    // Create history record
    const { data: historyRecord, error: historyError } = await supabase
      .from('export_history')
      .insert({
        scheduled_export_id: params.id,
        user_id: user.id,
        status: 'pending'
      })
      .select()
      .single()

    if (historyError) {
      throw new Error(`Failed to create history record: ${historyError.message}`)
    }

    try {
      // Execute the export using the enhanced export API
      const exportResponse = await fetch(new URL('/api/export/enhanced', request.url), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('Cookie') || ''
        },
        body: JSON.stringify({
          format: scheduledExport.format,
          dataType: scheduledExport.data_type,
          ...scheduledExport.filters
        })
      })

      if (!exportResponse.ok) {
        const errorData = await exportResponse.json()
        throw new Error(errorData.error || 'Export failed')
      }

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0]
      const fileName = `trackflow_${scheduledExport.data_type}_${timestamp}.${scheduledExport.format}`

      // For CSV and Excel, we get the actual file
      let fileSize = 0
      let recordCount = 0

      if (scheduledExport.format === 'pdf') {
        // PDF returns JSON with data
        const pdfData = await exportResponse.json()
        recordCount = pdfData.metadata?.recordCount || 0
        fileSize = JSON.stringify(pdfData).length
      } else {
        // CSV and Excel return the actual file
        const buffer = await exportResponse.arrayBuffer()
        fileSize = buffer.byteLength
        
        // Estimate record count for CSV
        if (scheduledExport.format === 'csv') {
          const text = new TextDecoder().decode(buffer)
          recordCount = text.split('\n').length - 2 // Subtract header and empty line
        }
      }

      // Send email notification (if RESEND_API_KEY is configured)
      let emailSent = false
      try {
        if (process.env.RESEND_API_KEY) {
          await sendEmail({
            from: 'TrackFlow <noreply@trackflow.app>',
            to: scheduledExport.email_to,
            subject: scheduledExport.email_subject,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>TrackFlow Export: ${scheduledExport.name}</h2>
                <p>${scheduledExport.email_body}</p>
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3>Export Details</h3>
                  <p><strong>Export Name:</strong> ${scheduledExport.name}</p>
                  <p><strong>Data Type:</strong> ${scheduledExport.data_type.replace('_', ' ')}</p>
                  <p><strong>Format:</strong> ${scheduledExport.format.toUpperCase()}</p>
                  <p><strong>Records:</strong> ${recordCount}</p>
                  <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                </div>
                <p>This export was generated automatically by your TrackFlow scheduled export.</p>
                <p style="color: #666; font-size: 12px;">
                  You can manage your scheduled exports in your TrackFlow dashboard.
                </p>
              </div>
            `
          })
          emailSent = true
        }
      } catch (emailError) {
        console.error('Email send error:', emailError)
        // Don't fail the entire export if email fails
      }

      // Update history record with success
      await supabase
        .from('export_history')
        .update({
          status: 'success',
          file_name: fileName,
          file_size: fileSize,
          record_count: recordCount,
          completed_at: new Date().toISOString()
        })
        .eq('id', historyRecord.id)

      // Update scheduled export's last run info
      await supabase
        .from('scheduled_exports')
        .update({
          last_run_at: new Date().toISOString(),
          last_run_status: 'success'
        })
        .eq('id', params.id)

      return NextResponse.json({
        success: true,
        message: `Export executed successfully. ${emailSent ? 'Email sent.' : 'Email not configured.'}`,
        execution: {
          fileName,
          fileSize,
          recordCount,
          emailSent
        }
      })

    } catch (executionError) {
      // Update history record with error
      await supabase
        .from('export_history')
        .update({
          status: 'error',
          error_message: executionError instanceof Error ? executionError.message : 'Unknown error',
          completed_at: new Date().toISOString()
        })
        .eq('id', historyRecord.id)

      // Update scheduled export's last run info
      await supabase
        .from('scheduled_exports')
        .update({
          last_run_at: new Date().toISOString(),
          last_run_status: 'error',
          last_error_message: executionError instanceof Error ? executionError.message : 'Unknown error'
        })
        .eq('id', params.id)

      throw executionError
    }

  } catch (error) {
    console.error('Scheduled export execution error:', error)
    return NextResponse.json({ 
      error: 'Failed to execute scheduled export',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}