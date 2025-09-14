'use client'

import { useState, useEffect } from 'react'
import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Clock,
  Users,
  FileText,
  ChevronRight,
  PieChart,
  Loader2,
  Filter,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import ProfitabilityChart from '@/components/charts/ProfitabilityChart'
import TimeDistributionChart from '@/components/charts/TimeDistributionChart'
import { reportsAPI, DashboardStats, ChannelSummary, ClientSummary, TimeDistribution, ReportFilters } from '@/lib/api/reports'
import { clientsAPI } from '@/lib/api/clients'
import { getAllChannels } from '@/lib/constants/marketing-channels'

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [channelData, setChannelData] = useState<ChannelSummary[]>([])
  const [clientData, setClientData] = useState<ClientSummary[]>([])
  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution[]>([])
  const [filters, setFilters] = useState<ReportFilters>({})
  const [clients, setClients] = useState<any[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [aiReportLoading, setAiReportLoading] = useState(false)
  const [aiReport, setAiReport] = useState<any | null>(null)
  const [plan, setPlan] = useState<'free'|'pro'|'enterprise'>('free')
  const [printing, setPrinting] = useState(false)
  // Optional white-label branding for PDF
  const [brandCompany, setBrandCompany] = useState('')
  const [brandLogoUrl, setBrandLogoUrl] = useState('')
  const [brandEmail, setBrandEmail] = useState('')
  const [periodLabel, setPeriodLabel] = useState('')
  const [prefLocale, setPrefLocale] = useState('')
  const [prefCurrency, setPrefCurrency] = useState('')
  const [prefIncludeCover, setPrefIncludeCover] = useState(true)
  const [prefRepeatHeader, setPrefRepeatHeader] = useState(true)
  const [prefRowStriping, setPrefRowStriping] = useState(true)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(()=>{
    (async ()=>{
      try {
        const res = await fetch('/api/me/branding')
        if (res.ok) {
          const d = await res.json()
          if (d.branding) {
            setBrandCompany(d.branding.companyName || '')
            setBrandLogoUrl(d.branding.logoUrl || '')
            setBrandEmail(d.branding.contactEmail || '')
          }
          if (d.prefs) {
            setPrefLocale(d.prefs.locale || '')
            setPrefCurrency(d.prefs.currency || '')
            setPrefIncludeCover(d.prefs.includeCover !== false)
            setPrefRepeatHeader(d.prefs.repeatHeader !== false)
            if (typeof d.prefs.rowStriping === 'boolean') setPrefRowStriping(d.prefs.rowStriping)
            if (!periodLabel && d.prefs.defaultPeriod) setPeriodLabel(d.prefs.defaultPeriod)
          }
        }
      } catch {}
      try {
        const local = localStorage.getItem('branding_prefs')
        if (local) {
          const b = JSON.parse(local)
          setBrandCompany(b.companyName||'')
          setBrandLogoUrl(b.logoUrl||'')
          setBrandEmail(b.contactEmail||'')
          if (typeof b.includeCover === 'boolean') setPrefIncludeCover(b.includeCover)
          if (typeof b.repeatHeader === 'boolean') setPrefRepeatHeader(b.repeatHeader)
          if (typeof b.rowStriping === 'boolean') setPrefRowStriping(b.rowStriping)
          if (b.locale) setPrefLocale(b.locale)
          if (b.currency) setPrefCurrency(b.currency)
          if (!periodLabel && b.defaultPeriod) setPeriodLabel(b.defaultPeriod)
        }
      } catch {}
    })()
  },[])

  // Load initial data
  useEffect(() => {
    loadReportData()
    loadClients()
    fetch('/api/me/plan').then(r=>r.json()).then(d=>setPlan(d.plan||'free')).catch(()=>{})
  }, [])

  // Reload data when filters change
  useEffect(() => {
    if (!loading) {
      loadReportData()
    }
  }, [filters])

  const loadClients = async () => {
    try {
      const clientsData = await clientsAPI.getAll()
      setClients(clientsData)
    } catch (err) {
      console.error('Failed to load clients:', err)
    }
  }

  const loadReportData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [statsData, channelsData, clientsData, distributionData] = await Promise.all([
        reportsAPI.getDashboardStats(filters),
        reportsAPI.getChannelSummary(filters),
        reportsAPI.getClientSummary(filters),
        reportsAPI.getTimeDistribution(filters)
      ])
      
      setStats(statsData)
      setChannelData(channelsData)
      setClientData(clientsData)
      setTimeDistribution(distributionData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report data')
      console.error('Failed to load report data:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateFilters = (newFilters: Partial<ReportFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`
  }

  const getDefaultDateRange = () => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    return {
      start: startOfMonth.toISOString().split('T')[0],
      end: endOfMonth.toISOString().split('T')[0]
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" role="status" aria-live="polite" aria-busy="true">
        <Loader2 className="w-8 h-8 animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading reports…</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Analytics and insights for your marketing work
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Link href="/settings/reports" className="hidden md:inline-flex">
            <Button variant="outline" title="Report Preferences">Preferences</Button>
          </Link>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button 
            variant="default" 
            title={plan==='free' ? 'Upgrade to Pro to generate AI reports' : undefined}
            onClick={async ()=>{
              setAiReportLoading(true)
              setError(null)
              try {
                try { const { trackEvent } = await import('@/components/analytics'); trackEvent.featureUse('reports_ai_generate'); } catch {}
                const res = await fetch('/api/ai/reports/weekly', { method: 'POST' })
                if (!res.ok) throw new Error('AI report failed')
                const data = await res.json()
                setAiReport(data)
              } catch (e:any) {
                setError(e.message || 'Failed to generate AI report')
              } finally { setAiReportLoading(false) }
            }}
            disabled={plan==='free' || aiReportLoading}
          >
            {aiReportLoading ? 'Generating…' : 'Generate Weekly (AI)'}
          </Button>
          {plan==='free' && (
            <a href="/pricing/simple" className="text-xs underline text-blue-600" onClick={async (e)=>{ try { const { trackEvent } = await import('@/components/analytics'); trackEvent.featureUse('reports_upgrade_click_generate'); } catch {} }}>Upgrade</a>
          )}
          {plan !== 'free' && aiReport && (
            <Button variant="outline" onClick={() => {
              // Simple print-to-PDF: open a print window with AI report content
              try {
                (async ()=>{ try { const { trackEvent } = await import('@/components/analytics'); trackEvent.featureUse('reports_pdf_print'); } catch {} })()
                const content = document.getElementById('ai-weekly-report-print')?.innerHTML || ''
                const w = window.open('', 'PRINT', 'height=700,width=900')
                if (!w) return
                w.document.write('<html><head><title>AI Weekly Report</title>')
                w.document.write('<style>body{font-family:Inter,system-ui,sans-serif;padding:24px;} .section{border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin-bottom:12px;} h1{font-size:20px;margin:0 0 8px;} h2{font-size:16px;margin:8px 0;} ul{margin:6px 0 0 18px;}</style>')
                w.document.write('</head><body>')
                w.document.write(`<h1>AI Weekly Report</h1>`)
                w.document.write(content)
                w.document.write('</body></html>')
                w.document.close();
                w.focus();
                w.print();
                w.close();
              } catch {}
            }}>
              Save as PDF
            </Button>
          )}
          {plan !== 'free' && aiReport && (
            <Button variant="ghost" onClick={async ()=>{
              try { const { trackEvent } = await import('@/components/analytics'); trackEvent.featureUse('reports_pdf_download'); } catch {}
              // Prefer POST with report content for richer PDF
              const res = await fetch('/api/ai/reports/weekly/pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ branding: { companyName: brandCompany, logoUrl: brandLogoUrl, contactEmail: brandEmail }, report: aiReport, period: periodLabel, options: { includeCover: prefIncludeCover, repeatHeader: prefRepeatHeader, rowStriping: prefRowStriping, locale: prefLocale || undefined, currency: prefCurrency || undefined } })
              })
              if (res.ok) {
                const blob = await res.blob()
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'weekly-report.pdf'
                a.click()
                URL.revokeObjectURL(url)
              } else {
                // Fallback to GET without body
                const qp = new URLSearchParams()
                if (brandCompany) qp.set('companyName', brandCompany)
                if (brandLogoUrl) qp.set('logoUrl', brandLogoUrl)
                if (brandEmail) qp.set('contactEmail', brandEmail)
                const res2 = await fetch(`/api/ai/reports/weekly/pdf${qp.toString() ? `?${qp.toString()}` : ''}`)
                if (res2.ok) {
                  const blob2 = await res2.blob()
                  const url2 = URL.createObjectURL(blob2)
                  const a2 = document.createElement('a')
                  a2.href = url2
                  a2.download = 'weekly-report.pdf'
                  a2.click()
                  URL.revokeObjectURL(url2)
                } else {
                  setError('PDF export failed')
                }
              }
            }}>
              Download PDF (beta)
            </Button>
          )}
          {plan !== 'free' && aiReport && (
            <Button variant="outline" onClick={async ()=>{
              try { const { trackEvent } = await import('@/components/analytics'); trackEvent.featureUse('reports_pdf_preview'); } catch {}
              try {
              const res = await fetch('/api/ai/reports/weekly/pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ branding: { companyName: brandCompany, logoUrl: brandLogoUrl, contactEmail: brandEmail }, report: aiReport, period: periodLabel, options: { includeCover: prefIncludeCover, repeatHeader: prefRepeatHeader, rowStriping: prefRowStriping, locale: prefLocale || undefined, currency: prefCurrency || undefined } })
              })
                if (!res.ok) throw new Error('PDF preview failed')
                const blob = await res.blob()
                const url = URL.createObjectURL(blob)
                setPreviewUrl(url)
                setPreviewOpen(true)
              } catch (e:any) {
                setError(e.message || 'PDF preview failed')
              }
            }}>
              Preview PDF
            </Button>
          )}
        </div>
      </div>

      {/* Branding inputs for PDF (optional) */}
      {plan !== 'free' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Branding (optional)</CardTitle>
            <CardDescription>Include your company info in exported PDFs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Company Name</Label>
                <Input value={brandCompany} onChange={(e)=>setBrandCompany(e.target.value)} placeholder="e.g., Acme Agency"/>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Logo URL</Label>
                <Input value={brandLogoUrl} onChange={(e)=>setBrandLogoUrl(e.target.value)} placeholder="https://example.com/logo.png"/>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Contact Email</Label>
                <Input type="email" value={brandEmail} onChange={(e)=>setBrandEmail(e.target.value)} placeholder="ops@agency.com"/>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div className="space-y-2">
                <Label className="text-sm">Period Label</Label>
                <Input value={periodLabel} onChange={(e)=>setPeriodLabel(e.target.value)} placeholder="e.g., Aug 1–7, 2025"/>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Locale</Label>
                <Input value={prefLocale} onChange={(e)=>setPrefLocale(e.target.value)} placeholder="e.g., en-US, fr-FR"/>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Currency</Label>
                <Input value={prefCurrency} onChange={(e)=>setPrefCurrency(e.target.value)} placeholder="e.g., USD, EUR"/>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div className="space-y-2">
                <Label className="text-sm">Include Cover Page</Label>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={prefIncludeCover} onChange={(e)=>setPrefIncludeCover(e.target.checked)} />
                  <span className="text-sm text-muted-foreground">Show cover on PDF</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Repeat Table Header</Label>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={prefRepeatHeader} onChange={(e)=>setPrefRepeatHeader(e.target.checked)} />
                  <span className="text-sm text-muted-foreground">Repeat table header on new pages</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Row Striping</Label>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={prefRowStriping} onChange={(e)=>setPrefRowStriping(e.target.checked)} />
                  <span className="text-sm text-muted-foreground">Alternate row background color</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <Button variant="outline" size="sm" onClick={async ()=>{
                const branding = { companyName: brandCompany, logoUrl: brandLogoUrl, contactEmail: brandEmail }
                const prefs = { locale: prefLocale, currency: prefCurrency, includeCover: prefIncludeCover, repeatHeader: prefRepeatHeader }
                try {
                  const res = await fetch('/api/me/branding', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ branding, prefs }) })
                  if (!res.ok) throw new Error('Save failed')
                  localStorage.setItem('branding_prefs', JSON.stringify({ ...branding, ...prefs, rowStriping: prefRowStriping }))
                } catch {
                  localStorage.setItem('branding_prefs', JSON.stringify({ ...branding, ...prefs, rowStriping: prefRowStriping }))
                }
              }}>Save Branding</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inline PDF Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={(o)=>{
        setPreviewOpen(o)
        if (!o && previewUrl) {
          try { URL.revokeObjectURL(previewUrl) } catch {}
          setPreviewUrl(null)
        }
      }}>
        <DialogContent className="max-w-5xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Weekly Report Preview</DialogTitle>
          </DialogHeader>
          <div className="w-full h-full">
            {previewUrl ? (
              <iframe src={previewUrl} title="Report Preview" className="w-full h-full border rounded" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">Generating preview…</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setError(null)}
            className="ml-auto"
          >
            ×
          </Button>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Report Filters</CardTitle>
            <CardDescription>Customize your report data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate?.split('T')[0] || getDefaultDateRange().start}
                  onChange={(e) => updateFilters({ startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate?.split('T')[0] || getDefaultDateRange().end}
                  onChange={(e) => updateFilters({ endDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="client">Client</Label>
                <Select value={filters.clientId || ''} onValueChange={(value) => updateFilters({ clientId: value || undefined })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All clients</SelectItem>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.total_revenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.billable_rate || 0}% billable rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Tracked</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((stats?.total_hours || 0) * 10) / 10} hrs</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats?.billable_hours || 0) * 10) / 10} billable
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hourly Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.avg_hourly_rate || 0}</div>
            <p className="text-xs text-muted-foreground">
              MRR: {formatCurrency(stats?.total_mrr || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_clients || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.active_projects || 0} active projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts Section */}
      <div className="space-y-6">
        {/* Profitability Chart */}
        {channelData.length > 0 && (
          <ProfitabilityChart
            data={channelData.map(channel => ({
              channel: channel.channel_name,
              revenue: channel.total_amount / 100, // Convert from cents
              cost: channel.total_hours * 60, // Assume $60/hr cost
              margin: (channel.total_amount / 100) - (channel.total_hours * 60),
              marginPercentage: channel.total_hours > 0 
                ? (((channel.total_amount / 100) - (channel.total_hours * 60)) / (channel.total_amount / 100)) * 100 
                : 0,
              hours: channel.total_hours,
              color: channel.color
            }))}
            title="Channel Profitability Analysis"
            description="Revenue, costs, and profit margins by marketing channel"
          />
        )}

        {/* Time Distribution Chart */}
        {timeDistribution.length > 0 && (
          <TimeDistributionChart
            data={timeDistribution.map(item => ({
              label: item.label,
              hours: item.hours,
              percentage: item.percentage,
              color: item.color,
              billable: true // Assume most time is billable for simplicity
            }))}
            title="Time Distribution Analysis"
            description="Visual breakdown of time allocation across activities"
          />
        )}

        {/* Fallback for empty data */}
        {channelData.length === 0 && timeDistribution.length === 0 && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No profitability data available</p>
                  <p className="text-xs">Start tracking time to see channel profitability</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No time distribution data</p>
                  <p className="text-xs">Start tracking time to see time breakdown</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Client Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Client Performance</CardTitle>
          <CardDescription>Revenue and time breakdown by client</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {clientData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No client performance data</p>
                <p className="text-xs">Start tracking time for clients to see performance metrics</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Client</th>
                    <th className="pb-3 font-medium">Hours</th>
                    <th className="pb-3 font-medium">Revenue</th>
                    <th className="pb-3 font-medium">Avg Rate</th>
                    <th className="pb-3 font-medium">Projects</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {clientData.slice(0, 10).map((client) => (
                    <tr key={client.client_id} className="hover:bg-muted/50">
                      <td className="py-3">
                        <div>
                          <p className="font-medium">{client.client_name}</p>
                          {client.company && (
                            <p className="text-xs text-muted-foreground">{client.company}</p>
                          )}
                          {client.has_retainer && (
                            <Badge variant="outline" className="text-xs mt-1">
                              Retainer
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3">{client.total_hours} hrs</td>
                      <td className="py-3 font-medium">{formatCurrency(client.total_amount)}</td>
                      <td className="py-3">${client.avg_hourly_rate}/hr</td>
                      <td className="py-3">{client.projects_count}</td>
                      <td className="py-3">
                        <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                          {client.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Reports */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/reports/margins">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Service Margins
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
              <CardDescription>Profitability by service channel</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                View Analysis
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Weekly Summary
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
            <CardDescription>Generated weekly on Monday</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              View Report
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Monthly Invoice
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
            <CardDescription>Ready for 3 clients</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/invoices">
              <Button className="w-full" variant="outline">
                Generate Invoices
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Performance Report
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
            <CardDescription>Campaign ROI analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              View Analysis
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Weekly Report Output */}
      {aiReport && (
        <Card id="ai-weekly-report-print">
          <CardHeader>
            <CardTitle>AI Weekly Report</CardTitle>
            <CardDescription>Summary and highlights generated from your last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {aiReport.executiveSummary && (
              <div className="mb-4 text-sm text-muted-foreground">{aiReport.executiveSummary}</div>
            )}
            {Array.isArray(aiReport.reports) && aiReport.reports.map((r:any, idx:number)=> (
              <div key={idx} className="border rounded-md p-3 mb-3 section">
                <div className="font-medium">{r.client || 'Client'}</div>
                {r.totals && (
                  <div className="text-sm text-muted-foreground">{r.totals.hours} hrs • ${(r.totals.amount||0/100).toFixed(2)}</div>
                )}
                {r.summary && (
                  <div className="text-sm mt-2">{r.summary}</div>
                )}
                {Array.isArray(r.highlights) && r.highlights.length>0 && (
                  <ul className="list-disc pl-5 text-sm mt-2">
                    {r.highlights.map((h:string,i:number)=>(<li key={i}>{h}</li>))}
                  </ul>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* AI Upsell for Free plan */}
      {plan === 'free' && (
        <div className="p-3 bg-blue-50 text-blue-900 rounded border border-blue-200 text-sm">
          Generate Weekly (AI) reports is available on Pro. <a href="/pricing/simple" className="underline" onClick={async (e)=>{ try { const { trackEvent } = await import('@/components/analytics'); trackEvent.featureUse('reports_upgrade_click_banner'); } catch {} }}>Upgrade to Pro</a>.
        </div>
      )}
    </div>
  )
}
