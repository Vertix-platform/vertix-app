'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Mail, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { LoginRequest } from '@/types/auth';
import { RiGoogleFill } from '@remixicon/react';

const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'google'>('email');
  const { loginWithEmail, loginWithGoogle, isLoading, clearError } = useAuth();
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
      toast.error(err instanceof Error ? err.message : 'Failed to sign in');
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
    <div className='flex items-center justify-center p-4 h-full min-h-screen lg:min-h-full xl:min-h-screen'>
      <div className='w-full max-w-md space-y-6'>
        {/* Header */}
        <div className='text-center space-y-2'>
          <h1 className='text-3xl font-bold'>Welcome Back</h1>
          <p className='text-muted-foreground'>
            Sign in to your Vertix account
          </p>
        </div>

        {/* Auth Method Selector */}
        <div className='flex rounded-lg border bg-card p-1'>
          <Button
            variant={authMethod === 'email' ? 'default' : 'ghost'}
            size='sm'
            className='flex-1'
            onClick={() => setAuthMethod('email')}
          >
            <Mail className='h-4 w-4 mr-2' />
            Email
          </Button>
          <Button
            variant={authMethod === 'google' ? 'default' : 'ghost'}
            size='sm'
            className='flex-1'
            onClick={() => setAuthMethod('google')}
          >
            <RiGoogleFill className='h-4 w-4 mr-2' />
            Google
          </Button>
        </div>

        {/* Email Login Form */}
        {authMethod === 'email' && (
          <Card className='w-full max-w-md mx-auto'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Mail className='h-5 w-5' />
                Sign In with Email
              </CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleEmailLogin)}
                  className='space-y-4'
                >
                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type='email'
                            placeholder='Enter your email'
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Input
                              {...field}
                              type={showPassword ? 'text' : 'password'}
                              placeholder='Enter your password'
                              disabled={isLoading}
                            />
                            <Button
                              type='button'
                              size='sm'
                              className='absolute right-0 top-0 h-full px-3 py-2 text-white hover:text-gray-400 bg-transparent hover:bg-transparent cursor-pointer'
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className='h-4 w-4' />
                              ) : (
                                <Eye className='h-4 w-4' />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type='submit'
                    className='w-full'
                    size='lg'
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
          <Card className='w-full max-w-md mx-auto'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <RiGoogleFill className='h-5 w-5' />
                Sign In with Google
              </CardTitle>
              <CardDescription>
                Continue with your Google account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleGoogleLogin}
                className='w-full'
                size='lg'
                variant='default'
                disabled={isLoading}
              >
                <RiGoogleFill className='h-4 w-4 mr-2' />
                {isLoading ? 'Signing In...' : 'Continue with Google'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className='text-center space-y-4'>
          <div className='text-sm'>
            <span className='text-muted-foreground'>
              Don&apos;t have an account?{' '}
            </span>
            <Link href='/signup' className='text-primary hover:underline'>
              Sign up
            </Link>
          </div>

          <div className='text-xs text-muted-foreground'>
            <p>
              By continuing, you agree to our{' '}
              <Button variant='link' className='p-0 h-auto text-xs'>
                Terms of Service
              </Button>{' '}
              and{' '}
              <Button variant='link' className='p-0 h-auto text-xs'>
                Privacy Policy
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
