'use client'

import { useState, useEffect } from 'react'
import { X, Download, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInStandaloneMode, setIsInStandaloneMode] = useState(false)

  useEffect(() => {
    // Check if already installed or in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true

    setIsInStandaloneMode(isStandalone)

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    // Don't show if already installed or previously dismissed
    if (isStandalone || localStorage.getItem('pwa-install-dismissed')) {
      return
    }

    // Listen for beforeinstallprompt event (Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show prompt after a delay (better UX)
      setTimeout(() => {
        if (!localStorage.getItem('pwa-install-dismissed')) {
          setShowPrompt(true)
        }
      }, 30000) // Show after 30 seconds
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // For iOS, show custom instructions after delay
    if (isIOSDevice && !isStandalone) {
      setTimeout(() => {
        if (!localStorage.getItem('pwa-install-dismissed')) {
          setShowPrompt(true)
        }
      }, 30000)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // For iOS, show instructions
      if (isIOS) {
        setShowPrompt(true)
      }
      return
    }

    // Show the install prompt
    deferredPrompt.prompt()
    
    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
      // Track installation
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'pwa_install', {
          event_category: 'PWA',
          event_label: 'accepted'
        })
      }
    }
    
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
    
    // Track dismissal
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'pwa_install', {
        event_category: 'PWA',
        event_label: 'dismissed'
      })
    }
  }

  if (!showPrompt || isInStandaloneMode) {
    return null
  }

  return (
    <>
      {/* Desktop/Android Prompt */}
      {!isIOS && (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Install TrackFlow App
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Install our app for a better experience with offline support and faster loading.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={handleInstall}
                    size="sm"
                    className="flex-1"
                  >
                    Install
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    Not now
                  </Button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Instructions */}
      {isIOS && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="bg-white dark:bg-slate-800 w-full rounded-t-2xl p-6 animate-slide-up">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <Smartphone className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Install TrackFlow
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Add to your home screen
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">1</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Tap the <span className="font-semibold">Share</span> button in your browser's navigation bar
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">2</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Scroll down and tap <span className="font-semibold">Add to Home Screen</span>
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">3</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Tap <span className="font-semibold">Add</span> in the top right corner
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleDismiss}
              className="w-full mt-6"
              variant="outline"
            >
              Got it
            </Button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

