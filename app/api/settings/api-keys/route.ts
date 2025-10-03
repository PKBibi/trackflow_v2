import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getAuthenticatedUser, hashApiKey } from '@/lib/auth/api-key'
import { createAdminClient } from '@/lib/supabase/admin'
import { HttpError } from '@/lib/errors'

function maskKey(prefix: string) {
  return `${prefix}******`
}

function generateApiKey() {
  return `tf_${crypto.randomBytes(24).toString('hex')}`
}

function sanitizeRow(row: any) {
  return {
    id: row.id,
    name: row.name,
    key: maskKey(row.prefix),
    prefix: row.prefix,
    created_at: row.created_at,
    updated_at: row.updated_at,
    last_used: row.last_used,
    expires_at: row.expires_at,
    status: row.status,
    permissions: row.permissions ?? [],
    rate_limit: row.rate_limit,
    usage_count: row.usage_count ?? 0,
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      throw new HttpError(401, 'Unauthorized')
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('api_keys')
      .select(
        'id, name, prefix, created_at, updated_at, last_used, expires_at, status, permissions, rate_limit, usage_count',
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    const response = (data || []).map(sanitizeRow)
    return NextResponse.json({ data: response })
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('Failed to list API keys:', error)
    return NextResponse.json({ error: 'Failed to load API keys' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      throw new HttpError(401, 'Unauthorized')
    }

    const { name, expiresInDays, permissions, rateLimit } = await request.json()

    if (!name || typeof name !== 'string') {
      throw new HttpError(400, 'Key name is required')
    }

    const apiKey = generateApiKey()
    const prefix = apiKey.slice(0, 7)
    const hashedKey = hashApiKey(apiKey)

    let expiresAt: string | null = null
    if (typeof expiresInDays === 'number' && Number.isFinite(expiresInDays)) {
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + expiresInDays)
      expiresAt = expiry.toISOString()
    }

    const normalizedPermissions = Array.isArray(permissions) && permissions.length > 0
      ? Array.from(new Set(permissions))
      : ['read']

    const normalizedRateLimit = typeof rateLimit === 'number' && Number.isFinite(rateLimit)
      ? rateLimit
      : null

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        name,
        key_hash: hashedKey,
        prefix,
        permissions: normalizedPermissions,
        rate_limit: normalizedRateLimit,
        expires_at: expiresAt,
        status: 'active',
      })
      .select(
        'id, name, prefix, created_at, updated_at, last_used, expires_at, status, permissions, rate_limit, usage_count',
      )
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ data: sanitizeRow(data), key: apiKey }, { status: 201 })
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('Failed to create API key:', error)
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 })
  }
}
