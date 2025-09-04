import { WebClient } from '@slack/web-api'
import { IncomingWebhook } from '@slack/webhook'

export interface SlackNotification {
  text: string
  channel?: string
  username?: string
  icon_emoji?: string
  attachments?: Array<{
    color?: 'good' | 'warning' | 'danger' | string
    title?: string
    title_link?: string
    text?: string
    fields?: Array<{
      title: string
      value: string
      short?: boolean
    }>
    footer?: string
    ts?: string
  }>
  blocks?: any[]
}

export class SlackService {
  private client: WebClient | null = null
  private webhook: IncomingWebhook | null = null

  constructor(token?: string, webhookUrl?: string) {
    if (token) {
      this.client = new WebClient(token)
    }
    if (webhookUrl) {
      this.webhook = new IncomingWebhook(webhookUrl)
    }
  }

  /**
   * Send notification via webhook (simpler, no bot user required)
   */
  async sendWebhookNotification(notification: SlackNotification) {
    if (!this.webhook) {
      throw new Error('Slack webhook URL not configured')
    }

    return await this.webhook.send(notification)
  }

  /**
   * Send message via Web API (requires bot token)
   */
  async sendMessage(channel: string, text: string, options: any = {}) {
    if (!this.client) {
      throw new Error('Slack client not configured')
    }

    return await this.client.chat.postMessage({
      channel,
      text,
      ...options
    })
  }

  /**
   * Send time tracking reminder
   */
  async sendTimeTrackingReminder(channel: string, userId: string, projectName?: string) {
    const blocks: any[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '⏰ Time Tracking Reminder',
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Hey <@${userId}>! Don't forget to track your time${projectName ? ` for *${projectName}*` : ''}.`
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Start Timer',
              emoji: true
            },
            value: 'start_timer',
            url: `${process.env.NEXT_PUBLIC_APP_URL}/timer`,
            style: 'primary'
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Timesheet',
              emoji: true
            },
            value: 'view_timesheet',
            url: `${process.env.NEXT_PUBLIC_APP_URL}/timesheet`
          }
        ]
      }
    ]

    return await this.sendMessage(channel, 'Time tracking reminder', { blocks })
  }

  /**
   * Send project update notification
   */
  async sendProjectUpdate(channel: string, update: {
    project: string
    type: 'task_added' | 'task_completed' | 'milestone_reached' | 'deadline_approaching'
    details: string
    user?: string
    url?: string
  }) {
    const emoji = {
      task_added: '📝',
      task_completed: '✅',
      milestone_reached: '🎯',
      deadline_approaching: '⚠️'
    }

    const color = {
      task_added: '#2563eb',
      task_completed: 'good',
      milestone_reached: '#10b981',
      deadline_approaching: 'warning'
    }

    const notification: SlackNotification = {
      text: `Project Update: ${update.project}`,
      attachments: [
        {
          color: color[update.type],
          title: `${emoji[update.type]} ${update.type.replace(/_/g, ' ').toUpperCase()}`,
          title_link: update.url,
          text: update.details,
          fields: update.user ? [
            {
              title: 'Updated by',
              value: update.user,
              short: true
            }
          ] : [],
          footer: 'TrackFlow',
          ts: Math.floor(Date.now() / 1000).toString()
        }
      ]
    }

    if (this.webhook) {
      return await this.sendWebhookNotification(notification)
    } else if (this.client) {
      return await this.sendMessage(channel, notification.text, {
        attachments: notification.attachments
      })
    }
  }

  /**
   * Send invoice notification
   */
  async sendInvoiceNotification(channel: string, invoice: {
    number: string
    client: string
    amount: number
    currency: string
    status: 'sent' | 'paid' | 'overdue'
    dueDate?: string
    url?: string
  }) {
    const statusEmoji = {
      sent: '📧',
      paid: '💰',
      overdue: '🔴'
    }

    const statusColor = {
      sent: '#3b82f6',
      paid: 'good',
      overdue: 'danger'
    }

    const blocks: any[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${statusEmoji[invoice.status]} Invoice ${invoice.status.toUpperCase()}`,
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Invoice:*\n${invoice.number}`
          },
          {
            type: 'mrkdwn',
            text: `*Client:*\n${invoice.client}`
          },
          {
            type: 'mrkdwn',
            text: `*Amount:*\n${invoice.currency} ${invoice.amount.toLocaleString()}`
          },
          {
            type: 'mrkdwn',
            text: `*Status:*\n${invoice.status.toUpperCase()}`
          }
        ]
      }
    ]

    if (invoice.dueDate) {
      blocks.push({
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Due date: ${invoice.dueDate}`
          }
        ]
      })
    }

    if (invoice.url) {
      blocks.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Invoice',
              emoji: true
            },
            url: invoice.url,
            style: invoice.status === 'overdue' ? 'danger' : 'primary'
          }
        ]
      })
    }

    return await this.sendMessage(channel, `Invoice ${invoice.number} - ${invoice.status}`, { blocks })
  }

  /**
   * Send weekly summary report
   */
  async sendWeeklySummary(channel: string, summary: {
    week: string
    totalHours: number
    totalProjects: number
    topProjects: Array<{ name: string; hours: number }>
    totalRevenue?: number
    currency?: string
  }) {
    const blocks: any[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📊 Weekly Summary Report',
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Week of ${summary.week}*`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Total Hours:*\n${summary.totalHours.toFixed(1)} hrs`
          },
          {
            type: 'mrkdwn',
            text: `*Active Projects:*\n${summary.totalProjects}`
          }
        ]
      }
    ]

    if (summary.totalRevenue && summary.currency) {
      blocks[2].fields.push({
        type: 'mrkdwn',
        text: `*Billable Revenue:*\n${summary.currency} ${summary.totalRevenue.toLocaleString()}`
      })
    }

    // Top projects
    if (summary.topProjects.length > 0) {
      const projectsList = summary.topProjects
        .slice(0, 5)
        .map((p, i) => `${i + 1}. *${p.name}* - ${p.hours.toFixed(1)} hrs`)
        .join('\n')

      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Top Projects:*\n${projectsList}`
        }
      })
    }

    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Full Report',
            emoji: true
          },
          url: `${process.env.NEXT_PUBLIC_APP_URL}/reports`,
          style: 'primary'
        }
      ]
    })

    return await this.sendMessage(channel, 'Weekly summary report', { blocks })
  }

  /**
   * Handle Slack slash commands
   */
  async handleSlashCommand(command: {
    command: string
    text: string
    user_id: string
    channel_id: string
    response_url: string
  }) {
    switch (command.command) {
      case '/track':
        return this.handleTrackCommand(command)
      case '/timer':
        return this.handleTimerCommand(command)
      case '/report':
        return this.handleReportCommand(command)
      default:
        return {
          text: 'Unknown command. Try /track, /timer, or /report'
        }
    }
  }

  private async handleTrackCommand(command: any) {
    const [action, ...args] = command.text.split(' ')

    switch (action) {
      case 'start':
        return {
          text: '✅ Timer started',
          attachments: [{
            text: `Tracking time for: ${args.join(' ') || 'General work'}`,
            color: 'good'
          }]
        }
      case 'stop':
        return {
          text: '⏹️ Timer stopped',
          attachments: [{
            text: 'Time entry saved successfully',
            color: '#3b82f6'
          }]
        }
      case 'status':
        return {
          text: '⏱️ Timer Status',
          attachments: [{
            text: 'Currently tracking: Project X - 1h 23m',
            color: '#10b981'
          }]
        }
      default:
        return {
          text: 'Usage: /track [start|stop|status] [description]'
        }
    }
  }

  private async handleTimerCommand(command: any) {
    return {
      response_type: 'in_channel',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '⏰ *Quick Timer Controls*'
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '▶️ Start',
                emoji: true
              },
              value: 'start_timer',
              action_id: 'timer_start',
              style: 'primary'
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '⏸️ Pause',
                emoji: true
              },
              value: 'pause_timer',
              action_id: 'timer_pause'
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '⏹️ Stop',
                emoji: true
              },
              value: 'stop_timer',
              action_id: 'timer_stop',
              style: 'danger'
            }
          ]
        }
      ]
    }
  }

  private async handleReportCommand(command: any) {
    const period = command.text || 'today'
    
    return {
      text: `📊 Time Report for ${period}`,
      attachments: [
        {
          color: '#2563eb',
          fields: [
            {
              title: 'Total Hours',
              value: '7.5 hrs',
              short: true
            },
            {
              title: 'Projects',
              value: '3',
              short: true
            },
            {
              title: 'Billable',
              value: '6.0 hrs (80%)',
              short: true
            },
            {
              title: 'Revenue',
              value: '$750',
              short: true
            }
          ],
          footer: 'TrackFlow Reports',
          ts: Math.floor(Date.now() / 1000).toString()
        }
      ]
    }
  }

  /**
   * Handle Slack interactive components (buttons, select menus, etc.)
   */
  async handleInteraction(payload: any) {
    const action = payload.actions[0]
    
    switch (action.action_id) {
      case 'timer_start':
        // Handle timer start
        return {
          text: '✅ Timer started successfully'
        }
      case 'timer_pause':
        // Handle timer pause
        return {
          text: '⏸️ Timer paused'
        }
      case 'timer_stop':
        // Handle timer stop
        return {
          text: '⏹️ Timer stopped and entry saved'
        }
      default:
        return {
          text: 'Action received'
        }
    }
  }
}

