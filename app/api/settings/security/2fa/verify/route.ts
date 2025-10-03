import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { twoFactorAuth } from '@/lib/auth/two-factor'
import { HttpError } from '@/lib/errors'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token || typeof token !== 'string') {
      throw new HttpError(400, 'Verification code is required')
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new HttpError(401, 'Unauthorized')
    }

    const enabled = await twoFactorAuth.enableTwoFactor(user.id, user.email || 'user', token)

    if (!enabled) {
      throw new HttpError(400, 'Invalid verification code')
    }

    const status = await twoFactorAuth.getStatus(user.id)

    return NextResponse.json({ success: true, status })
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('Failed to verify 2FA code:', error)
    return NextResponse.json({ error: 'Failed to verify 2FA code' }, { status: 500 })
  }
}
