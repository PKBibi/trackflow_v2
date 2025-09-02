'use client'

import { User, Users, CreditCard, Bell, Key, Shield, Activity, Download, Trash2, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const settingsSections = [
  {
    title: 'Profile',
    description: 'Manage your personal information and preferences',
    icon: User,
    href: '/settings/profile',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  },
  {
    title: 'Team Management',
    description: 'Invite and manage team members',
    icon: Users,
    href: '/settings/team',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  },
  {
    title: 'Billing & Subscription',
    description: 'Manage your subscription and payment methods',
    icon: CreditCard,
    href: '/billing',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  },
  {
    title: 'Notifications',
    description: 'Configure how you receive notifications',
    icon: Bell,
    href: '/settings/notifications',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  },
  {
    title: 'API Keys',
    description: 'Manage API keys for integrations',
    icon: Key,
    href: '/settings/api-keys',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
  },
  {
    title: 'Security',
    description: 'Two-factor authentication and security settings',
    icon: Shield,
    href: '/settings/security',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  },
  {
    title: 'Activity Logs',
    description: 'View all account activity and changes',
    icon: Activity,
    href: '/settings/activity',
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
  },
  {
    title: 'Data Export',
    description: 'Export your data in various formats',
    icon: Download,
    href: '/settings/export',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
  },
  {
    title: 'Delete Account',
    description: 'Permanently delete your account and data',
    icon: Trash2,
    href: '/settings/delete-account',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
]

export default function SettingsPage() {
  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsSections.map((section) => {
          const Icon = section.icon
          
          return (
            <Link key={section.href} href={section.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${section.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="mt-4">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 p-6 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Link
            href="/settings/security"
            className="flex items-center gap-3 p-3 bg-background rounded-md hover:bg-accent transition-colors"
          >
            <Shield className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium">Enable Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
          </Link>
          
          <Link
            href="/settings/team"
            className="flex items-center gap-3 p-3 bg-background rounded-md hover:bg-accent transition-colors"
          >
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium">Invite Team Members</p>
              <p className="text-sm text-muted-foreground">Collaborate with your team</p>
            </div>
          </Link>
          
          <Link
            href="/settings/api-keys"
            className="flex items-center gap-3 p-3 bg-background rounded-md hover:bg-accent transition-colors"
          >
            <Key className="w-5 h-5 text-purple-600" />
            <div>
              <p className="font-medium">Generate API Key</p>
              <p className="text-sm text-muted-foreground">Connect external applications</p>
            </div>
          </Link>
          
          <Link
            href="/settings/export"
            className="flex items-center gap-3 p-3 bg-background rounded-md hover:bg-accent transition-colors"
          >
            <Download className="w-5 h-5 text-orange-600" />
            <div>
              <p className="font-medium">Export Your Data</p>
              <p className="text-sm text-muted-foreground">Download all your information</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

