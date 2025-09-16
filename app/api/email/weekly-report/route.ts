import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, emailTemplates } from '@/lib/email/resend';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, reportData } = await request.json();

    if (!userId || !reportData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user details from Supabase
    const supabase = createClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('email, notification_preferences')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user wants weekly reports
    const prefs = profile.notification_preferences || {};
    if (!prefs.weekly_reports) {
      return NextResponse.json({ message: 'User opted out of weekly reports' });
    }

    const template = emailTemplates.weeklyReport(reportData);
    const result = await sendEmail({
      to: profile.email,
      subject: template.subject,
      html: template.html,
    });

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: result.data?.id });
  } catch (error) {
    console.error('Weekly report email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}