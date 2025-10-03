import { NextRequest } from 'next/server'
import { createHash } from 'crypto'
import { createClient } from '@/lib/supabase/server'

interface AuthenticatedUser {
  id: string
  email?: string | null
}

export function hashApiKey(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}

function extractBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization') || req.headers.get('Authorization')
  if (!auth) return null
  const parts = auth.split(' ')
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1]
  }
  // Also support X-API-Key header for convenience
  const xKey = req.headers.get('x-api-key') || req.headers.get('X-API-Key')
  return xKey || null
}

// Try API key auth first; fall back to Supabase session auth
export async function getAuthenticatedUser(req: NextRequest): Promise<AuthenticatedUser | null> {
  // Attempt API key authentication
  const token = extractBearerToken(req)
  const supabase = await createClient()

  if (token) {
    try {
      const hash = hashApiKey(token)
      const { data: apiKey, error } = await supabase
        .from('api_keys')
        .select('user_id, status, expires_at')
        .eq('key_hash', hash)
        .single()

      if (!error && apiKey && apiKey.status === 'active') {
        if (apiKey.expires_at && new Date(apiKey.expires_at).getTime() < Date.now()) {
          // expired
        } else if (apiKey.user_id) {
          return { id: apiKey.user_id }
        }
      }
    } catch (_) {
      // Ignore API key errors and fall back to session auth
    }
  }

  // Fall back to Supabase session
  const { data: { user } } = await supabase.auth.getUser()
  if (user && user.id) {
    return { id: user.id, email: user.email }
  }
  return null
}
