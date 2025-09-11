import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const scheduledExportId = searchParams.get('scheduled_export_id')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('export_history')
      .select(`
        *,
        scheduled_exports:scheduled_export_id (
          name,
          format,
          data_type
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (scheduledExportId) {
      query = query.eq('scheduled_export_id', scheduledExportId)
    }

    const { data: history, error } = await query

    if (error) {
      throw new Error(`Failed to fetch export history: ${error.message}`)
    }

    return NextResponse.json({ 
      history: history || [],
      total: history?.length || 0
    })
  } catch (error) {
    console.error('Export history fetch error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch export history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}