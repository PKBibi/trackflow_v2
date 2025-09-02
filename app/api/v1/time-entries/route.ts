import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schemas
const TimeEntrySchema = z.object({
  description: z.string().min(1),
  project_id: z.string().uuid(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime().optional(),
  duration: z.number().optional(),
  billable: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
})

const QuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  project_id: z.string().uuid().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  billable: z.string().optional(),
})

// GET /api/v1/time-entries
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const query = QuerySchema.parse(searchParams)
    
    const page = parseInt(query.page)
    const limit = parseInt(query.limit)
    const offset = (page - 1) * limit

    // Build query
    let dbQuery = supabase
      .from('time_entries')
      .select('*, projects(name, client)', { count: 'exact' })
      .eq('user_id', user.id)
      .order('start_time', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (query.project_id) {
      dbQuery = dbQuery.eq('project_id', query.project_id)
    }
    if (query.start_date) {
      dbQuery = dbQuery.gte('start_time', query.start_date)
    }
    if (query.end_date) {
      dbQuery = dbQuery.lte('start_time', query.end_date)
    }
    if (query.billable !== undefined) {
      dbQuery = dbQuery.eq('billable', query.billable === 'true')
    }

    const { data, error, count } = await dbQuery

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      data,
      meta: {
        page,
        limit,
        total: count,
        totalPages,
        hasNext,
        hasPrev,
      },
      links: {
        self: `/api/v1/time-entries?page=${page}&limit=${limit}`,
        next: hasNext ? `/api/v1/time-entries?page=${page + 1}&limit=${limit}` : null,
        prev: hasPrev ? `/api/v1/time-entries?page=${page - 1}&limit=${limit}` : null,
      }
    }, {
      status: 200,
      headers: {
        'X-Total-Count': String(count || 0),
        'X-Page': String(page),
        'X-Limit': String(limit),
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }
    
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// POST /api/v1/time-entries
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = TimeEntrySchema.parse(body)

    // Create time entry
    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        ...validatedData,
        user_id: user.id,
        created_at: new Date().toISOString(),
      })
      .select('*, projects(name, client)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { 
      status: 201,
      headers: {
        'Location': `/api/v1/time-entries/${data.id}`
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }
    
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// PATCH /api/v1/time-entries (bulk operations)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ids, data: updateData } = body

    if (!action || !ids || !Array.isArray(ids)) {
      return NextResponse.json({ 
        error: 'Invalid request. Provide action, ids array, and data.' 
      }, { status: 400 })
    }

    switch (action) {
      case 'update':
        const { error: updateError } = await supabase
          .from('time_entries')
          .update(updateData)
          .eq('user_id', user.id)
          .in('id', ids)

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        return NextResponse.json({ 
          message: `Updated ${ids.length} time entries` 
        })

      case 'delete':
        const { error: deleteError } = await supabase
          .from('time_entries')
          .delete()
          .eq('user_id', user.id)
          .in('id', ids)

        if (deleteError) {
          return NextResponse.json({ error: deleteError.message }, { status: 500 })
        }

        return NextResponse.json({ 
          message: `Deleted ${ids.length} time entries` 
        })

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use "update" or "delete".' 
        }, { status: 400 })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

