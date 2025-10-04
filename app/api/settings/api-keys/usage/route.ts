import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/api-key'
import { createAdminClient } from '@/lib/supabase/admin'
import { HttpError } from '@/lib/errors'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      throw new HttpError(401, 'Unauthorized')
    }

    const supabase = createAdminClient()
    const since = new Date()
    since.setDate(since.getDate() - 30)

    const { data, error } = await supabase
      .from('api_usage')
      .select('date, requests, errors, latency')
      .eq('user_id', user.id)
      .gte('date', since.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ data: data ?? [] })
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('Failed to load API usage:', error)
    return NextResponse.json({ error: 'Failed to load API usage' }, { status: 500 })
  }
}
