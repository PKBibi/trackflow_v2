/**
 * Circuit Breaker implementation for fault tolerance
 * Prevents cascading failures and provides graceful degradation
 */

import { EventEmitter } from 'events'

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failing, reject requests
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

export interface CircuitBreakerOptions {
  name: string
  failureThreshold?: number      // Number of failures before opening
  successThreshold?: number      // Number of successes to close from half-open
  timeout?: number               // Time before trying again (ms)
  volumeThreshold?: number       // Minimum requests before calculating failure rate
  errorThresholdPercentage?: number // Percentage of failures to open circuit
  rollingWindowSize?: number    // Time window for metrics (ms)
  fallback?: () => Promise<any> // Fallback function when circuit is open
}

export interface CircuitBreakerMetrics {
  requestCount: number
  errorCount: number
  successCount: number
  rejectedCount: number
  fallbackCount: number
  responseTime: number[]
  state: CircuitState
  lastStateChange: Date
  lastFailureTime?: Date
}

export class CircuitBreaker extends EventEmitter {
  private state: CircuitState = CircuitState.CLOSED
  private failureCount = 0
  private successCount = 0
  private lastFailureTime?: Date
  private nextAttempt?: Date
  private requestLog: { timestamp: Date; success: boolean; responseTime: number }[] = []
  private metrics: CircuitBreakerMetrics

  private readonly options: Required<CircuitBreakerOptions>

  constructor(options: CircuitBreakerOptions) {
    super()

    this.options = {
      name: options.name,
      failureThreshold: options.failureThreshold ?? 5,
      successThreshold: options.successThreshold ?? 2,
      timeout: options.timeout ?? 60000,
      volumeThreshold: options.volumeThreshold ?? 10,
      errorThresholdPercentage: options.errorThresholdPercentage ?? 50,
      rollingWindowSize: options.rollingWindowSize ?? 60000,
      fallback: options.fallback ?? (() => Promise.reject(new Error('Circuit breaker is OPEN')))
    }

    this.metrics = this.initializeMetrics()
  }

  private initializeMetrics(): CircuitBreakerMetrics {
    return {
      requestCount: 0,
      errorCount: 0,
      successCount: 0,
      rejectedCount: 0,
      fallbackCount: 0,
      responseTime: [],
      state: this.state,
      lastStateChange: new Date(),
      lastFailureTime: undefined
    }
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Clean old request logs
    this.cleanRequestLog()

    // Check if we should attempt the request
    if (!this.canAttempt()) {
      this.metrics.rejectedCount++
      this.emit('rejected', { name: this.options.name, state: this.state })

      // Use fallback if available
      if (this.options.fallback) {
        this.metrics.fallbackCount++
        return this.options.fallback() as Promise<T>
      }

      throw new Error(`Circuit breaker is ${this.state} for ${this.options.name}`)
    }

    const startTime = Date.now()

    try {
      const result = await fn()
      this.onSuccess(Date.now() - startTime)
      return result
    } catch (error) {
      this.onFailure(Date.now() - startTime, error)
      throw error
    }
  }

  /**
   * Wrap a function with circuit breaker protection
   */
  wrap<T extends (...args: any[]) => Promise<any>>(fn: T): T {
    return (async (...args: Parameters<T>) => {
      return this.execute(() => fn(...args))
    }) as T
  }

  /**
   * Check if request can be attempted
   */
  private canAttempt(): boolean {
    if (this.state === CircuitState.CLOSED) {
      return true
    }

    if (this.state === CircuitState.OPEN) {
      if (this.nextAttempt && Date.now() >= this.nextAttempt.getTime()) {
        this.transitionTo(CircuitState.HALF_OPEN)
        return true
      }
      return false
    }

    // HALF_OPEN state
    return true
  }

  /**
   * Handle successful request
   */
  private onSuccess(responseTime: number): void {
    this.recordRequest(true, responseTime)
    this.metrics.successCount++

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++
      if (this.successCount >= this.options.successThreshold) {
        this.transitionTo(CircuitState.CLOSED)
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Check if we should stay closed based on error percentage
      const errorPercentage = this.calculateErrorPercentage()
      if (errorPercentage > this.options.errorThresholdPercentage &&
          this.requestLog.length >= this.options.volumeThreshold) {
        this.transitionTo(CircuitState.OPEN)
      }
    }
  }

  /**
   * Handle failed request
   */
  private onFailure(responseTime: number, error: any): void {
    this.recordRequest(false, responseTime)
    this.metrics.errorCount++
    this.lastFailureTime = new Date()
    this.metrics.lastFailureTime = this.lastFailureTime

    if (this.state === CircuitState.HALF_OPEN) {
      this.transitionTo(CircuitState.OPEN)
    } else if (this.state === CircuitState.CLOSED) {
      this.failureCount++

      // Check both failure count and error percentage
      const errorPercentage = this.calculateErrorPercentage()

      if (this.failureCount >= this.options.failureThreshold ||
          (errorPercentage > this.options.errorThresholdPercentage &&
           this.requestLog.length >= this.options.volumeThreshold)) {
        this.transitionTo(CircuitState.OPEN)
      }
    }

    this.emit('failure', {
      name: this.options.name,
      error: error?.message || 'Unknown error',
      state: this.state
    })
  }

  /**
   * Transition to a new state
   */
  private transitionTo(newState: CircuitState): void {
    const oldState = this.state
    this.state = newState
    this.metrics.state = newState
    this.metrics.lastStateChange = new Date()

    switch (newState) {
      case CircuitState.CLOSED:
        this.failureCount = 0
        this.successCount = 0
        this.nextAttempt = undefined
        this.emit('close', { name: this.options.name })
        break

      case CircuitState.OPEN:
        this.nextAttempt = new Date(Date.now() + this.options.timeout)
        this.emit('open', { name: this.options.name, nextAttempt: this.nextAttempt })
        break

      case CircuitState.HALF_OPEN:
        this.failureCount = 0
        this.successCount = 0
        this.emit('halfOpen', { name: this.options.name })
        break
    }

    this.emit('stateChange', {
      name: this.options.name,
      from: oldState,
      to: newState
    })
  }

  /**
   * Record request in rolling window
   */
  private recordRequest(success: boolean, responseTime: number): void {
    this.requestLog.push({
      timestamp: new Date(),
      success,
      responseTime
    })

    this.metrics.requestCount++
    this.metrics.responseTime.push(responseTime)

    // Keep only last 100 response times for metrics
    if (this.metrics.responseTime.length > 100) {
      this.metrics.responseTime.shift()
    }
  }

  /**
   * Clean old requests from log
   */
  private cleanRequestLog(): void {
    const cutoff = Date.now() - this.options.rollingWindowSize
    this.requestLog = this.requestLog.filter(
      log => log.timestamp.getTime() > cutoff
    )
  }

  /**
   * Calculate error percentage in current window
   */
  private calculateErrorPercentage(): number {
    if (this.requestLog.length === 0) return 0

    const errors = this.requestLog.filter(log => !log.success).length
    return (errors / this.requestLog.length) * 100
  }

  /**
   * Get current metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    this.cleanRequestLog()

    const recentRequests = this.requestLog
    const recentErrors = recentRequests.filter(log => !log.success).length
    const avgResponseTime = this.metrics.responseTime.length > 0
      ? this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length
      : 0

    return {
      ...this.metrics,
      errorCount: recentErrors,
      successCount: recentRequests.length - recentErrors,
      requestCount: recentRequests.length,
      responseTime: [avgResponseTime]
    }
  }

  /**
   * Reset the circuit breaker
   */
  reset(): void {
    this.transitionTo(CircuitState.CLOSED)
    this.failureCount = 0
    this.successCount = 0
    this.lastFailureTime = undefined
    this.nextAttempt = undefined
    this.requestLog = []
    this.metrics = this.initializeMetrics()
    this.emit('reset', { name: this.options.name })
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state
  }

  /**
   * Check if circuit is open
   */
  isOpen(): boolean {
    return this.state === CircuitState.OPEN
  }

  /**
   * Force open the circuit (for testing/maintenance)
   */
  trip(): void {
    this.transitionTo(CircuitState.OPEN)
  }
}

/**
 * Circuit breaker factory for managing multiple breakers
 */
export class CircuitBreakerFactory {
  private static breakers = new Map<string, CircuitBreaker>()

  /**
   * Get or create a circuit breaker
   */
  static getBreaker(options: CircuitBreakerOptions): CircuitBreaker {
    if (!this.breakers.has(options.name)) {
      this.breakers.set(options.name, new CircuitBreaker(options))
    }
    return this.breakers.get(options.name)!
  }

  /**
   * Get all circuit breakers
   */
  static getAllBreakers(): Map<string, CircuitBreaker> {
    return this.breakers
  }

  /**
   * Get metrics for all breakers
   */
  static getAllMetrics(): Record<string, CircuitBreakerMetrics> {
    const metrics: Record<string, CircuitBreakerMetrics> = {}

    this.breakers.forEach((breaker, name) => {
      metrics[name] = breaker.getMetrics()
    })

    return metrics
  }

  /**
   * Reset all circuit breakers
   */
  static resetAll(): void {
    this.breakers.forEach(breaker => breaker.reset())
  }

  /**
   * Remove a circuit breaker
   */
  static removeBreaker(name: string): void {
    this.breakers.delete(name)
  }
}

/**
 * Decorator for adding circuit breaker to class methods
 */
export function WithCircuitBreaker(options: Omit<CircuitBreakerOptions, 'name'>) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    const breakerOptions: CircuitBreakerOptions = {
      ...options,
      name: `${target.constructor.name}.${propertyKey}`
    }

    descriptor.value = async function (...args: any[]) {
      const breaker = CircuitBreakerFactory.getBreaker(breakerOptions)
      return breaker.execute(() => originalMethod.apply(this, args))
    }

    return descriptor
  }
}

// Export convenience functions
export const createCircuitBreaker = (options: CircuitBreakerOptions) => new CircuitBreaker(options)
export const getCircuitBreaker = CircuitBreakerFactory.getBreaker.bind(CircuitBreakerFactory)