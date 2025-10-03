import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export type TeamRole = 'owner' | 'admin' | 'member'

const ROLE_RANK: Record<TeamRole, number> = { owner: 3, admin: 2, member: 1 }

export async function getActiveTeam(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const requestedTeamId = req.headers.get('x-team-id') || undefined

  const { data: memberships, error } = await supabase
    .from('teams_users')
    .select('team_id, role')
    .eq('user_id', user.id)

  if (error) return { ok: false as const, response: NextResponse.json({ error: 'Team lookup failed' }, { status: 500 }) }
  if (!memberships || memberships.length === 0) {
    return { ok: false as const, response: NextResponse.json({ error: 'No team membership' }, { status: 403 }) }
  }

  let teamId = memberships[0].team_id as string
  let role = (memberships[0].role || 'member') as TeamRole
  if (requestedTeamId) {
    const found = memberships.find((m) => m.team_id === requestedTeamId)
    if (!found) return { ok: false as const, response: NextResponse.json({ error: 'Forbidden team' }, { status: 403 }) }
    teamId = found.team_id as string
    role = (found.role || 'member') as TeamRole
  }

  return { ok: true as const, user, teamId, role }
}

export async function requireTeamRole(req: NextRequest, minRole: TeamRole) {
  const ctx = await getActiveTeam(req)
  if (!ctx.ok) return ctx
  if (ROLE_RANK[ctx.role] < ROLE_RANK[minRole]) {
    return { ok: false as const, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return ctx
}