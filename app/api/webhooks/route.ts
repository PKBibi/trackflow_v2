import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import {
  createWebhookSubscription,
  deleteWebhookSubscription,
  listWebhookSubscriptions,
  verifyIncomingWebhook,
  type WebhookPayload,
} from '@/lib/webhooks'
import { getAuthenticatedUser } from '@/lib/auth/api-key'
import { HttpError } from '@/lib/errors'
import { log } from '@/lib/logger'

async function requireAuth(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    throw new HttpError(401, 'Unauthorized')
  }
  return user
}

// Receive webhook events from third parties
export async function POST(request: NextRequest) {
  let payload: any = null

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const subscriptionId =
    request.headers.get('x-webhook-id') ?? request.nextUrl.searchParams.get('subscriptionId')
  const signature = request.headers.get('x-webhook-signature')

  if (!subscriptionId || !signature) {
    return NextResponse.json(
      { error: 'Missing webhook identification headers' },
      { status: 400 },
    )
  }

  try {
    const verified = await verifyIncomingWebhook(subscriptionId, payload, signature)
    if (!verified) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
    }

    const { event, data } = payload as WebhookPayload

    switch (event) {
      case 'time_entry.created':
        await handleTimeEntryCreated(data)
        break
      case 'time_entry.updated':
        await handleTimeEntryUpdated(data)
        break
      case 'client.created':
        await handleClientCreated(data)
        break
      case 'invoice.created':
        await handleInvoiceCreated(data)
        break
      case 'invoice.paid':
        await handleInvoicePaid(data)
        break
      default:
        log.info('Unhandled webhook event', { event, subscriptionId })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    log.apiError('webhooks/process', error, { subscriptionId })
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 })
  }
}

// List webhook subscriptions for authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const subscriptions = await listWebhookSubscriptions(user.id)

    return NextResponse.json({ data: subscriptions, total: subscriptions.length })
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    log.apiError('webhooks/subscriptions/fetch', error)
    return NextResponse.json({ error: 'Failed to fetch webhook subscriptions' }, { status: 500 })
  }
}

// Register a new webhook subscription
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const schema = z.object({
      url: z.string().url(),
      events: z.array(z.string()).min(1).max(20),
    })

    const { url, events } = schema.parse(await request.json())

    const { subscription, secret } = await createWebhookSubscription(user.id, url, events)

    return NextResponse.json(
      {
        data: subscription,
        secret,
        message: 'Webhook subscription created successfully',
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid payload', details: error.issues }, { status: 400 })
    }

    log.apiError('webhooks/subscriptions/create', error)
    return NextResponse.json({ error: 'Failed to create webhook subscription' }, { status: 500 })
  }
}

// Remove webhook subscription
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const schema = z.object({ id: z.string().uuid('Invalid subscription ID') })
    const { id } = schema.parse(await request.json())

    await deleteWebhookSubscription(user.id, id)

    return NextResponse.json({ message: 'Webhook subscription removed successfully' })
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid payload', details: error.issues }, { status: 400 })
    }

    log.apiError('webhooks/subscriptions/remove', error)
    return NextResponse.json({ error: 'Failed to remove webhook subscription' }, { status: 500 })
  }
}

async function handleTimeEntryCreated(data: any) {
  log.info('Webhook time_entry.created received', { data })
}

async function handleTimeEntryUpdated(data: any) {
  log.info('Webhook time_entry.updated received', { data })
}

async function handleClientCreated(data: any) {
  log.info('Webhook client.created received', { data })
}

async function handleInvoiceCreated(data: any) {
  log.info('Webhook invoice.created received', { data })
}

async function handleInvoicePaid(data: any) {
  log.info('Webhook invoice.paid received', { data })
}
