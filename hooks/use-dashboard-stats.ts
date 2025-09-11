'use client'

import { useState, useEffect } from 'react'
import { toastUtils } from '@/lib/toast-utils'

export interface DashboardStats {
  today: {
    hours: number
    revenue: number
    changeFromYesterday: number
  }
  week: {
    hours: number
    revenue: number
    billableRate: number
    changeFromLastWeek: number
  }
  clients: {
    total: number
    retainers: number
    projects: number
  }
  lastUpdated: string
}

export function useDashboardStats() {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async (showToast = false) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/dashboard/stats')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch dashboard stats')
      }
      
      const stats = await response.json()
      setData(stats)
      
      if (showToast) {
        toastUtils.success({
          title: 'Dashboard refreshed',
          description: `Data updated at ${new Date().toLocaleTimeString()}`,
          duration: 2000,
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      console.error('Failed to fetch dashboard stats:', err)
      
      if (showToast) {
        toastUtils.error({
          title: 'Refresh failed',
          description: errorMessage,
          action: { label: 'Try Again', onClick: () => fetchStats(true) }
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => fetchStats(true)

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    data,
    loading,
    error,
    refresh
  }
}