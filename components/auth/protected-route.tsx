'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Shield } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  redirectTo = '/auth',
}) => {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      checkAuth().then((authenticated) => {
        if (!authenticated) {
          router.push(redirectTo);
        }
      });
    }
  }, [isAuthenticated, isLoading, checkAuth, router, redirectTo]);

  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Verifying authentication...</p>
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <Shield className="h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Access Denied</h2>
            <p className="text-muted-foreground text-center">
              You need to be authenticated to access this page.
            </p>
            <Button onClick={() => router.push(redirectTo)}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
