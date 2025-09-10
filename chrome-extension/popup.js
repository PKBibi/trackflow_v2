// TrackFlow Chrome Extension - Popup Script
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://track-flow.app' 
  : 'http://localhost:3000'

let currentTimer = null
let timerInterval = null

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthentication()
  await loadProjects()
  await checkCurrentTimer()
  setupEventListeners()
})

// Check if user is authenticated
async function checkAuthentication() {
  try {
    const token = await getStoredToken()
    if (!token) {
      showLoginRequired()
      return false
    }
    return true
  } catch (error) {
    console.error('Auth check failed:', error)
    showLoginRequired()
    return false
  }
}

// Show login required state
function showLoginRequired() {
  document.getElementById('mainContent').style.display = 'none'
  document.querySelectorAll('.actions, .quick-actions, .status').forEach(el => {
    el.style.display = 'none'
  })
  document.getElementById('loginRequired').classList.add('active')
}

// Get stored authentication token
async function getStoredToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['auth_token'], (result) => {
      resolve(result.auth_token)
    })
  })
}

// Load projects from API
async function loadProjects() {
  try {
    const token = await getStoredToken()
    if (!token) return

    const response = await fetch(`${API_URL}/api/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) throw new Error('Failed to load projects')

    const projects = await response.json()
    const select = document.getElementById('projectSelect')
    
    // Clear existing options
    select.innerHTML = '<option value="">Select a project...</option>'
    
    // Add project options
    projects.forEach(project => {
      const option = document.createElement('option')
      option.value = project.id
      option.textContent = project.name
      select.appendChild(option)
    })

    // Restore last selected project
    chrome.storage.local.get(['last_project_id'], (result) => {
      if (result.last_project_id) {
        select.value = result.last_project_id
      }
    })
  } catch (error) {
    console.error('Failed to load projects:', error)
  }
}

// Check if timer is currently running
async function checkCurrentTimer() {
  chrome.runtime.sendMessage({ action: 'getTimer' }, (response) => {
    if (response && response.timer) {
      currentTimer = response.timer
      updateTimerUI(true)
      startTimerDisplay()
    }
  })
}

// Setup event listeners
function setupEventListeners() {
  // Timer buttons
  document.getElementById('startBtn').addEventListener('click', startTimer)
  document.getElementById('stopBtn').addEventListener('click', stopTimer)

  // Quick action buttons
  document.getElementById('dashboardBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: `${API_URL}/dashboard` })
  })

  document.getElementById('reportsBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: `${API_URL}/reports` })
  })

  document.getElementById('projectsBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: `${API_URL}/projects` })
  })

  document.getElementById('settingsBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: `${API_URL}/settings` })
  })

  // Footer links
  document.getElementById('syncBtn').addEventListener('click', syncData)
  document.getElementById('logoutBtn').addEventListener('click', logout)

  // Login button
  document.getElementById('loginBtn')?.addEventListener('click', () => {
    chrome.tabs.create({ url: `${API_URL}/login` })
    window.close()
  })

  // Save project selection
  document.getElementById('projectSelect').addEventListener('change', (e) => {
    chrome.storage.local.set({ last_project_id: e.target.value })
  })
}

// Start timer
async function startTimer() {
  const projectId = document.getElementById('projectSelect').value
  const description = document.getElementById('descriptionInput').value
  const notes = document.getElementById('notesInput').value

  if (!projectId) {
    alert('Please select a project')
    return
  }

  if (!description) {
    alert('Please enter a description')
    return
  }

  const timer = {
    id: Date.now().toString(),
    projectId,
    description,
    notes,
    startTime: new Date().toISOString(),
    duration: 0
  }

  // Send to background script
  chrome.runtime.sendMessage({ 
    action: 'startTimer', 
    timer 
  }, (response) => {
    if (response.success) {
      currentTimer = timer
      updateTimerUI(true)
      startTimerDisplay()
    }
  })
}

// Stop timer
async function stopTimer() {
  if (!currentTimer) return

  const endTime = new Date().toISOString()
  const duration = Math.floor((new Date(endTime).getTime() - new Date(currentTimer.startTime).getTime()) / 1000)

  // Save time entry
  try {
    const token = await getStoredToken()
    const response = await fetch(`${API_URL}/api/time-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        project_id: currentTimer.projectId,
        description: currentTimer.description,
        notes: currentTimer.notes,
        start_time: currentTimer.startTime,
        end_time: endTime,
        duration
      })
    })

    if (!response.ok) throw new Error('Failed to save time entry')

    // Clear timer
    chrome.runtime.sendMessage({ action: 'stopTimer' })
    currentTimer = null
    stopTimerDisplay()
    updateTimerUI(false)

    // Clear form
    document.getElementById('descriptionInput').value = ''
    document.getElementById('notesInput').value = ''

    // Show success notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-128.png',
      title: 'Time Entry Saved',
      message: `Tracked ${formatDuration(duration)} for ${currentTimer.description}`
    })
  } catch (error) {
    console.error('Failed to save time entry:', error)
    alert('Failed to save time entry. Please try again.')
  }
}

// Update timer UI
function updateTimerUI(isRunning) {
  const startBtn = document.getElementById('startBtn')
  const stopBtn = document.getElementById('stopBtn')
  const statusDot = document.getElementById('statusDot')
  const statusText = document.getElementById('statusText')
  const inputs = document.querySelectorAll('#mainContent input, #mainContent select, #mainContent textarea')

  if (isRunning) {
    startBtn.style.display = 'none'
    stopBtn.style.display = 'block'
    statusDot.classList.add('active')
    statusText.textContent = 'Tracking time'
    inputs.forEach(input => input.disabled = true)
  } else {
    startBtn.style.display = 'block'
    stopBtn.style.display = 'none'
    statusDot.classList.remove('active')
    statusText.textContent = 'Not tracking'
    inputs.forEach(input => input.disabled = false)
  }
}

// Start timer display
function startTimerDisplay() {
  if (timerInterval) clearInterval(timerInterval)
  
  timerInterval = setInterval(() => {
    if (!currentTimer) {
      stopTimerDisplay()
      return
    }

    const duration = Math.floor((Date.now() - new Date(currentTimer.startTime).getTime()) / 1000)
    document.getElementById('timerDisplay').textContent = formatDuration(duration)
  }, 1000)
}

// Stop timer display
function stopTimerDisplay() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  document.getElementById('timerDisplay').textContent = '00:00:00'
}

// Format duration
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return [hours, minutes, secs]
    .map(v => v.toString().padStart(2, '0'))
    .join(':')
}

// Sync data
async function syncData() {
  try {
    document.getElementById('loading').classList.add('active')
    
    // Sync with background script
    chrome.runtime.sendMessage({ action: 'syncData' }, (response) => {
      document.getElementById('loading').classList.remove('active')
      if (response.success) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon-128.png',
          title: 'Sync Complete',
          message: 'Your data has been synchronized'
        })
      }
    })
  } catch (error) {
    console.error('Sync failed:', error)
    document.getElementById('loading').classList.remove('active')
  }
}

// Logout
async function logout() {
  if (confirm('Are you sure you want to logout?')) {
    chrome.storage.local.clear()
    chrome.runtime.sendMessage({ action: 'logout' })
    showLoginRequired()
  }
}

