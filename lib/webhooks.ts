import crypto from 'crypto';

// Webhook event types
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
  | 'user.updated';

export interface WebhookPayload {
  event: WebhookEvent;
  data: any;
  timestamp: string;
  signature?: string;
}

// Store for webhook subscriptions (in production, use database)
export let webhookSubscriptions = [
  {
    id: '1',
    url: 'https://hooks.zapier.com/hooks/catch/123456/abcdef/',
    events: ['time_entry.created', 'time_entry.updated'],
    secret: 'webhook_secret_123',
    active: true,
    createdAt: new Date().toISOString()
  }
];

// Helper function to verify webhook signature
export function verifyWebhookSignature(
  payload: any,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === expectedSignature;
}

// Helper function to send webhook to subscribers
export async function sendWebhookEvent(
  event: WebhookEvent,
  data: any
): Promise<void> {
  // Get active subscriptions for this event
  const subscribers = webhookSubscriptions.filter(sub =>
    sub.active && sub.events.includes(event)
  );
  
  // Send webhook to each subscriber
  const promises = subscribers.map(async (subscriber) => {
    const payload: WebhookPayload = {
      event,
      data,
      timestamp: new Date().toISOString()
    };
    
    // Generate signature
    const signature = crypto
      .createHmac('sha256', subscriber.secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    try {
      const response = await fetch(subscriber.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': event,
          'X-Webhook-Signature': signature,
          'X-Webhook-Timestamp': payload.timestamp
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        console.error(`Failed to send webhook to ${subscriber.url}: ${response.status}`);
        // In production, implement retry logic and deactivate failing webhooks
      }
    } catch (error) {
      console.error(`Error sending webhook to ${subscriber.url}:`, error);
      // In production, implement retry logic
    }
  });
  
  await Promise.all(promises);
}

// Test webhook endpoint
export async function testWebhook(url: string, secret: string): Promise<any> {
  const testPayload: WebhookPayload = {
    event: 'time_entry.created' as WebhookEvent,
    data: {
      test: true,
      message: 'This is a test webhook from TrackFlow'
    },
    timestamp: new Date().toISOString()
  };
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(testPayload))
    .digest('hex');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Event': 'test',
        'X-Webhook-Signature': signature,
        'X-Webhook-Timestamp': testPayload.timestamp
      },
      body: JSON.stringify(testPayload)
    });
    
    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to reach webhook endpoint'
    };
  }
}


