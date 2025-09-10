import { NextRequest, NextResponse } from 'next/server';
import { HttpError, isHttpError } from '@/lib/errors';
import { createClient } from '@/lib/supabase/server';
import { validateInput, timeEntryCreateSchema, rateLimitPerUser } from '@/lib/validation/middleware';

// GET /api/v1/time-entries
export async function GET(request: NextRequest) {
  return validateInput(timeEntryCreateSchema)(request, async (validatedData, req) => {
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new HttpError(401, 'Unauthorized')
      }
      
      // Apply rate limiting per user
      await rateLimitPerUser(100, 60000)(user.id)
      
      // Extract validated parameters
      const { 
        client_id: clientId, 
        project_id: projectId, 
        billable, 
        status, 
        marketing_category: marketingCategory,
        marketing_channel: marketingChannel,
        page = 1, 
        limit = 50 
      } = validatedData
      
      // Additional query parameters (dates need separate validation)
      const { searchParams } = new URL(request.url)
      const startDate = searchParams.get('startDate')
      const endDate = searchParams.get('endDate')
      const offset = (page - 1) * limit
    
    // Build query - include related client and project names
    let query = supabase
      .from('time_entries')
      .select(`
        *,
        clients:client_id (name),
        projects:project_id (name)
      `, { count: 'exact' })
      .eq('user_id', user.id)
    
    // Apply filters
    if (clientId) {
      query = query.eq('client_id', clientId)
    }
    if (projectId) {
      query = query.eq('project_id', projectId)
    }
    if (startDate) {
      query = query.gte('start_time', startDate)
    }
    if (endDate) {
      // Add time to end date to include the full day
      const endDateTime = new Date(endDate)
      endDateTime.setHours(23, 59, 59, 999)
      query = query.lte('start_time', endDateTime.toISOString())
    }
    if (billable !== null) {
      query = query.eq('billable', billable === 'true')
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (marketingCategory) {
      query = query.eq('marketing_category', marketingCategory)
    }
    if (marketingChannel) {
      query = query.eq('marketing_channel', marketingChannel)
    }
    
    // Order by start_time descending by default
    query = query.order('start_time', { ascending: false })
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1)
    
    const { data: entries, error, count } = await query
    
    if (error) {
      throw new HttpError(500, error.message)
    }
    
    // Format the response to include client and project names
    const formattedEntries = entries?.map(entry => ({
      ...entry,
      client_name: entry.clients?.name || null,
      project_name: entry.projects?.name || null,
      // Remove nested objects
      clients: undefined,
      projects: undefined
    })) || []
    
    return NextResponse.json({
      data: formattedEntries,
      meta: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Time-entries route error:', error)
    if (isHttpError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/v1/time-entries
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new HttpError(401, 'Unauthorized')
    }
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['client_id', 'project_id', 'start_time', 'marketing_category', 'marketing_channel'];
    for (const field of requiredFields) {
      if (!body[field]) {
        throw new HttpError(400, `Missing required field: ${field}`)
      }
    }
    
    // Verify user owns the client and project
    const { data: clientCheck } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .eq('id', body.client_id)
      .single()
    
    if (!clientCheck) {
      throw new HttpError(403, 'Invalid client ID or permission denied')
    }
    
    const { data: projectCheck } = await supabase
      .from('projects')
      .select('id, hourly_rate')
      .eq('user_id', user.id)
      .eq('id', body.project_id)
      .single()
    
    if (!projectCheck) {
      throw new HttpError(403, 'Invalid project ID or permission denied')
    }
    
    // Calculate duration if end_time is provided
    let duration = null;
    if (body.end_time) {
      const start = new Date(body.start_time)
      const end = new Date(body.end_time)
      duration = Math.round((end.getTime() - start.getTime()) / 60000) // Convert to minutes
    }
    
    // Use project hourly rate if not specified
    const hourlyRate = body.hourly_rate !== undefined ? body.hourly_rate : projectCheck.hourly_rate
    
    // Prepare time entry data
    const entryData = {
      user_id: user.id,
      client_id: body.client_id,
      project_id: body.project_id,
      start_time: body.start_time,
      end_time: body.end_time || null,
      duration: duration,
      marketing_category: body.marketing_category,
      marketing_channel: body.marketing_channel,
      task_title: body.task_title || null,
      task_description: body.task_description || null,
      campaign_id: body.campaign_id || null,
      campaign_platform: body.campaign_platform || null,
      billable: body.billable !== false,
      hourly_rate: hourlyRate || 0,
      status: body.status || 'stopped',
      is_timer_running: body.is_timer_running || false,
      notes: body.notes || null,
      tags: body.tags || [],
      screenshots: body.screenshots || []
    }
    
    // Insert into database
    const { data: newEntry, error } = await supabase
      .from('time_entries')
      .insert([entryData])
      .select()
      .single()
    
    if (error) {
      throw new HttpError(500, error.message)
    }
    
    return NextResponse.json({
      data: newEntry,
      message: 'Time entry created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Time-entries route error:', error)
    if (isHttpError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/v1/time-entries (bulk update)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new HttpError(401, 'Unauthorized')
    }
    
    const body = await request.json();
    const { ids, updates } = body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new HttpError(400, 'Missing or invalid ids array')
    }
    
    // Verify user owns these time entries
    const { data: entryCheck } = await supabase
      .from('time_entries')
      .select('id')
      .eq('user_id', user.id)
      .in('id', ids)
    
    if (!entryCheck || entryCheck.length !== ids.length) {
      throw new HttpError(403, 'You do not have permission to update some of these time entries')
    }
    
    // If updating end_time, calculate duration
    if (updates.end_time && !updates.duration) {
      // We'd need to fetch each entry's start_time to calculate duration
      // For bulk updates, require duration to be provided if end_time changes
      throw new HttpError(400, 'Duration must be provided when updating end_time in bulk')
    }
    
    // Prepare updates (filter out undefined values)
    const validUpdates: any = {}
    const allowedFields = ['end_time', 'duration', 'marketing_category', 'marketing_channel',
      'task_title', 'task_description', 'campaign_id', 'campaign_platform',
      'billable', 'hourly_rate', 'status', 'is_timer_running', 'notes', 'tags', 'screenshots']
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        validUpdates[field] = updates[field]
      }
    }
    
    // Update time entries
    const { error } = await supabase
      .from('time_entries')
      .update(validUpdates)
      .eq('user_id', user.id)
      .in('id', ids)
    
    if (error) {
      throw new HttpError(500, error.message)
    }
    
    return NextResponse.json({
      message: `Updated ${ids.length} time entries`,
      updatedIds: ids
    });
  } catch (error) {
    console.error('Time-entries route error:', error)
    if (isHttpError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/v1/time-entries (bulk delete)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new HttpError(401, 'Unauthorized')
    }
    
    const body = await request.json();
    const { ids } = body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new HttpError(400, 'Missing or invalid ids array')
    }
    
    // Verify user owns these time entries
    const { data: entryCheck } = await supabase
      .from('time_entries')
      .select('id, status')
      .eq('user_id', user.id)
      .in('id', ids)
    
    if (!entryCheck || entryCheck.length !== ids.length) {
      throw new HttpError(403, 'You do not have permission to delete some of these time entries')
    }
    
    // Check if any entries are already invoiced
    const invoicedEntries = entryCheck.filter(e => e.status === 'invoiced' || e.status === 'paid')
    
    if (invoicedEntries.length > 0) {
      throw new HttpError(400, `Cannot delete ${invoicedEntries.length} invoiced or paid time entries`)
    }
    
    // Delete time entries
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('user_id', user.id)
      .in('id', ids)
    
    if (error) {
      throw new HttpError(500, error.message)
    }
    
    return NextResponse.json({
      message: `Deleted ${ids.length} time entries`,
      deletedIds: ids
    });
  } catch (error) {
    console.error('Time-entries route error:', error)
    if (isHttpError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}