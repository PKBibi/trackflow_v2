import { HttpError, isHttpError } from '@/lib/errors'

describe('HttpError', () => {
  it('should create an HttpError with status and message', () => {
    const error = new HttpError(404, 'Not found')
    
    expect(error).toBeInstanceOf(Error)
    expect(error.status).toBe(404)
    expect(error.message).toBe('Not found')
    expect(error.code).toBeUndefined()
  })

  it('should create an HttpError with status, message, and code', () => {
    const error = new HttpError(400, 'Bad request', 'VALIDATION_ERROR')
    
    expect(error.status).toBe(400)
    expect(error.message).toBe('Bad request')
    expect(error.code).toBe('VALIDATION_ERROR')
  })
})

describe('isHttpError', () => {
  it('should return true for HttpError instances', () => {
    const error = new HttpError(500, 'Internal server error')
    expect(isHttpError(error)).toBe(true)
  })

  it('should return true for objects with status property', () => {
    const errorLike = { status: 400, message: 'Bad request' }
    expect(isHttpError(errorLike)).toBe(true)
  })

  it('should return false for regular Error instances', () => {
    const error = new Error('Regular error')
    expect(isHttpError(error)).toBe(false)
  })

  it('should return false for null/undefined', () => {
    expect(isHttpError(null)).toBe(false)
    expect(isHttpError(undefined)).toBe(false)
  })

  it('should return false for non-objects', () => {
    expect(isHttpError('string')).toBe(false)
    expect(isHttpError(123)).toBe(false)
  })
})