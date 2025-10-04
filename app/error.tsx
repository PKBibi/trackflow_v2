'use client';

import { log } from '@/lib/logger';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    log.error(error.message, {
      digest: error.digest,
      stack: error.stack
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Something went wrong!</h1>
        <p className="text-muted-foreground mb-6">
          We apologize for the inconvenience. An unexpected error occurred while processing your request.
        </p>
        
        {error.message && (
          <div className="bg-muted rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-mono text-muted-foreground">
              {error.message}
            </p>
          </div>
        )}
        
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => reset()}
            variant="default"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="h-4 w-4" />
              Go home
            </Button>
          </Link>
        </div>
        
        <p className="text-xs text-muted-foreground mt-8">
          If this problem persists, please contact{' '}
          <a href="mailto:support@track-flow.app" className="text-primary hover:underline">
            support@track-flow.app
          </a>
        </p>
      </div>
    </div>
  );
}


