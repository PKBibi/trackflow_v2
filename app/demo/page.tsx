'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  Settings,
  AlertTriangle,
  Target,
  Zap,
  RefreshCw,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Eye
} from 'lucide-react'

export default function DemoPage() {
  // Demo scenario state
  const [activeScenario, setActiveScenario] = useState('profitability')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState('00:00:00')
  const [seconds, setSeconds] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Profitability calculator state
  const [selectedChannel, setSelectedChannel] = useState('ppc')
  const [hoursWorked, setHoursWorked] = useState(8)
  const [clientSpend, setClientSpend] = useState(15000)

  // Retainer burndown state
  const [retainerUsed, setRetainerUsed] = useState(75)
  const [daysLeft, setDaysLeft] = useState(12)

  // ROI comparison state
  const [selectedTimeframe, setSelectedTimeframe] = useState('month')

  // Demo data
  const channelData = {
    ppc: {
      name: 'Google Ads',
      hourlyRate: 125,
      profitMargin: 0.85,
      avgSpend: 15000,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    seo: {
      name: 'SEO Services',
      hourlyRate: 110,
      profitMargin: 0.92,
      avgSpend: 0,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    social: {
      name: 'Social Media',
      hourlyRate: 85,
      profitMargin: 0.65,
      avgSpend: 5000,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    email: {
      name: 'Email Marketing',
      hourlyRate: 95,
      profitMargin: 0.78,
      avgSpend: 2000,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  }

  // Calculate profitability
  const calculateProfitability = () => {
    const channel = channelData[selectedChannel]
    const revenue = hoursWorked * channel.hourlyRate
    const managementFee = clientSpend * 0.15 // 15% management fee
    const totalRevenue = revenue + managementFee
    const profit = totalRevenue * channel.profitMargin
    const roi = profit / (totalRevenue - profit)

    return {
      revenue: totalRevenue,
      profit: profit,
      roi: roi,
      hourlyValue: totalRevenue / hoursWorked
    }
  }

  // Timer functionality
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1)
      }, 100) // Faster for demo
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying])

  // Format time display
  useEffect(() => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    setCurrentTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`)
  }, [seconds])

  const scenarios = [
    { id: 'profitability', name: 'Campaign Profitability', icon: DollarSign, description: 'See which campaigns actually make money' },
    { id: 'retainer', name: 'Retainer Alerts', icon: AlertTriangle, description: 'Prevent budget overruns and scope creep' },
    { id: 'roi', name: 'Channel ROI', icon: TrendingUp, description: 'Compare profitability across marketing channels' },
    { id: 'invoice', name: 'Smart Invoicing', icon: FileText, description: 'Generate detailed, campaign-specific invoices' }
  ]

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

          {/* Interactive Demo Scenarios */}
          <div className="space-y-8">
            {/* Scenario Selector */}
            <div className="flex justify-center">
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                {scenarios.map((scenario) => {
                  const Icon = scenario.icon
                  return (
                    <button
                      key={scenario.id}
                      onClick={() => setActiveScenario(scenario.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeScenario === scenario.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {scenario.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Campaign Profitability Calculator */}
            {activeScenario === 'profitability' && (
              <Card className="border-2 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Campaign Profitability Calculator
                  </CardTitle>
                  <CardDescription>
                    See which marketing channels actually make money after labor costs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Marketing Channel</label>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(channelData).map(([key, channel]) => (
                            <button
                              key={key}
                              onClick={() => setSelectedChannel(key)}
                              className={`p-3 rounded-lg border text-left transition-all ${
                                selectedChannel === key
                                  ? `border-blue-500 ${channel.bgColor} ${channel.color}`
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="font-medium text-sm">{channel.name}</div>
                              <div className="text-xs text-gray-500">${channel.hourlyRate}/hr</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Hours Worked: {hoursWorked}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="40"
                          value={hoursWorked}
                          onChange={(e) => setHoursWorked(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Client Ad Spend: ${clientSpend.toLocaleString()}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="50000"
                          step="500"
                          value={clientSpend}
                          onChange={(e) => setClientSpend(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      {(() => {
                        const results = calculateProfitability()
                        return (
                          <>
                            <div className="p-4 bg-blue-50 rounded-lg">
                              <div className="text-2xl font-bold text-blue-900">
                                ${results.revenue.toLocaleString()}
                              </div>
                              <div className="text-sm text-blue-700">Total Revenue</div>
                            </div>

                            <div className="p-4 bg-green-50 rounded-lg">
                              <div className="text-2xl font-bold text-green-900">
                                ${results.profit.toLocaleString()}
                              </div>
                              <div className="text-sm text-green-700">Net Profit</div>
                            </div>

                            <div className="p-4 bg-purple-50 rounded-lg">
                              <div className="text-2xl font-bold text-purple-900">
                                {(results.roi * 100).toFixed(0)}%
                              </div>
                              <div className="text-sm text-purple-700">ROI</div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="text-2xl font-bold text-gray-900">
                                ${results.hourlyValue.toFixed(0)}
                              </div>
                              <div className="text-sm text-gray-700">Effective Hourly Value</div>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Retainer Burndown Alert */}
            {activeScenario === 'retainer' && (
              <Card className="border-2 border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Retainer Burndown Alert
                  </CardTitle>
                  <CardDescription>
                    Get notified before you exceed client budgets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Retainer Used: {retainerUsed}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={retainerUsed}
                          onChange={(e) => setRetainerUsed(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Days Left in Month: {daysLeft}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="31"
                          value={daysLeft}
                          onChange={(e) => setDaysLeft(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-white border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Acme Corp - PPC Retainer</span>
                          <Badge
                            variant={retainerUsed >= 90 ? "destructive" : retainerUsed >= 75 ? "secondary" : "default"}
                          >
                            {retainerUsed}% Used
                          </Badge>
                        </div>
                        <Progress value={retainerUsed} className="mb-3" />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Budget</div>
                            <div className="font-medium">$8,000</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Remaining</div>
                            <div className="font-medium">${((100 - retainerUsed) * 80).toFixed(0)}</div>
                          </div>
                        </div>
                      </div>

                      {retainerUsed >= 90 && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2 text-red-800 font-medium mb-1">
                            <AlertTriangle className="w-4 h-4" />
                            Critical Alert
                          </div>
                          <div className="text-sm text-red-700">
                            Retainer is {retainerUsed}% used with {daysLeft} days remaining.
                            Contact client immediately to discuss scope or additional budget.
                          </div>
                        </div>
                      )}

                      {retainerUsed >= 75 && retainerUsed < 90 && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-center gap-2 text-amber-800 font-medium mb-1">
                            <AlertTriangle className="w-4 h-4" />
                            Warning
                          </div>
                          <div className="text-sm text-amber-700">
                            Retainer is {retainerUsed}% used. Plan client conversation about
                            remaining work and potential budget adjustments.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Channel ROI Comparison */}
            {activeScenario === 'roi' && (
              <Card className="border-2 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Channel ROI Comparison
                  </CardTitle>
                  <CardDescription>
                    Compare profitability across all marketing channels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex gap-2">
                      {['week', 'month', 'quarter'].map((timeframe) => (
                        <button
                          key={timeframe}
                          onClick={() => setSelectedTimeframe(timeframe)}
                          className={`px-3 py-1 rounded text-sm capitalize ${
                            selectedTimeframe === timeframe
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {timeframe}
                        </button>
                      ))}
                    </div>

                    <div className="grid gap-4">
                      {Object.entries(channelData).map(([key, channel]) => {
                        const revenue = 40 * channel.hourlyRate
                        const profit = revenue * channel.profitMargin
                        const roi = (profit / (revenue - profit)) * 100

                        return (
                          <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${channel.color.replace('text', 'bg')}`} />
                              <div>
                                <div className="font-medium">{channel.name}</div>
                                <div className="text-sm text-gray-500">40hrs @ ${channel.hourlyRate}/hr</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">{roi.toFixed(0)}% ROI</div>
                              <div className="text-sm text-gray-500">${profit.toLocaleString()} profit</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Smart Invoicing Preview */}
            {activeScenario === 'invoice' && (
              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Smart Invoice Preview
                  </CardTitle>
                  <CardDescription>
                    Auto-generated invoices with campaign breakdowns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white border rounded-lg p-6 shadow-sm">
                    <div className="border-b pb-4 mb-4">
                      <h3 className="text-lg font-bold">Invoice #2024-001</h3>
                      <p className="text-sm text-gray-600">Acme Corp - February 2024</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Google Ads Management</div>
                          <div className="text-sm text-gray-500">Campaign setup & optimization • 12.5 hours</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">$1,562.50</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">SEO Content Creation</div>
                          <div className="text-sm text-gray-500">Blog posts & page optimization • 8 hours</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">$880.00</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Social Media Management</div>
                          <div className="text-sm text-gray-500">Content creation & posting • 6 hours</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">$510.00</div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total</span>
                        <span>$2,952.50</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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