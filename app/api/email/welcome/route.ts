import { log } from '@/lib/logger';
import { rateLimitPerUser } from '@/lib/validation/middleware'
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, emailTemplates } from '@/lib/email/resend';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  await rateLimitPerUser()
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user details from Supabase
    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const template = emailTemplates.welcome(profile.full_name || 'there');
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
    log.error('Welcome email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
