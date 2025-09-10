import { NextRequest, NextResponse } from 'next/server'
import { requireUserWithPlan } from '@/lib/ai/access'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const gate = await requireUserWithPlan('pro')
    if (gate.status !== 200) return NextResponse.json({ error: gate.error }, { status: gate.status })

    // Gather data (reuse weekly report aggregation)
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data, error } = await supabase
      .from('time_entries')
      .select('duration, amount, task_title, marketing_channel, client_id, start_time, clients:client_id(name)')
      .eq('user_id', user!.id)
      .gte('start_time', since)
      .order('start_time', { ascending: false })
    if (error) return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
    const entries = data || []
    const byClient: Record<string, any> = {}
    entries.forEach((e: any) => {
      const name = e.clients?.name || 'Unknown Client'
      if (!byClient[name]) byClient[name] = { name, totalMinutes: 0, totalAmount: 0, items: [] as any[] }
      byClient[name].totalMinutes += e.duration || 0
      byClient[name].totalAmount += e.amount || 0
      byClient[name].items.push({ title: e.task_title, channel: e.marketing_channel, minutes: e.duration || 0 })
    })
    const clientsArr: any[] = Object.values(byClient)
    const totals = clientsArr.reduce((acc, c: any) => {
      acc.minutes += c.totalMinutes || 0
      acc.amount += c.totalAmount || 0
      return acc
    }, { minutes: 0, amount: 0 })
    const payload = { period: 'last_7_days', clients: clientsArr, totals }

    // Dynamic import to avoid edge issues
    const ReactPDF = await import('@react-pdf/renderer')
    const { Document, Page, Text, View, StyleSheet, Image } = ReactPDF as any

    const styles = StyleSheet.create({
      page: { padding: 32, fontSize: 11, fontFamily: 'Helvetica' },
      header: { borderBottom: 1, borderColor: '#e5e7eb', paddingBottom: 8, marginBottom: 10, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
      brand: { fontSize: 14, fontWeight: 700 },
      meta: { color: '#666' },
      h1: { fontSize: 18, marginBottom: 8 },
      h2: { fontSize: 14, marginTop: 12, marginBottom: 6 },
      small: { color: '#666', marginBottom: 10 },
      section: { border: 1, borderColor: '#e5e7eb', padding: 8, borderRadius: 4, marginBottom: 8 },
      row: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between' },
      bullet: { marginLeft: 10, marginTop: 2 },
      footer: { position: 'absolute', bottom: 16, left: 32, right: 32, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', color: '#666', fontSize: 10 },
    })

    let logo: Buffer | null = null
    try {
      const p = path.join(process.cwd(), 'public', 'images', 'logo.png')
      if (fs.existsSync(p)) logo = fs.readFileSync(p)
    } catch {}

    const generatedDate = new Date().toLocaleDateString()
    const ReportDoc = (
      <Document>
        {/* Cover / Summary Page */}
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            {logo ? <Image src={logo} style={{ width: 180 }} /> : <Text style={styles.brand}>TrackFlow</Text>}
            <Text style={styles.meta}>{generatedDate}</Text>
          </View>
          <Text style={styles.h1}>Weekly Report</Text>
          <Text style={styles.small}>Period: last 7 days</Text>
          <View style={styles.section}>
            <Text style={styles.h2}>Totals</Text>
            <View style={styles.row}>
              <Text>Total Hours: {(payload.totals.minutes / 60).toFixed(2)}</Text>
              <Text>Total Amount: ${(payload.totals.amount / 100).toFixed(2)}</Text>
            </View>
            <Text style={{ marginTop: 6 }}>Clients: {payload.clients.length}</Text>
          </View>
          <Text style={{ marginTop: 8 }}>Highlights:</Text>
          {payload.clients.slice(0, 5).map((c: any, i: number) => (
            <Text key={i} style={styles.bullet}>• {c.name}: {(c.totalMinutes/60).toFixed(1)}h, ${(c.totalAmount/100).toFixed(0)}</Text>
          ))}
          <View style={styles.footer} fixed>
            <Text>TrackFlow • track-flow.app • Generated {generatedDate}</Text>
            <Text render={({ pageNumber, totalPages }: any) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
        </Page>

        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            {logo ? <Image src={logo} style={{ width: 180 }} /> : <Text style={styles.brand}>TrackFlow</Text>}
            <Text style={styles.meta}>{generatedDate}</Text>
          </View>
          {payload.clients.length === 0 && (
            <Text>No data available. Track some time to generate reports.</Text>
          )}
          {payload.clients.map((c: any, idx: number) => (
            <View key={idx} style={styles.section} wrap>
              <Text style={styles.h2}>{c.name}</Text>
              <View style={styles.row}>
                <Text>Total Hours: {(c.totalMinutes / 60).toFixed(2)}</Text>
                <Text>Total Amount: ${(c.totalAmount / 100).toFixed(2)}</Text>
              </View>
              <Text style={{ marginTop: 6 }}>Highlights:</Text>
              {c.items.slice(0, 6).map((it: any, i: number) => (
                <Text key={i} style={styles.bullet}>• {it.title || 'Task'} — {it.channel} ({Math.round((it.minutes || 0))}m)</Text>
              ))}
            </View>
          ))}
          <View style={styles.footer} fixed>
            <Text>TrackFlow • track-flow.app • Generated {generatedDate}</Text>
            <Text render={({ pageNumber, totalPages }: any) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
        </Page>
      </Document>
    )

    const buffer = await (ReactPDF as any).renderToBuffer(ReportDoc)
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="weekly-report.pdf"'
      }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'PDF generation error' }, { status: 500 })
  }
}

export async function POST() {
  return GET()
}
