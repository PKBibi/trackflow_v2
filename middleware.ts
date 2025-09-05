import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create a Supabase client configured for the server environment
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Check authentication status
  const { data: { session } } = await supabase.auth.getSession()

  // Define protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/timer',
    '/timesheet',
    '/reports',
    '/invoices',
    '/insights',
    '/settings',
    '/import',
    '/onboarding'
  ]

  // Define public routes that should redirect to dashboard if already authenticated
  const authRoutes = ['/login', '/signup']

  const pathname = request.nextUrl.pathname

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Redirect unauthenticated users trying to access protected routes
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from auth pages to dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect standalone routes to dashboard equivalents
  if (session && pathname === '/timer') {
    return NextResponse.redirect(new URL('/dashboard/timer', request.url))
  }
  
  if (session && pathname === '/timesheet') {
    return NextResponse.redirect(new URL('/dashboard/timesheet', request.url))
  }
  
  if (session && pathname === '/reports') {
    return NextResponse.redirect(new URL('/dashboard/reports', request.url))
  }
  
  if (session && pathname === '/invoices') {
    return NextResponse.redirect(new URL('/dashboard/invoices', request.url))
  }
  
  if (session && pathname === '/clients') {
    return NextResponse.redirect(new URL('/dashboard/clients', request.url))
  }
  
  if (session && pathname === '/projects') {
    return NextResponse.redirect(new URL('/dashboard/projects', request.url))
  }

  return response
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - demo page (public demo)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|demo|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}