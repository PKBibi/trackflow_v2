import { NextRequest, NextResponse } from 'next/server'

function pdfEscape(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

// Minimal multipage PDF generator with page numbers and simple headings
function estimateTextWidth(text: string, size: number) {
  // crude estimate: half the font size per char
  const factor = 0.5
  return text.length * size * factor
}

function wrapText(text: string, size: number, maxWidth: number): string[] {
  const words = String(text).split(/\s+/)
  const lines: string[] = []
  let current = ''
  words.forEach(w => {
    const test = current ? current + ' ' + w : w
    if (estimateTextWidth(test, size) <= maxWidth) {
      current = test
    } else {
      if (current) lines.push(current)
      current = w
    }
  })
  if (current) lines.push(current)
  return lines
}

function generatePDFMultiPage(
  title: string,
  blocks: { text: string; size: number }[] | any[],
  cover?: { company?: string; period?: string },
  opts?: { repeatHeader?: boolean; rowStriping?: boolean }
): Buffer {
  let out = '%PDF-1.4\n'
  const offsets: number[] = []
  const pushObj = (s: string) => { offsets.push(Buffer.byteLength(out)); out += s }

  // Prepare page streams with placeholder for total pages
  const pageStreams: { stream: string; isCover?: boolean }[] = []
  let y = 760
  const lineHeights: Record<number, number> = { 9: 12, 11: 14, 12: 16, 14: 18, 16: 22, 18: 24 }
  const beginPage = (): string[] => {
    const arr: string[] = []
    // Banner background and title
    arr.push('q\n', '0.92 0.94 0.98 rg\n', '40 740 532 28 re\n', 'f\n', 'Q\n')
    arr.push('BT\n/F1 16 Tf\n0 0 0 rg\n')
    arr.push(`50 760 Td (${pdfEscape(title)}) Tj\n`)
    arr.push('ET\n')
    y = 760
    return arr
  }
  const beginCover = (): string[] => {
    const arr: string[] = []
    // Full-bleed soft background band
    arr.push('q\n', '0.95 0.96 0.99 rg\n', '0 620 612 100 re\n', 'f\n', 'Q\n')
    // Large centered title
    const bigSize = 24
    const titleEsc = pdfEscape(cover?.company ? `${cover.company}` : title)
    const titleWidth = estimateTextWidth(titleEsc, bigSize)
    const titleX = Math.max(50, (612 - titleWidth) / 2)
    arr.push('BT\n')
    arr.push(`/F1 ${bigSize} Tf\n0 0 0 rg\n`)
    arr.push(`1 0 0 1 ${titleX} 660 Tm (${titleEsc}) Tj\n`)
    arr.push('ET\n')
    // Subtitle
    const sub = cover?.period ? `Weekly Report — ${cover.period}` : 'Weekly Report'
    const subSize = 14
    const subEsc = pdfEscape(sub)
    const subWidth = estimateTextWidth(subEsc, subSize)
    const subX = Math.max(50, (612 - subWidth) / 2)
    arr.push('BT\n')
    arr.push(`/F1 ${subSize} Tf\n0.2 0.2 0.2 rg\n`)
    arr.push(`1 0 0 1 ${subX} 630 Tm (${subEsc}) Tj\n`)
    arr.push('ET\n')
    // Footer on cover
    arr.push('BT\n/F1 9 Tf\n0.4 0.4 0.4 rg\n')
    arr.push(`1 0 0 1 50 30 Tm (Generated ${pdfEscape(new Date().toLocaleString())}) Tj\n`)
    arr.push('ET\n')
    return arr
  }
  let parts = beginPage()

  // Column helpers for simple tables
  const colXs = [50, 360, 460]
  const colRightXs = [330, 450, 560]
  let stripeEven = false
  let lastHeaderRow: string[] | null = null
  const hasCover = !!cover
  const repeatHeader = opts?.repeatHeader !== false
  const rowStriping = opts?.rowStriping !== false

  const addLine = (text: string, size: number) => {
    if (!text) { y -= 10; return }
    const lh = lineHeights[size] || 16
    if (y - lh < 60) {
      // Footer with placeholder total pages
      parts.push('BT\n/F1 9 Tf\n0.4 0.4 0.4 rg\n', `1 0 0 1 50 30 Tm (Page {NUM} of {TOTAL} — ${pdfEscape(new Date().toLocaleString())}) Tj\n`, 'ET\n')
      pageStreams.push({ stream: parts.join('') })
      parts = beginPage()
      // Repeat header row if we were in a table and enabled
      if (repeatHeader && lastHeaderRow) {
        const sizeH = 11
        const lhH = lineHeights[sizeH] || 16
        y -= lhH
        parts.push('q\n', '0.9 0.9 0.92 rg\n', `48 ${y - 2} 514 ${lhH} re\n`, 'f\n', 'Q\n')
        const texts = lastHeaderRow.map((c: string) => pdfEscape(String(c)))
        parts.push(`BT\n/F1 ${sizeH} Tf\n0 0 0 rg\n`)
        parts.push(`1 0 0 1 ${colXs[0]} ${y} Tm (${texts[0] || ''}) Tj\n`)
        if (texts[1] !== undefined) parts.push(`1 0 0 1 ${colXs[1]} ${y} Tm (${texts[1]}) Tj\n`)
        if (texts[2] !== undefined) parts.push(`1 0 0 1 ${colXs[2]} ${y} Tm (${texts[2]}) Tj\n`)
        parts.push('ET\n')
      }
    }
    // Wrap text to page width (512 points)
    const wrapped = wrapText(text, size, 512)
    wrapped.forEach((line, idx) => {
      if (y - lh < 60) {
        parts.push('BT\n/F1 9 Tf\n0.4 0.4 0.4 rg\n', `1 0 0 1 50 30 Tm (Page ${pageStreams.length + 1} of {TOTAL} — ${pdfEscape(new Date().toLocaleString())}) Tj\n`, 'ET\n')
        pageStreams.push({ stream: parts.join('') })
        parts = beginPage()
      }
      y -= lh
      parts.push(`BT\n/F1 ${size} Tf\n0 0 0 rg\n1 0 0 1 50 ${y} Tm (${pdfEscape(line)}) Tj\nET\n`)
    })
  }

  // Title spacing
  // Add optional cover page first
  if (cover) {
    pageStreams.push({ stream: beginCover().join(''), isCover: true })
  }
  y -= 28
  blocks.forEach((b: any) => {
    if (b && Array.isArray(b.row)) {
      const size = b.size || 11
      const lh = lineHeights[size] || 16
      if (y - lh < 60) {
        parts.push('BT\n/F1 9 Tf\n0.4 0.4 0.4 rg\n', `1 0 0 1 50 30 Tm (Page {NUM} of {TOTAL} — ${pdfEscape(new Date().toLocaleString())}) Tj\n`, 'ET\n')
        pageStreams.push({ stream: parts.join('') })
        parts = beginPage()
        if (repeatHeader && lastHeaderRow) {
          const sizeH = 11
          const lhH = lineHeights[sizeH] || 16
          y -= lhH
          parts.push('q\n', '0.9 0.9 0.92 rg\n', `48 ${y - 2} 514 ${lhH} re\n`, 'f\n', 'Q\n')
          const texts = lastHeaderRow.map((c: string) => pdfEscape(String(c)))
          parts.push(`BT\n/F1 ${sizeH} Tf\n0 0 0 rg\n`)
          parts.push(`1 0 0 1 ${colXs[0]} ${y} Tm (${texts[0] || ''}) Tj\n`)
          if (texts[1] !== undefined) parts.push(`1 0 0 1 ${colXs[1]} ${y} Tm (${texts[1]}) Tj\n`)
          if (texts[2] !== undefined) parts.push(`1 0 0 1 ${colXs[2]} ${y} Tm (${texts[2]}) Tj\n`)
          parts.push('ET\n')
        }
      }
      y -= lh
      if (b.header) {
        lastHeaderRow = b.row
        parts.push('q\n', '0.9 0.9 0.92 rg\n', `48 ${y - 2} 514 ${lh} re\n`, 'f\n', 'Q\n')
        stripeEven = false
      }
      const texts = b.row.map((c: string) => pdfEscape(String(c)))
      // Row striping for data rows
      if (rowStriping && !b.header && stripeEven) {
        parts.push('q\n', '0.97 0.97 0.985 rg\n', `48 ${y - (lh - 2)} 514 ${lh - 2} re\n`, 'f\n', 'Q\n')
      }
      parts.push(`BT\n/F1 ${size} Tf\n0 0 0 rg\n`)
      // Left column: client name (left aligned)
      parts.push(`1 0 0 1 ${colXs[0]} ${y} Tm (${texts[0] || ''}) Tj\n`)
      // Right align numeric columns by estimating width
      if (texts[1] !== undefined) {
        const w = estimateTextWidth(texts[1], size)
        const x = Math.max(colXs[1], colRightXs[1] - w)
        parts.push(`1 0 0 1 ${x} ${y} Tm (${texts[1]}) Tj\n`)
      }
      if (texts[2] !== undefined) {
        const w2 = estimateTextWidth(texts[2], size)
        const x2 = Math.max(colXs[2], colRightXs[2] - w2)
        parts.push(`1 0 0 1 ${x2} ${y} Tm (${texts[2]}) Tj\n`)
      }
      parts.push('ET\n')
      if (!b.header) stripeEven = !stripeEven
    } else {
      addLine(b.text, b.size)
    }
  })
  // Close last page
  parts.push('BT\n/F1 9 Tf\n0.4 0.4 0.4 rg\n', `1 0 0 1 50 30 Tm (Page {NUM} of {TOTAL} — ${pdfEscape(new Date().toLocaleString())}) Tj\n`, 'ET\n')
  pageStreams.push({ stream: parts.join('') })

  const totalPages = pageStreams.length
  const totalContent = hasCover ? totalPages - 1 : totalPages

  // Objects: 1 Catalog, 2 Pages, 5 Font, pages pairs start at 3
  const catalogObjNum = 1
  const pagesObjNum = 2
  const fontObjNum = 5
  const kids: string[] = []
  let objNum = 3
  const objs: string[] = []
  pageStreams.forEach((obj, i) => {
    let finalStream = obj.stream
    if (!obj.isCover) {
      const contentIndex = hasCover ? i : i + 1
      const num = hasCover ? contentIndex : contentIndex
      finalStream = finalStream.replace('{TOTAL}', String(totalContent)).replace('{NUM}', String(hasCover ? i : i + 1))
    }
    const contNum = objNum + 1
    const pageNum = objNum
    const pageObj = `${pageNum} 0 obj\n<< /Type /Page /Parent ${pagesObjNum} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObjNum} 0 R >> >> /Contents ${contNum} 0 R >>\nendobj\n`
    const contObj = `${contNum} 0 obj\n<< /Length ${finalStream.length} >>\nstream\n${finalStream}\nendstream\nendobj\n`
    objs.push(pageObj, contObj)
    kids.push(`${pageNum} 0 R`)
    objNum += 2
  })

  const catalogObj = `${catalogObjNum} 0 obj\n<< /Type /Catalog /Pages ${pagesObjNum} 0 R >>\nendobj\n`
  const pagesObj = `${pagesObjNum} 0 obj\n<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${totalPages} >>\nendobj\n`
  const fontObj = `${fontObjNum} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`

  pushObj(catalogObj)
  pushObj(pagesObj)
  objs.forEach(o => pushObj(o))
  pushObj(fontObj)

  const xrefStart = Buffer.byteLength(out)
  const total = 2 + objs.length + 1
  let xref = `xref\n0 ${total + 1}\n0000000000 65535 f \n`
  offsets.forEach(off => { xref += `${off.toString().padStart(10, '0')} 00000 n \n` })
  const trailer = `trailer\n<< /Size ${total + 1} /Root ${catalogObjNum} 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`
  out += xref + trailer
  return Buffer.from(out, 'binary')
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const branding = {
    companyName: searchParams.get('companyName') || undefined,
    logoUrl: searchParams.get('logoUrl') || undefined,
    contactEmail: searchParams.get('contactEmail') || undefined,
  }
  const title = branding.companyName ? `${branding.companyName} — Weekly AI Report` : 'Weekly AI Report'
  const blocks = [
    ...(branding.logoUrl ? [{ text: `Logo: ${branding.logoUrl}`, size: 11 }] : []),
    ...(branding.contactEmail ? [{ text: `Contact: ${branding.contactEmail}`, size: 11 }] : []),
    { text: `Generated: ${new Date().toLocaleString()}`, size: 11 },
    { text: '', size: 11 },
    { text: 'Summary', size: 14 },
    { text: 'Report content was not provided in GET; submit via POST for details.', size: 11 }
  ]

  const pdf = generatePDFMultiPage(title, blocks, undefined, { repeatHeader: true, rowStriping: true })
  return new NextResponse(pdf as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="weekly-report.pdf"'
    }
  })
}

export async function POST(request: NextRequest) {
  let payload: any = {}
  try { payload = await request.json() } catch {}
  const branding = payload?.branding || {}
  const report = payload?.report || null
  const period: string = payload?.period || 'Last 7 days'
  const options = payload?.options || {}
  const includeCover = options.includeCover !== false
  const repeatHeader = options.repeatHeader !== false
  const locale = options.locale || undefined
  const currency = options.currency || undefined
  const title = branding.companyName ? `${branding.companyName} — Weekly AI Report` : 'Weekly AI Report'
  const blocks: any[] = []
  const fmtCurrency = (n: number) => {
    if (isNaN(Number(n))) return String(n)
    try {
      if (currency && locale) return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(n))
      if (currency) return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(n))
    } catch {}
    return Number(n).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  const fmtHours = (n: number) => {
    if (isNaN(Number(n))) return String(n)
    return Number(n).toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  }
  if (branding.logoUrl) blocks.push({ text: `Logo: ${branding.logoUrl}`, size: 11 })
  if (branding.contactEmail) blocks.push({ text: `Contact: ${branding.contactEmail}`, size: 11 })
  blocks.push({ text: `Generated: ${new Date().toLocaleString()}`, size: 11 })
  blocks.push({ text: `Period: ${period}`, size: 11 })
  blocks.push({ text: '', size: 11 })
  blocks.push({ text: 'Executive Summary', size: 16 })
  if (report?.executiveSummary) {
    blocks.push({ text: report.executiveSummary, size: 11 })
  } else {
    blocks.push({ text: 'No executive summary provided.', size: 11 })
  }
  blocks.push({ text: '', size: 11 })
  blocks.push({ text: 'Client Summaries', size: 14 })
  if (Array.isArray(report?.reports) && report.reports.length > 0) {
    // Table header
    blocks.push({ row: ['Client', 'Hours', 'Amount'], header: true, size: 11 })
    report.reports.forEach((r: any, idx: number) => {
      const client = r.client || `Client ${idx+1}`
      const hours = r.totals?.hours != null ? fmtHours(r.totals.hours) : '—'
      const amount = r.totals?.amount != null ? fmtCurrency(r.totals.amount) : '—'
      blocks.push({ row: [client, String(hours), `$${amount}`], size: 11 })
      if (Array.isArray(r.highlights) && r.highlights.length > 0) {
        // Add a small highlights line below as plain text
        blocks.push({ text: `• ${r.highlights.slice(0,3).join(' • ')}`, size: 10 })
      }
    })
  } else {
    blocks.push({ text: 'No client breakdown provided.', size: 11 })
  }
  if (Array.isArray(report?.reports)) {
    const totalHours = fmtHours(report.reports.reduce((sum: number, r: any) => sum + (r.totals?.hours || 0), 0))
    const totalAmount = fmtCurrency(report.reports.reduce((sum: number, r: any) => sum + (r.totals?.amount || 0), 0))
    blocks.push({ text: 'Totals', size: 14 })
    blocks.push({ text: `Total Hours: ${totalHours}`, size: 11 })
    blocks.push({ text: `Total Amount: $${totalAmount}`, size: 11 })
  }

  const pdf = generatePDFMultiPage(
    title,
    blocks,
    includeCover ? { company: branding.companyName, period } : undefined,
    { repeatHeader, rowStriping: options?.rowStriping !== false }
  )
  return new NextResponse(pdf as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="weekly-report.pdf"'
    }
  })
}
