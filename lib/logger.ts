/**
 * Production-ready logging utility
 *
 * Provides structured logging with different levels and proper handling
 * for both development and production environments.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  userId?: string;
  requestId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      userId: context?.userId,
      requestId: context?.requestId
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;

    // In production, only log warnings and errors
    return level === 'warn' || level === 'error';
  }

  private output(logEntry: LogEntry): void {
    if (!this.shouldLog(logEntry.level)) return;

    if (this.isDevelopment) {
      // Development: use console with colors
      switch (logEntry.level) {
        case 'debug':
          console.debug('🐛', logEntry.message, logEntry.context || '');
          break;
        case 'info':
          console.info('ℹ️', logEntry.message, logEntry.context || '');
          break;
        case 'warn':
          console.warn('⚠️', logEntry.message, logEntry.context || '');
          break;
        case 'error':
          console.error('❌', logEntry.message, logEntry.context || '');
          break;
      }
    } else {
      // Production: structured JSON logging
      console.log(JSON.stringify(logEntry));

      // Send errors to external monitoring if configured
      if (logEntry.level === 'error' && typeof window === 'undefined') {
        this.sendToExternalLogger(logEntry).catch(() => {
          // Silent fail - don't break the application
        });
      }
    }
  }

  private async sendToExternalLogger(logEntry: LogEntry): Promise<void> {
    // Integration with external logging services (Sentry, LogRocket, etc.)
    try {
      // This could be expanded to send to your preferred logging service
      if (process.env.LOG_WEBHOOK_URL) {
        await fetch(process.env.LOG_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logEntry),
        });
      }
    } catch {
      // Silent fail
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.output(this.formatMessage('debug', message, context));
  }

  info(message: string, context?: Record<string, any>): void {
    this.output(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: Record<string, any>): void {
    this.output(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error | unknown, context?: Record<string, any>): void {
    const errorContext = {
      ...context,
      ...(error instanceof Error && {
        stack: error.stack,
        name: error.name,
        message: error.message,
      }),
      ...(error && typeof error === 'object' && {
        error: error
      })
    };

    this.output(this.formatMessage('error', message, errorContext));
  }

  // Convenience methods for common patterns
  apiError(endpoint: string, error: Error | unknown, context?: Record<string, any>): void {
    this.error(`API Error: ${endpoint}`, error, {
      ...context,
      endpoint,
      type: 'api_error'
    });
  }

  dbError(operation: string, error: Error | unknown, context?: Record<string, any>): void {
    this.error(`Database Error: ${operation}`, error, {
      ...context,
      operation,
      type: 'database_error'
    });
  }

  authError(message: string, context?: Record<string, any>): void {
    this.error(`Auth Error: ${message}`, undefined, {
      ...context,
      type: 'auth_error'
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports for common patterns
export const log = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  apiError: logger.apiError.bind(logger),
  dbError: logger.dbError.bind(logger),
  authError: logger.authError.bind(logger),
};

export default logger;