import { log } from '@/lib/logger';
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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      throw new HttpError(401, 'Unauthorized')
    }

    const { action, status } = await request.json()
    const supabase = createAdminClient()

    if (action === 'update-status') {
      if (!['active', 'inactive'].includes(status)) {
        throw new HttpError(400, 'Invalid status value')
      }

      const { data, error } = await supabase
        .from('api_keys')
        .update({ status })
        .eq('user_id', user.id)
        .eq('id', params.id)
        .select(
          'id, name, prefix, created_at, updated_at, last_used, expires_at, status, permissions, rate_limit, usage_count',
        )
        .single()

      if (error) {
        throw error
      }

      return NextResponse.json({ data: sanitizeRow(data) })
    }

    if (action === 'regenerate') {
      const apiKey = generateApiKey()
      const prefix = apiKey.slice(0, 7)
      const hashedKey = hashApiKey(apiKey)

      const { data, error } = await supabase
        .from('api_keys')
        .update({
          key_hash: hashedKey,
          prefix,
          status: 'active',
          created_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('id', params.id)
        .select(
          'id, name, prefix, created_at, updated_at, last_used, expires_at, status, permissions, rate_limit, usage_count',
        )
        .single()

      if (error) {
        throw error
      }

      return NextResponse.json({ data: sanitizeRow(data), key: apiKey })
    }

    throw new HttpError(400, 'Unsupported action')
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    log.error('Failed to update API key:', error)
    return NextResponse.json({ error: 'Failed to update API key' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      throw new HttpError(401, 'Unauthorized')
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('user_id', user.id)
      .eq('id', params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    log.error('Failed to delete API key:', error)
    return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 })
  }
}
