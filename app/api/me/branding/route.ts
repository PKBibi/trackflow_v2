import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ branding: null, stored: false })

    // Attempt to read from a user_preferences table if it exists
    const { data, error } = await supabase
      .from('user_preferences')
      .select('branding_company, branding_logo_url, branding_contact_email, locale, currency_code, pdf_include_cover, pdf_repeat_header, pdf_row_striping, default_report_period')
      .eq('user_id', user.id)
      .single()

    if (error || !data) return NextResponse.json({ branding: null, stored: false })

    return NextResponse.json({
      branding: {
        companyName: data.branding_company || '',
        logoUrl: data.branding_logo_url || '',
        contactEmail: data.branding_contact_email || ''
      },
      prefs: {
        locale: data.locale || '',
        currency: data.currency_code || '',
        includeCover: data.pdf_include_cover !== false,
        repeatHeader: data.pdf_repeat_header !== false,
        rowStriping: data.pdf_row_striping !== false,
        defaultPeriod: data.default_report_period || ''
      },
      stored: true
    })
  } catch (e) {
    return NextResponse.json({ branding: null, stored: false })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json()
    const branding = body?.branding || {}
    const prefs = body?.prefs || {}

    const payload = {
      user_id: user.id,
      branding_company: branding.companyName || null,
      branding_logo_url: branding.logoUrl || null,
      branding_contact_email: branding.contactEmail || null,
      locale: prefs.locale || null,
      currency_code: prefs.currency || null,
      pdf_include_cover: (prefs.includeCover === undefined ? true : !!prefs.includeCover),
      pdf_repeat_header: (prefs.repeatHeader === undefined ? true : !!prefs.repeatHeader),
      pdf_row_striping: (prefs.rowStriping === undefined ? true : !!prefs.rowStriping),
      default_report_period: prefs.defaultPeriod || null
    }

    const { error } = await supabase
      .from('user_preferences')
      .upsert(payload, { onConflict: 'user_id' })

    if (error) {
      return NextResponse.json({ error: 'Storage not available', details: error.message }, { status: 501 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to save branding' }, { status: 500 })
  }
}
