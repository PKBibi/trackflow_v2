import { NextRequest, NextResponse } from 'next/server'
import { HttpError, isHttpError } from '@/lib/errors'
import { requireTeamRole } from '@/lib/auth/team'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await requireTeamRole(request, 'member')
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('projects')
      .select(`*, clients:client_id(name)`).eq('id', params.id)
      .eq('team_id', (ctx as any).teamId)
      .single()
    if (error?.code === 'PGRST116') throw new HttpError(404, 'Project not found')
    if (error) throw new HttpError(500, error.message)
    return NextResponse.json({ data })
  } catch (error) {
    if (isHttpError(error)) return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const ProjectUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['planning','active','paused','completed','cancelled']).optional(),
  priority: z.enum(['low','medium','high','urgent']).optional(),
  hourly_rate: z.number().nonnegative().optional(),
  billable: z.boolean().optional(),
  budget_amount: z.number().nonnegative().optional(),
  estimated_hours: z.number().nonnegative().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  notes: z.string().optional(),
})

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await requireTeamRole(request, 'member')
    const body = ProjectUpdateSchema.parse(await request.json())
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('projects')
      .update(body)
      .eq('id', params.id)
      .eq('team_id', (ctx as any).teamId)
      .select()
      .single()
    if (error?.code === 'PGRST116') throw new HttpError(404, 'Project not found')
    if (error) throw new HttpError(500, error.message)
    return NextResponse.json({ data, message: 'Project updated successfully' })
  } catch (error) {
    if (isHttpError(error)) return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await requireTeamRole(request, 'admin')
    const supabase = await createClient()

    // Ensure no time entries exist for this project
    const { count } = await supabase
      .from('time_entries')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', params.id)
      .eq('team_id', (ctx as any).teamId)
    if ((count || 0) > 0) {
      throw new HttpError(400, 'Cannot delete project with existing time entries')
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', params.id)
      .eq('team_id', (ctx as any).teamId)
    if (error) throw new HttpError(500, error.message)

    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    if (isHttpError(error)) return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

