import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle Google OAuth callback
  if (request.nextUrl.pathname === '/auth/google-callback') {
    return NextResponse.next();
  }

  // Check if user is authenticated for protected routes
  const isAuthenticated = request.cookies.has('access_token');
  const isAuthPage = request.nextUrl.pathname.startsWith('/');
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                          request.nextUrl.pathname.startsWith('/profile');

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to home if accessing auth pages while authenticated
  if (isAuthPage && isAuthenticated && !request.nextUrl.pathname.includes('google-callback')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/auth/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
  ],
};
