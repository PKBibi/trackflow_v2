'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

interface NotificationSettings {
  timeReminders: boolean
  projectUpdates: boolean
  invoiceAlerts: boolean
  reportSummaries: boolean
}

export function PushNotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings>({
    timeReminders: true,
    projectUpdates: true,
    invoiceAlerts: true,
    reportSummaries: false
  })

  useEffect(() => {
    // Check notification permission and subscription status
    if ('Notification' in window) {
      setPermission(Notification.permission)
      checkSubscription()
    }

    // Load saved settings
    const savedSettings = localStorage.getItem('notification-settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const checkSubscription = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        setIsSubscribed(!!subscription)
      } catch (error) {
        console.error('Error checking subscription:', error)
      }
    }
  }

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Not Supported',
        description: 'Push notifications are not supported in your browser.',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    try {
      const permission = await Notification.requestPermission()
      setPermission(permission)

      if (permission === 'granted') {
        await subscribeToNotifications()
      } else if (permission === 'denied') {
        toast({
          title: 'Permission Denied',
          description: 'You have denied notification permissions. You can change this in your browser settings.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error requesting permission:', error)
      toast({
        title: 'Error',
        description: 'Failed to request notification permissions.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const subscribeToNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription()
      
      if (!subscription) {
        // Create new subscription
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        
        if (!vapidPublicKey) {
          console.error('VAPID public key not found')
          return
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        })

        // Send subscription to server
        await saveSubscription(subscription)
      }

      setIsSubscribed(true)
      
      // Show test notification
      showTestNotification()
      
      toast({
        title: 'Notifications Enabled',
        description: 'You will now receive push notifications from TrackFlow.',
      })
    } catch (error) {
      console.error('Error subscribing to notifications:', error)
      toast({
        title: 'Subscription Failed',
        description: 'Failed to subscribe to push notifications.',
        variant: 'destructive'
      })
    }
  }

  const unsubscribeFromNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return
    }

    setIsLoading(true)

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
        await removeSubscription(subscription)
      }

      setIsSubscribed(false)
      
      toast({
        title: 'Notifications Disabled',
        description: 'You will no longer receive push notifications.',
      })
    } catch (error) {
      console.error('Error unsubscribing:', error)
      toast({
        title: 'Error',
        description: 'Failed to unsubscribe from notifications.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveSubscription = async (subscription: PushSubscription) => {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          settings
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save subscription')
      }
    } catch (error) {
      console.error('Error saving subscription:', error)
      throw error
    }
  }

  const removeSubscription = async (subscription: PushSubscription) => {
    try {
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription })
      })
    } catch (error) {
      console.error('Error removing subscription:', error)
    }
  }

  const updateSettings = async (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('notification-settings', JSON.stringify(newSettings))

    // Update settings on server if subscribed
    if (isSubscribed) {
      try {
        await fetch('/api/notifications/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newSettings)
        })
      } catch (error) {
        console.error('Error updating settings:', error)
      }
    }
  }

  const showTestNotification = () => {
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification('TrackFlow', {
          body: 'Push notifications are now enabled!',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          vibrate: [200, 100, 200],
          tag: 'test-notification',
          data: {
            url: '/dashboard'
          }
        })
      })
    }
  }

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Push Notifications
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Stay updated with real-time notifications
          </p>
        </div>
        <div className="flex items-center">
          {permission === 'granted' && isSubscribed ? (
            <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <BellOff className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </div>

      {/* Permission Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Notification Status
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {permission === 'granted' 
                ? (isSubscribed ? 'Enabled and active' : 'Permission granted, not subscribed')
                : permission === 'denied' 
                ? 'Blocked in browser settings'
                : 'Not yet requested'}
            </p>
          </div>
          
          {permission === 'default' && (
            <Button
              onClick={requestPermission}
              disabled={isLoading}
              size="sm"
            >
              Enable
            </Button>
          )}
          
          {permission === 'granted' && !isSubscribed && (
            <Button
              onClick={subscribeToNotifications}
              disabled={isLoading}
              size="sm"
            >
              Subscribe
            </Button>
          )}
          
          {permission === 'granted' && isSubscribed && (
            <Button
              onClick={unsubscribeFromNotifications}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              Disable
            </Button>
          )}
        </div>
      </div>

      {/* Notification Settings */}
      {isSubscribed && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-900 dark:text-white">
            Notification Preferences
          </h4>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Time Tracking Reminders
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Remind to start/stop timer
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.timeReminders}
                onChange={(e) => updateSettings('timeReminders', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>
            
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Project Updates
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  New tasks and comments
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.projectUpdates}
                onChange={(e) => updateSettings('projectUpdates', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>
            
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Invoice Alerts
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Payment received and overdue
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.invoiceAlerts}
                onChange={(e) => updateSettings('invoiceAlerts', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>
            
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Weekly Report Summaries
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Weekly time and project summaries
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.reportSummaries}
                onChange={(e) => updateSettings('reportSummaries', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>
          </div>
          
          <div className="pt-4">
            <Button
              onClick={showTestNotification}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Send Test Notification
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

