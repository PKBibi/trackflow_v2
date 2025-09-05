import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Calendar,
  Clock,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Timesheet - TrackFlow',
  description: 'View and manage your time entries',
}

export default function TimesheetPage() {
  const timeEntries = [
    {
      id: 1,
      date: '2024-01-15',
      client: 'Acme Corp',
      project: 'Q1 Campaign',
      activity: 'Google Ads Management',
      duration: '2h 30m',
      billable: true,
      amount: '$375',
      notes: 'Optimized bidding strategy and ad copy'
    },
    {
      id: 2,
      date: '2024-01-15',
      client: 'TechStart',
      project: 'Content Marketing',
      activity: 'Blog Writing',
      duration: '1h 45m',
      billable: true,
      amount: '$262.50',
      notes: 'Wrote article on AI trends'
    },
    {
      id: 3,
      date: '2024-01-14',
      client: 'Growth Co',
      project: 'SEO Optimization',
      activity: 'Technical Audit',
      duration: '3h 00m',
      billable: true,
      amount: '$450',
      notes: 'Complete site audit and recommendations'
    },
    {
      id: 4,
      date: '2024-01-14',
      client: 'Internal',
      project: 'Admin',
      activity: 'Team Meeting',
      duration: '45m',
      billable: false,
      amount: '-',
      notes: 'Weekly sync meeting'
    },
    {
      id: 5,
      date: '2024-01-13',
      client: 'Startup Inc',
      project: 'Social Media',
      activity: 'Content Creation',
      duration: '2h 15m',
      billable: true,
      amount: '$337.50',
      notes: 'Created social media calendar'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timesheet</h1>
          <p className="text-muted-foreground">
            Manage and review your time entries
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link href="/timer">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="date-range">Date Range</Label>
              <Select defaultValue="this-week">
                <SelectTrigger id="date-range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="last-week">Last Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select defaultValue="all">
                <SelectTrigger id="client">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  <SelectItem value="acme">Acme Corp</SelectItem>
                  <SelectItem value="techstart">TechStart</SelectItem>
                  <SelectItem value="growth">Growth Co</SelectItem>
                  <SelectItem value="startup">Startup Inc</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select defaultValue="all">
                <SelectTrigger id="project">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="q1-campaign">Q1 Campaign</SelectItem>
                  <SelectItem value="content">Content Marketing</SelectItem>
                  <SelectItem value="seo">SEO Optimization</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billable">Status</Label>
              <Select defaultValue="all">
                <SelectTrigger id="billable">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entries</SelectItem>
                  <SelectItem value="billable">Billable Only</SelectItem>
                  <SelectItem value="non-billable">Non-billable Only</SelectItem>
                  <SelectItem value="invoiced">Invoiced</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10h 15m</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9h 30m</div>
            <p className="text-xs text-muted-foreground">92.7% billable</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,425</div>
            <p className="text-xs text-muted-foreground">To be invoiced</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Daily</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3h 25m</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
          <CardDescription>Your recorded time for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Client / Project</th>
                  <th className="pb-3 font-medium">Activity</th>
                  <th className="pb-3 font-medium">Duration</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {timeEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-muted/50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{entry.date}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-sm">{entry.client}</p>
                        <p className="text-xs text-muted-foreground">{entry.project}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <div>
                        <p className="text-sm">{entry.activity}</p>
                        <p className="text-xs text-muted-foreground">{entry.notes}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{entry.duration}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-sm font-medium">{entry.amount}</span>
                    </td>
                    <td className="py-3">
                      {entry.billable ? (
                        <Badge variant="secondary">Billable</Badge>
                      ) : (
                        <Badge variant="outline">Non-billable</Badge>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing 1-5 of 23 entries
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
