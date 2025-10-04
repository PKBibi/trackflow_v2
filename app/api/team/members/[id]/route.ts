import { log } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { role, permissions, status } = body

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

    // Update the team member
    const { data, error } = await supabase
      .from('team_members')
      .update({
        role: role || undefined,
        permissions: permissions || undefined,
        status: status || undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('team_id', currentUserMember.team_id)
      .select()
      .single()

    if (error) {
      log.error('Error updating team member:', error)
      return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 })
    }

    return NextResponse.json({ member: data })
  } catch (error) {
    log.error('Error in PUT /api/team/members/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    // Prevent deleting the owner
    const { data: targetMember } = await supabase
      .from('team_members')
      .select('role')
      .eq('id', params.id)
      .single()

    if (targetMember?.role === 'owner') {
      return NextResponse.json({ error: 'Cannot remove team owner' }, { status: 400 })
    }

    // Delete the team member
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', params.id)
      .eq('team_id', currentUserMember.team_id)

    if (error) {
      log.error('Error deleting team member:', error)
      return NextResponse.json({ error: 'Failed to remove team member' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    log.error('Error in DELETE /api/team/members/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}