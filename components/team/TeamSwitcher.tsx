"use client";
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getActiveTeamId, setActiveTeamId } from '@/lib/api/team-client'

export default function TeamSwitcher({ onChange }: { onChange?: (teamId: string) => void }) {
  const [teamId, setTeamId] = useState('')

  useEffect(() => {
    const current = getActiveTeamId()
    if (current) setTeamId(current)
  }, [])

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="team-id">Team</Label>
      <Input
        id="team-id"
        placeholder="Enter team ID"
        value={teamId}
        onChange={(e) => setTeamId(e.target.value)}
        onBlur={() => {
          if (teamId) {
            setActiveTeamId(teamId)
            onChange?.(teamId)
          }
        }}
      />
    </div>
  )
}