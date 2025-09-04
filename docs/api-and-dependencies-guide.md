# API Structure & Dependencies Guide

## Overview

This guide covers the essential dependencies installed and API structure implemented for TrackFlow, including REST endpoints, webhook support, keyboard shortcuts, and CSV import functionality.

## Installed Dependencies

### Core Dependencies
```json
{
  "react-hotkeys-hook": "^4.x",  // Keyboard shortcuts
  "@dnd-kit/sortable": "^8.x",   // Drag and drop functionality
  "react-pdf": "^7.x",           // PDF generation and viewing
  "xlsx": "^0.x",                // Excel file parsing
  "swr": "^2.x"                  // Data fetching and caching
}
```

## API Structure

### Base URL
All API endpoints follow the pattern: `/api/v1/{resource}`

### Time Entries API

#### Endpoints

##### GET `/api/v1/time-entries`
Fetch time entries with filtering and pagination.

**Query Parameters:**
- `userId` - Filter by user ID
- `clientId` - Filter by client ID
- `projectId` - Filter by project ID
- `startDate` - Start date filter (YYYY-MM-DD)
- `endDate` - End date filter (YYYY-MM-DD)
- `billable` - Filter billable entries (true/false)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

**Response:**
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  }
}
```

##### POST `/api/v1/time-entries`
Create a new time entry.

**Request Body:**
```json
{
  "date": "2024-11-20",
  "startTime": "09:00",
  "endTime": "11:00",
  "duration": 120,
  "category": "content-seo",
  "activity": "Blog Writing",
  "description": "Created blog post",
  "clientId": "1",
  "projectId": "1",
  "billable": true,
  "rate": 100
}
```

##### PUT `/api/v1/time-entries/[id]`
Update a specific time entry.

##### DELETE `/api/v1/time-entries/[id]`
Delete a specific time entry.

##### Bulk Operations

**PUT `/api/v1/time-entries`**
```json
{
  "ids": ["1", "2", "3"],
  "updates": {
    "billable": false
  }
}
```

**DELETE `/api/v1/time-entries`**
```json
{
  "ids": ["1", "2", "3"]
}
```

### Clients API

#### Endpoints

##### GET `/api/v1/clients`
Fetch clients with search, filtering, and sorting.

**Query Parameters:**
- `search` - Search by name, email, or industry
- `status` - Filter by status (active/inactive)
- `industry` - Filter by industry
- `sortBy` - Sort field (name, totalBilled, outstandingBalance, createdAt)
- `sortOrder` - Sort order (asc/desc)
- `page` - Page number
- `limit` - Items per page

**Response includes statistics:**
```json
{
  "data": [...],
  "meta": {...},
  "stats": {
    "totalClients": 10,
    "activeClients": 8,
    "totalRevenue": 50000,
    "totalOutstanding": 5000,
    "averageRate": 120
  }
}
```

##### POST `/api/v1/clients`
Create a new client.

**Request Body:**
```json
{
  "name": "Acme Corp",
  "email": "contact@acmecorp.com",
  "phone": "+1-555-0100",
  "address": "123 Business St",
  "website": "https://acmecorp.com",
  "industry": "Technology",
  "hourlyRate": 150,
  "notes": "Preferred communication via email"
}
```

##### PUT `/api/v1/clients/[id]`
Update a specific client.

##### DELETE `/api/v1/clients/[id]`
Delete a specific client (prevented if outstanding balance exists).

### Webhooks API

#### Endpoints

##### POST `/api/webhooks`
Receive webhook events (for testing incoming webhooks).

**Headers:**
- `X-Webhook-Signature` - HMAC SHA256 signature
- `X-Webhook-Secret` - Webhook secret key
- `X-Webhook-Event` - Event type
- `X-Webhook-Timestamp` - Event timestamp

**Supported Events:**
- `time_entry.created`
- `time_entry.updated`
- `time_entry.deleted`
- `client.created`
- `client.updated`
- `client.deleted`
- `project.created`
- `project.updated`
- `project.deleted`
- `invoice.created`
- `invoice.paid`
- `user.updated`

##### GET `/api/webhooks`
List webhook subscriptions.

##### PUT `/api/webhooks`
Register a new webhook subscription.

**Request Body:**
```json
{
  "url": "https://hooks.zapier.com/hooks/catch/123456/abcdef/",
  "events": ["time_entry.created", "client.created"]
}
```

##### DELETE `/api/webhooks`
Remove a webhook subscription.

## Keyboard Shortcuts

### Implementation
Located at `/components/keyboard-shortcuts.tsx`

### Global Shortcuts

#### Timer Controls
- `Space` - Start/Stop timer
- `N` - New time entry
- `T` - Today view

#### Navigation (G + key)
- `G H` - Go to Dashboard
- `G T` - Go to Timer
- `G C` - Go to Clients
- `G P` - Go to Projects
- `G R` - Go to Reports
- `G S` - Go to Settings

#### Actions
- `/` - Focus search
- `Cmd/Ctrl + K` - Command palette
- `Cmd/Ctrl + N` - Create new (context aware)

#### General
- `?` - Show keyboard shortcuts help
- `Esc` - Close dialogs/Cancel

### Features
- **Command Palette**: Quick navigation and actions
- **Context Awareness**: Create actions adapt to current page
- **Help Dialog**: Visual reference for all shortcuts
- **Input Safety**: Shortcuts disabled when typing

### Usage
```tsx
import { KeyboardShortcutsProvider } from '@/components/keyboard-shortcuts';

// Wrap your app
<KeyboardShortcutsProvider>
  {children}
</KeyboardShortcutsProvider>
```

## CSV Import

### Implementation
Located at `/app/(dashboard)/import/page.tsx`

### Features

#### Multi-Step Import Process
1. **Upload**: Select CSV/Excel file
2. **Map Columns**: Match file columns to system fields
3. **Preview**: Validate and review data
4. **Import**: Process and save to database

#### Supported Import Types
- **Time Entries**
  - Date, Start/End Time, Duration
  - Activity, Category, Description
  - Client, Project
  - Billable status and Rate

- **Clients**
  - Name, Email, Phone
  - Company, Address
  - Default hourly rate

#### Key Features
- **Auto-mapping**: Intelligent column matching
- **Validation**: Type checking and required field validation
- **Batch Processing**: Handles large files efficiently
- **Error Reporting**: Clear validation messages
- **Sample Downloads**: Template CSV files

#### File Support
- CSV (.csv)
- Excel (.xlsx, .xls)
- Maximum 1000 rows per import

#### Data Validation
- Date format: YYYY-MM-DD
- Time format: HH:MM (24-hour)
- Duration: Minutes (number)
- Boolean: yes/no, true/false, 1/0

### Usage Example
```typescript
// Parse Excel file
const workbook = XLSX.read(data, { type: 'binary' });
const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[0]);

// Process and validate
const processed = jsonData.map(row => ({
  date: new Date(row.Date).toISOString().split('T')[0],
  duration: parseInt(row.Duration),
  activity: row.Activity,
  billable: row.Billable === 'Yes'
}));

// Import via API
await fetch('/api/v1/time-entries', {
  method: 'POST',
  body: JSON.stringify(processed)
});
```

## Integration Examples

### Using SWR for Data Fetching
```typescript
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

function TimeEntries() {
  const { data, error, isLoading } = useSWR(
    '/api/v1/time-entries?page=1&limit=50',
    fetcher
  );
  
  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;
  
  return <div>{data.data.length} entries</div>;
}
```

### Webhook Integration (Zapier)
```javascript
// Zapier Zap Configuration
{
  trigger: {
    url: 'https://yourapp.com/api/webhooks',
    method: 'PUT',
    body: {
      url: '{{bundle.targetUrl}}',
      events: ['time_entry.created', 'invoice.paid']
    }
  },
  
  // Webhook will receive
  payload: {
    event: 'time_entry.created',
    data: {
      id: '123',
      duration: 120,
      activity: 'Blog Writing',
      // ... more fields
    },
    timestamp: '2024-11-20T10:00:00Z'
  }
}
```

### Drag and Drop with @dnd-kit
```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

function TaskList({ tasks }) {
  return (
    <DndContext collisionDetection={closestCenter}>
      <SortableContext 
        items={tasks} 
        strategy={verticalListSortingStrategy}
      >
        {tasks.map(task => (
          <SortableTask key={task.id} task={task} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

## Security Considerations

### API Security
- Validate all input data
- Implement rate limiting
- Use HMAC signatures for webhooks
- Sanitize data before storage
- Check authorization on all endpoints

### Webhook Security
- Verify signatures on incoming webhooks
- Use secure random secrets
- Implement retry logic with exponential backoff
- Monitor failed webhook deliveries

### CSV Import Security
- File size limits (10MB max)
- File type validation
- Content sanitization
- Batch processing to prevent timeouts
- User permission checks

## Testing

### API Testing
```bash
# Test time entry creation
curl -X POST http://localhost:3000/api/v1/time-entries \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-11-20",
    "duration": 120,
    "activity": "Testing",
    "category": "development"
  }'

# Test webhook
curl -X POST http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Event: time_entry.created" \
  -d '{
    "event": "time_entry.created",
    "data": {...}
  }'
```

### Keyboard Shortcuts Testing
1. Press `?` to open help dialog
2. Test each shortcut combination
3. Verify context awareness
4. Check input field behavior

### CSV Import Testing
1. Download sample CSV
2. Modify with test data
3. Upload and map columns
4. Verify preview accuracy
5. Check import success

## Future Enhancements

1. **API Enhancements**
   - GraphQL support
   - Real-time subscriptions
   - Batch operations optimization
   - API versioning strategy

2. **Webhook Improvements**
   - Event filtering rules
   - Webhook retry queue
   - Dead letter queue
   - Webhook testing tools

3. **Import/Export**
   - JSON import support
   - Scheduled exports
   - Direct Google Sheets integration
   - Dropbox/OneDrive sync

4. **Keyboard Shortcuts**
   - Customizable shortcuts
   - Shortcut profiles
   - Vim-style navigation
   - Touch bar support (Mac)

5. **Performance**
   - API response caching
   - Optimistic UI updates
   - Background job processing
   - CDN integration

