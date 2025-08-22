'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, User, LogOut } from 'lucide-react';
import { formatAddress } from '@/lib/custom-utils';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const WalletConnect: React.FC = () => {
  const { login, logout, authenticated, ready, user: privyUser } = usePrivy();
  const { user, isLoading, error, clearError, connectWallet } = useAuth();
  const router = useRouter();

  // Handle wallet connection to backend when user becomes authenticated
  useEffect(() => {
    const connectWalletToBackend = async () => {
      if (authenticated && privyUser?.wallet?.address && !user) {
        try {
          await connectWallet(privyUser.wallet.address);
          toast.success('Wallet connected successfully!');

          // Redirect to home page after successful wallet connection
          setTimeout(() => {
            router.push('/');
          }, 1500);
        } catch (err) {
          toast.error('Failed to connect wallet to backend');
          console.error(err);
        }
      }
    };

    connectWalletToBackend();
  }, [authenticated, privyUser?.wallet?.address, user, connectWallet, router]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (err) {
      toast.error('Failed to connect wallet');
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Wallet disconnected successfully!');
    } catch (err) {
      toast.error('Failed to disconnect wallet');
      console.error(err);
    }
  };

  if (!ready) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (authenticated && user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Welcome, {user.first_name || 'User'}!
          </CardTitle>
          <CardDescription>
            You&apos;re successfully connected with your wallet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm mb-4">
            <p><strong>Email:</strong> {user.email || 'Not signed up'}</p>
            <p><strong>Wallet:</strong> {privyUser?.wallet?.address ? formatAddress(privyUser.wallet.address) : 'Not connected'}</p>
            <p><strong>Verified:</strong> {user.is_verified ? 'Yes' : 'No'}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Your Wallet
        </CardTitle>
        <CardDescription>
          Connect your wallet to access Vertix
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
            {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="ml-2 h-auto p-1"
            >
              ×
            </Button>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            <Wallet className="h-4 w-4 mr-2" />
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </Button>

          {/* <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="lg">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button variant="outline" size="lg">
              <User className="h-4 w-4 mr-2" />
              Social
            </Button>
          </div> */}
        </div>
      </CardContent>
    </Card>
  );
};
