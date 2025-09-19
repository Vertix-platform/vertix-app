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
import { Mail, Eye, EyeOff, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { RegisterRequest } from '@/types/auth';
import { RiGoogleFill } from '@remixicon/react';

const signupSchema = z
  .object({
    first_name: z.string().min(2, 'First name must be at least 2 characters'),
    last_name: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'google'>('email');
  const { register, loginWithGoogle, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleEmailSignup = async (data: SignupFormData) => {
    try {
      clearError();
      const signupData: RegisterRequest = {
        first_name: data.first_name as string,
        last_name: data.last_name as string,
        email: data.email as string,
        password: data.password as string,
      };

      await register(signupData);
      toast.success('Account created successfully!');
      router.push('/login');
    } catch (err) {
      toast.error(error || 'Failed to create account');
      console.error(err);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      toast.error('Failed to sign up with Google');
      console.error(err);
    }
  };

  return (
    <div className='flex items-center justify-center p-4 h-full min-h-screen lg:min-h-full xl:min-h-screen'>
      <div className='w-full max-w-md space-y-6'>
        {/* Header */}
        <div className='text-center space-y-2'>
          <h1 className='text-3xl font-bold'>Create Account</h1>
          <p className='text-muted-foreground'>
            Join Vertix and start trading digital assets
          </p>
        </div>

        {/* Auth Method Selector */}
        <div className='flex rounded-lg border bg-card p-1'>
          <Button
            variant={authMethod === 'email' ? 'default' : 'ghost'}
            size='sm'
            className='flex-1 hover:bg-white'
            onClick={() => setAuthMethod('email')}
          >
            <Mail className='h-4 w-4 mr-2' />
            Email
          </Button>
          <Button
            variant={authMethod === 'google' ? 'default' : 'ghost'}
            size='sm'
            className='flex-1 hover:bg-white'
            onClick={() => setAuthMethod('google')}
          >
            <RiGoogleFill className='h-4 w-4 mr-2' />
            Google
          </Button>
        </div>

        {/* Email Signup Form */}
        {authMethod === 'email' && (
          <Card className='w-full max-w-md mx-auto'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='h-5 w-5' />
                Sign Up with Email
              </CardTitle>
              <CardDescription>
                Create your account to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleEmailSignup)}
                  className='space-y-4'
                >
                  <div className='grid grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='first_name'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder='John'
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='last_name'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder='Doe'
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                            placeholder='john@example.com'
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
                              placeholder='Create a password'
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

                  <FormField
                    control={form.control}
                    name='confirmPassword'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Input
                              {...field}
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder='Confirm your password'
                              disabled={isLoading}
                            />
                            <Button
                              type='button'
                              size='sm'
                              className='absolute right-0 top-0 h-full px-3 py-2 text-white hover:text-gray-400 bg-transparent hover:bg-transparent cursor-pointer'
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                            >
                              {showConfirmPassword ? (
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
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Google Signup */}
        {authMethod === 'google' && (
          <Card className='w-full max-w-md mx-auto'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <RiGoogleFill className='h-5 w-5' />
                Sign Up with Google
              </CardTitle>
              <CardDescription>Create your account with Google</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleGoogleSignup}
                className='w-full'
                size='lg'
                variant='default'
                disabled={isLoading}
              >
                <RiGoogleFill className='h-4 w-4 mr-2' />
                {isLoading ? 'Creating Account...' : 'Continue with Google'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className='text-center space-y-4'>
          <div className='text-sm'>
            <span className='text-muted-foreground'>
              Already have an account?{' '}
            </span>
            <Link href='/login' className='text-primary hover:underline'>
              Sign in
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
