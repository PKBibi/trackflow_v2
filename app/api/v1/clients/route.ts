import { NextRequest, NextResponse } from 'next/server'
import { HttpError, isHttpError } from '@/lib/errors'
import { createClient } from '@/lib/supabase/server'
import { validateInput, clientCreateSchema, clientListSchema, rateLimitPerUser, validateRequestSize } from '@/lib/validation/middleware'
import { getAuthenticatedUser } from '@/lib/auth/api-key'
import { auditLogger } from '@/lib/audit/logger'
import { getActiveTeam } from '@/lib/auth/team'

// GET /api/v1/clients
export async function GET(request: NextRequest) {
  // @ts-expect-error - Zod transform types are incompatible with validateInput generic
  return validateInput(clientListSchema)(request, async (validatedData, req) => {
    try {
      const supabase = await createClient()
      const user = await getAuthenticatedUser(request)
      
      if (!user) {
        throw new HttpError(401, 'Unauthorized')
      }
      
      // Get team context
      const teamContext = await getActiveTeam(request)
      if (!teamContext.ok) {
        return teamContext.response
      }
      const teamId = teamContext.teamId

      // Apply rate limiting per user
      const rateLimit = await rateLimitPerUser(100, 60000)
      await rateLimit(user.id)

      // Extract validated parameters
      const { search, status, page = 1, limit = 50 } = validatedData
      const sortBy = 'name' // Default sort
      const sortOrder = 'asc' // Default order
      const offset = (page - 1) * limit

    // Build query with team scoping
    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('team_id', teamId)
    
    // Apply filters with validated/sanitized inputs
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`)
    }
    if (status) {
      query = query.eq('status', status)
    }
    // Note: hasRetainer would need to be added to schema if still needed
    
    // Apply sorting
    const isAsc = sortOrder === 'asc'
    query = query.order(sortBy, { ascending: isAsc })
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1)
    
    const { data: clients, error, count } = await query
    
    if (error) {
      throw new HttpError(500, error.message)
    }
    
    // Calculate statistics with a separate aggregation query
    const { data: statsData } = await supabase
      .from('clients')
      .select('status, hourly_rate')
      .eq('user_id', user.id)
      .eq('team_id', teamId)

    // Also get invoice statistics for revenue calculations
    const { data: invoiceStats } = await supabase
      .from('invoices')
      .select('client_id, total_amount, status')
      .eq('user_id', user.id)
      .eq('team_id', teamId)
    
    // Calculate stats
    const activeClients = statsData?.filter(c => c.status === 'active').length || 0
    const averageRate = statsData?.length ? 
      statsData.reduce((sum, c) => sum + (c.hourly_rate || 0), 0) / statsData.length : 0
    
    // Calculate revenue from invoices
    const totalRevenue = invoiceStats?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0
    const totalOutstanding = invoiceStats
      ?.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0
    
    const stats = {
      totalClients: count || 0,
      activeClients,
      totalRevenue: totalRevenue / 100, // Convert from cents
      totalOutstanding: totalOutstanding / 100, // Convert from cents  
      averageRate: averageRate / 100 // Convert from cents
    };
    
    return NextResponse.json({
      data: clients || [],
      meta: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      },
      stats
    });
  } catch (error) {
    console.error('Clients route error:', error)
    if (isHttpError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
  })
}

// POST /api/v1/clients
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const user = await getAuthenticatedUser(request)

    if (!user) {
      throw new HttpError(401, 'Unauthorized')
    }

    // Get team context
    const teamContext = await getActiveTeam(request)
    if (!teamContext.ok) {
      return teamContext.response
    }
    const teamId = teamContext.teamId

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name'];
    for (const field of requiredFields) {
      if (!body[field]) {
        throw new HttpError(400, `Missing required field: ${field}`)
      }
    }

    // Check for duplicate email if provided
    if (body.email) {
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .eq('team_id', teamId)
        .eq('email', body.email)
        .single()

      if (existing) {
        throw new HttpError(409, 'A client with this email already exists')
      }
    }

    // Prepare client data
    const clientData = {
      user_id: user.id,
      team_id: teamId,
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      company: body.company || null,
      website: body.website || null,
      address: body.address || null,
      city: body.city || null,
      state: body.state || null,
      zip_code: body.zip_code || null,
      country: body.country || 'US',
      hourly_rate: body.hourly_rate || null,
      currency: body.currency || 'USD',
      tax_rate: body.tax_rate || 0,
      has_retainer: body.has_retainer || false,
      retainer_hours: body.retainer_hours || 0,
      retainer_amount: body.retainer_amount || 0,
      retainer_start_date: body.retainer_start_date || null,
      retainer_end_date: body.retainer_end_date || null,
      retainer_auto_renew: body.retainer_auto_renew || false,
      alert_at_75_percent: body.alert_at_75_percent !== false,
      alert_at_90_percent: body.alert_at_90_percent !== false,
      alert_at_100_percent: body.alert_at_100_percent !== false,
      status: body.status || 'active',
      notes: body.notes || null,
      tags: body.tags || []
    }
    
    // Insert into database
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select()
      .single()
    
    if (error) {
      // Log failed creation attempt
      await auditLogger.logDataAccess(
        'data:client_create',
        user.id,
        'client',
        'unknown',
        undefined,
        clientData,
        false,
        error.message
      )
      throw new HttpError(500, error.message)
    }
    
    // Log successful client creation
    await auditLogger.logDataAccess(
      'data:client_create',
      user.id,
      'client',
      newClient.id,
      undefined,
      newClient,
      true
    )
    
    return NextResponse.json({
      data: newClient,
      message: 'Client created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Clients route error:', error)
    
    // Log the error if it's a security issue
    if (error instanceof HttpError && error.status === 401) {
      await auditLogger.logSecurityEvent(
        'security:permission_denied',
        undefined,
        { endpoint: '/api/v1/clients', method: 'POST' },
        error.message
      )
    }
    
    if (isHttpError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/v1/clients (bulk update)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new HttpError(401, 'Unauthorized')
    }

    // Get team context
    const teamContext = await getActiveTeam(request)
    if (!teamContext.ok) {
      return teamContext.response
    }
    const teamId = teamContext.teamId

    const body = await request.json();
    const { ids, updates } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new HttpError(400, 'Missing or invalid ids array')
    }

    // Verify user owns these clients within their team
    const { data: clientCheck } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .in('id', ids)
    
    if (!clientCheck || clientCheck.length !== ids.length) {
      throw new HttpError(403, 'You do not have permission to update some of these clients')
    }
    
    // Prepare updates (filter out undefined values)
    const validUpdates: any = {}
    const allowedFields = ['name', 'email', 'phone', 'company', 'website', 'address', 
      'city', 'state', 'zip_code', 'country', 'hourly_rate', 'currency', 'tax_rate',
      'has_retainer', 'retainer_hours', 'retainer_amount', 'retainer_start_date',
      'retainer_end_date', 'retainer_auto_renew', 'alert_at_75_percent', 
      'alert_at_90_percent', 'alert_at_100_percent', 'status', 'notes', 'tags']
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        validUpdates[field] = updates[field]
      }
    }
    
    // Update clients
    const { error } = await supabase
      .from('clients')
      .update(validUpdates)
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .in('id', ids)
    
    if (error) {
      throw new HttpError(500, error.message)
    }
    
    return NextResponse.json({
      message: `Updated ${ids.length} clients`,
      updatedIds: ids
    });
  } catch (error) {
    console.error('Clients route error:', error)
    if (isHttpError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/v1/clients (bulk delete)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new HttpError(401, 'Unauthorized')
    }

    // Get team context
    const teamContext = await getActiveTeam(request)
    if (!teamContext.ok) {
      return teamContext.response
    }
    const teamId = teamContext.teamId

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new HttpError(400, 'Missing or invalid ids array')
    }

    // Verify user owns these clients within their team
    const { data: clientCheck } = await supabase
      .from('clients')
      .select('id, name')
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .in('id', ids)
    
    if (!clientCheck || clientCheck.length !== ids.length) {
      throw new HttpError(403, 'You do not have permission to delete some of these clients')
    }
    
    // Check for clients with unpaid invoices
    const { data: unpaidInvoices } = await supabase
      .from('invoices')
      .select('client_id, total_amount')
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .in('client_id', ids)
      .neq('status', 'paid')
      .neq('status', 'cancelled')
    
    if (unpaidInvoices && unpaidInvoices.length > 0) {
      const clientsWithBalance = unpaidInvoices.map(inv => {
        const client = clientCheck.find(c => c.id === inv.client_id)
        return {
          id: inv.client_id,
          name: client?.name || 'Unknown',
          balance: inv.total_amount / 100 // Convert from cents
        }
      })
      
      return NextResponse.json(
        { 
          error: 'Cannot delete clients with unpaid invoices',
          clientsWithBalance
        },
        { status: 400 }
      );
    }
    
    // Delete clients
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .in('id', ids)
    
    if (error) {
      throw new HttpError(500, error.message)
    }
    
    return NextResponse.json({
      message: `Deleted ${ids.length} clients`,
      deletedIds: ids
    });
  } catch (error) {
    console.error('Clients route error:', error)
    if (isHttpError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
