'use client'

import Link from 'next/link'
import { 
  LayoutDashboard, Timer, FolderOpen, Users, FileText, 
  Calendar, BarChart3, Settings, CreditCard, LogIn,
  UserPlus, Home, DollarSign, Bell, Shield, Activity,
  Download, Key, UserCog, Trash2, ChevronRight,
  Code, Palette, Globe, Mail, Info,
  BookOpen, Phone, Lock, FileCode, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const devRoutes = {
  auth: [
    { name: 'Login', path: '/login', icon: LogIn, description: 'User authentication' },
    { name: 'Sign Up', path: '/signup', icon: UserPlus, description: 'New user registration' },
    { name: 'Forgot Password', path: '/forgot-password', icon: Lock, description: 'Password recovery' },
  ],
  dashboard: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, description: 'Main dashboard', status: 'ready' },
    { name: 'Timer', path: '/timer', icon: Timer, description: 'Time tracking', status: 'ready' },
    { name: 'Projects', path: '/projects', icon: FolderOpen, description: 'Project management', status: 'ready' },
    { name: 'Clients', path: '/clients', icon: Users, description: 'Client management', status: 'ready' },
    { name: 'Invoices', path: '/invoices', icon: FileText, description: 'Invoice management', status: 'ready' },
    { name: 'Timesheet', path: '/timesheet', icon: Calendar, description: 'Time entries', status: 'ready' },
    { name: 'Reports', path: '/reports', icon: BarChart3, description: 'Analytics & reports', status: 'ready' },
    { name: 'Billing', path: '/billing', icon: CreditCard, description: 'Subscription & billing', status: 'ready' },
  ],
  settings: [
    { name: 'Settings Main', path: '/settings', icon: Settings, description: 'Main settings page' },
    { name: 'Profile', path: '/settings/profile', icon: UserCog, description: 'User profile management' },
    { name: 'Team', path: '/settings/team', icon: Users, description: 'Team management' },
    { name: 'Notifications', path: '/settings/notifications', icon: Bell, description: 'Notification preferences' },
    { name: 'Security', path: '/settings/security', icon: Shield, description: '2FA & security' },
    { name: 'API Keys', path: '/settings/api-keys', icon: Key, description: 'API key management' },
    { name: 'Activity Logs', path: '/settings/activity', icon: Activity, description: 'Activity history' },
    { name: 'Data Export', path: '/settings/export', icon: Download, description: 'Export data' },
    { name: 'Delete Account', path: '/settings/delete-account', icon: Trash2, description: 'Account deletion' },
  ],
  marketing: [
    { name: 'Marketing Home', path: '/', icon: Home, description: 'Marketing landing page' },
    { name: 'Pricing', path: '/pricing', icon: DollarSign, description: 'Pricing plans' },
    { name: 'Features', path: '/features', icon: Zap, description: 'Feature showcase' },
    { name: 'About', path: '/about', icon: Info, description: 'About us' },
    { name: 'Blog', path: '/blog', icon: BookOpen, description: 'Blog posts' },
    { name: 'Contact', path: '/contact', icon: Phone, description: 'Contact form' },
    { name: 'Privacy', path: '/privacy', icon: Lock, description: 'Privacy policy' },
    { name: 'Terms', path: '/terms', icon: FileCode, description: 'Terms of service' },
  ],
  api: [
    { name: 'REST API', path: '/api/v1/time-entries', icon: Code, description: 'Time entries API' },
    { name: 'GraphQL', path: '/api/graphql', icon: Globe, description: 'GraphQL endpoint' },
    { name: 'Webhooks', path: '/api/webhooks/stripe', icon: Zap, description: 'Stripe webhooks' },
  ]
}

export default function DevDashboard() {
  const isDev = process.env.NODE_ENV === 'development'
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF] to-[#7C3AED] rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  TrackFlow Development Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Quick access to all application routes
                </p>
              </div>
            </div>
            <Badge variant={isDev ? "default" : "destructive"}>
              {isDev ? 'Development Mode' : 'Production Mode'}
            </Badge>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Routes</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {Object.values(devRoutes).flat().length}
              </p>
            </div>
            <div className="bg-[#2F6BFF]/10 rounded-lg p-3">
              <p className="text-xs text-[#2F6BFF]">App Pages</p>
              <p className="text-xl font-bold text-[#2F6BFF]">
                {devRoutes.dashboard.length}
              </p>
            </div>
            <div className="bg-[#16B8A6]/10 rounded-lg p-3">
              <p className="text-xs text-[#16B8A6]">Settings Pages</p>
              <p className="text-xl font-bold text-[#16B8A6]">
                {devRoutes.settings.length}
              </p>
            </div>
            <div className="bg-[#7C3AED]/10 rounded-lg p-3">
              <p className="text-xs text-[#7C3AED]">Marketing Pages</p>
              <p className="text-xl font-bold text-[#7C3AED]">
                {devRoutes.marketing.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Route Sections */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Authentication Routes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="w-5 h-5" />
              Authentication Routes
            </CardTitle>
            <CardDescription>User authentication and onboarding pages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {devRoutes.auth.map((route) => (
                <Link key={route.path} href={route.path}>
                  <Button variant="outline" className="w-full justify-start h-auto p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-start gap-3 w-full">
                      <route.icon className="w-5 h-5 mt-0.5 text-gray-500" />
                      <div className="text-left">
                        <p className="font-medium">{route.name}</p>
                        <p className="text-xs text-gray-500">{route.description}</p>
                      </div>
                    </div>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Application Routes */}
        <Card className="border-[#2F6BFF]/20">
          <CardHeader className="bg-gradient-to-r from-[#2F6BFF]/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-[#2F6BFF]" />
              Main Application
            </CardTitle>
            <CardDescription>Core application features and pages</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-3">
              {devRoutes.dashboard.map((route) => (
                <Link key={route.path} href={route.path}>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-auto p-3 hover:bg-[#2F6BFF]/5 hover:border-[#2F6BFF]/30 group"
                  >
                    <div className="flex items-start gap-3 w-full">
                      <route.icon className="w-5 h-5 mt-0.5 text-[#2F6BFF]" />
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{route.name}</p>
                          {route.status === 'ready' && (
                            <Badge variant="secondary" className="text-xs py-0 h-4">
                              Ready
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{route.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#2F6BFF] mt-0.5" />
                    </div>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings Routes */}
        <Card className="border-[#16B8A6]/20">
          <CardHeader className="bg-gradient-to-r from-[#16B8A6]/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#16B8A6]" />
              Settings & Preferences
            </CardTitle>
            <CardDescription>User and system configuration pages (Phase 9)</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-3">
              {devRoutes.settings.map((route) => (
                <Link key={route.path} href={route.path}>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-auto p-3 hover:bg-[#16B8A6]/5 hover:border-[#16B8A6]/30"
                  >
                    <div className="flex items-start gap-3 w-full">
                      <route.icon className="w-5 h-5 mt-0.5 text-[#16B8A6]" />
                      <div className="text-left">
                        <p className="font-medium">{route.name}</p>
                        <p className="text-xs text-gray-500">{route.description}</p>
                      </div>
                    </div>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Marketing Routes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Marketing Pages
            </CardTitle>
            <CardDescription>Public-facing marketing and content pages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {devRoutes.marketing.map((route) => (
                <Link key={route.path} href={route.path}>
                  <Button variant="outline" className="w-full justify-start h-auto p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-start gap-3 w-full">
                      <route.icon className="w-4 h-4 mt-0.5 text-gray-500" />
                      <div className="text-left">
                        <p className="font-medium text-sm">{route.name}</p>
                        <p className="text-xs text-gray-500">{route.path}</p>
                      </div>
                    </div>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Routes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              API Endpoints
            </CardTitle>
            <CardDescription>REST API, GraphQL, and webhook endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {devRoutes.api.map((route) => (
                <div key={route.path} className="font-mono">
                  <Button variant="outline" className="w-full justify-start h-auto p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-start gap-3 w-full">
                      <route.icon className="w-5 h-5 mt-0.5 text-gray-500" />
                      <div className="text-left">
                        <p className="font-medium font-sans">{route.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{route.path}</p>
                      </div>
                    </div>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-[#7C3AED]/5 to-[#2F6BFF]/5">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common development tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              <Link href="/dashboard">
                <Button className="bg-[#2F6BFF] hover:bg-[#2F6BFF]/90">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/timer">
                <Button variant="outline">
                  <Timer className="w-4 h-4 mr-2" />
                  Start Timer
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.clear()
                    window.location.reload()
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Local Storage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>TrackFlow Development Dashboard • Environment: {process.env.NODE_ENV || 'development'}</p>
        <p className="mt-1">This page is only accessible in development mode</p>
      </div>
    </div>
  )
}

