'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Clock, FolderOpen, FileText, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
}

const navItems: NavItem[] = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/timer', icon: Clock, label: 'Timer' },
  { href: '/projects', icon: FolderOpen, label: 'Projects' },
  { href: '/reports', icon: FileText, label: 'Reports' },
  { href: '/menu', icon: Menu, label: 'Menu' }
]

export function BottomNavigation() {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Handle scroll to hide/show nav
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            setIsVisible(false) // Scrolling down
          } else {
            setIsVisible(true) // Scrolling up
          }
          
          setLastScrollY(currentScrollY)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY])

  // Don't render on desktop or auth pages
  if (!isMobile || pathname?.startsWith('/login') || pathname?.startsWith('/signup')) {
    return null
  }

  return (
    <>
      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="h-16 md:hidden" />
      
      {/* Bottom Navigation */}
      <nav 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 md:hidden transition-transform duration-300 ease-in-out",
          !isVisible && "translate-y-full"
        )}
      >
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname?.startsWith(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full py-2 px-3 transition-colors relative",
                  "touch-manipulation active:bg-slate-100 dark:active:bg-slate-800",
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-blue-600 dark:bg-blue-400" />
                )}
                
                <Icon className={cn(
                  "w-5 h-5 mb-1 transition-transform",
                  isActive && "scale-110"
                )} />
                <span className="text-xs font-medium">{item.label}</span>
                
                {/* Ripple effect container */}
                <span className="absolute inset-0 overflow-hidden rounded">
                  <span className="ripple" />
                </span>
              </Link>
            )
          })}
        </div>
        
        {/* Safe area padding for devices with home indicator */}
        <div className="pb-safe" />
      </nav>

      <style jsx>{`
        .ripple {
          position: absolute;
          border-radius: 50%;
          background-color: rgba(0, 0, 0, 0.1);
          width: 100px;
          height: 100px;
          margin-top: -50px;
          margin-left: -50px;
          animation: ripple 600ms;
          opacity: 0;
        }

        @keyframes ripple {
          from {
            opacity: 1;
            transform: scale(0);
          }
          to {
            opacity: 0;
            transform: scale(2.5);
          }
        }

        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </>
  )
}

