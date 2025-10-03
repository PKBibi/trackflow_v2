import { rateLimitPerUser } from '@/lib/validation/middleware'
import { requireTeamRole } from '@/lib/auth/team'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'

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
    const { email, role = 'member', sendEmail: shouldSendEmail = true } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user is admin or owner
    const { data: currentUserMember } = await supabase
      .from('team_members')
      .select('role, team_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!currentUserMember || !['owner', 'admin'].includes(currentUserMember.role)) {
      return NextResponse.json({ error: 'Insufficient permissions to invite members' }, { status: 403 })
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('email', email)
      .eq('team_id', currentUserMember.team_id)
      .single()

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a team member' }, { status: 400 })
    }

    // Check for existing pending invitation
    const { data: existingInvite } = await supabase
      .from('team_invitations')
      .select('id')
      .eq('email', email)
      .eq('team_id', currentUserMember.team_id)
      .gte('expires_at', new Date().toISOString())
      .is('accepted_at', null)
      .single()

    if (existingInvite) {
      return NextResponse.json({ error: 'An invitation has already been sent to this email' }, { status: 400 })
    }

    // Check team member limits based on plan
    const { count: memberCount } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', currentUserMember.team_id)

    // Get user's plan
    const planResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/me/plan`, {
      headers: {
        'Cookie': request.headers.get('cookie') || ''
      }
    })
    const planData = await planResponse.json()
    const plan = planData.plan || 'free'

    const memberLimit = plan === 'enterprise' ? 999 : plan === 'pro' ? 10 : 3
    if ((memberCount || 0) >= memberLimit) {
      return NextResponse.json({ 
        error: `Team member limit reached. Upgrade to ${plan === 'free' ? 'Pro' : 'Enterprise'} for more members.`,
        limit: memberLimit,
        current: memberCount
      }, { status: 400 })
    }

    // Create invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('team_invitations')
      .insert({
        team_id: currentUserMember.team_id,
        email,
        role,
        invited_by: user.id
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Error creating invitation:', inviteError)
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })
    }

    // Send invitation email if requested
    if (shouldSendEmail && process.env.RESEND_API_KEY) {
      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/team/join?token=${invitation.token}`

      try {
        await sendEmail({
          from: 'TrackFlow <team@track-flow.app>',
          to: email,
          subject: 'You\'ve been invited to join a team on TrackFlow',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333; margin-bottom: 20px;">Team Invitation</h2>
              <p style="color: #666; line-height: 1.6;">
                You've been invited to join a team on TrackFlow as a ${role}.
              </p>
              <p style="color: #666; line-height: 1.6;">
                Click the button below to accept the invitation:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                  Accept Invitation
                </a>
              </div>
              <p style="color: #999; font-size: 14px; line-height: 1.6;">
                This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                TrackFlow - Time Tracking for Digital Marketing Teams
              </p>
            </div>
          `
        })
      } catch (emailError) {
        console.error('Error sending invitation email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ 
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expires_at: invitation.expires_at,
        token: invitation.token
      }
    })
  } catch (error) {
    console.error('Error in POST /api/team/invite:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get pending invitations
export async function GET(request: NextRequest) {
  await rateLimitPerUser()
  const roleCtx = await requireTeamRole(request as any, 'admin')
  if (!('ok' in roleCtx) || !roleCtx.ok) return (roleCtx as any).response

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user's team
    const { data: currentUserMember } = await supabase
      .from('team_members')
      .select('role, team_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!currentUserMember || !['owner', 'admin'].includes(currentUserMember.role)) {
      return NextResponse.json({ invitations: [] })
    }

    // Get pending invitations
    const { data: invitations, error } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('team_id', currentUserMember.team_id)
      .gte('expires_at', new Date().toISOString())
      .is('accepted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invitations:', error)
      return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 })
    }

    return NextResponse.json({ invitations: invitations || [] })
  } catch (error) {
    console.error('Error in GET /api/team/invite:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
