'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleGoogleCallback } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          setError('OAuth authorization was denied or failed');
          setStatus('error');
          return;
        }

        if (!code || !state) {
          setError('Missing required OAuth parameters');
          setStatus('error');
          return;
        }

        // Call the backend to exchange code for tokens
        await handleGoogleCallback(code, state);

        setStatus('success');
        toast.success('Successfully signed in with Google!');

        // Redirect to home page
        setTimeout(() => {
          router.push('/');
        }, 1500);

      } catch (err) {
        console.error('Google OAuth callback error:', err);
        setError(err instanceof Error ? err.message : 'Failed to complete Google sign-in');
        setStatus('error');
      }
    };

    handleCallback();
  }, [searchParams, handleGoogleCallback, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Completing Sign In...
          </div>
          <p className="text-muted-foreground">
            Please wait while we complete your Google sign-in.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Sign In Successful!
          </div>
          <p className="text-muted-foreground">
            You have been successfully signed in with Google. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Sign In Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {error}
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={() => router.push('/login')}
              className="flex-1"
            >
              Try Again
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/')}
              className="flex-1"
            >
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
