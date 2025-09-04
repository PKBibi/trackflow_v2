import { NextRequest, NextResponse } from 'next/server';

// Mock database - replace with actual database queries
// This would be imported from a shared location in production
let clients = [
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
    const client = clients.find(c => c.id === params.id);
    
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
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
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/clients/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const clientIndex = clients.findIndex(c => c.id === params.id);
    
    if (clientIndex === -1) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    
    // Check for email uniqueness if email is being updated
    if (body.email && body.email !== clients[clientIndex].email) {
      const emailExists = clients.some(c => 
        c.email === body.email && c.id !== params.id
      );
      
      if (emailExists) {
        return NextResponse.json(
          { error: 'A client with this email already exists' },
          { status: 409 }
        );
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
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/clients/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientIndex = clients.findIndex(c => c.id === params.id);
    
    if (clientIndex === -1) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    
    // Check for outstanding balance
    if (clients[clientIndex].outstandingBalance > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete client with outstanding balance',
          outstandingBalance: clients[clientIndex].outstandingBalance
        },
        { status: 400 }
      );
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
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}


