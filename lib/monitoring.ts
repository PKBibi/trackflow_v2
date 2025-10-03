import * as Sentry from '@sentry/nextjs';

// Enhanced error logging with context
export function logError(error: Error | string, context?: Record<string, any>) {
  console.error('Error logged:', error, context);

  if (typeof error === 'string') {
    error = new Error(error);
  }

  Sentry.captureException(error, {
    tags: {
      component: context?.component || 'unknown',
      severity: context?.severity || 'error',
    },
    extra: context,
  });
}

// Performance monitoring
export function startTransaction(name: string, operation: string = 'navigation') {
  if (typeof window === 'undefined') return null;

  // Note: startTransaction is deprecated in newer Sentry versions
  // Using manual spans instead
  return null;
}

export function measurePerformance<T>(
  name: string,
  operation: () => T | Promise<T>,
  metadata?: Record<string, any>
): T | Promise<T> {
  const transaction = startTransaction(name, 'function');

  try {
    const result = operation();

    if (result instanceof Promise) {
      return result
        .then((value) => {
          // Transaction handling disabled
          // transaction?.setStatus('ok');
          // transaction?.finish();
          return value;
        })
        .catch((error) => {
          // Transaction handling disabled
          // transaction?.setStatus('internal_error');
          logError(error, { operation: name, ...metadata });
          // transaction?.finish();
          throw error;
        });
    } else {
      // Transaction handling disabled
      // transaction?.setStatus('ok');
      // transaction?.finish();
      return result;
    }
  } catch (error) {
    // Transaction handling disabled
    // transaction?.setStatus('internal_error');
    logError(error as Error, { operation: name, ...metadata });
    // transaction?.finish();
    throw error;
  }
}

// API request monitoring
export async function monitoredFetch(
  url: string,
  options?: RequestInit,
  metadata?: Record<string, any>
): Promise<Response> {
  const transaction = startTransaction(`HTTP ${options?.method || 'GET'} ${url}`, 'http.client');

  try {
    // transaction?.setData('url', url);
    // transaction?.setData('method', options?.method || 'GET');

    const response = await fetch(url, options);

    // transaction?.setData('status_code', response.status);
    // transaction?.setStatus(response.ok ? 'ok' : 'failed_precondition');

    if (!response.ok) {
      logError(new Error(`HTTP ${response.status}: ${response.statusText}`), {
        url,
        status: response.status,
        ...metadata,
      });
    }

    return response;
  } catch (error) {
    // Transaction handling disabled
    // transaction?.setStatus('internal_error');
    logError(error as Error, { url, ...metadata });
    throw error;
  } finally {
    // transaction?.finish();
  }
}

// User context setting
export function setUserContext(user: { id: string; email?: string; plan?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    plan: user.plan,
  });
}

export function clearUserContext() {
  Sentry.setUser(null);
}

// Feature flag and experiment tracking
export function trackFeatureUsage(feature: string, metadata?: Record<string, any>) {
  Sentry.addBreadcrumb({
    category: 'feature',
    message: `Used feature: ${feature}`,
    data: metadata,
    level: 'info',
  });
}

// Business metric tracking
export function trackBusinessEvent(event: string, value?: number, metadata?: Record<string, any>) {
  Sentry.addBreadcrumb({
    category: 'business',
    message: event,
    data: {
      value,
      ...metadata,
    },
    level: 'info',
  });

  // Could also send to analytics service
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, {
      value,
      ...metadata,
    });
  }
}

// Development-only logging
export function devLog(message: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] ${message}`, data);
  }
}

// Critical error alerting (for things that need immediate attention)
export function alertCriticalError(error: Error, context?: Record<string, any>) {
  logError(error, { ...context, severity: 'critical', alert: true });

  // In production, this could trigger PagerDuty, Slack alerts, etc.
  if (process.env.NODE_ENV === 'production') {
    console.error('CRITICAL ERROR:', error, context);
  }
}

// Health check monitoring
export function recordHealthCheck(service: string, status: 'healthy' | 'unhealthy', latency?: number) {
  Sentry.addBreadcrumb({
    category: 'health',
    message: `${service} health check: ${status}`,
    data: {
      service,
      status,
      latency,
      timestamp: new Date().toISOString(),
    },
    level: status === 'healthy' ? 'info' : 'warning',
  });

  if (status === 'unhealthy') {
    logError(new Error(`Health check failed for ${service}`), {
      service,
      latency,
      severity: 'warning',
    });
  }
}

// Utility to wrap async functions with error handling
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: Record<string, any>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error as Error, context);
      throw error;
    }
  };
}

// React hook for error boundary integration
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    logError(error, {
      component: 'React',
      componentStack: errorInfo?.componentStack,
    });
  };
}