import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { HttpError } from '@/lib/errors'

export type WebhookEvent =
  | 'time_entry.created'
  | 'time_entry.updated'
  | 'time_entry.deleted'
  | 'client.created'
  | 'client.updated'
  | 'client.deleted'
  | 'project.created'
  | 'project.updated'
  | 'project.deleted'
  | 'invoice.created'
  | 'invoice.paid'
  | 'user.updated'

export interface WebhookPayload {
  event: WebhookEvent
  data: Record<string, any>
  timestamp: string
}

export interface WebhookSubscription {
  id: string
  url: string
  events: string[]
  active: boolean
  created_at: string
  updated_at: string
  last_failure_at: string | null
  failure_count: number
  secret_preview: string
}

const ENCRYPTION_KEY = crypto
  .createHash('sha256')
  .update(process.env.WEBHOOK_SECRET_KEY ?? '')
  .digest()

if (!process.env.WEBHOOK_SECRET_KEY) {
  console.warn(
    'WEBHOOK_SECRET_KEY environment variable is not set. Webhook secrets cannot be persisted securely.',
  )
}

function assertEncryptionKey() {
  if (!process.env.WEBHOOK_SECRET_KEY) {
    throw new Error('WEBHOOK_SECRET_KEY environment variable is required for webhook management')
  }
  return ENCRYPTION_KEY
}

function encryptSecret(secret: string) {
  const key = assertEncryptionKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, encrypted]).toString('base64')
}

function decryptSecret(ciphertext: string) {
  const key = assertEncryptionKey()
  const buffer = Buffer.from(ciphertext, 'base64')
  const iv = buffer.subarray(0, 12)
  const authTag = buffer.subarray(12, 28)
  const encrypted = buffer.subarray(28)
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString('utf8')
}

export function verifyWebhookSignature(payload: any, signature: string, secret: string) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex')

  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
}

export async function listWebhookSubscriptions(userId: string): Promise<WebhookSubscription[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('webhook_subscriptions')
    .select(
      'id, url, events, active, created_at, updated_at, last_failure_at, failure_count, secret_preview',
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function createWebhookSubscription(
  userId: string,
  url: string,
  events: string[],
) {
  if (!events?.length) {
    throw new HttpError(400, 'At least one event must be specified')
  }

  const supabase = createAdminClient()
  const secret = `wh_${crypto.randomBytes(24).toString('hex')}`
  const secretPreview = secret.slice(0, 6)
  const ciphertext = encryptSecret(secret)

  const { data, error } = await supabase
    .from('webhook_subscriptions')
    .insert({
      user_id: userId,
      url,
      events,
      secret_ciphertext: ciphertext,
      secret_preview: secretPreview,
    })
    .select(
      'id, url, events, active, created_at, updated_at, last_failure_at, failure_count, secret_preview',
    )
    .single()

  if (error) {
    throw error
  }

  return { subscription: data as WebhookSubscription, secret }
}

export async function deleteWebhookSubscription(userId: string, subscriptionId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('webhook_subscriptions')
    .delete()
    .eq('user_id', userId)
    .eq('id', subscriptionId)

  if (error) {
    throw error
  }
}

export async function resolveSubscriptionSecret(subscriptionId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('webhook_subscriptions')
    .select('secret_ciphertext')
    .eq('id', subscriptionId)
    .single()

  if (error || !data) {
    throw new HttpError(404, 'Webhook subscription not found')
  }

  return decryptSecret(data.secret_ciphertext)
}

export async function sendWebhookEvent(
  userId: string,
  event: WebhookEvent,
  data: Record<string, any>,
) {
  const supabase = createAdminClient()
  const { data: subscriptions, error } = await supabase
    .from('webhook_subscriptions')
    .select('id, url, events, secret_ciphertext, active, failure_count')
    .eq('user_id', userId)
    .eq('active', true)

  if (error) {
    throw error
  }

  const payload: WebhookPayload = {
    event,
    data,
    timestamp: new Date().toISOString(),
  }

  await Promise.all(
    (subscriptions ?? [])
      .filter(sub => sub.events.includes(event))
      .map(async sub => {
        const secret = decryptSecret(sub.secret_ciphertext)
        const signature = crypto
          .createHmac('sha256', secret)
          .update(JSON.stringify(payload))
          .digest('hex')

        const attemptStartedAt = Date.now()

        try {
          const response = await fetch(sub.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Event': event,
              'X-Webhook-Signature': signature,
              'X-Webhook-Timestamp': payload.timestamp,
              'X-Webhook-Id': sub.id,
            },
            body: JSON.stringify(payload),
          })

          const durationMs = Date.now() - attemptStartedAt
          let responseBody: string | null = null
          try {
            responseBody = await response.text()
          } catch {
            responseBody = null
          }

          await supabase
            .from('webhook_delivery_logs')
            .insert({
              subscription_id: sub.id,
              status: response.ok ? 'success' : 'failure',
              response_status: response.status,
              response_body: responseBody ? responseBody.slice(0, 2000) : null,
              duration_ms: durationMs,
            })

          if (!response.ok) {
            await supabase
              .from('webhook_subscriptions')
              .update({
                last_failure_at: new Date().toISOString(),
                failure_count: ((sub as any).failure_count ?? 0) + 1,
              })
              .eq('id', sub.id)
          }
        } catch (err) {
          console.error('Webhook delivery failed', err)
          const durationMs = Date.now() - attemptStartedAt

          await Promise.all([
            supabase
              .from('webhook_delivery_logs')
              .insert({
                subscription_id: sub.id,
                status: 'failure',
                error_message: err instanceof Error ? err.message : 'Unknown error',
                duration_ms: durationMs,
              }),
            supabase
              .from('webhook_subscriptions')
              .update({
                last_failure_at: new Date().toISOString(),
                failure_count: ((sub as any).failure_count ?? 0) + 1,
              })
              .eq('id', sub.id),
          ])
        }
      }),
  )
}

export async function verifyIncomingWebhook(
  subscriptionId: string,
  payload: any,
  signature: string,
) {
  const secret = await resolveSubscriptionSecret(subscriptionId)
  return verifyWebhookSignature(payload, signature, secret)
}
