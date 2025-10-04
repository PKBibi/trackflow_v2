import { log } from '@/lib/logger';
import { rateLimitPerUser } from '@/lib/validation/middleware'
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, emailTemplates } from '@/lib/email/resend';

export async function POST(request: NextRequest) {
  await rateLimitPerUser()
  try {
    const { template, email, ...data } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    if (!template) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
    }

    // Only allow in development or with proper auth
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Test endpoint disabled in production' }, { status: 403 });
    }

    let emailTemplate;

    switch (template) {
      case 'welcome':
        emailTemplate = emailTemplates.welcome(data.name || 'Test User');
        break;
      case 'subscription':
        emailTemplate = emailTemplates.subscriptionConfirmed(
          data.planName || 'Professional',
          data.amount || 29
        );
        break;
      case 'retainer':
        emailTemplate = emailTemplates.retainerAlert(
          data.clientName || 'Test Client',
          data.percentage || 75,
          data.remaining || 25
        );
        break;
      case 'weekly':
        emailTemplate = emailTemplates.weeklyReport({
          totalHours: data.totalHours || 40,
          topChannels: data.topChannels || ['PPC', 'SEO', 'Social Media'],
          revenue: data.revenue || 5000
        });
        break;
      default:
        return NextResponse.json({ error: 'Invalid template name' }, { status: 400 });
    }

    const result = await sendEmail({
      to: email,
      subject: `[TEST] ${emailTemplate.subject}`,
      html: emailTemplate.html,
    });

    if (!result.success) {
      return NextResponse.json({
        error: 'Failed to send email',
        details: result.error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      messageId: result.success ? (result.data as any)?.id : undefined,
      template,
      email
    });

  } catch (error) {
    log.error('Email test error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  await rateLimitPerUser()
  return NextResponse.json({
    message: 'Email Test API',
    availableTemplates: ['welcome', 'subscription', 'retainer', 'weekly'],
    usage: {
      method: 'POST',
      body: {
        template: 'welcome',
        email: 'test@example.com',
        name: 'Test User (optional)'
      }
    }
  });
}
