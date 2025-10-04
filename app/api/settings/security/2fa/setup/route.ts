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

    const setup = await twoFactorAuth.setupTwoFactor(user.id, user.email || 'user')

    return NextResponse.json({
      data: {
        qrCode: setup.qrCode,
        secret: setup.secret,
        backupCodes: setup.backupCodes,
      },
    })
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    log.error('Failed to start 2FA setup:', error)
    return NextResponse.json({ error: 'Failed to start 2FA setup' }, { status: 500 })
  }
}
