import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail, emailTemplates } from '@/lib/email/resend';
import { log } from '@/lib/logger';

export async function GET(request: NextRequest) {
  // Verify this is a cron request (in production, you'd also check a secret)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createClient();

    // Get all users who want weekly reports
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, notification_preferences')
      .not('notification_preferences->weekly_reports', 'is', false);

    if (usersError) throw usersError;

    const results = [];

    for (const user of users || []) {
      try {
        // Get user's time entries from the past week
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const { data: timeEntries, error: timeError } = await supabase
          .from('time_entries')
          .select('duration, channel, hourly_rate')
          .eq('user_id', user.id)
          .gte('created_at', oneWeekAgo);

        if (timeError) throw timeError;

        if (!timeEntries?.length) {
          continue; // Skip users with no activity
        }

        // Calculate report data
        const totalHours = timeEntries.reduce((sum: number, entry: any) => sum + (entry.duration || 0), 0) / 3600; // Convert seconds to hours
        const revenue = timeEntries.reduce((sum: number, entry: any) => sum + ((entry.duration || 0) / 3600) * (entry.hourly_rate || 0), 0);

        // Get top channels
        const channelHours = timeEntries.reduce((acc: Record<string, number>, entry: any) => {
          const channel = entry.channel || 'Other';
          acc[channel] = (acc[channel] || 0) + (entry.duration || 0) / 3600;
          return acc;
        }, {} as Record<string, number>);

        const topChannels = Object.entries(channelHours)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([channel, hours]) => `${channel} (${hours.toFixed(1)}h)`);

        const reportData = {
          totalHours: Math.round(totalHours * 10) / 10,
          topChannels,
          revenue: Math.round(revenue * 100) / 100,
        };

        // Send the email
        const template = emailTemplates.weeklyReport(reportData);
        const result = await sendEmail({
          to: user.email,
          subject: template.subject,
          html: template.html,
        });

        results.push({
          userId: user.id,
          email: user.email,
          success: result.success,
          messageId: result.data?.id,
        });

      } catch (userError) {
        log.apiError(`weekly-reports/send-to-user`, userError, {
          userId: user.id,
          email: user.email
        });
        results.push({
          userId: user.id,
          email: user.email,
          success: false,
          error: userError instanceof Error ? userError.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });

  } catch (error) {
    log.apiError('weekly-reports/cron', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}