import { NextRequest, NextResponse } from 'next/server';
import { HttpError, isHttpError } from '@/lib/errors';

// Mock database - replace with actual database queries
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
  },
  {
    id: '2',
    date: '2024-11-20',
    startTime: '14:00',
    endTime: '15:30',
    duration: 90,
    category: 'advertising-paid-media',
    activity: 'Google Ads Management',
    description: 'Optimized PPC campaigns',
    clientId: '2',
    clientName: 'Tech Startup Inc',
    projectId: '2',
    projectName: 'Digital Advertising',
    billable: true,
    rate: 120,
    amount: 180,
    userId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET /api/v1/time-entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const userId = searchParams.get('userId');
    const clientId = searchParams.get('clientId');
    const projectId = searchParams.get('projectId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const billable = searchParams.get('billable');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let filteredEntries = [...timeEntries];
    
    // Apply filters
    if (userId) {
      filteredEntries = filteredEntries.filter(entry => entry.userId === userId);
    }
    if (clientId) {
      filteredEntries = filteredEntries.filter(entry => entry.clientId === clientId);
    }
    if (projectId) {
      filteredEntries = filteredEntries.filter(entry => entry.projectId === projectId);
    }
    if (billable !== null) {
      filteredEntries = filteredEntries.filter(entry => entry.billable === (billable === 'true'));
    }
    if (startDate) {
      filteredEntries = filteredEntries.filter(entry => entry.date >= startDate);
    }
    if (endDate) {
      filteredEntries = filteredEntries.filter(entry => entry.date <= endDate);
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEntries = filteredEntries.slice(startIndex, endIndex);
    
    return NextResponse.json({
      data: paginatedEntries,
      meta: {
        total: filteredEntries.length,
        page,
        limit,
        totalPages: Math.ceil(filteredEntries.length / limit)
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
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['date', 'duration', 'activity', 'category'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Create new time entry
    const newEntry = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Calculate amount if billable
    if (newEntry.billable && newEntry.rate) {
      newEntry.amount = (newEntry.duration / 60) * newEntry.rate;
    }
    
    // Add to mock database
    timeEntries.push(newEntry);
    
    // In production, save to database:
    // const { data, error } = await supabase
    //   .from('time_entries')
    //   .insert([newEntry])
    //   .select()
    //   .single();
    
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
    const body = await request.json();
    const { ids, updates } = body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid ids array' },
        { status: 400 }
      );
    }
    
    // Update multiple entries
    const updatedEntries = timeEntries.map(entry => {
      if (ids.includes(entry.id)) {
        return {
          ...entry,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return entry;
    });
    
    timeEntries = updatedEntries;
    
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
    const body = await request.json();
    const { ids } = body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid ids array' },
        { status: 400 }
      );
    }
    
    // Remove entries
    timeEntries = timeEntries.filter(entry => !ids.includes(entry.id));
    
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
