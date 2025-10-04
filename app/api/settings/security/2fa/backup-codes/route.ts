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

    const codes = await twoFactorAuth.regenerateBackupCodes(user.id, user.email || 'user')
    const status = await twoFactorAuth.getStatus(user.id)

    return NextResponse.json({ backupCodes: codes, status })
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    log.error('Failed to regenerate backup codes:', error)
    return NextResponse.json({ error: 'Failed to regenerate backup codes' }, { status: 500 })
  }
}
