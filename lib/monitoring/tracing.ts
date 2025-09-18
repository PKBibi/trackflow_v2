/**
 * OpenTelemetry distributed tracing implementation
 * Provides comprehensive observability across the application
 */

import { trace, context, SpanStatusCode, SpanKind, Tracer, Span } from '@opentelemetry/api'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch'
import { ConsoleSpanExporter, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'

// Import exporters based on configuration
let JaegerExporter: any
let OTLPTraceExporter: any

/**
 * Initialize OpenTelemetry tracing
 */
export async function initializeTracing() {
  const serviceName = process.env.OTEL_SERVICE_NAME || 'trackflow-api'
  const environment = process.env.NODE_ENV || 'development'

  // Create resource
  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: environment,
    [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: process.env.DYNO || 'local',
  })

  // Create provider
  const provider = new NodeTracerProvider({
    resource,
  })

  // Configure exporters based on environment
  if (environment === 'production') {
    // Use OTLP exporter in production
    if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
      try {
        const { OTLPTraceExporter: OTLP } = await import('@opentelemetry/exporter-trace-otlp-http')
        OTLPTraceExporter = OTLP
        const otlpExporter = new OTLPTraceExporter({
          url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
          headers: process.env.OTEL_EXPORTER_OTLP_HEADERS ?
            JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS) : undefined,
        })
        provider.addSpanProcessor(new BatchSpanProcessor(otlpExporter))
      } catch (error) {
        console.error('Failed to initialize OTLP exporter:', error)
      }
    }

    // Use Jaeger exporter as fallback
    if (process.env.JAEGER_ENDPOINT) {
      try {
        const { JaegerExporter: Jaeger } = await import('@opentelemetry/exporter-jaeger')
        JaegerExporter = Jaeger
        const jaegerExporter = new JaegerExporter({
          endpoint: process.env.JAEGER_ENDPOINT,
        })
        provider.addSpanProcessor(new BatchSpanProcessor(jaegerExporter))
      } catch (error) {
        console.error('Failed to initialize Jaeger exporter:', error)
      }
    }
  } else {
    // Use console exporter in development
    const consoleExporter = new ConsoleSpanExporter()
    provider.addSpanProcessor(new BatchSpanProcessor(consoleExporter))
  }

  // Register provider
  provider.register()

  // Register instrumentations
  registerInstrumentations({
    instrumentations: [
      new HttpInstrumentation({
        requestHook: (span, request) => {
          span.setAttribute('http.request.body', JSON.stringify(request))
        },
        responseHook: (span, response) => {
          span.setAttribute('http.response.body', JSON.stringify(response))
        },
      }),
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: [
          /^https?:\/\/.*\.supabase\.co/,
          /^https?:\/\/api\.stripe\.com/,
        ],
      }),
    ],
  })

  console.log(`OpenTelemetry tracing initialized for ${serviceName} in ${environment} mode`)
}

/**
 * Custom tracer wrapper with enhanced functionality
 */
export class TracingService {
  private tracer: Tracer

  constructor(name: string = 'trackflow') {
    this.tracer = trace.getTracer(name)
  }

  /**
   * Start a new span
   */
  startSpan(name: string, kind: SpanKind = SpanKind.INTERNAL): Span {
    return this.tracer.startSpan(name, { kind })
  }

  /**
   * Trace a function execution
   */
  async trace<T>(
    name: string,
    fn: (span: Span) => Promise<T>,
    options?: {
      kind?: SpanKind
      attributes?: Record<string, any>
    }
  ): Promise<T> {
    const span = this.startSpan(name, options?.kind)

    // Add attributes
    if (options?.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        span.setAttribute(key, value)
      })
    }

    try {
      const result = await context.with(
        trace.setSpan(context.active(), span),
        () => fn(span)
      )

      span.setStatus({ code: SpanStatusCode.OK })
      return result
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      })

      // Record exception
      if (error instanceof Error) {
        span.recordException(error)
      }

      throw error
    } finally {
      span.end()
    }
  }

  /**
   * Trace a database query
   */
  async traceQuery<T>(
    operation: string,
    query: string,
    fn: () => Promise<T>
  ): Promise<T> {
    return this.trace(
      `db.${operation}`,
      async (span) => {
        span.setAttribute('db.system', 'postgresql')
        span.setAttribute('db.operation', operation)
        span.setAttribute('db.statement', query)

        const startTime = Date.now()
        const result = await fn()
        const duration = Date.now() - startTime

        span.setAttribute('db.duration', duration)

        return result
      },
      { kind: SpanKind.CLIENT }
    )
  }

  /**
   * Trace an HTTP request
   */
  async traceRequest<T>(
    method: string,
    url: string,
    fn: () => Promise<T>
  ): Promise<T> {
    return this.trace(
      `http.${method.toLowerCase()}`,
      async (span) => {
        span.setAttribute('http.method', method)
        span.setAttribute('http.url', url)
        span.setAttribute('http.target', new URL(url).pathname)

        const result = await fn()

        return result
      },
      { kind: SpanKind.CLIENT }
    )
  }

  /**
   * Trace a cache operation
   */
  async traceCache<T>(
    operation: 'get' | 'set' | 'delete',
    key: string,
    fn: () => Promise<T>
  ): Promise<T> {
    return this.trace(
      `cache.${operation}`,
      async (span) => {
        span.setAttribute('cache.key', key)
        span.setAttribute('cache.operation', operation)

        const result = await fn()

        if (operation === 'get' && result !== null) {
          span.setAttribute('cache.hit', true)
        } else if (operation === 'get') {
          span.setAttribute('cache.hit', false)
        }

        return result
      },
      { kind: SpanKind.INTERNAL }
    )
  }

  /**
   * Add baggage to current context
   */
  setBaggage(key: string, value: string): void {
    const span = trace.getActiveSpan()
    if (span) {
      span.setAttribute(`baggage.${key}`, value)
    }
  }

  /**
   * Get active span
   */
  getActiveSpan(): Span | undefined {
    return trace.getActiveSpan()
  }

  /**
   * Create a child span
   */
  createChildSpan(name: string, parentSpan?: Span): Span {
    const parent = parentSpan || trace.getActiveSpan()

    if (parent) {
      const ctx = trace.setSpan(context.active(), parent)
      return this.tracer.startSpan(name, undefined, ctx)
    }

    return this.startSpan(name)
  }
}

/**
 * Decorator for tracing class methods
 */
export function Trace(options?: {
  name?: string
  kind?: SpanKind
  attributes?: Record<string, any>
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    const methodName = options?.name || `${target.constructor.name}.${propertyKey}`

    descriptor.value = async function (...args: any[]) {
      const tracer = new TracingService()

      return tracer.trace(
        methodName,
        async (span) => {
          // Add method arguments as attributes (be careful with sensitive data)
          if (options?.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
              span.setAttribute(key, value)
            })
          }

          // Add basic metadata
          span.setAttribute('method.class', target.constructor.name)
          span.setAttribute('method.name', propertyKey)

          return originalMethod.apply(this, args)
        },
        { kind: options?.kind }
      )
    }

    return descriptor
  }
}

/**
 * Middleware for tracing HTTP requests in Next.js
 */
export function tracingMiddleware(handler: any) {
  return async (req: any, res: any) => {
    const tracer = new TracingService()

    return tracer.trace(
      `${req.method} ${req.url}`,
      async (span) => {
        // Add HTTP attributes
        span.setAttribute('http.method', req.method)
        span.setAttribute('http.url', req.url)
        span.setAttribute('http.target', req.url)
        span.setAttribute('http.host', req.headers.host)
        span.setAttribute('http.scheme', req.protocol)
        span.setAttribute('http.user_agent', req.headers['user-agent'])

        // Add custom attributes
        if (req.user) {
          span.setAttribute('user.id', req.user.id)
        }

        // Execute handler
        const result = await handler(req, res)

        // Add response attributes
        span.setAttribute('http.status_code', res.statusCode)

        return result
      },
      { kind: SpanKind.SERVER }
    )
  }
}

/**
 * Create correlation ID for request tracking
 */
export function createCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Extract trace context from headers
 */
export function extractTraceContext(headers: Record<string, string>) {
  return {
    traceId: headers['x-trace-id'] || headers['x-b3-traceid'],
    spanId: headers['x-span-id'] || headers['x-b3-spanid'],
    parentSpanId: headers['x-parent-span-id'] || headers['x-b3-parentspanid'],
    sampled: headers['x-b3-sampled'] === '1',
  }
}

/**
 * Inject trace context into headers
 */
export function injectTraceContext(span: Span): Record<string, string> {
  const spanContext = span.spanContext()

  return {
    'x-trace-id': spanContext.traceId,
    'x-span-id': spanContext.spanId,
    'x-b3-traceid': spanContext.traceId,
    'x-b3-spanid': spanContext.spanId,
    'x-b3-sampled': spanContext.traceFlags === 1 ? '1' : '0',
  }
}

// Export singleton instance
export const tracing = new TracingService()

// Initialize tracing on module load
if (process.env.OTEL_ENABLED === 'true') {
  initializeTracing().catch(console.error)
}