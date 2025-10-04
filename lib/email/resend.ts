import { log } from '@/lib/logger';
import { Resend } from 'resend';

// Lazy initialization - only throw error when actually trying to use the service
let resendInstance: Resend | null = null;

function getResendClient(): Resend {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is required');
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

// For backward compatibility
export const resend = {
  get emails() {
    return getResendClient().emails;
  }
} as Resend;

// Email sending utility
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = 'TrackFlow <noreply@track-flow.app>',
}: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}) {
  try {
    const result = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    } as any);

    return { success: true, data: result };
  } catch (error) {
    log.error('Failed to send email:', error);
    return { success: false, error };
  }
}

// Email templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to TrackFlow! 🚀',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2F6BFF;">Welcome to TrackFlow, ${name}!</h1>
        <p>Thank you for signing up! You're now ready to start tracking your time like a pro.</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Get started in 3 steps:</h3>
          <ol>
            <li>Add your first client</li>
            <li>Set up your marketing channels (PPC, SEO, Social)</li>
            <li>Start tracking time and see instant insights</li>
          </ol>
        </div>
        <a href="https://track-flow.app/dashboard" style="background: #2F6BFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Get Started</a>
        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          Need help? Reply to this email or visit our <a href="https://track-flow.app/help">help center</a>.
        </p>
      </div>
    `,
  }),

  subscriptionConfirmed: (planName: string, amount: number) => ({
    subject: 'Subscription Confirmed - Welcome to TrackFlow Pro! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2F6BFF;">Welcome to TrackFlow ${planName}!</h1>
        <p>Your subscription has been confirmed. You now have access to all ${planName} features.</p>
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2F6BFF;">
          <h3>Subscription Details:</h3>
          <p><strong>Plan:</strong> ${planName}</p>
          <p><strong>Amount:</strong> $${amount}/month</p>
          <p><strong>Next billing:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
        </div>
        <a href="https://track-flow.app/dashboard" style="background: #2F6BFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Access Your Dashboard</a>
      </div>
    `,
  }),

  retainerAlert: (clientName: string, percentage: number, remaining: number) => ({
    subject: `⚠️ Retainer Alert: ${clientName} at ${percentage}% usage`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f59e0b;">Retainer Alert</h1>
        <p>Your client <strong>${clientName}</strong> has used ${percentage}% of their retainer.</p>
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p><strong>Remaining hours:</strong> ${remaining}</p>
          <p>Consider reaching out to discuss additional work or retainer renewal.</p>
        </div>
        <a href="https://track-flow.app/dashboard/clients" style="background: #2F6BFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Client Details</a>
      </div>
    `,
  }),

  weeklyReport: (data: { totalHours: number; topChannels: string[]; revenue: number }) => ({
    subject: 'Your Weekly TrackFlow Report 📊',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2F6BFF;">Your Weekly Report</h1>
        <p>Here's how you performed this week:</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span><strong>Total Hours:</strong></span>
            <span>${data.totalHours}h</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span><strong>Revenue Generated:</strong></span>
            <span>$${data.revenue}</span>
          </div>
          <div>
            <strong>Top Channels:</strong>
            <ul style="margin: 5px 0;">
              ${data.topChannels.map(channel => `<li>${channel}</li>`).join('')}
            </ul>
          </div>
        </div>
        <a href="https://track-flow.app/dashboard/reports" style="background: #2F6BFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Full Report</a>
      </div>
    `,
  }),
};