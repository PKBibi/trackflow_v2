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
  const [activeScenario, setActiveScenario] = useState<string>('profitability')
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [seconds, setSeconds] = useState<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Profitability calculator state
  const [selectedChannel, setSelectedChannel] = useState<string>('ppc')
  const [hoursWorked, setHoursWorked] = useState<number>(8)
  const [teamMembers, setTeamMembers] = useState<number>(2)

  // Retainer burndown state
  const [retainerUsed, setRetainerUsed] = useState<number>(75)
  const [daysLeft, setDaysLeft] = useState<number>(12)

  // ROI comparison state
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('month')

  // Timer control functions
  const toggleTimer = () => {
    setIsPlaying(prev => !prev)
  }

  const resetTimer = () => {
    setIsPlaying(false)
    setSeconds(0)
  }

  const startTimer = () => {
    if (!isPlaying) {
      setIsPlaying(true)
    }
  }

  // Format time display
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Channel selection handler
  const handleChannelSelect = (channelKey: string) => {
    setSelectedChannel(channelKey)
  }

  // Slider change handlers
  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHoursWorked(Number(e.target.value))
  }

  const handleTeamMembersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeamMembers(Number(e.target.value))
  }

  const handleRetainerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRetainerUsed(Number(e.target.value))
  }

  const handleDaysLeftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDaysLeft(Number(e.target.value))
  }

  // Demo data - Agency-focused pricing
  const channelData = {
    ppc: {
      name: 'PPC Management',
      hourlyRate: 125, // What agency charges client per hour
      costPerHour: 65,  // What it costs agency (salary + overhead)
      description: 'Google Ads, Meta Ads, LinkedIn Ads',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      profitMargin: 0.48 // (125-65)/125 = 48%
    },
    seo: {
      name: 'SEO Services',
      hourlyRate: 110,
      costPerHour: 55,
      description: 'Technical SEO, Content, Link Building',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      profitMargin: 0.50 // (110-55)/110 = 50%
    },
    social: {
      name: 'Social Media',
      hourlyRate: 85,
      costPerHour: 45,
      description: 'Content Creation, Community Management',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      profitMargin: 0.47 // (85-45)/85 = 47%
    },
    email: {
      name: 'Email Marketing',
      hourlyRate: 95,
      costPerHour: 50,
      description: 'Campaigns, Automation, List Building',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      profitMargin: 0.47 // (95-50)/95 = 47%
    }
  }

  // Calculate agency profitability
  const calculateProfitability = () => {
    const channel = channelData[selectedChannel as keyof typeof channelData]
    if (!channel) return { revenue: 0, costs: 0, profit: 0, marginPercent: 0 }

    const totalHours = hoursWorked * teamMembers
    const revenue = totalHours * channel.hourlyRate // What agency charges client
    const costs = totalHours * channel.costPerHour   // What it costs agency (salaries + overhead)
    const profit = revenue - costs
    const marginPercent = (profit / revenue) * 100

    return {
      revenue: revenue,
      costs: costs,
      profit: profit,
      marginPercent: marginPercent
    }
  }

  // Timer functionality
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isPlaying])

  const scenarios = [
    { id: 'profitability', name: 'Agency Profitability', icon: DollarSign, description: 'Calculate profit margins for different services' },
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
            See How Agencies Boost Profits by 23%
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            Track every billable minute, prevent scope creep, and maximize profit margins.
            The only time tracker built specifically for digital marketing agencies.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Average 23% profit increase</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>2,000+ agencies trust TrackFlow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>$2M+ in recovered billable time</span>
            </div>
          </div>
          <p className="text-lg font-medium text-blue-600">
            👇 Try the live timer and profitability calculator below
          </p>
        </div>

        {/* Demo Dashboard */}
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Timer Demo */}
          <Card className={`border-2 transition-all duration-300 ${isPlaying ? 'border-green-400 bg-green-50 shadow-lg' : 'border-blue-200'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className={`w-5 h-5 ${isPlaying ? 'text-green-600' : ''}`} />
                Live Billable Time Tracker
                {isPlaying && (
                  <Badge className="bg-green-600 text-white animate-pulse ml-2">
                    <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                    TRACKING • ${((seconds / 3600) * 125).toFixed(2)} earned
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Stop losing money on untracked time. Every billable minute automatically calculated for maximum agency profitability.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Google Ads Campaign Audit & Optimization</p>
                    <div className="flex gap-2">
                      <Badge variant="outline">PPC • $125/hr</Badge>
                      <Badge variant="outline">Client: TechStart Inc</Badge>
                      <Badge variant="outline" className="text-green-600 border-green-600">Billable</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Keyword research, ad copy testing, landing page optimization
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-mono font-bold">{formatTime(seconds)}</span>
                    <div className="flex gap-2">
                      <Button
                        onClick={toggleTimer}
                        size="lg"
                        className={isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        <span className="ml-2">{isPlaying ? 'Pause' : 'Start'}</span>
                      </Button>
                      <Button
                        onClick={resetTimer}
                        size="lg"
                        variant="outline"
                        disabled={seconds === 0}
                      >
                        <RefreshCw className="w-5 h-5" />
                        <span className="ml-2">Reset</span>
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-700">Quick Start Categories:</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button
                      className="p-2 text-left border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      onClick={startTimer}
                    >
                      <div className="font-medium text-sm">PPC Management</div>
                      <div className="text-xs text-gray-500">$125/hr</div>
                    </button>
                    <button
                      className="p-2 text-left border rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
                      onClick={startTimer}
                    >
                      <div className="font-medium text-sm">SEO Services</div>
                      <div className="text-xs text-gray-500">$110/hr</div>
                    </button>
                    <button
                      className="p-2 text-left border rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
                      onClick={startTimer}
                    >
                      <div className="font-medium text-sm">Social Media</div>
                      <div className="text-xs text-gray-500">$85/hr</div>
                    </button>
                    <button
                      className="p-2 text-left border rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors"
                      onClick={startTimer}
                    >
                      <div className="font-medium text-sm">Email Marketing</div>
                      <div className="text-xs text-gray-500">$95/hr</div>
                    </button>
                  </div>
                  {!isPlaying && (
                    <p className="text-sm text-gray-600 italic">
                      💡 Click any service above to start tracking time at that billing rate
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Billable Hours Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">6.5</div>
                <p className="text-xs text-green-600">85% billable • $812.50 earned</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Weekly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">$8,450</div>
                <p className="text-xs text-blue-600">+22% from last week</p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  <Users className="w-4 h-4 text-purple-600" />
                  Active Retainers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700">12</div>
                <p className="text-xs text-purple-600">$45K MRR • 95% renewal rate</p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  <Target className="w-4 h-4 text-orange-600" />
                  Profit Margin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700">52%</div>
                <p className="text-xs text-orange-600">Up 8% this quarter</p>
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
                    Agency Profitability Calculator
                  </CardTitle>
                  <CardDescription>
                    Calculate your agency's profit margins across different marketing services
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
                              onClick={() => handleChannelSelect(key)}
                              className={`p-3 rounded-lg border text-left transition-all ${
                                selectedChannel === key
                                  ? `border-blue-500 ${channel.bgColor} ${channel.color}`
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="font-medium text-sm">{channel.name}</div>
                              <div className="text-xs text-gray-500">${channel.hourlyRate}/hr • Margin: {(((channel.hourlyRate - channel.costPerHour) / channel.hourlyRate) * 100).toFixed(0)}%</div>
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
                          onChange={handleHoursChange}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Team Members: {teamMembers}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={teamMembers}
                          onChange={handleTeamMembersChange}
                          className="w-full"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Total hours: {hoursWorked * teamMembers} hours
                        </div>
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
                              <div className="text-sm text-blue-700">Agency Revenue</div>
                            </div>

                            <div className="p-4 bg-red-50 rounded-lg">
                              <div className="text-2xl font-bold text-red-900">
                                ${results.costs.toLocaleString()}
                              </div>
                              <div className="text-sm text-red-700">Total Costs</div>
                            </div>

                            <div className="p-4 bg-green-50 rounded-lg">
                              <div className="text-2xl font-bold text-green-900">
                                ${results.profit.toLocaleString()}
                              </div>
                              <div className="text-sm text-green-700">Net Profit</div>
                            </div>

                            <div className="p-4 bg-purple-50 rounded-lg">
                              <div className="text-2xl font-bold text-purple-900">
                                {results.marginPercent.toFixed(1)}%
                              </div>
                              <div className="text-sm text-purple-700">Profit Margin</div>
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
                          onChange={handleRetainerChange}
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
                          onChange={handleDaysLeftChange}
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
                        const hours = selectedTimeframe === 'week' ? 10 : selectedTimeframe === 'month' ? 40 : 120
                        const revenue = hours * channel.hourlyRate
                        const costs = hours * channel.costPerHour
                        const profit = revenue - costs
                        const roi = costs > 0 ? (profit / costs) * 100 : 0

                        // Color mapping
                        const colorMap: Record<string, string> = {
                          'text-blue-600': 'bg-blue-500',
                          'text-green-600': 'bg-green-500',
                          'text-purple-600': 'bg-purple-500',
                          'text-orange-600': 'bg-orange-500'
                        }

                        return (
                          <div key={key} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${colorMap[channel.color] || 'bg-gray-500'}`} />
                              <div>
                                <div className="font-medium">{channel.name}</div>
                                <div className="text-sm text-gray-500">{hours}hrs @ ${channel.hourlyRate}/hr</div>
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
                Stop Losing Money on Untracked Time
              </h2>
              <p className="text-xl mb-6 opacity-90">
                Join 2,000+ agencies already using TrackFlow to boost profitability by an average of 23%
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">$2M+</div>
                  <div className="text-sm opacity-90">Recovered billable time</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">23%</div>
                  <div className="text-sm opacity-90">Average profit increase</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">2,000+</div>
                  <div className="text-sm opacity-90">Agencies trust TrackFlow</div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="min-w-48">
                    Start Free 14-Day Trial
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 min-w-32">
                    View Pricing
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-sm opacity-75">
                No credit card required • Cancel anytime • Setup in 5 minutes
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}