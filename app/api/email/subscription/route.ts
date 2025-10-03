import { rateLimitPerUser } from '@/lib/validation/middleware'
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, emailTemplates } from '@/lib/email/resend';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  await rateLimitPerUser()
  try {
    const { userId, planName, amount } = await request.json();

    if (!userId || !planName || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user details from Supabase
    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const template = emailTemplates.subscriptionConfirmed(planName, amount);
    const result = await sendEmail({
      to: profile.email,
      subject: template.subject,
      html: template.html,
    });

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: result.success ? (result.data as any)?.id : undefined });
  } catch (error) {
    console.error('Subscription email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
