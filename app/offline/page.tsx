'use client'

import { WifiOff, RefreshCw, Clock, FolderOpen, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false)
  const [cachedData, setCachedData] = useState<any>({
    recentProjects: [],
    recentTimeEntries: []
  })

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Load cached data from localStorage
    const loadCachedData = () => {
      const projects = localStorage.getItem('cached_projects')
      const timeEntries = localStorage.getItem('cached_time_entries')
      
      setCachedData({
        recentProjects: projects ? JSON.parse(projects) : [],
        recentTimeEntries: timeEntries ? JSON.parse(timeEntries) : []
      })
    }

    loadCachedData()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Offline Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <WifiOff className="w-12 h-12 text-slate-600 dark:text-slate-400" />
              </div>
              {isOnline && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
          </div>

          {/* Title and Description */}
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            {isOnline ? 'You\'re back online!' : 'You\'re offline'}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            {isOnline 
              ? 'Your connection has been restored. Click below to continue.'
              : 'Don\'t worry, you can still access some cached content and your data will sync when you\'re back online.'}
          </p>

          {/* Retry Button */}
          <Button 
            onClick={handleRetry}
            size="lg"
            className="mb-12"
            disabled={!isOnline}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {isOnline ? 'Continue to App' : 'Retry Connection'}
          </Button>

          {/* Cached Content */}
          {!isOnline && (
            <div className="space-y-8 text-left">
              {/* Recent Time Entries */}
              {cachedData.recentTimeEntries.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Recent Time Entries (Cached)
                  </h2>
                  <div className="space-y-3">
                    {cachedData.recentTimeEntries.slice(0, 5).map((entry: any, index: number) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-0 dark:border-slate-700">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{entry.description}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{entry.project}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-slate-900 dark:text-white">{entry.duration}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{entry.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Projects */}
              {cachedData.recentProjects.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                    <FolderOpen className="w-5 h-5 mr-2" />
                    Recent Projects (Cached)
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {cachedData.recentProjects.slice(0, 4).map((project: any, index: number) => (
                      <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <h3 className="font-medium text-slate-900 dark:text-white mb-1">{project.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{project.client}</p>
                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                          <FileText className="w-3 h-3 mr-1" />
                          {project.taskCount} tasks
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Offline Features Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  Available Offline Features
                </h3>
                <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    View cached projects and time entries
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Continue tracking time (will sync when online)
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Access previously viewed reports
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Create drafts that will be saved when reconnected
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

