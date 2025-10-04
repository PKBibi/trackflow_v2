import { log } from '@/lib/logger';
/**
 * OpenTelemetry distributed tracing implementation
 * NOTE: OpenTelemetry packages not installed - this is a stub for now
 * To enable, install: npm install @opentelemetry/api @opentelemetry/sdk-trace-node etc.
 */

// Stub exports to maintain compatibility
export function initializeTracing() {
  log.warn('OpenTelemetry tracing not configured - packages not installed')
}

export function startSpan(name: string, options?: any) {
  return null
}

export function endSpan(span: any) {
  // No-op
}

export function getCurrentSpan() {
  return null
}

export function setSpanAttribute(span: any, key: string, value: any) {
  // No-op
}

export function recordException(span: any, error: Error) {
  // No-op
}
