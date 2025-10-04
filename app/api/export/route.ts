import { log } from '@/lib/logger';
import { requirePlan } from '@/lib/auth/plan'
import { NextRequest, NextResponse } from 'next/server';
import { format } from 'date-fns';

export async function POST(request: NextRequest) {
  const gate = await requirePlan('pro')
  if (!gate.ok) return gate.response

  try {
    const body = await request.json();
    const { 
      format: exportFormat, 
      dataType, 
      dateRange, 
      filters, 
      viewType,
      groupBy 
    } = body;

    // Mock data for demonstration - replace with actual database queries
    const mockTimeEntries = [
      {
        id: '1',
        date: '2024-11-20',
        startTime: '09:00',
        endTime: '11:00',
        duration: 120,
        client: 'Acme Corp',
        project: 'Website Redesign',
        activity: 'Frontend Development',
        description: 'Implemented responsive navigation',
        billable: true,
        rate: 150,
        amount: 300
      },
      {
        id: '2',
        date: '2024-11-20',
        startTime: '11:00',
        endTime: '12:30',
        duration: 90,
        client: 'Tech Startup Inc',
        project: 'Marketing Campaign',
        activity: 'PPC Optimization',
        description: 'Optimized Google Ads campaigns',
        billable: true,
        rate: 120,
        amount: 180
      },
      {
        id: '3',
        date: '2024-11-19',
        startTime: '14:00',
        endTime: '16:00',
        duration: 120,
        client: 'Global Enterprises',
        project: 'SEO Optimization',
        activity: 'Content Writing',
        description: 'Created blog posts for SEO',
        billable: true,
        rate: 100,
        amount: 200
      }
    ];

    const mockClients = [
      {
        id: '1',
        name: 'Acme Corp',
        email: 'contact@acmecorp.com',
        phone: '+1-555-0100',
        address: '123 Business St, New York, NY 10001',
        totalBilled: 15000,
        totalPaid: 12000,
        outstanding: 3000
      },
      {
        id: '2',
        name: 'Tech Startup Inc',
        email: 'hello@techstartup.com',
        phone: '+1-555-0200',
        address: '456 Innovation Ave, San Francisco, CA 94102',
        totalBilled: 8500,
        totalPaid: 8500,
        outstanding: 0
      }
    ];

    const mockProjects = [
      {
        id: '1',
        name: 'Website Redesign',
        client: 'Acme Corp',
        status: 'active',
        startDate: '2024-01-15',
        budget: 25000,
        spent: 12500,
        hoursLogged: 150
      },
      {
        id: '2',
        name: 'Marketing Campaign',
        client: 'Tech Startup Inc',
        status: 'active',
        startDate: '2024-02-01',
        budget: 15000,
        spent: 8500,
        hoursLogged: 85
      }
    ];

    // Select data based on dataType
    let data: any[] = [];
    switch (dataType) {
      case 'time_entries':
        data = mockTimeEntries;
        break;
      case 'clients':
        data = mockClients;
        break;
      case 'projects':
        data = mockProjects;
        break;
      case 'all':
        data = [
          { type: 'time_entries', data: mockTimeEntries },
          { type: 'clients', data: mockClients },
          { type: 'projects', data: mockProjects }
        ];
        break;
      default:
        data = mockTimeEntries;
    }

    // Apply filters (simplified for demonstration)
    if (dataType === 'time_entries' && filters) {
      if (filters.clientId) {
        data = data.filter((entry: any) => entry.clientId === filters.clientId);
      }
      if (filters.billableOnly) {
        data = data.filter((entry: any) => entry.billable);
      }
    }

    // Format data based on export format
    switch (exportFormat) {
      case 'csv':
        return exportAsCSV(data, dataType, viewType);
      case 'json':
        return exportAsJSON(data);
      case 'excel':
        return exportAsExcel(data, dataType, viewType);
      case 'pdf':
        return exportAsPDF(data, dataType, viewType);
      default:
        return exportAsCSV(data, dataType, viewType);
    }
  } catch (error) {
    log.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

function exportAsCSV(data: any[], dataType: string, viewType: string) {
  let csv = '';
  
  if (dataType === 'time_entries') {
    if (viewType === 'detailed') {
      // Headers
      csv = 'Date,Start Time,End Time,Duration (min),Client,Project,Activity,Description,Billable,Rate,Amount\n';
      
      // Rows
      data.forEach(entry => {
        csv += `"${entry.date}","${entry.startTime}","${entry.endTime}",${entry.duration},"${entry.client}","${entry.project}","${entry.activity}","${entry.description || ''}",${entry.billable ? 'Yes' : 'No'},${entry.rate || 0},${entry.amount || 0}\n`;
      });
    } else {
      // Summary view - group by project
      const summary: Record<string, any> = {};
      data.forEach(entry => {
        const key = entry.project;
        if (!summary[key]) {
          summary[key] = {
            project: entry.project,
            client: entry.client,
            totalHours: 0,
            totalAmount: 0
          };
        }
        summary[key].totalHours += entry.duration / 60;
        summary[key].totalAmount += entry.amount || 0;
      });
      
      csv = 'Project,Client,Total Hours,Total Amount\n';
      Object.values(summary).forEach(row => {
        csv += `"${row.project}","${row.client}",${row.totalHours.toFixed(2)},${row.totalAmount.toFixed(2)}\n`;
      });
    }
  } else if (dataType === 'clients') {
    csv = 'Name,Email,Phone,Address,Total Billed,Total Paid,Outstanding\n';
    data.forEach(client => {
      csv += `"${client.name}","${client.email}","${client.phone}","${client.address}",${client.totalBilled},${client.totalPaid},${client.outstanding}\n`;
    });
  } else if (dataType === 'projects') {
    csv = 'Name,Client,Status,Start Date,Budget,Spent,Hours Logged\n';
    data.forEach(project => {
      csv += `"${project.name}","${project.client}","${project.status}","${project.startDate}",${project.budget},${project.spent},${project.hoursLogged}\n`;
    });
  }
  
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${dataType}_${format(new Date(), 'yyyy-MM-dd')}.csv"`
    }
  });
}

function exportAsJSON(data: any[]) {
  return NextResponse.json(data, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="export_${format(new Date(), 'yyyy-MM-dd')}.json"`
    }
  });
}

function exportAsExcel(data: any[], dataType: string, viewType: string) {
  // In a real implementation, you would use a library like ExcelJS to generate the Excel file
  // For now, we'll return a mock response
  return NextResponse.json(
    { 
      message: 'Excel export would be generated here',
      dataType,
      viewType,
      recordCount: data.length
    },
    { status: 200 }
  );
}

function exportAsPDF(data: any[], dataType: string, viewType: string) {
  // In a real implementation, you would use a library like pdfkit or puppeteer to generate the PDF
  // For now, we'll return a mock response
  return NextResponse.json(
    { 
      message: 'PDF export would be generated here',
      dataType,
      viewType,
      recordCount: data.length
    },
    { status: 200 }
  );
}

export async function GET() {
  const gate = await requirePlan('pro')
  if (!gate.ok) return gate.response

  // Get export history
  const mockHistory = [
    {
      id: '1',
      fileName: 'time_entries_2024_11_20.csv',
      format: 'CSV',
      dataType: 'Time Entries',
      size: '245 KB',
      createdAt: new Date(Date.now() - 86400000),
      status: 'completed',
      downloadUrl: '/api/export/download/1'
    },
    {
      id: '2',
      fileName: 'monthly_report_oct_2024.pdf',
      format: 'PDF',
      dataType: 'Summary Report',
      size: '1.2 MB',
      createdAt: new Date(Date.now() - 172800000),
      status: 'completed',
      downloadUrl: '/api/export/download/2'
    }
  ];
  
  return NextResponse.json(mockHistory);
}


