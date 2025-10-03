import { NextRequest, NextResponse } from 'next/server'
import { HttpError, isHttpError } from '@/lib/errors'
import { requireTeamRole } from '@/lib/auth/team'
import { z } from 'zod'

// Mock database - replace with actual database queries
// This would be imported from a shared location in production
let timeEntries = [
  {
    id: '1',
    date: '2024-11-20',
    startTime: '09:00',
    endTime: '11:00',
    duration: 120,
    category: 'content-seo',
    activity: 'Blog Writing',
    description: 'Created blog post about digital marketing trends',
    clientId: '1',
    clientName: 'Acme Corp',
    projectId: '1',
    projectName: 'Content Marketing',
    billable: true,
    rate: 100,
    amount: 200,
    userId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET /api/v1/time-entries/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await requireTeamRole(request, 'member')
    const entry = timeEntries.find(e => e.id === params.id);
    
    if (!entry) {
      throw new HttpError(404, 'Time entry not found')
    }
    
    return NextResponse.json({ data: entry });
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
    const ctx = await requireTeamRole(request, 'member')
    const BodySchema = z.object({
      date: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      duration: z.number().nonnegative().optional(),
      category: z.string().optional(),
      activity: z.string().optional(),
      description: z.string().optional(),
      billable: z.boolean().optional(),
      rate: z.number().nonnegative().optional(),
    })
    const body = BodySchema.parse(await request.json());
    
    const entryIndex = timeEntries.findIndex(e => e.id === params.id);
    
    if (entryIndex === -1) {
      throw new HttpError(404, 'Time entry not found')
    }
    
    // Update entry
    const updatedEntry = {
      ...timeEntries[entryIndex],
      ...body,
      id: params.id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    // Recalculate amount if billable
    if (updatedEntry.billable && updatedEntry.rate) {
      updatedEntry.amount = (updatedEntry.duration / 60) * updatedEntry.rate;
    }
    
    timeEntries[entryIndex] = updatedEntry;
    
    // In production, update in database:
    // const { data, error } = await supabase
    //   .from('time_entries')
    //   .update(updatedEntry)
    //   .eq('id', params.id)
    //   .select()
    //   .single();
    
    return NextResponse.json({
      data: updatedEntry,
      message: 'Time entry updated successfully'
    });
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
    const ctx = await requireTeamRole(request, 'admin')
    const entryIndex = timeEntries.findIndex(e => e.id === params.id);
    
    if (entryIndex === -1) {
      throw new HttpError(404, 'Time entry not found')
    }
    
    // Remove entry
    timeEntries.splice(entryIndex, 1);
    
    // In production, delete from database:
    // const { error } = await supabase
    //   .from('time_entries')
    //   .delete()
    //   .eq('id', params.id);
    
    return NextResponse.json({
      message: 'Time entry deleted successfully'
    });
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


