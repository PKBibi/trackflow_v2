import { NextRequest, NextResponse } from 'next/server';

// Mock database - replace with actual database queries
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
  },
  {
    id: '2',
    name: 'Tech Startup Inc',
    email: 'hello@techstartup.com',
    phone: '+1-555-0200',
    address: '456 Innovation Ave, San Francisco, CA 94102',
    website: 'https://techstartup.com',
    industry: 'SaaS',
    hourlyRate: 120,
    currency: 'USD',
    totalBilled: 8500,
    totalPaid: 8500,
    outstandingBalance: 0,
    status: 'active',
    notes: 'Monthly retainer client',
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Global Enterprises',
    email: 'info@globalent.com',
    phone: '+1-555-0300',
    address: '789 Corporate Blvd, Chicago, IL 60601',
    website: 'https://globalenterprises.com',
    industry: 'Finance',
    hourlyRate: 200,
    currency: 'USD',
    totalBilled: 25000,
    totalPaid: 20000,
    outstandingBalance: 5000,
    status: 'active',
    notes: 'Enterprise client - NET 30 terms',
    createdAt: new Date('2024-03-01').toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET /api/v1/clients
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const industry = searchParams.get('industry');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let filteredClients = [...clients];
    
    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      filteredClients = filteredClients.filter(client =>
        client.name.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        client.industry?.toLowerCase().includes(searchLower)
      );
    }
    if (status) {
      filteredClients = filteredClients.filter(client => client.status === status);
    }
    if (industry) {
      filteredClients = filteredClients.filter(client => client.industry === industry);
    }
    
    // Sorting
    filteredClients.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'totalBilled':
          comparison = a.totalBilled - b.totalBilled;
          break;
        case 'outstandingBalance':
          comparison = a.outstandingBalance - b.outstandingBalance;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedClients = filteredClients.slice(startIndex, endIndex);
    
    // Calculate statistics
    const stats = {
      totalClients: filteredClients.length,
      activeClients: filteredClients.filter(c => c.status === 'active').length,
      totalRevenue: filteredClients.reduce((sum, c) => sum + c.totalBilled, 0),
      totalOutstanding: filteredClients.reduce((sum, c) => sum + c.outstandingBalance, 0),
      averageRate: filteredClients.reduce((sum, c) => sum + c.hourlyRate, 0) / filteredClients.length
    };
    
    return NextResponse.json({
      data: paginatedClients,
      meta: {
        total: filteredClients.length,
        page,
        limit,
        totalPages: Math.ceil(filteredClients.length / limit)
      },
      stats
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST /api/v1/clients
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'email'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Check for duplicate email
    const existingClient = clients.find(c => c.email === body.email);
    if (existingClient) {
      return NextResponse.json(
        { error: 'A client with this email already exists' },
        { status: 409 }
      );
    }
    
    // Create new client
    const newClient = {
      id: Date.now().toString(),
      ...body,
      totalBilled: 0,
      totalPaid: 0,
      outstandingBalance: 0,
      status: body.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to mock database
    clients.push(newClient);
    
    // In production, save to database:
    // const { data, error } = await supabase
    //   .from('clients')
    //   .insert([newClient])
    //   .select()
    //   .single();
    
    return NextResponse.json({
      data: newClient,
      message: 'Client created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/clients (bulk update)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, updates } = body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid ids array' },
        { status: 400 }
      );
    }
    
    // Update multiple clients
    const updatedClients = clients.map(client => {
      if (ids.includes(client.id)) {
        return {
          ...client,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return client;
    });
    
    clients = updatedClients;
    
    return NextResponse.json({
      message: `Updated ${ids.length} clients`,
      updatedIds: ids
    });
  } catch (error) {
    console.error('Error updating clients:', error);
    return NextResponse.json(
      { error: 'Failed to update clients' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/clients (bulk delete)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid ids array' },
        { status: 400 }
      );
    }
    
    // Check for clients with outstanding balances
    const clientsWithBalance = clients.filter(c => 
      ids.includes(c.id) && c.outstandingBalance > 0
    );
    
    if (clientsWithBalance.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete clients with outstanding balances',
          clientsWithBalance: clientsWithBalance.map(c => ({
            id: c.id,
            name: c.name,
            balance: c.outstandingBalance
          }))
        },
        { status: 400 }
      );
    }
    
    // Remove clients
    clients = clients.filter(client => !ids.includes(client.id));
    
    return NextResponse.json({
      message: `Deleted ${ids.length} clients`,
      deletedIds: ids
    });
  } catch (error) {
    console.error('Error deleting clients:', error);
    return NextResponse.json(
      { error: 'Failed to delete clients' },
      { status: 500 }
    );
  }
}


