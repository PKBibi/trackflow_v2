import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: scheduledExports, error } = await supabase
      .from('scheduled_exports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch scheduled exports: ${error.message}`)
    }

    return NextResponse.json({ scheduledExports: scheduledExports || [] })
  } catch (error) {
    console.error('Scheduled exports fetch error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch scheduled exports',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
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
    const {
      name,
      description,
      format = 'csv',
      dataType = 'time_entries',
      filters = {},
      frequency,
      dayOfWeek,
      dayOfMonth,
      timeOfDay = '09:00:00',
      emailTo,
      emailSubject,
      emailBody,
      isActive = true
    } = body

    // Validate required fields
    if (!name || !frequency || !emailTo) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, frequency, emailTo' 
      }, { status: 400 })
    }

    // Validate frequency-specific fields
    if (frequency === 'weekly' && (dayOfWeek === null || dayOfWeek === undefined)) {
      return NextResponse.json({ 
        error: 'dayOfWeek is required for weekly frequency' 
      }, { status: 400 })
    }

    if (frequency === 'monthly' && !dayOfMonth) {
      return NextResponse.json({ 
        error: 'dayOfMonth is required for monthly frequency' 
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailTo)) {
      return NextResponse.json({ 
        error: 'Invalid email format' 
      }, { status: 400 })
    }

    const mergedFilters = { ...(filters || {}), ...(body?.branding ? { branding: body.branding } : {}) }

    const { data: scheduledExport, error } = await supabase
      .from('scheduled_exports')
      .insert({
        user_id: user.id,
        name,
        description,
        format,
        data_type: dataType,
        filters: mergedFilters,
        frequency,
        day_of_week: dayOfWeek,
        day_of_month: dayOfMonth,
        time_of_day: timeOfDay,
        email_to: emailTo,
        email_subject: emailSubject || `TrackFlow ${dataType} Export - ${name}`,
        email_body: emailBody || `Please find your ${dataType} export attached.`,
        is_active: isActive
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create scheduled export: ${error.message}`)
    }

    return NextResponse.json({ 
      success: true, 
      scheduledExport,
      message: 'Scheduled export created successfully'
    })
  } catch (error) {
    console.error('Scheduled export creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create scheduled export',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
