'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Mail, Eye, EyeOff, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { WalletConnect } from '@/components/auth/wallet-connect';
import type { LoginRequest } from '@/types/auth';

const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'google' | 'wallet'>('email');
  const { loginWithEmail, loginWithGoogle, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleEmailLogin = async (data: LoginFormData) => {
    try {
      clearError();
      const loginData: LoginRequest = {
        email: data.email,
        password: data.password,
      };

      await loginWithEmail(loginData);
      toast.success('Successfully signed in!');
      router.push('/');
    } catch (err) {
      toast.error(error || 'Failed to sign in');
      console.error(err);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      toast.error('Failed to sign in with Google');
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 h-full min-h-screen lg:min-h-full xl:min-h-screen">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to your Vertix account
          </p>
        </div>

        {/* Auth Method Selector */}
        <div className="flex rounded-lg border bg-card p-1">
          <Button
            variant={authMethod === 'email' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => setAuthMethod('email')}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
            <Button
              variant={authMethod === 'google' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
              onClick={() => setAuthMethod('google')}
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
          <Button
            variant={authMethod === 'wallet' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => setAuthMethod('wallet')}
          >
            <Wallet className="h-4 w-4 mr-2" />
            Wallet
          </Button>
        </div>

        {/* Email Login Form */}
        {authMethod === 'email' && (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Sign In with Email
              </CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleEmailLogin)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="Enter your email"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your password"
                              disabled={isLoading}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Google Login */}
        {authMethod === 'google' && (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign In with Google
              </CardTitle>
              <CardDescription>
                Continue with your Google account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleGoogleLogin}
                className="w-full"
                size="lg"
                variant="outline"
                disabled={isLoading}
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isLoading ? 'Signing In...' : 'Continue with Google'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Wallet Login */}
        {authMethod === 'wallet' && (
          <WalletConnect />
        )}

        {/* Footer */}
        <div className="text-center space-y-4">
          <div className="text-sm">
            <span className="text-muted-foreground">
              Don&apos;t have an account?{' '}
            </span>
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>
              By continuing, you agree to our{' '}
              <Button variant="link" className="p-0 h-auto text-xs">
                Terms of Service
              </Button>{' '}
              and{' '}
              <Button variant="link" className="p-0 h-auto text-xs">
                Privacy Policy
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
