'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Activity,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { RetainerAlerts } from '@/components/dashboard/retainer-alerts'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'
import { toastUtils } from '@/lib/toast-utils'

export default function DashboardPage() {
  const { data: stats, loading, error, refresh } = useDashboardStats()
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your activity overview.
            {stats && (
              <span className="text-xs ml-2">
                • Last updated {new Date(stats.lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Failed to load dashboard data: {error}</span>
              <Button variant="outline" size="sm" onClick={refresh} className="ml-auto">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.today.hours || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.today.changeFromYesterday !== undefined && (
                    <span className={stats.today.changeFromYesterday >= 0 ? "text-green-600" : "text-red-600"}>
                      {stats.today.changeFromYesterday >= 0 ? '+' : ''}{stats.today.changeFromYesterday}%
                    </span>
                  )} from yesterday
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-28 bg-muted animate-pulse rounded" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.week.hours || 0} hrs
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.week.billableRate || 0}% billable rate
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ${stats?.week.revenue?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.week.changeFromLastWeek !== undefined && (
                    <span className={stats.week.changeFromLastWeek >= 0 ? "text-green-600" : "text-red-600"}>
                      {stats.week.changeFromLastWeek >= 0 ? '+' : ''}{stats.week.changeFromLastWeek}%
                    </span>
                  )} from last week
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.clients.total || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.clients.retainers || 0} retainers, {stats?.clients.projects || 0} projects
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest time entries and tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Google Ads Optimization</p>
                  <p className="text-xs text-muted-foreground">Acme Corp • 2.5 hours</p>
                </div>
                <Badge variant="secondary">Billable</Badge>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Content Creation</p>
                  <p className="text-xs text-muted-foreground">TechStart • 1.5 hours</p>
                </div>
                <Badge variant="secondary">Billable</Badge>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-2 w-2 bg-purple-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Team Meeting</p>
                  <p className="text-xs text-muted-foreground">Internal • 45 minutes</p>
                </div>
                <Badge variant="outline">Non-billable</Badge>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-2 w-2 bg-orange-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">SEO Audit</p>
                  <p className="text-xs text-muted-foreground">Growth Co • 3 hours</p>
                </div>
                <Badge variant="secondary">Billable</Badge>
              </div>
            </div>

            <Link href="/timesheet">
              <Button variant="ghost" className="w-full mt-4">
                View All Entries
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Alerts & Reminders */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Alerts & Reminders</CardTitle>
            <CardDescription>Important updates and tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Retainer Alert</p>
                  <p className="text-xs text-muted-foreground">
                    Acme Corp at 85% usage (17/20 hours)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Time to Invoice</p>
                  <p className="text-xs text-muted-foreground">
                    3 clients ready for monthly invoicing
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Goal Achieved</p>
                  <p className="text-xs text-muted-foreground">
                    Hit your 40-hour weekly target!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Productivity Insight</p>
                  <p className="text-xs text-muted-foreground">
                    You're most productive 9-11 AM
                  </p>
                </div>
              </div>
            </div>

            <Link href="/insights">
              <Button variant="ghost" className="w-full mt-4">
                View All Insights
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Retainer Alerts */}
      <RetainerAlerts />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Start tracking or manage your work</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Link href="/timer">
              <Button className="w-full" variant="default">
                <Clock className="h-4 w-4 mr-2" />
                Start Timer
              </Button>
            </Link>
            <Link href="/timesheet">
              <Button className="w-full" variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                Log Time
              </Button>
            </Link>
            <Link href="/reports">
              <Button className="w-full" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </Link>
            <Link href="/invoices">
              <Button className="w-full" variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
