import { NextRequest, NextResponse } from 'next/server'
import { HttpError, isHttpError } from '@/lib/errors'
import { createClient } from '@/lib/supabase/server'

// GET /api/v1/projects
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new HttpError(401, 'Unauthorized')
    }
    
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');
    const priority = searchParams.get('priority');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    // Build query - include related client name and project statistics
    let query = supabase
      .from('projects')
      .select(`
        *,
        clients:client_id (name, company)
      `, { count: 'exact' })
      .eq('user_id', user.id)
    
    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (clientId) {
      query = query.eq('client_id', clientId)
    }
    if (priority) {
      query = query.eq('priority', priority)
    }
    
    // Apply sorting
    const isAsc = sortOrder === 'asc'
    query = query.order(sortBy, { ascending: isAsc })
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1)
    
    const { data: projects, error, count } = await query
    
    if (error) {
      throw new HttpError(500, error.message)
    }
    
    // Get project statistics (time entries and amounts)
    const projectIds = projects?.map(p => p.id) || []
    let projectStats: any = {}
    
    if (projectIds.length > 0) {
      const { data: timeEntries } = await supabase
        .from('time_entries')
        .select('project_id, duration, amount, billable')
        .eq('user_id', user.id)
        .in('project_id', projectIds)
      
      // Calculate stats per project
      timeEntries?.forEach(entry => {
        const projectId = entry.project_id
        if (!projectStats[projectId]) {
          projectStats[projectId] = {
            total_time_entries: 0,
            total_hours: 0,
            total_amount: 0
          }
        }
        
        projectStats[projectId].total_time_entries += 1
        projectStats[projectId].total_hours += (entry.duration || 0) / 60 // Convert minutes to hours
        if (entry.billable && entry.amount) {
          projectStats[projectId].total_amount += entry.amount
        }
      })
    }
    
    // Format the response with client names and statistics
    const formattedProjects = projects?.map(project => ({
      ...project,
      client_name: project.clients?.name || null,
      client_company: project.clients?.company || null,
      total_time_entries: projectStats[project.id]?.total_time_entries || 0,
      total_hours: Math.round((projectStats[project.id]?.total_hours || 0) * 100) / 100,
      total_amount: projectStats[project.id]?.total_amount || 0,
      is_over_budget: project.budget_amount && projectStats[project.id]?.total_amount 
        ? projectStats[project.id].total_amount > project.budget_amount
        : false,
      // Remove nested objects
      clients: undefined
    })) || []
    
    return NextResponse.json({
      data: formattedProjects,
      meta: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Projects route error:', error)
    if (isHttpError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/v1/projects
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new HttpError(401, 'Unauthorized')
    }
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'client_id'];
    for (const field of requiredFields) {
      if (!body[field]) {
        throw new HttpError(400, `Missing required field: ${field}`)
      }
    }
    
    // Verify user owns the client
    const { data: clientCheck } = await supabase
      .from('clients')
      .select('id, hourly_rate')
      .eq('user_id', user.id)
      .eq('id', body.client_id)
      .single()
    
    if (!clientCheck) {
      throw new HttpError(403, 'Invalid client ID or permission denied')
    }
    
    // Prepare project data
    const projectData = {
      user_id: user.id,
      client_id: body.client_id,
      name: body.name,
      description: body.description || null,
      project_type: body.project_type || null,
      priority: body.priority || 'medium',
      budget_type: body.budget_type || 'hourly',
      budget_amount: body.budget_amount || 0,
      estimated_hours: body.estimated_hours || 0,
      campaign_id: body.campaign_id || null,
      campaign_platform: body.campaign_platform || null,
      campaign_objective: body.campaign_objective || null,
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      deadline: body.deadline || null,
      status: body.status || 'planning',
      completion_percentage: body.completion_percentage || 0,
      billable: body.billable !== false,
      hourly_rate: body.hourly_rate || clientCheck.hourly_rate,
      notes: body.notes || null,
      tags: body.tags || []
    }
    
    // Insert into database
    const { data: newProject, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single()
    
    if (error) {
      throw new HttpError(500, error.message)
    }
    
    return NextResponse.json({
      data: newProject,
      message: 'Project created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Projects route error:', error)
    if (isHttpError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/v1/projects (bulk update)
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
    
    // Verify user owns these projects
    const { data: projectCheck } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', user.id)
      .in('id', ids)
    
    if (!projectCheck || projectCheck.length !== ids.length) {
      throw new HttpError(403, 'You do not have permission to update some of these projects')
    }
    
    // Prepare updates (filter out undefined values)
    const validUpdates: any = {}
    const allowedFields = ['name', 'description', 'project_type', 'priority', 'budget_type',
      'budget_amount', 'estimated_hours', 'campaign_id', 'campaign_platform', 'campaign_objective',
      'start_date', 'end_date', 'deadline', 'status', 'completion_percentage', 'billable',
      'hourly_rate', 'notes', 'tags']
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        validUpdates[field] = updates[field]
      }
    }
    
    // Validate completion percentage if provided
    if (validUpdates.completion_percentage !== undefined) {
      const pct = validUpdates.completion_percentage
      if (pct < 0 || pct > 100) {
        throw new HttpError(400, 'Completion percentage must be between 0 and 100')
      }
    }
    
    // Update projects
    const { error } = await supabase
      .from('projects')
      .update(validUpdates)
      .eq('user_id', user.id)
      .in('id', ids)
    
    if (error) {
      throw new HttpError(500, error.message)
    }
    
    return NextResponse.json({
      message: `Updated ${ids.length} projects`,
      updatedIds: ids
    });
  } catch (error) {
    console.error('Projects route error:', error)
    if (isHttpError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/v1/projects (bulk delete)
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
    
    // Verify user owns these projects
    const { data: projectCheck } = await supabase
      .from('projects')
      .select('id, name')
      .eq('user_id', user.id)
      .in('id', ids)
    
    if (!projectCheck || projectCheck.length !== ids.length) {
      throw new HttpError(403, 'You do not have permission to delete some of these projects')
    }
    
    // Check if projects have associated time entries
    const { data: timeEntries } = await supabase
      .from('time_entries')
      .select('project_id')
      .eq('user_id', user.id)
      .in('project_id', ids)
    
    if (timeEntries && timeEntries.length > 0) {
      const projectsWithTime = timeEntries.map(te => {
        const project = projectCheck.find(p => p.id === te.project_id)
        return {
          id: te.project_id,
          name: project?.name || 'Unknown'
        }
      })
      
      // Get unique projects
      const uniqueProjects = projectsWithTime.filter((proj, index, self) => 
        index === self.findIndex(p => p.id === proj.id)
      )
      
      return NextResponse.json(
        { 
          error: `Cannot delete projects with existing time entries`,
          projectsWithTimeEntries: uniqueProjects
        },
        { status: 400 }
      );
    }
    
    // Delete projects
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('user_id', user.id)
      .in('id', ids)
    
    if (error) {
      throw new HttpError(500, error.message)
    }
    
    return NextResponse.json({
      message: `Deleted ${ids.length} projects`,
      deletedIds: ids
    });
  } catch (error) {
    console.error('Projects route error:', error)
    if (isHttpError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}