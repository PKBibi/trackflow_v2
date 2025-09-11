'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Users } from 'lucide-react';
import { teamAPI } from '@/lib/api/team';

export default function JoinTeamPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
    } else {
      setStatus('loading');
    }
  }, [token]);

  const handleAcceptInvitation = async () => {
    if (!token) return;
    
    setIsAccepting(true);
    try {
      const result = await teamAPI.acceptInvitation(token);
      if (result.success) {
        setStatus('success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || 'Failed to accept invitation');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = () => {
    router.push('/');
  };

  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/')}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <CardTitle>Welcome to the Team!</CardTitle>
            <CardDescription>
              You've successfully joined the team. Redirecting to dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Unable to Join Team</CardTitle>
            <CardDescription>
              {errorMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button onClick={() => router.push('/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <CardTitle>Team Invitation</CardTitle>
          <CardDescription>
            You've been invited to join a team on TrackFlow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              By accepting this invitation, you'll become a member of the team and gain access to shared projects and time entries.
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-3">
            <Button 
              className="flex-1" 
              onClick={handleAcceptInvitation}
              disabled={isAccepting}
            >
              {isAccepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                'Accept Invitation'
              )}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleDecline}
              disabled={isAccepting}
            >
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}