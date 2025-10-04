import { NextRequest, NextResponse } from 'next/server'
import { HttpError, isHttpError } from '@/lib/errors'
import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth/api-key'
import { getActiveTeam } from '@/lib/auth/team'
import { z } from 'zod'

// GET /api/v1/time-entries/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data: entry, error } = await supabase
      .from('time_entries')
      .select(`
        *,
        clients:client_id (name),
        projects:project_id (name)
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .single()

    if (error || !entry) {
      throw new HttpError(404, 'Time entry not found')
    }

    // Format response
    const formattedEntry = {
      ...entry,
      client_name: entry.clients?.name || null,
      project_name: entry.projects?.name || null,
      clients: undefined,
      projects: undefined
    }

    return NextResponse.json({ data: formattedEntry })
  } catch (error) {
    console.error('Time entry route error:', error)
    if (isHttpError(error)) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/v1/time-entries/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const UpdateSchema = z.object({
      end_time: z.string().optional(),
      duration: z.number().nonnegative().optional(),
      marketing_category: z.string().optional(),
      marketing_channel: z.string().optional(),
      task_title: z.string().optional(),
      task_description: z.string().optional(),
      campaign_id: z.string().optional(),
      campaign_platform: z.string().optional(),
      billable: z.boolean().optional(),
      hourly_rate: z.number().nonnegative().optional(),
      status: z.enum(['running', 'stopped', 'paused', 'invoiced', 'paid']).optional(),
      is_timer_running: z.boolean().optional(),
      notes: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })

    const body = UpdateSchema.parse(await request.json())

    // Verify user owns this entry
    const { data: existingEntry } = await supabase
      .from('time_entries')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .single()

    if (!existingEntry) {
      throw new HttpError(404, 'Time entry not found or access denied')
    }

    // Calculate duration if end_time is provided and duration isn't
    if (body.end_time && !body.duration) {
      const { data: entry } = await supabase
        .from('time_entries')
        .select('start_time')
        .eq('id', params.id)
        .single()

      if (entry) {
        const start = new Date(entry.start_time)
        const end = new Date(body.end_time)
        body.duration = Math.round((end.getTime() - start.getTime()) / 60000) // minutes
      }
    }

    // Update the entry
    const { data: updatedEntry, error } = await supabase
      .from('time_entries')
      .update(body)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .select()
      .single()

    if (error) {
      throw new HttpError(500, error.message)
    }

    return NextResponse.json({
      data: updatedEntry,
      message: 'Time entry updated successfully'
    })
  } catch (error) {
    console.error('Time entry route error:', error)
    if (isHttpError(error)) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/time-entries/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify user owns this entry and it's not invoiced/paid
    const { data: entry } = await supabase
      .from('time_entries')
      .select('id, status')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .single()

    if (!entry) {
      throw new HttpError(404, 'Time entry not found or access denied')
    }

    if (entry.status === 'invoiced' || entry.status === 'paid') {
      throw new HttpError(400, 'Cannot delete invoiced or paid time entries')
    }

    // Delete the entry
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)
      .eq('team_id', teamId)

    if (error) {
      throw new HttpError(500, error.message)
    }

    return NextResponse.json({
      message: 'Time entry deleted successfully'
    })
  } catch (error) {
    console.error('Time entry route error:', error)
    if (isHttpError(error)) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
