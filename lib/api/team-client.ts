export function getActiveTeamId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('tf.active_team_id');
  } catch {
    return null;
  }
}

export function setActiveTeamId(teamId: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('tf.active_team_id', teamId);
  } catch {}
}