import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  verifyWebhookSignature,
  webhookSubscriptions,
  testWebhook,
  type WebhookPayload
} from '@/lib/webhooks';
import { log } from '@/lib/logger';

// POST /api/webhooks - Receive webhook (for testing incoming webhooks)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify webhook signature if provided
    const signature = request.headers.get('x-webhook-signature');
    const webhookSecret = request.headers.get('x-webhook-secret');
    
    if (signature && webhookSecret) {
      const isValid = verifyWebhookSignature(body, signature, webhookSecret);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        );
      }
    }
    
    // Process webhook based on event type
    const { event, data } = body as WebhookPayload;
    
    // Process webhook event
    
    // Handle different event types
    switch (event) {
      case 'time_entry.created':
        await handleTimeEntryCreated(data);
        break;
      case 'time_entry.updated':
        await handleTimeEntryUpdated(data);
        break;
      case 'client.created':
        await handleClientCreated(data);
        break;
      case 'invoice.created':
        await handleInvoiceCreated(data);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(data);
        break;
      default:
        // Unhandled webhook event type
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: `Webhook ${event} processed successfully`
    });
  } catch (error) {
    log.apiError('webhooks/process', error, { webhook: body });
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// GET /api/webhooks - List webhook subscriptions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    
    let subscriptions = [...webhookSubscriptions];
    
    if (active !== null) {
      subscriptions = subscriptions.filter(sub => 
        sub.active === (active === 'true')
      );
    }
    
    return NextResponse.json({
      data: subscriptions,
      total: subscriptions.length
    });
  } catch (error) {
    log.apiError('webhooks/subscriptions/fetch', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhook subscriptions' },
      { status: 500 }
    );
  }
}

// PUT /api/webhooks - Register a new webhook subscription
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.url || !body.events || !Array.isArray(body.events)) {
      return NextResponse.json(
        { error: 'Missing required fields: url and events array' },
        { status: 400 }
      );
    }
    
    // Validate URL
    try {
      new URL(body.url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid webhook URL' },
        { status: 400 }
      );
    }
    
    // Generate secret for webhook signature
    const secret = crypto.randomBytes(32).toString('hex');
    
    // Create new subscription
    const newSubscription = {
      id: Date.now().toString(),
      url: body.url,
      events: body.events,
      secret,
      active: true,
      createdAt: new Date().toISOString()
    };
    
    webhookSubscriptions.push(newSubscription);
    
    // Test webhook with a ping event
    const testResult = await testWebhook(newSubscription.url, secret);
    
    return NextResponse.json({
      data: newSubscription,
      message: 'Webhook subscription created successfully',
      testResult
    }, { status: 201 });
  } catch (error) {
    log.apiError('webhooks/subscriptions/create', error, { url: body.url, events: body.events });
    return NextResponse.json(
      { error: 'Failed to create webhook subscription' },
      { status: 500 }
    );
  }
}

// DELETE /api/webhooks - Remove webhook subscription
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing subscription ID' },
        { status: 400 }
      );
    }
    
    const index = webhookSubscriptions.findIndex(sub => sub.id === id);
    if (index !== -1) {
      webhookSubscriptions.splice(index, 1);
    }
    
    return NextResponse.json({
      message: 'Webhook subscription removed successfully'
    });
  } catch (error) {
    log.apiError('webhooks/subscriptions/remove', error, { subscriptionId: params.id });
    return NextResponse.json(
      { error: 'Failed to remove webhook subscription' },
      { status: 500 }
    );
  }
}

// Event handlers
async function handleTimeEntryCreated(data: any) {
  // Process time entry creation
  // Process time entry creation
  // Add your business logic here
}

async function handleTimeEntryUpdated(data: any) {
  // Process time entry update
  // Process time entry update
  // Add your business logic here
}

async function handleClientCreated(data: any) {
  // Process client creation
  // Process client creation
  // Add your business logic here
}

async function handleInvoiceCreated(data: any) {
  // Process invoice creation
  // Process invoice creation
  // Add your business logic here
}

async function handleInvoicePaid(data: any) {
  // Process invoice payment
  // Process invoice payment
  // Update client balance, send notifications, etc.
}