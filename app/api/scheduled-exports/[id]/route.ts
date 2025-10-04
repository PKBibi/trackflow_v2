import { log } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: scheduledExport, error } = await supabase
      .from('scheduled_exports')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Scheduled export not found' }, { status: 404 })
      }
      throw new Error(`Failed to fetch scheduled export: ${error.message}`)
    }

    return NextResponse.json({ scheduledExport })
  } catch (error) {
    log.error('Scheduled export fetch error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch scheduled export',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      format,
      dataType,
      filters,
      frequency,
      dayOfWeek,
      dayOfMonth,
      timeOfDay,
      emailTo,
      emailSubject,
      emailBody,
      isActive
    } = body

    // Validate email format if provided
    if (emailTo) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(emailTo)) {
        return NextResponse.json({ 
          error: 'Invalid email format' 
        }, { status: 400 })
      }
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (format !== undefined) updateData.format = format
    if (dataType !== undefined) updateData.data_type = dataType
    if (filters !== undefined) updateData.filters = filters
    if (frequency !== undefined) updateData.frequency = frequency
    if (dayOfWeek !== undefined) updateData.day_of_week = dayOfWeek
    if (dayOfMonth !== undefined) updateData.day_of_month = dayOfMonth
    if (timeOfDay !== undefined) updateData.time_of_day = timeOfDay
    if (emailTo !== undefined) updateData.email_to = emailTo
    if (emailSubject !== undefined) updateData.email_subject = emailSubject
    if (emailBody !== undefined) updateData.email_body = emailBody
    if (isActive !== undefined) updateData.is_active = isActive

    const { data: scheduledExport, error } = await supabase
      .from('scheduled_exports')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Scheduled export not found' }, { status: 404 })
      }
      throw new Error(`Failed to update scheduled export: ${error.message}`)
    }

    return NextResponse.json({ 
      success: true, 
      scheduledExport,
      message: 'Scheduled export updated successfully'
    })
  } catch (error) {
    log.error('Scheduled export update error:', error)
    return NextResponse.json({ 
      error: 'Failed to update scheduled export',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { error } = await supabase
      .from('scheduled_exports')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      throw new Error(`Failed to delete scheduled export: ${error.message}`)
    }

    return NextResponse.json({ 
      success: true,
      message: 'Scheduled export deleted successfully'
    })
  } catch (error) {
    log.error('Scheduled export deletion error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete scheduled export',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}