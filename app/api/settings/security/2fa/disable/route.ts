import { log } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { twoFactorAuth } from '@/lib/auth/two-factor'
import { HttpError } from '@/lib/errors'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new HttpError(401, 'Unauthorized')
    }

    const disabled = await twoFactorAuth.disableTwoFactor(user.id, user.email || 'user')

    if (!disabled) {
      throw new HttpError(400, 'Failed to disable two-factor authentication')
    }

    const status = await twoFactorAuth.getStatus(user.id)

    return NextResponse.json({ success: true, status })
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    log.error('Failed to disable 2FA:', error)
    return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 })
  }
}
