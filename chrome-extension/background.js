// TrackFlow Chrome Extension - Background Script
const API_URL = 'http://localhost:3000' // Change to production URL when deploying

let currentTimer = null
let notificationInterval = null
let lastDetected = null
let lastDetectNotifiedAt = 0

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'startTimer':
      startTimer(request.timer)
      sendResponse({ success: true })
      break
    
    case 'stopTimer':
      stopTimer()
      sendResponse({ success: true })
      break
    
    case 'getTimer':
      sendResponse({ timer: currentTimer })
      break
    
    case 'syncData':
      syncData().then(() => {
        sendResponse({ success: true })
      })
      return true // Keep channel open for async response
    
    case 'detectedContext':
      lastDetected = request.data || null
      try { chrome.storage.local.set({ detected_context: lastDetected }) } catch (_) {}
      // Privacy-first gentle prompt when detected and no timer running (throttle to 60s)
      const now = Date.now()
      if (!currentTimer && now - lastDetectNotifiedAt > 60000 && lastDetected) {
        lastDetectNotifiedAt = now
        try {
          chrome.notifications.create('tf-detected', {
            type: 'basic',
            title: 'Platform detected',
            iconUrl: 'icons/icon-128.png',
            message: `Detected ${lastDetected.channel}. Open TrackFlow to start a timer?`
          })
        } catch (_) {}
      }
      sendResponse({ success: true })
      break
    
    case 'logout':
      logout()
      sendResponse({ success: true })
      break
    
    default:
      sendResponse({ error: 'Unknown action' })
  }
})

// Start timer
function startTimer(timer) {
  currentTimer = timer
  
  // Update badge
  chrome.action.setBadgeText({ text: 'ON' })
  chrome.action.setBadgeBackgroundColor({ color: '#10b981' })
  
  // Store timer state
  chrome.storage.local.set({ current_timer: timer })
  
  // Set up reminder notifications
  setupReminders()
  
  // Track in analytics
  trackEvent('timer_started', {
    project_id: timer.projectId
  })
}

// Stop timer
function stopTimer() {
  if (!currentTimer) return
  
  // Clear badge
  chrome.action.setBadgeText({ text: '' })
  
  // Clear storage
  chrome.storage.local.remove('current_timer')
  
  // Clear reminders
  clearReminders()
  
  // Track in analytics
  trackEvent('timer_stopped', {
    duration: Math.floor((Date.now() - new Date(currentTimer.startTime).getTime()) / 1000)
  })
  
  currentTimer = null
}

// Setup reminder notifications
function setupReminders() {
  // Clear existing interval
  if (notificationInterval) {
    clearInterval(notificationInterval)
  }
  
  // Set up hourly reminders
  notificationInterval = setInterval(() => {
    if (currentTimer) {
      const duration = Math.floor((Date.now() - new Date(currentTimer.startTime).getTime()) / 1000)
      const hours = Math.floor(duration / 3600)
      
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon-128.png',
        title: 'Timer Running',
        message: `You've been tracking time for ${hours} hour${hours !== 1 ? 's' : ''}`,
        buttons: [
          { title: 'Stop Timer' },
          { title: 'Keep Tracking' }
        ]
      })
    }
  }, 3600000) // Every hour
}

// Clear reminders
function clearReminders() {
  if (notificationInterval) {
    clearInterval(notificationInterval)
    notificationInterval = null
  }
}

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    // Stop timer button clicked
    stopTimer()
    chrome.notifications.clear(notificationId)
  } else {
    // Keep tracking button clicked
    chrome.notifications.clear(notificationId)
  }
})

// Sync data with server
async function syncData() {
  try {
    // Get stored data
    const data = await chrome.storage.local.get(['offline_entries', 'auth_token'])
    
    if (!data.auth_token || !data.offline_entries || data.offline_entries.length === 0) {
      return
    }
    
    // Send to server
    const response = await fetch(`${API_URL}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.auth_token}`
      },
      body: JSON.stringify({
        entries: data.offline_entries
      })
    })
    
    if (response.ok) {
      // Clear synced entries
      chrome.storage.local.remove('offline_entries')
    }
  } catch (error) {
    console.error('Sync failed:', error)
  }
}

// Logout
function logout() {
  stopTimer()
  chrome.storage.local.clear()
  chrome.action.setBadgeText({ text: '' })
}

// Track analytics events
function trackEvent(eventName, eventData) {
  // Send to analytics service if configured
  console.log('Event tracked:', eventName, eventData)
}

// Handle extension install/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Open onboarding page
    chrome.tabs.create({
      url: `${API_URL}/extension-welcome`
    })
  } else if (details.reason === 'update') {
    // Check for timer recovery
    chrome.storage.local.get(['current_timer'], (result) => {
      if (result.current_timer) {
        currentTimer = result.current_timer
        chrome.action.setBadgeText({ text: 'ON' })
        chrome.action.setBadgeBackgroundColor({ color: '#10b981' })
        setupReminders()
      }
    })
  }
})

// Handle alarm for periodic sync
chrome.alarms.create('syncData', { periodInMinutes: 30 })

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncData') {
    syncData()
  }
})

// Context menu for quick timer start
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'trackflow-quick-start',
    title: 'Start TrackFlow Timer',
    contexts: ['all']
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'trackflow-quick-start') {
    // Get page title as description
    const description = tab.title || 'Work'
    
    // Start timer with auto-generated entry
    const timer = {
      id: Date.now().toString(),
      projectId: 'quick', // Special ID for quick entries
      description: description,
      notes: `Started from: ${tab.url}`,
      startTime: new Date().toISOString(),
      duration: 0
    }
    
    startTimer(timer)
    
    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-128.png',
      title: 'Timer Started',
      message: `Tracking time for: ${description}`
    })
  }
})

// Listen for tab/window focus changes to track active time
let lastActiveTime = Date.now()
let isActive = true

chrome.tabs.onActivated.addListener(() => {
  if (!isActive) {
    isActive = true
    lastActiveTime = Date.now()
  }
})

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    isActive = false
    // Could pause timer or track idle time here
  } else {
    isActive = true
    lastActiveTime = Date.now()
  }
})

// Idle detection
chrome.idle.setDetectionInterval(300) // 5 minutes

chrome.idle.onStateChanged.addListener((state) => {
  if (currentTimer) {
    if (state === 'idle' || state === 'locked') {
      // Send notification about idle state
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon-128.png',
        title: 'Are you still working?',
        message: 'You\'ve been idle for 5 minutes',
        buttons: [
          { title: 'Yes, keep tracking' },
          { title: 'No, stop timer' }
        ]
      })
    }
  }
})

