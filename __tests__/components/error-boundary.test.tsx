import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBoundary, { DefaultErrorFallback } from '@/components/error-boundary'

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  // Suppress console errors in tests
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  afterAll(() => {
    console.error = originalError
  })

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('should render error fallback when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Try again')).toBeInTheDocument()
  })

  it('should call custom error handler when error occurs', () => {
    const onError = jest.fn()
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })

  it('should reset error when try again is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    
    fireEvent.click(screen.getByText('Try again'))
    
    // After clicking try again, re-render with no error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('No error')).toBeInTheDocument()
  })
})

describe('DefaultErrorFallback', () => {
  const mockResetError = jest.fn()
  const testError = new Error('Test error message')

  beforeEach(() => {
    mockResetError.mockClear()
  })

  it('should render error message and action buttons', () => {
    render(
      <DefaultErrorFallback 
        error={testError} 
        resetError={mockResetError} 
      />
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Try again')).toBeInTheDocument()
    expect(screen.getByText('Refresh page')).toBeInTheDocument()
  })

  it('should call resetError when try again is clicked', () => {
    render(
      <DefaultErrorFallback 
        error={testError} 
        resetError={mockResetError} 
      />
    )
    
    fireEvent.click(screen.getByText('Try again'))
    expect(mockResetError).toHaveBeenCalledTimes(1)
  })
})