import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
]

export class GoogleCalendarService {
  private oauth2Client: OAuth2Client

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )
  }

  /**
   * Generate auth URL for OAuth consent
   */
  getAuthUrl(userId: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      state: userId,
      prompt: 'consent'
    })
  }

  /**
   * Exchange auth code for tokens
   */
  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code)
    return tokens
  }

  /**
   * Set credentials for authenticated requests
   */
  setCredentials(tokens: any) {
    this.oauth2Client.setCredentials(tokens)
  }

  /**
   * Get user's calendars
   */
  async getCalendars() {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })
    const response = await calendar.calendarList.list()
    return response.data.items || []
  }

  /**
   * Get events from a specific calendar
   */
  async getEvents(calendarId: string = 'primary', options: {
    timeMin?: string
    timeMax?: string
    maxResults?: number
    orderBy?: string
  } = {}) {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })
    
    const params = {
      calendarId,
      timeMin: options.timeMin || new Date().toISOString(),
      timeMax: options.timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      maxResults: options.maxResults || 100,
      singleEvents: true,
      orderBy: options.orderBy || 'startTime'
    }

    const response = await calendar.events.list(params)
    return response.data.items || []
  }

  /**
   * Create a new calendar event from time entry
   */
  async createEventFromTimeEntry(timeEntry: {
    description: string
    project: string
    startTime: string
    endTime: string
    notes?: string
  }, calendarId: string = 'primary') {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

    const event = {
      summary: `${timeEntry.project}: ${timeEntry.description}`,
      description: timeEntry.notes || `Time tracked in TrackFlow for project: ${timeEntry.project}`,
      start: {
        dateTime: timeEntry.startTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: timeEntry.endTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      colorId: '9', // Blue color for TrackFlow events
      source: {
        title: 'TrackFlow',
        url: process.env.NEXT_PUBLIC_APP_URL
      }
    }

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
    })

    return response.data
  }

  /**
   * Update an existing calendar event
   */
  async updateEvent(eventId: string, updates: any, calendarId: string = 'primary') {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

    const response = await calendar.events.patch({
      calendarId,
      eventId,
      requestBody: updates,
    })

    return response.data
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(eventId: string, calendarId: string = 'primary') {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

    await calendar.events.delete({
      calendarId,
      eventId,
    })
  }

  /**
   * Sync time entries with Google Calendar
   */
  async syncTimeEntries(timeEntries: Array<{
    id: string
    description: string
    project: string
    startTime: string
    endTime: string
    googleEventId?: string
  }>, calendarId: string = 'primary') {
    const results = {
      created: [] as any[],
      updated: [] as any[],
      failed: [] as any[],
    }

    for (const entry of timeEntries) {
      try {
        if (entry.googleEventId) {
          // Update existing event
          const updated = await this.updateEvent(
            entry.googleEventId,
            {
              summary: `${entry.project}: ${entry.description}`,
              start: { dateTime: entry.startTime },
              end: { dateTime: entry.endTime },
            },
            calendarId
          )
          results.updated.push({ entry, event: updated })
        } else {
          // Create new event
          const created = await this.createEventFromTimeEntry(entry, calendarId)
          results.created.push({ entry, event: created })
        }
      } catch (error) {
        results.failed.push({ entry, error })
      }
    }

    return results
  }

  /**
   * Import events from Google Calendar as time entries
   */
  async importEventsAsTimeEntries(calendarId: string = 'primary', options: {
    timeMin?: string
    timeMax?: string
    projectMapping?: Record<string, string>
  } = {}) {
    const events = await this.getEvents(calendarId, {
      timeMin: options.timeMin,
      timeMax: options.timeMax,
    })

    const timeEntries = events.map(event => {
      const project = this.extractProjectFromEvent(event, options.projectMapping)
      const description = this.extractDescriptionFromEvent(event)
      
      return {
        googleEventId: event.id,
        description,
        project,
        startTime: event.start?.dateTime || event.start?.date,
        endTime: event.end?.dateTime || event.end?.date,
        duration: this.calculateDuration(event),
        notes: event.description,
        imported: true,
        importedAt: new Date().toISOString()
      }
    })

    return timeEntries.filter(entry => entry.startTime && entry.endTime)
  }

  /**
   * Watch for calendar changes (using push notifications)
   */
  async watchCalendar(calendarId: string = 'primary', webhookUrl: string) {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

    const response = await calendar.events.watch({
      calendarId,
      requestBody: {
        id: `trackflow-${Date.now()}`,
        type: 'web_hook',
        address: webhookUrl,
        expiration: (Date.now() + 7 * 24 * 60 * 60 * 1000).toString(), // 7 days
      },
    })

    return response.data
  }

  /**
   * Stop watching calendar changes
   */
  async stopWatching(channelId: string, resourceId: string) {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

    await calendar.channels.stop({
      requestBody: {
        id: channelId,
        resourceId,
      },
    })
  }

  // Helper methods
  private extractProjectFromEvent(event: any, projectMapping?: Record<string, string>): string {
    const summary = event.summary || ''
    
    // Check if summary matches pattern "Project: Description"
    const match = summary.match(/^([^:]+):\s*(.+)/)
    if (match) {
      const projectName = match[1].trim()
      return projectMapping?.[projectName] || projectName
    }

    // Check for project in event categories/labels
    if (event.extendedProperties?.shared?.project) {
      return event.extendedProperties.shared.project
    }

    return 'Imported'
  }

  private extractDescriptionFromEvent(event: any): string {
    const summary = event.summary || 'Imported event'
    
    // If summary has project prefix, extract just the description
    const match = summary.match(/^[^:]+:\s*(.+)/)
    if (match) {
      return match[1].trim()
    }

    return summary
  }

  private calculateDuration(event: any): number {
    if (!event.start || !event.end) return 0

    const start = new Date(event.start.dateTime || event.start.date)
    const end = new Date(event.end.dateTime || event.end.date)
    
    return Math.round((end.getTime() - start.getTime()) / 1000) // Duration in seconds
  }
}

