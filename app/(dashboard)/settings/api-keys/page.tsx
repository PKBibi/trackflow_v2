'use client'

import { useState, useEffect } from 'react'
import { Plus, Key, Copy, Eye, EyeOff, Trash2, RotateCw, Shield, Calendar, Activity, Code, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'

interface APIKey {
  id: string
  name: string
  key: string
  prefix: string
  created_at: string
  last_used: string | null
  expires_at: string | null
  status: 'active' | 'inactive' | 'expired'
  permissions: string[]
  rate_limit: number
  usage_count: number
}

interface APIUsage {
  date: string
  requests: number
  errors: number
  latency: number
}

export default function APIKeysPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [usage, setUsage] = useState<APIUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyExpiry, setNewKeyExpiry] = useState('30')
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(['read'])
  const [newKeyRateLimit, setNewKeyRateLimit] = useState('1000')
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({})
  const supabase = createClient()

  const permissions = [
    { value: 'read', label: 'Read', description: 'Read access to all resources' },
    { value: 'write', label: 'Write', description: 'Create and update resources' },
    { value: 'delete', label: 'Delete', description: 'Delete resources' },
    { value: 'admin', label: 'Admin', description: 'Full administrative access' }
  ]

  useEffect(() => {
    loadAPIKeys()
    loadUsageStats()
  }, [])

  const loadAPIKeys = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setApiKeys(data || [])
    } catch (error) {
      console.error('Error loading API keys:', error)
      toast({
        title: 'Error',
        description: 'Failed to load API keys',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadUsageStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load last 30 days of usage
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)

      const { data, error } = await supabase
        .from('api_usage')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString())
        .order('date', { ascending: true })

      if (error) throw error

      setUsage(data || [])
    } catch (error) {
      console.error('Error loading usage stats:', error)
    }
  }

  const createAPIKey = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to continue',
          variant: 'destructive'
        })
        return
      }

      // Generate a secure API key
      const key = generateAPIKey()
      const prefix = key.substring(0, 7)
      
      let expiresAt = null
      if (newKeyExpiry !== 'never') {
        const expiry = new Date()
        expiry.setDate(expiry.getDate() + parseInt(newKeyExpiry))
        expiresAt = expiry.toISOString()
      }

      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          name: newKeyName,
          key: await hashAPIKey(key), // Hash the key before storing
          prefix,
          expires_at: expiresAt,
          permissions: newKeyPermissions,
          rate_limit: parseInt(newKeyRateLimit),
          status: 'active'
        })
        .select()
        .single()

      if (error) throw error

      setApiKeys([{ ...data, key: prefix + '•••••••' }, ...apiKeys])
      setCreatedKey(key)
      setNewKeyName('')
      
      toast({
        title: 'API Key Created',
        description: 'Your new API key has been created successfully'
      })
    } catch (error) {
      console.error('Error creating API key:', error)
      toast({
        title: 'Error',
        description: 'Failed to create API key',
        variant: 'destructive'
      })
    }
  }

  const generateAPIKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let key = 'tf_'
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return key
  }

  const hashAPIKey = async (key: string) => {
    // In production, use proper hashing on the server side
    const encoder = new TextEncoder()
    const data = encoder.encode(key)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied',
      description: `${label} copied to clipboard`
    })
  }

  const regenerateKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to regenerate this API key? The old key will stop working immediately.')) {
      return
    }

    try {
      const newKey = generateAPIKey()
      const prefix = newKey.substring(0, 7)

      const { error } = await supabase
        .from('api_keys')
        .update({
          key: await hashAPIKey(newKey),
          prefix,
          created_at: new Date().toISOString()
        })
        .eq('id', keyId)

      if (error) throw error

      setApiKeys(apiKeys.map(k => 
        k.id === keyId ? { ...k, key: prefix + '•••••••', prefix } : k
      ))

      setCreatedKey(newKey)
      
      toast({
        title: 'Key Regenerated',
        description: 'Your API key has been regenerated'
      })
    } catch (error) {
      console.error('Error regenerating key:', error)
      toast({
        title: 'Error',
        description: 'Failed to regenerate API key',
        variant: 'destructive'
      })
    }
  }

  const toggleKeyStatus = async (keyId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ status: newStatus })
        .eq('id', keyId)

      if (error) throw error

      setApiKeys(apiKeys.map(k => 
        k.id === keyId ? { ...k, status: newStatus } : k
      ))

      toast({
        title: 'Status Updated',
        description: `API key ${newStatus === 'active' ? 'activated' : 'deactivated'}`
      })
    } catch (error) {
      console.error('Error updating key status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update API key status',
        variant: 'destructive'
      })
    }
  }

  const deleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId)

      if (error) throw error

      setApiKeys(apiKeys.filter(k => k.id !== keyId))
      
      toast({
        title: 'Key Deleted',
        description: 'API key has been deleted'
      })
    } catch (error) {
      console.error('Error deleting key:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete API key',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">API Keys</h1>
        <p className="text-muted-foreground mt-2">
          Manage your API keys for programmatic access to TrackFlow
        </p>
      </div>

      {/* API Documentation Link */}
      <Alert className="mb-6">
        <Code className="h-4 w-4" />
        <AlertTitle>API Documentation</AlertTitle>
        <AlertDescription>
          Learn how to use the TrackFlow API with our{' '}
          <a href="/docs" className="font-medium underline">
            comprehensive documentation
          </a>
          . Available endpoints include REST API and GraphQL.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="keys" className="space-y-6">
        <TabsList>
          <TabsTrigger value="keys">
            <Key className="w-4 h-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="usage">
            <Activity className="w-4 h-4 mr-2" />
            Usage Statistics
          </TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="keys" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your API Keys</CardTitle>
                  <CardDescription>
                    Create and manage API keys for accessing the TrackFlow API
                  </CardDescription>
                </div>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create API Key</DialogTitle>
                      <DialogDescription>
                        Generate a new API key for programmatic access
                      </DialogDescription>
                    </DialogHeader>
                    
                    {createdKey ? (
                      <div className="space-y-4 py-4">
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Important</AlertTitle>
                          <AlertDescription>
                            Copy your API key now. You won't be able to see it again!
                          </AlertDescription>
                        </Alert>
                        
                        <div className="space-y-2">
                          <Label>Your API Key</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={createdKey}
                              readOnly
                              className="font-mono"
                            />
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => copyToClipboard(createdKey, 'API key')}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button
                            onClick={() => {
                              setCreatedKey(null)
                              setCreateDialogOpen(false)
                            }}
                          >
                            Done
                          </Button>
                        </DialogFooter>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="key-name">Key Name</Label>
                            <Input
                              id="key-name"
                              placeholder="e.g., Production API Key"
                              value={newKeyName}
                              onChange={(e) => setNewKeyName(e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="key-expiry">Expiration</Label>
                            <Select value={newKeyExpiry} onValueChange={setNewKeyExpiry}>
                              <SelectTrigger id="key-expiry">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7">7 days</SelectItem>
                                <SelectItem value="30">30 days</SelectItem>
                                <SelectItem value="90">90 days</SelectItem>
                                <SelectItem value="365">1 year</SelectItem>
                                <SelectItem value="never">Never</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Permissions</Label>
                            <div className="space-y-3">
                              {permissions.map((perm) => (
                                <div key={perm.value} className="flex items-start gap-3">
                                  <Switch
                                    checked={newKeyPermissions.includes(perm.value)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setNewKeyPermissions([...newKeyPermissions, perm.value])
                                      } else {
                                        setNewKeyPermissions(newKeyPermissions.filter(p => p !== perm.value))
                                      }
                                    }}
                                  />
                                  <div className="space-y-1">
                                    <Label className="font-medium">{perm.label}</Label>
                                    <p className="text-sm text-muted-foreground">
                                      {perm.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="rate-limit">Rate Limit (requests/hour)</Label>
                            <Select value={newKeyRateLimit} onValueChange={setNewKeyRateLimit}>
                              <SelectTrigger id="rate-limit">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="100">100 requests/hour</SelectItem>
                                <SelectItem value="1000">1,000 requests/hour</SelectItem>
                                <SelectItem value="10000">10,000 requests/hour</SelectItem>
                                <SelectItem value="100000">100,000 requests/hour</SelectItem>
                                <SelectItem value="unlimited">Unlimited</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setCreateDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={createAPIKey}
                            disabled={!newKeyName}
                          >
                            Create Key
                          </Button>
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {apiKeys.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No API keys yet. Create your first key to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((apiKey) => (
                      <TableRow key={apiKey.id}>
                        <TableCell className="font-medium">
                          {apiKey.name}
                          <div className="flex gap-1 mt-1">
                            {apiKey.permissions.map(p => (
                              <Badge key={p} variant="outline" className="text-xs">
                                {p}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-sm">
                              {showKey[apiKey.id] ? apiKey.key : apiKey.prefix + '•••••••'}
                            </code>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => setShowKey({ ...showKey, [apiKey.id]: !showKey[apiKey.id] })}
                            >
                              {showKey[apiKey.id] ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(apiKey.key, 'API key')}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={apiKey.status === 'active' ? 'default' : 'secondary'}
                          >
                            {apiKey.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(apiKey.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {apiKey.last_used 
                            ? new Date(apiKey.last_used).toLocaleDateString()
                            : 'Never'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {apiKey.usage_count.toLocaleString()} calls
                            <div className="text-xs text-muted-foreground">
                              {apiKey.rate_limit === -1 
                                ? 'Unlimited' 
                                : `${apiKey.rate_limit}/hour`
                              }
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => toggleKeyStatus(apiKey.id, apiKey.status)}
                            >
                              <Shield className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => regenerateKey(apiKey.id)}
                            >
                              <RotateCw className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-600"
                              onClick={() => deleteKey(apiKey.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Code Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
              <CardDescription>
                Example code to get you started with the TrackFlow API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="curl" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="graphql">GraphQL</TabsTrigger>
                </TabsList>
                
                <TabsContent value="curl" className="space-y-2">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>{`# Get all time entries
curl -X GET https://track-flow.app/api/v1/time-entries \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"

# Create a new time entry
curl -X POST https://track-flow.app/api/v1/time-entries \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "project_id": "uuid",
    "description": "Working on API integration",
    "start_time": "2024-01-01T09:00:00Z",
    "end_time": "2024-01-01T11:00:00Z"
  }'`}</code>
                  </pre>
                </TabsContent>
                
                <TabsContent value="javascript" className="space-y-2">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>{`// Install: npm install @trackflow/sdk
import { TrackFlow } from '@trackflow/sdk';

const client = new TrackFlow({
  apiKey: 'YOUR_API_KEY'
});

// Get time entries
const entries = await client.timeEntries.list({
  projectId: 'uuid',
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});

// Create time entry
const entry = await client.timeEntries.create({
  projectId: 'uuid',
  description: 'Working on API integration',
  startTime: new Date('2024-01-01T09:00:00'),
  endTime: new Date('2024-01-01T11:00:00')
});`}</code>
                  </pre>
                </TabsContent>
                
                <TabsContent value="python" className="space-y-2">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>{`# Install: pip install trackflow
from trackflow import TrackFlow
from datetime import datetime

client = TrackFlow(api_key='YOUR_API_KEY')

# Get time entries
entries = client.time_entries.list(
    project_id='uuid',
    start_date='2024-01-01',
    end_date='2024-01-31'
)

# Create time entry
entry = client.time_entries.create(
    project_id='uuid',
    description='Working on API integration',
    start_time=datetime(2024, 1, 1, 9, 0),
    end_time=datetime(2024, 1, 1, 11, 0)
)`}</code>
                  </pre>
                </TabsContent>
                
                <TabsContent value="graphql" className="space-y-2">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>{`# GraphQL endpoint: https://track-flow.app/api/graphql

query GetTimeEntries {
  timeEntries(
    projectId: "uuid"
    startDate: "2024-01-01"
    endDate: "2024-01-31"
  ) {
    id
    description
    startTime
    endTime
    duration
    project {
      name
      client
    }
  }
}

mutation CreateTimeEntry {
  createTimeEntry(
    projectId: "uuid"
    description: "Working on API integration"
    startTime: "2024-01-01T09:00:00Z"
    endTime: "2024-01-01T11:00:00Z"
  ) {
    id
    description
    duration
  }
}`}</code>
                  </pre>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Statistics Tab */}
        <TabsContent value="usage" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Requests (30d)
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usage.reduce((sum, day) => sum + day.requests, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average: {Math.round(usage.reduce((sum, day) => sum + day.requests, 0) / 30).toLocaleString()}/day
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Error Rate
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usage.length > 0 
                    ? ((usage.reduce((sum, day) => sum + day.errors, 0) / usage.reduce((sum, day) => sum + day.requests, 0)) * 100).toFixed(2)
                    : 0
                  }%
                </div>
                <p className="text-xs text-muted-foreground">
                  {usage.reduce((sum, day) => sum + day.errors, 0)} errors total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Latency
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usage.length > 0
                    ? Math.round(usage.reduce((sum, day) => sum + day.latency, 0) / usage.length)
                    : 0
                  }ms
                </div>
                <p className="text-xs text-muted-foreground">
                  P95: {usage.length > 0 ? Math.round(Math.max(...usage.map(d => d.latency)) * 0.95) : 0}ms
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>API Usage Over Time</CardTitle>
              <CardDescription>
                Your API usage for the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                {/* Add a chart component here (e.g., Recharts) */}
                <Activity className="w-8 h-8 mr-2" />
                Usage chart will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

