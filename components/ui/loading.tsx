import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <Loader2 
      className={cn(
        'animate-spin',
        {
          'h-4 w-4': size === 'sm',
          'h-6 w-6': size === 'md', 
          'h-8 w-8': size === 'lg',
        },
        className
      )}
    />
  )
}

interface LoadingStateProps {
  children: React.ReactNode
  loading: boolean
  error?: string | null
  fallback?: React.ReactNode
}

export function LoadingState({ children, loading, error, fallback }: LoadingStateProps) {
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return fallback || (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <LoadingSpinner />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  children: React.ReactNode
}

export function LoadingButton({ loading, children, disabled, className, ...props }: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'relative inline-flex items-center justify-center',
        className
      )}
    >
      {loading && (
        <LoadingSpinner size="sm" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
      )}
      <span className={cn(loading && 'invisible')}>
        {children}
      </span>
    </button>
  )
}