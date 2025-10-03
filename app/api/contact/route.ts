import { createClient } from '@/lib/supabase/server'
import { rateLimitPerUser } from '@/lib/validation/middleware'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  await rateLimitPerUser()
  try {
    const body = await request.json().catch(() => null)
    if (!body || !body.name || !body.email || !body.message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // TODO: integrate with email service / ticketing
    // Store contact submission for processing

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to submit contact' }, { status: 500 })
  }
}


