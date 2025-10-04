import { log } from '@/lib/logger';
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, Mail, MessageSquare, Smartphone, Globe, Clock, Calendar, DollarSign, Users, FileText, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'

interface NotificationSettings {
  // Email Notifications
  email_enabled: boolean
  email_daily_summary: boolean
  email_weekly_report: boolean
  email_invoice_sent: boolean
  email_payment_received: boolean
  email_team_updates: boolean
  email_project_updates: boolean
  email_timer_reminders: boolean
  
  // Push Notifications
  push_enabled: boolean
  push_timer_reminders: boolean
  push_invoice_updates: boolean
  push_team_mentions: boolean
  push_project_deadlines: boolean
  
  // In-App Notifications
  app_enabled: boolean
  app_sound_enabled: boolean
  app_desktop_enabled: boolean
  
  // Slack Integration
  slack_enabled: boolean
  slack_channel: string
  slack_daily_summary: boolean
  slack_timer_reminders: boolean
  slack_invoice_updates: boolean
  
  // Quiet Hours
  quiet_hours_enabled: boolean
  quiet_hours_start: string
  quiet_hours_end: string
  quiet_hours_timezone: string
  
  // Frequency Settings
  summary_frequency: 'never' | 'daily' | 'weekly' | 'monthly'
  reminder_frequency: 'never' | 'hourly' | 'daily' | 'weekly'
}

const defaultSettings: NotificationSettings = {
  email_enabled: true,
  email_daily_summary: true,
  email_weekly_report: false,
  email_invoice_sent: true,
  email_payment_received: true,
  email_team_updates: true,
  email_project_updates: true,
  email_timer_reminders: false,
  
  push_enabled: false,
  push_timer_reminders: false,
  push_invoice_updates: false,
  push_team_mentions: true,
  push_project_deadlines: true,
  
  app_enabled: true,
  app_sound_enabled: true,
  app_desktop_enabled: false,
  
  slack_enabled: false,
  slack_channel: '',
  slack_daily_summary: false,
  slack_timer_reminders: false,
  slack_invoice_updates: false,
  
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00',
  quiet_hours_timezone: 'America/New_York',
  
  summary_frequency: 'daily',
  reminder_frequency: 'daily'
}

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingNotification, setTestingNotification] = useState(false)
  const supabase = createClient()

  const loadSettings = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setSettings(data)
      }
    } catch (error) {
      log.error('Error loading notification settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to load notification settings',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const saveSettings = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to continue',
          variant: 'destructive'
        })
        setSaving(false)
        return
      }

      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      toast({
        title: 'Settings Saved',
        description: 'Your notification preferences have been updated'
      })
    } catch (error) {
      log.error('Error saving settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to save notification settings',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const testNotification = async (type: 'email' | 'push' | 'slack') => {
    setTestingNotification(true)
    try {
      await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })

      toast({
        title: 'Test Sent',
        description: `A test ${type} notification has been sent`
      })
    } catch (error) {
      log.error('Error sending test notification:', error)
      toast({
        title: 'Error',
        description: 'Failed to send test notification',
        variant: 'destructive'
      })
    } finally {
      setTestingNotification(false)
    }
  }

  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Notification Preferences</h1>
        <p className="text-muted-foreground mt-2">
          Configure how and when you receive notifications
        </p>
      </div>

      <Tabs defaultValue="channels" className="space-y-6">
        <TabsList>
          <TabsTrigger value="channels">
            <Bell className="w-4 h-4 mr-2" />
            Channels
          </TabsTrigger>
          <TabsTrigger value="events">
            <Calendar className="w-4 h-4 mr-2" />
            Events
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Clock className="w-4 h-4 mr-2" />
            Schedule
          </TabsTrigger>
        </TabsList>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-6">
          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Notifications
                  </CardTitle>
                  <CardDescription>
                    Receive notifications via email
                  </CardDescription>
                </div>
                <Switch
                  checked={settings.email_enabled}
                  onCheckedChange={(checked) => updateSetting('email_enabled', checked)}
                />
              </div>
            </CardHeader>
            {settings.email_enabled && (
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Daily Summary</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive a daily summary of your activity
                      </p>
                    </div>
                    <Switch
                      checked={settings.email_daily_summary}
                      onCheckedChange={(checked) => updateSetting('email_daily_summary', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Get weekly productivity reports
                      </p>
                    </div>
                    <Switch
                      checked={settings.email_weekly_report}
                      onCheckedChange={(checked) => updateSetting('email_weekly_report', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Invoice Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Notifications about invoice status
                      </p>
                    </div>
                    <Switch
                      checked={settings.email_invoice_sent}
                      onCheckedChange={(checked) => updateSetting('email_invoice_sent', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Payment Confirmations</Label>
                      <p className="text-sm text-muted-foreground">
                        Notifications when payments are received
                      </p>
                    </div>
                    <Switch
                      checked={settings.email_payment_received}
                      onCheckedChange={(checked) => updateSetting('email_payment_received', checked)}
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('email')}
                    disabled={testingNotification}
                  >
                    {testingNotification ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Test Email'
                    )}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Push Notifications
                  </CardTitle>
                  <CardDescription>
                    Browser and mobile push notifications
                  </CardDescription>
                </div>
                <Switch
                  checked={settings.push_enabled}
                  onCheckedChange={(checked) => updateSetting('push_enabled', checked)}
                />
              </div>
            </CardHeader>
            {settings.push_enabled && (
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Permission Required</AlertTitle>
                  <AlertDescription>
                    You need to allow push notifications in your browser settings
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Timer Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Remind you to start/stop timer
                      </p>
                    </div>
                    <Switch
                      checked={settings.push_timer_reminders}
                      onCheckedChange={(checked) => updateSetting('push_timer_reminders', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Team Mentions</Label>
                      <p className="text-sm text-muted-foreground">
                        When someone mentions you
                      </p>
                    </div>
                    <Switch
                      checked={settings.push_team_mentions}
                      onCheckedChange={(checked) => updateSetting('push_team_mentions', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Project Deadlines</Label>
                      <p className="text-sm text-muted-foreground">
                        Upcoming project deadlines
                      </p>
                    </div>
                    <Switch
                      checked={settings.push_project_deadlines}
                      onCheckedChange={(checked) => updateSetting('push_project_deadlines', checked)}
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('push')}
                    disabled={testingNotification}
                  >
                    Send Test Push
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Slack Integration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Slack Notifications
                  </CardTitle>
                  <CardDescription>
                    Send notifications to Slack
                  </CardDescription>
                </div>
                <Switch
                  checked={settings.slack_enabled}
                  onCheckedChange={(checked) => updateSetting('slack_enabled', checked)}
                />
              </div>
            </CardHeader>
            {settings.slack_enabled && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slack-channel">Slack Channel</Label>
                  <Input
                    id="slack-channel"
                    placeholder="#general"
                    value={settings.slack_channel}
                    onChange={(e) => updateSetting('slack_channel', e.target.value)}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Daily Summary</Label>
                      <p className="text-sm text-muted-foreground">
                        Post daily summary to Slack
                      </p>
                    </div>
                    <Switch
                      checked={settings.slack_daily_summary}
                      onCheckedChange={(checked) => updateSetting('slack_daily_summary', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Timer Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Timer start/stop reminders
                      </p>
                    </div>
                    <Switch
                      checked={settings.slack_timer_reminders}
                      onCheckedChange={(checked) => updateSetting('slack_timer_reminders', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Invoice Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Invoice status changes
                      </p>
                    </div>
                    <Switch
                      checked={settings.slack_invoice_updates}
                      onCheckedChange={(checked) => updateSetting('slack_invoice_updates', checked)}
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('slack')}
                    disabled={testingNotification || !settings.slack_channel}
                  >
                    Send Test to Slack
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Events</CardTitle>
              <CardDescription>
                Choose which events trigger notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Time Tracking */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time Tracking
                  </h3>
                  <div className="space-y-3 pl-6">
                    <Label className="flex items-center gap-2">
                      <Switch defaultChecked />
                      Timer started
                    </Label>
                    <Label className="flex items-center gap-2">
                      <Switch defaultChecked />
                      Timer stopped
                    </Label>
                    <Label className="flex items-center gap-2">
                      <Switch />
                      Timer running for more than 8 hours
                    </Label>
                    <Label className="flex items-center gap-2">
                      <Switch defaultChecked />
                      Daily time goal achieved
                    </Label>
                  </div>
                </div>

                {/* Projects */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Projects
                  </h3>
                  <div className="space-y-3 pl-6">
                    <Label className="flex items-center gap-2">
                      <Switch defaultChecked />
                      Project created
                    </Label>
                    <Label className="flex items-center gap-2">
                      <Switch defaultChecked />
                      Project deadline approaching
                    </Label>
                    <Label className="flex items-center gap-2">
                      <Switch />
                      Project completed
                    </Label>
                    <Label className="flex items-center gap-2">
                      <Switch defaultChecked />
                      Project budget exceeded
                    </Label>
                  </div>
                </div>

                {/* Invoices */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Invoices
                  </h3>
                  <div className="space-y-3 pl-6">
                    <Label className="flex items-center gap-2">
                      <Switch defaultChecked />
                      Invoice sent
                    </Label>
                    <Label className="flex items-center gap-2">
                      <Switch defaultChecked />
                      Invoice viewed
                    </Label>
                    <Label className="flex items-center gap-2">
                      <Switch defaultChecked />
                      Payment received
                    </Label>
                    <Label className="flex items-center gap-2">
                      <Switch defaultChecked />
                      Invoice overdue
                    </Label>
                  </div>
                </div>

                {/* Team */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Team
                  </h3>
                  <div className="space-y-3 pl-6">
                    <Label className="flex items-center gap-2">
                      <Switch defaultChecked />
                      New team member joined
                    </Label>
                    <Label className="flex items-center gap-2">
                      <Switch defaultChecked />
                      Team member mentioned you
                    </Label>
                    <Label className="flex items-center gap-2">
                      <Switch />
                      Team member updated time entry
                    </Label>
                    <Label className="flex items-center gap-2">
                      <Switch defaultChecked />
                      Team member assigned you to project
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quiet Hours</CardTitle>
              <CardDescription>
                Pause notifications during specific hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Quiet Hours</Label>
                  <p className="text-sm text-muted-foreground">
                    No notifications during quiet hours
                  </p>
                </div>
                <Switch
                  checked={settings.quiet_hours_enabled}
                  onCheckedChange={(checked) => updateSetting('quiet_hours_enabled', checked)}
                />
              </div>
              
              {settings.quiet_hours_enabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quiet-start">Start Time</Label>
                      <Input
                        id="quiet-start"
                        type="time"
                        value={settings.quiet_hours_start}
                        onChange={(e) => updateSetting('quiet_hours_start', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quiet-end">End Time</Label>
                      <Input
                        id="quiet-end"
                        type="time"
                        value={settings.quiet_hours_end}
                        onChange={(e) => updateSetting('quiet_hours_end', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={settings.quiet_hours_timezone}
                      onValueChange={(value) => updateSetting('quiet_hours_timezone', value)}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Frequency</CardTitle>
              <CardDescription>
                Control how often you receive certain notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="summary-frequency">Summary Reports</Label>
                <Select
                  value={settings.summary_frequency}
                  onValueChange={(value: any) => updateSetting('summary_frequency', value)}
                >
                  <SelectTrigger id="summary-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reminder-frequency">Timer Reminders</Label>
                <Select
                  value={settings.reminder_frequency}
                  onValueChange={(value: any) => updateSetting('reminder_frequency', value)}
                >
                  <SelectTrigger id="reminder-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="hourly">Every Hour</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </Button>
      </div>
    </div>
  )
}
