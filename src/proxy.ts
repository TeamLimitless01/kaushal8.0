import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export const proxy = withAuth(
  function proxy() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET || 'EcoCampus-hackathon-svvv-secret-2026-supersecure-jwt-key',
  }
);

export default proxy;

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/upload/:path*',
    '/data/:path*',
    '/imports/:path*',
    '/analytics/:path*',
    '/settings/:path*',
  ],
};
