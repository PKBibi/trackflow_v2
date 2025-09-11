import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get clients needing alerts
    const { data: alerts, error } = await supabase
      .rpc('get_retainer_alerts')

    if (error) {
      console.error('Error fetching retainer alerts:', error)
      return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
    }

    return NextResponse.json({ alerts: alerts || [] })
  } catch (error) {
    console.error('Error in GET /api/retainer/alerts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { sendEmail = true } = body

    // Get all pending alerts
    const { data: alerts, error: alertsError } = await supabase
      .rpc('get_retainer_alerts')

    if (alertsError) {
      console.error('Error fetching alerts:', alertsError)
      return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
    }

    if (!alerts || alerts.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No alerts to send',
        alertsSent: 0
      })
    }

    const results = {
      alertsSent: 0,
      emailsSent: 0,
      errors: [] as string[]
    }

    // Process each alert
    for (const alert of alerts) {
      try {
        // Send email if enabled and API key is available
        if (sendEmail && process.env.RESEND_API_KEY) {
          const subject = `⚠️ Retainer Alert: ${alert.client_name} - ${alert.alert_type} Used`
          const usageText = `${alert.used_hours} of ${alert.allocated_hours} hours used`
          const percentageColor = alert.usage_percentage >= 100 ? '#ef4444' : 
                                alert.usage_percentage >= 90 ? '#f97316' : '#eab308'

          await resend.emails.send({
            from: 'TrackFlow <alerts@track-flow.app>',
            to: [user.email!], // Send to user, not client
            subject,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: ${percentageColor}; color: white; padding: 16px; border-radius: 8px 8px 0 0; text-align: center;">
                  <h2 style="margin: 0; font-size: 24px;">⚠️ Retainer Alert</h2>
                </div>
                
                <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                  <h3 style="color: #111827; margin-top: 0;">Client: ${alert.client_name}</h3>
                  
                  <div style="background: white; padding: 16px; border-radius: 6px; margin: 16px 0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                      <span>Retainer Usage:</span>
                      <span style="font-weight: bold; color: ${percentageColor};">${alert.usage_percentage}%</span>
                    </div>
                    <div style="background: #e5e7eb; height: 8px; border-radius: 4px;">
                      <div style="background: ${percentageColor}; height: 8px; width: ${Math.min(alert.usage_percentage, 100)}%; border-radius: 4px;"></div>
                    </div>
                    <div style="margin-top: 8px; font-size: 14px; color: #6b7280;">
                      ${usageText}
                    </div>
                  </div>
                  
                  <p style="color: #374151; margin: 16px 0;">
                    <strong>Period:</strong> ${new Date(alert.period_start).toLocaleDateString()} - ${new Date(alert.period_end).toLocaleDateString()}
                  </p>
                  
                  ${alert.usage_percentage >= 100 ? 
                    '<div style="background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 12px; border-radius: 6px; margin: 16px 0;"><strong>⚠️ Retainer Exceeded!</strong> This client has used all allocated hours for this period.</div>' :
                    alert.usage_percentage >= 90 ?
                    '<div style="background: #fffbeb; border: 1px solid #fed7aa; color: #92400e; padding: 12px; border-radius: 6px; margin: 16px 0;"><strong>⚠️ Nearly Complete!</strong> This client is approaching their retainer limit.</div>' :
                    '<div style="background: #fefce8; border: 1px solid #fde68a; color: #854d0e; padding: 12px; border-radius: 6px; margin: 16px 0;"><strong>ℹ️ Usage Notice</strong> This client has reached 75% of their retainer allocation.</div>'
                  }
                  
                  <div style="text-align: center; margin-top: 24px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/clients" 
                       style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                      View Client Details
                    </a>
                  </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280;">
                  <p>TrackFlow - Time Tracking for Digital Marketing Teams</p>
                  <p>You can disable these alerts in your <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications" style="color: #3b82f6;">notification settings</a>.</p>
                </div>
              </div>
            `
          })
          results.emailsSent++
        }

        // Mark alert as sent in database
        const { error: markError } = await supabase
          .rpc('mark_retainer_alert_sent', {
            p_retainer_usage_id: alert.retainer_usage_id,
            p_alert_type: alert.alert_type
          })

        if (markError) {
          throw new Error(`Failed to mark alert as sent: ${markError.message}`)
        }

        results.alertsSent++

      } catch (error) {
        console.error(`Error processing alert for ${alert.client_name}:`, error)
        results.errors.push(`${alert.client_name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: true,
      results
    })

  } catch (error) {
    console.error('Error in POST /api/retainer/alerts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get retainer usage stats for all clients
export async function PUT() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get current month's retainer usage
    const currentMonth = new Date()
    const periodStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const periodEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    const { data: usage, error } = await supabase
      .from('retainer_usage')
      .select(`
        *,
        clients:client_id (name, email, retainer_hours, retainer_amount)
      `)
      .eq('user_id', user.id)
      .gte('period_start', periodStart.toISOString().split('T')[0])
      .lte('period_end', periodEnd.toISOString().split('T')[0])
      .order('usage_percentage', { ascending: false })

    if (error) {
      console.error('Error fetching retainer usage:', error)
      return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 })
    }

    return NextResponse.json({ usage: usage || [] })
  } catch (error) {
    console.error('Error in PUT /api/retainer/alerts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}