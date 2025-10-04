import { NextRequest, NextResponse } from 'next/server'
import { HttpError, isHttpError } from '@/lib/errors'
import { requireTeamRole } from '@/lib/auth/team'
import { z } from 'zod'
import { log } from '@/lib/logger'

// Mock database - replace with actual database queries
// This would be imported from a shared location in production
const clients = [
  {
    id: '1',
    name: 'Acme Corp',
    email: 'contact@acmecorp.com',
    phone: '+1-555-0100',
    address: '123 Business St, New York, NY 10001',
    website: 'https://acmecorp.com',
    industry: 'Technology',
    hourlyRate: 150,
    currency: 'USD',
    totalBilled: 15000,
    totalPaid: 12000,
    outstandingBalance: 3000,
    status: 'active',
    notes: 'Preferred communication via email',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET /api/v1/clients/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await requireTeamRole(request, 'member')
    const client = clients.find(c => c.id === params.id);
    
    if (!client) {
      throw new HttpError(404, 'Client not found')
    }
    
    // In production, also fetch related data:
    // - Recent projects
    // - Recent invoices
    // - Time entries summary
    
    return NextResponse.json({ 
      data: client,
      related: {
        recentProjects: [],
        recentInvoices: [],
        timeEntriesSummary: {
          totalHours: 0,
          thisMonth: 0,
          lastMonth: 0
        }
      }
    });
  } catch (error) {
    log.apiError('GET /api/v1/clients/:id', error)
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

// PUT /api/v1/clients/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await requireTeamRole(request, 'member')
    const BodySchema = z.object({
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      website: z.string().url().optional(),
      industry: z.string().optional(),
      hourlyRate: z.number().nonnegative().optional(),
      currency: z.string().optional(),
      status: z.enum(['active','inactive']).optional(),
      notes: z.string().optional(),
    })
    const body = BodySchema.parse(await request.json());
    
    const clientIndex = clients.findIndex(c => c.id === params.id);
    
    if (clientIndex === -1) {
      throw new HttpError(404, 'Client not found')
    }
    
    // Check for email uniqueness if email is being updated
    if (body.email && body.email !== clients[clientIndex].email) {
      const emailExists = clients.some(c => 
        c.email === body.email && c.id !== params.id
      );
      
      if (emailExists) {
        throw new HttpError(409, 'A client with this email already exists')
      }
    }
    
    // Update client
    const updatedClient = {
      ...clients[clientIndex],
      ...body,
      id: params.id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    clients[clientIndex] = updatedClient;
    
    // In production, update in database:
    // const { data, error } = await supabase
    //   .from('clients')
    //   .update(updatedClient)
    //   .eq('id', params.id)
    //   .select()
    //   .single();
    
    return NextResponse.json({
      data: updatedClient,
      message: 'Client updated successfully'
    });
  } catch (error) {
    log.apiError('PUT /api/v1/clients/:id', error)
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

// DELETE /api/v1/clients/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await requireTeamRole(request, 'admin')
    const clientIndex = clients.findIndex(c => c.id === params.id);
    
    if (clientIndex === -1) {
      throw new HttpError(404, 'Client not found')
    }
    
    // Check for outstanding balance
    if (clients[clientIndex].outstandingBalance > 0) {
      throw new HttpError(400, `Cannot delete client with outstanding balance of ${clients[clientIndex].outstandingBalance}`)
    }
    
    // Remove client
    const deletedClient = clients[clientIndex];
    clients.splice(clientIndex, 1);
    
    // In production:
    // 1. Check for related records (projects, invoices, time entries)
    // 2. Either cascade delete or prevent deletion
    // 3. Delete from database:
    // const { error } = await supabase
    //   .from('clients')
    //   .delete()
    //   .eq('id', params.id);
    
    return NextResponse.json({
      message: 'Client deleted successfully',
      deletedClient: {
        id: deletedClient.id,
        name: deletedClient.name
      }
    });
  } catch (error) {
    log.apiError('DELETE /api/v1/clients/:id', error)
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


