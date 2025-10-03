import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAuthenticatedUser } from '@/lib/auth/api-key'
import { HttpError } from '@/lib/errors'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      throw new HttpError(401, 'Unauthorized')
    }

    const searchParams = request.nextUrl.searchParams
    const schema = z.object({
      subscriptionId: z.string().uuid().optional(),
      limit: z.coerce.number().int().min(1).max(100).default(50),
    })
    const params = schema.parse({
      subscriptionId: searchParams.get('subscriptionId') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    })

    const supabase = createAdminClient()

    const subscriptionQuery = supabase
      .from('webhook_subscriptions')
      .select('id')
      .eq('user_id', user.id)

    if (params.subscriptionId) {
      subscriptionQuery.eq('id', params.subscriptionId)
    }

    const { data: subscriptions, error: subscriptionError } = await subscriptionQuery

    if (subscriptionError) {
      throw subscriptionError
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ data: [] })
    }

    const subscriptionIds = subscriptions.map(sub => sub.id)

    const { data, error } = await supabase
      .from('webhook_delivery_logs')
      .select('id, subscription_id, status, response_status, response_body, error_message, duration_ms, attempted_at')
      .in('subscription_id', subscriptionIds)
      .order('attempted_at', { ascending: false })
      .limit(params.limit)

    if (error) {
      throw error
    }

    return NextResponse.json({ data: data ?? [] })
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid parameters', details: error.issues }, { status: 400 })
    }

    console.error('Failed to fetch webhook logs:', error)
    return NextResponse.json({ error: 'Failed to fetch webhook logs' }, { status: 500 })
  }
}
