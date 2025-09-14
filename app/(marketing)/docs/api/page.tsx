import type { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Code, Key, Clock, Users, FileText, AlertCircle, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'API Documentation | TrackFlow',
  description: 'Complete API documentation for TrackFlow time tracking platform with examples and authentication guide.',
}

export default function APIDocumentationPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Code className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">API Documentation</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Build powerful integrations with the TrackFlow API. REST and GraphQL endpoints for time tracking, client management, and reporting.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="secondary">Version 1.0</Badge>
            <Badge variant="outline">REST API</Badge>
            <Badge variant="outline">GraphQL</Badge>
          </div>
        </div>

        <Tabs defaultValue="getting-started" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="time-entries">Time Entries</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="graphql">GraphQL</TabsTrigger>
          </TabsList>

          {/* Getting Started */}
          <TabsContent value="getting-started" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Quick Start
                </CardTitle>
                <CardDescription>
                  Get up and running with the TrackFlow API in minutes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Base URL</h4>
                  <code className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded text-sm">
                    https://track-flow.app/api/v1
                  </code>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Content Type</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    All requests should include <code>Content-Type: application/json</code>
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Rate Limiting</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    100 requests per minute per authenticated user
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Example Request</h4>
                  <pre className="bg-gray-900 text-white p-4 rounded-lg text-sm overflow-x-auto">
{`curl -X GET "https://track-flow.app/api/v1/time-entries" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  Error Responses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    All errors return JSON with an error message:
                  </p>
                  <pre className="bg-gray-900 text-white p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "error": "Not authenticated",
  "code": 401,
  "details": "Valid API key required"
}`}
                  </pre>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>400</strong> - Bad Request
                    </div>
                    <div>
                      <strong>401</strong> - Unauthorized
                    </div>
                    <div>
                      <strong>403</strong> - Forbidden
                    </div>
                    <div>
                      <strong>404</strong> - Not Found
                    </div>
                    <div>
                      <strong>429</strong> - Rate Limit Exceeded
                    </div>
                    <div>
                      <strong>500</strong> - Internal Server Error
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Authentication */}
          <TabsContent value="authentication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-blue-600" />
                  API Key Authentication
                </CardTitle>
                <CardDescription>
                  Generate and use API keys to access TrackFlow endpoints
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1. Generate API Key</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Go to Settings → API Keys in your TrackFlow dashboard
                  </p>
                  <a 
                    href="/settings/api-keys" 
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    Generate API Key
                  </a>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">2. Include in Requests</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Add the API key to the Authorization header:
                  </p>
                  <pre className="bg-gray-900 text-white p-4 rounded-lg text-sm overflow-x-auto">
{`Authorization: Bearer YOUR_API_KEY`}
                  </pre>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    You can also use <code>X-API-Key: YOUR_API_KEY</code>. Both REST v1 and GraphQL accept API keys.
                  </p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <h5 className="font-medium mb-2">Enhanced Export (branding)</h5>
                      <pre className="bg-gray-900 text-white p-4 rounded-lg text-sm overflow-x-auto">{`curl -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "format": "csv",
  "dataType": "time_entries",
  "dateRange": { "start": "2025-01-01", "end": "2025-01-07" },
  "branding": {
    "companyName": "Acme Agency",
    "logoUrl": "https://example.com/logo.png",
    "contactEmail": "ops@acme.co"
  }
}' \
  https://track-flow.app/api/export/enhanced`}</pre>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Weekly AI PDF (branding + period)</h5>
                      <pre className="bg-gray-900 text-white p-4 rounded-lg text-sm overflow-x-auto">{`curl -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "branding": {
    "companyName": "Acme Agency",
    "logoUrl": "https://example.com/logo.png",
    "contactEmail": "ops@acme.co"
  },
  "period": "Aug 1–7, 2025",
  "options": { "includeCover": true, "repeatHeader": true, "locale": "en-US", "currency": "USD" },
  "report": { /* weekly AI report JSON */ }
}' \
  https://track-flow.app/api/ai/reports/weekly/pdf`}</pre>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Scheduled Exports (branding)</h5>
                      <pre className="bg-gray-900 text-white p-4 rounded-lg text-sm overflow-x-auto">{`curl -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Weekly Time Export",
  "format": "csv",
  "dataType": "time_entries",
  "filters": { "dateRange": { "start": "2025-01-01", "end": "2025-01-07" } },
  "branding": { "companyName": "Acme Agency", "logoUrl": "https://example.com/logo.png", "contactEmail": "ops@acme.co" },
  "frequency": "weekly",
  "dayOfWeek": 1,
  "timeOfDay": "09:00",
  "emailTo": "me@acme.co"
}' \
  https://track-flow.app/api/scheduled-exports`}</pre>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Branding is merged into the schedule filters and applied to generated files.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">3. Permissions</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <p>• <strong>Read:</strong> GET requests to view data</p>
                    <p>• <strong>Write:</strong> POST/PUT requests to create/update</p>
                    <p>• <strong>Delete:</strong> DELETE requests to remove data</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Time Entries */}
          <TabsContent value="time-entries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  Time Entries API
                </CardTitle>
                <CardDescription>
                  Manage time entries with full CRUD operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* GET Time Entries */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">GET</Badge>
                    <code className="text-sm">/api/v1/time-entries</code>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Retrieve time entries with optional filtering
                  </p>
                  
                  <h5 className="font-medium mb-2">Query Parameters:</h5>
                  <div className="text-sm space-y-1 mb-3">
                    <p>• <code>client_id</code> - Filter by client</p>
                    <p>• <code>project_id</code> - Filter by project</p>
                    <p>• <code>billable</code> - true/false</p>
                    <p>• <code>startDate</code> - YYYY-MM-DD</p>
                    <p>• <code>endDate</code> - YYYY-MM-DD</p>
                    <p>• <code>page</code> - Page number (default: 1)</p>
                    <p>• <code>limit</code> - Items per page (default: 50)</p>
                  </div>
                  
                  <h5 className="font-medium mb-2">Example:</h5>
                  <pre className="bg-gray-900 text-white p-4 rounded-lg text-sm overflow-x-auto">
{`curl -X GET "https://track-flow.app/api/v1/time-entries?billable=true&limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                  </pre>
                </div>

                <Separator />

                {/* POST Time Entry */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">POST</Badge>
                    <code className="text-sm">/api/v1/time-entries</code>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Create a new time entry
                  </p>
                  
                  <h5 className="font-medium mb-2">Request Body:</h5>
                  <pre className="bg-gray-900 text-white p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "client_id": "uuid",
  "project_id": "uuid", 
  "start_time": "2024-01-15T09:00:00Z",
  "end_time": "2024-01-15T11:00:00Z",
  "marketing_category": "Content",
  "marketing_channel": "Blog",
  "task_title": "Write blog post",
  "task_description": "Created post about time tracking",
  "billable": true,
  "hourly_rate": 15000
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients */}
          <TabsContent value="clients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Clients API
                </CardTitle>
                <CardDescription>
                  Manage your clients and their information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* GET Clients */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">GET</Badge>
                    <code className="text-sm">/api/v1/clients</code>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Retrieve all clients
                  </p>
                  
                  <h5 className="font-medium mb-2">Example Response:</h5>
                  <pre className="bg-gray-900 text-white p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "clients": [
    {
      "id": "uuid",
      "name": "Acme Corp",
      "email": "contact@acme.com",
      "hourly_rate": 15000,
      "retainer_hours": 40,
      "status": "active"
    }
  ],
  "total": 1
}`}
                  </pre>
                </div>

                <Separator />

                {/* POST Client */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">POST</Badge>
                    <code className="text-sm">/api/v1/clients</code>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Create a new client
                  </p>
                  
                  <h5 className="font-medium mb-2">Request Body:</h5>
                  <pre className="bg-gray-900 text-white p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "name": "New Client",
  "email": "client@example.com",
  "phone": "555-0100",
  "company": "Client Company",
  "hourly_rate": 15000,
  "retainer_hours": 40,
  "currency": "USD"
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  Team API
                </CardTitle>
                <CardDescription>
                  Manage team members and invitations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* GET Team Members */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">GET</Badge>
                    <code className="text-sm">/api/team/members</code>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Get all team members
                  </p>
                  
                  <h5 className="font-medium mb-2">Example Response:</h5>
                  <pre className="bg-gray-900 text-white p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "members": [
    {
      "id": "uuid",
      "email": "member@company.com",
      "name": "John Doe",
      "role": "admin",
      "status": "active",
      "joinedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "team_id": "uuid"
}`}
                  </pre>
                </div>

                <Separator />

                {/* POST Team Invite */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">POST</Badge>
                    <code className="text-sm">/api/team/invite</code>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Invite a new team member
                  </p>
                  
                  <h5 className="font-medium mb-2">Request Body:</h5>
                  <pre className="bg-gray-900 text-white p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "email": "newmember@company.com",
  "role": "member"
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GraphQL */}
          <TabsContent value="graphql" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-pink-600" />
                  GraphQL API
                </CardTitle>
                <CardDescription>
                  Flexible queries with GraphQL
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Endpoint</h4>
                  <code className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded text-sm">
                    POST /api/graphql
                  </code>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Example Query</h4>
                  <pre className="bg-gray-900 text-white p-4 rounded-lg text-sm overflow-x-auto">
{`query GetTimeEntries($limit: Int!) {
  timeEntries(limit: $limit) {
    id
    taskTitle
    duration
    billable
    client {
      name
    }
    project {
      name
    }
  }
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Variables</h4>
                  <pre className="bg-gray-900 text-white p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "limit": 10
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
