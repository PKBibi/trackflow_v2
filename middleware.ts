import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let user = null
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    // Create an Edge-compatible Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    const { data: { session }, error } = await supabase.auth.getSession()

    // Consider session valid only if we have a valid user and no errors
    const hasValidSession = session?.user && !error
    user = hasValidSession ? session.user : null
  } catch (error) {
    // If we can't create supabase client or get session, treat as unauthenticated
    console.error('Middleware auth error:', error)
    user = null
  }

  // Define protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/timer',
    '/timesheet',
    '/reports',
    '/invoices',
    '/clients',
    '/projects',
    '/insights',
    '/settings',
    '/billing',
    '/import',
    '/onboarding',
    '/account-security'
  ]

  // Define public routes that should redirect to dashboard if already authenticated
  const authRoutes = ['/login', '/signup']

  const pathname = request.nextUrl.pathname

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Redirect unauthenticated users trying to access protected routes
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and visits full pricing page, redirect to simple pricing
  if (pathname === '/pricing' && user) {
    return NextResponse.redirect(new URL('/pricing/simple', request.url))
  }

  // Redirect authenticated users away from auth pages to dashboard
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
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
