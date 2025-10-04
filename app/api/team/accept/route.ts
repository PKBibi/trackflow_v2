import { log } from '@/lib/logger';
import { rateLimitPerUser } from '@/lib/validation/middleware'
import { requireTeamRole } from '@/lib/auth/team'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  await rateLimitPerUser()
  const roleCtx = await requireTeamRole(request as any, 'admin')
  if (!('ok' in roleCtx) || !roleCtx.ok) return (roleCtx as any).response

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'Invitation token is required' }, { status: 400 })
    }

    // Call the database function to accept the invitation
    const { data, error } = await supabase
      .rpc('accept_team_invitation', { invitation_token: token })

    if (error) {
      log.error('Error accepting invitation:', error)
      return NextResponse.json({ 
        error: error.message || 'Failed to accept invitation' 
      }, { status: 400 })
    }

    if (!data?.success) {
      return NextResponse.json({ 
        error: data?.error || 'Failed to accept invitation' 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true,
      member_id: data.member_id,
      team_id: data.team_id
    })
  } catch (error) {
    log.error('Error in POST /api/team/accept:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
