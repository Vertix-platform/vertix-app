'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GoogleCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleGoogleCallback } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          setError('Google OAuth was cancelled or failed');
          setStatus('error');
          return;
        }

        if (!code || !state) {
          setError('Missing OAuth parameters');
          setStatus('error');
          return;
        }

        await handleGoogleCallback(code, state);
        setStatus('success');
        toast.success('Successfully signed in with Google!');

        // Redirect back to the original page or home
        const redirectUrl = sessionStorage.getItem('oauth_redirect_url') || '/';
        sessionStorage.removeItem('oauth_redirect_url');

        setTimeout(() => {
          router.push(redirectUrl);
        }, 1500);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'OAuth callback failed';
        setError(errorMessage);
        setStatus('error');
        toast.error(errorMessage);
      }
    };

    handleCallback();
  }, [searchParams, handleGoogleCallback, router]);

  return (
    <div className="flex items-center justify-center p-4 h-full min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Google Sign In</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Completing your sign in...'}
            {status === 'success' && 'Successfully signed in!'}
            {status === 'error' && 'Sign in failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Please wait while we complete your authentication...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <p className="text-sm text-muted-foreground">
                Redirecting you back...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-8 w-8 text-red-500" />
              <p className="text-sm text-red-600">{error}</p>
              <div className="space-y-2">
                <Button
                  onClick={() => router.push('/auth/login')}
                  className="w-full"
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="w-full"
                >
                  Go Home
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
