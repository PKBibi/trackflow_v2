import * as Sentry from '@sentry/nextjs';

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side instrumentation
    Sentry.init({
      dsn: process.env.SENTRY_DSN,

      // Performance monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Environment
      environment: process.env.NODE_ENV,

      // Release tracking
      release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',

      // Server-specific configuration
      debug: process.env.NODE_ENV === 'development',

      beforeSend(event, hint) {
        // Don't send events in development unless explicitly enabled
        if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEBUG) {
          return null;
        }

        // Add context for API routes
        if (event.request?.url) {
          event.tags = {
            ...event.tags,
            route: event.request.url,
          };
        }

        return event;
      },

      integrations: [
        Sentry.httpIntegration(),
        Sentry.consoleIntegration(),
      ],
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime instrumentation
    Sentry.init({
      dsn: process.env.SENTRY_DSN,

      // Performance monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Environment
      environment: process.env.NODE_ENV,

      // Release tracking
      release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',

      // Edge runtime specific configuration
      debug: false, // Edge runtime has limited console

      beforeSend(event, hint) {
        // Don't send events in development
        if (process.env.NODE_ENV === 'development') {
          return null;
        }

        return event;
      },
    });
  }
}