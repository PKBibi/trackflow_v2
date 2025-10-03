export async function fetchWithTeam(input: RequestInfo | URL, init: RequestInit = {}) {
  try {
    const teamId = typeof window !== 'undefined' ? localStorage.getItem('tf.active_team_id') : undefined
    const headers = new Headers(init.headers || {})
    if (teamId && !headers.has('X-Team-Id')) headers.set('X-Team-Id', teamId)
    return fetch(input, { ...init, headers })
  } catch {
    return fetch(input, init)
  }
}