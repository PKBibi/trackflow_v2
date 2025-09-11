import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user's team membership first to find their team_id
    const { data: userMembership, error: memberError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (memberError || !userMembership) {
      // User is not part of any team, return empty array
      return NextResponse.json({ members: [], total: 0 })
    }

    // Get all team members for the user's team
    const { data: members, error } = await supabase
      .from('team_members')
      .select(`
        id,
        user_id,
        email,
        role,
        status,
        permissions,
        joined_at,
        last_active,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .eq('team_id', userMembership.team_id)
      .order('joined_at', { ascending: true })

    if (error) {
      console.error('Error fetching team members:', error)
      return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
    }

    // Format the response
    const formattedMembers = members?.map(member => ({
      id: member.id,
      user_id: member.user_id,
      email: member.email,
      name: member.profiles?.full_name || member.email.split('@')[0],
      avatar: member.profiles?.avatar_url || '',
      role: member.role,
      status: member.status,
      permissions: member.permissions || [],
      joinedAt: member.joined_at,
      lastActive: member.last_active
    })) || []

    return NextResponse.json({ 
      members: formattedMembers,
      total: formattedMembers.length,
      team_id: userMembership.team_id
    })
  } catch (error) {
    console.error('Error in GET /api/team/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}