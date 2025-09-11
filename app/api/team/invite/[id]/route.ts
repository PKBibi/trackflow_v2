import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if user is admin or owner
    const { data: currentUserMember } = await supabase
      .from('team_members')
      .select('role, team_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!currentUserMember || !['owner', 'admin'].includes(currentUserMember.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Delete the invitation
    const { error } = await supabase
      .from('team_invitations')
      .delete()
      .eq('id', params.id)
      .eq('team_id', currentUserMember.team_id)

    if (error) {
      console.error('Error deleting invitation:', error)
      return NextResponse.json({ error: 'Failed to cancel invitation' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/team/invite/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Resend invitation endpoint
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if user is admin or owner
    const { data: currentUserMember } = await supabase
      .from('team_members')
      .select('role, team_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!currentUserMember || !['owner', 'admin'].includes(currentUserMember.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Update expiration date to 7 days from now
    const { data: invitation, error } = await supabase
      .from('team_invitations')
      .update({
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('team_id', currentUserMember.team_id)
      .select()
      .single()

    if (error) {
      console.error('Error resending invitation:', error)
      return NextResponse.json({ error: 'Failed to resend invitation' }, { status: 500 })
    }

    // TODO: Send email with new invitation link
    // This would use Resend or another email service

    return NextResponse.json({ success: true, invitation })
  } catch (error) {
    console.error('Error in POST /api/team/invite/[id]/resend:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}