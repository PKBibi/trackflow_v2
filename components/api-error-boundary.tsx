'use client'

import React from 'react'
import { AlertCircle, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ErrorBoundary, { ErrorFallbackProps } from './error-boundary'

const ApiErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  const isNetworkError = error.message.includes('fetch') || error.message.includes('network')
  const isAuthError = error.message.includes('401') || error.message.includes('Unauthorized')
  const isServerError = error.message.includes('500') || error.message.includes('Internal Server Error')

  let title = 'API Error'
  let description = 'There was a problem communicating with the server.'
  let icon = <AlertCircle className="h-5 w-5 text-red-500" />

  if (isNetworkError) {
    title = 'Network Error'
    description = 'Unable to connect to the server. Please check your internet connection.'
    icon = <WifiOff className="h-5 w-5 text-red-500" />
  } else if (isAuthError) {
    title = 'Authentication Error'
    description = 'Your session may have expired. Please log in again.'
    icon = <AlertCircle className="h-5 w-5 text-yellow-500" />
  } else if (isServerError) {
    title = 'Server Error'
    description = 'The server is experiencing issues. Please try again in a few moments.'
    icon = <AlertCircle className="h-5 w-5 text-red-500" />
  }

  const handleAuthError = () => {
    // Redirect to login page
    window.location.href = '/login'
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {isAuthError ? (
            <Button onClick={handleAuthError} className="w-full">
              Go to Login
            </Button>
          ) : (
            <>
              <Button onClick={resetError} variant="outline" className="flex-1">
                Try Again
              </Button>
              {isNetworkError && (
                <Button onClick={() => window.location.reload()} className="flex-1">
                  <Wifi className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface ApiErrorBoundaryProps {
  children: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

const ApiErrorBoundary: React.FC<ApiErrorBoundaryProps> = ({ children, onError }) => {
  return (
    <ErrorBoundary fallback={ApiErrorFallback} onError={onError}>
      {children}
    </ErrorBoundary>
  )
}

export default ApiErrorBoundary