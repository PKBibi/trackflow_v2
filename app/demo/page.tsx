'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Pause, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Users,
  Calendar,
  ChevronRight,
  BarChart3,
  FileText,
  Settings
} from 'lucide-react'

export default function DemoPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState('00:00:00')

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="secondary">Interactive Demo</Badge>
          <h1 className="text-4xl font-bold mb-4">
            Experience TrackFlow in Action
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how TrackFlow helps you track time, manage clients, and boost profitability - 
            all designed specifically for digital marketers.
          </p>
        </div>

        {/* Demo Dashboard */}
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Timer Demo */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Live Timer Demo
              </CardTitle>
              <CardDescription>
                Track time with marketing-specific categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">PPC Campaign Optimization</p>
                    <div className="flex gap-2">
                      <Badge variant="outline">Google Ads</Badge>
                      <Badge variant="outline">Client: Acme Corp</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-mono font-bold">{currentTime}</span>
                    <Button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      size="lg"
                      className={isPlaying ? 'bg-red-600 hover:bg-red-700' : ''}
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Badge variant="secondary">SEO</Badge>
                  <Badge variant="secondary">PPC</Badge>
                  <Badge variant="secondary">Social Media</Badge>
                  <Badge variant="secondary">Email Marketing</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Today's Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6.5</div>
                <p className="text-xs text-muted-foreground">85% billable</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Weekly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$8,450</div>
                <p className="text-xs text-green-600">+22% from last week</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Retainers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">$45K MRR</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">ROI Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.2x</div>
                <p className="text-xs text-muted-foreground">PPC best performer</p>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle>Channel Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track time across PPC, SEO, Social, Email. See which channels 
                  deliver the highest ROI after labor costs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle>Client Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage retainers, track budget burn rates, and get alerts 
                  before going over allocated hours.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="w-8 h-8 text-amber-600 mb-2" />
                <CardTitle>Smart Invoicing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generate detailed invoices with campaign breakdowns. 
                  Show clients exactly where their budget went.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
                <CardTitle>AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get intelligent recommendations on productivity patterns 
                  and revenue optimization opportunities.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Calendar className="w-8 h-8 text-indigo-600 mb-2" />
                <CardTitle>Project Timelines</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track campaign milestones, deliverables, and deadlines. 
                  Never miss a client deadline again.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Settings className="w-8 h-8 text-gray-600 mb-2" />
                <CardTitle>Team Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Invite team members, assign roles, and track everyone's 
                  contributions to client projects.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Transform Your Agency?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join 2,000+ agencies already using TrackFlow to boost profitability
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" variant="secondary">
                    Start Free 14-Day Trial
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                    View Pricing
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-sm opacity-75">
                No credit card required • Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}