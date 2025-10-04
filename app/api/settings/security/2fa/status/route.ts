import { log } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { twoFactorAuth } from '@/lib/auth/two-factor'
import { HttpError } from '@/lib/errors'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new HttpError(401, 'Unauthorized')
    }

    const status = await twoFactorAuth.getStatus(user.id)
    return NextResponse.json({ data: status })
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    log.error('Failed to load 2FA status:', error)
    return NextResponse.json({ error: 'Failed to load 2FA status' }, { status: 500 })
  }
}
