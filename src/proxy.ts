import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'EcoCampus-hackathon-svvv-secret-2026-supersecure-jwt-key',
  });

  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith('/login');

  // If already authenticated and visiting /login, send straight to campus dashboard
  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected paths require valid session token
  if (!token) {
    const callbackUrl = encodeURIComponent(pathname + request.nextUrl.search);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, request.url));
  }

  // If admin tries to navigate to /report (which is student report-and-earn), send to /leaderboard
  if (token.role === 'ADMIN' && pathname.startsWith('/report')) {
    return NextResponse.redirect(new URL('/leaderboard', request.url));
  }

  // If student tries to navigate to admin-only areas, redirect to dashboard
  if (token.role === 'STUDENT') {
    const adminOnlyRoutes = ['/admin', '/upload', '/data', '/imports', '/analytics', '/settings'];
    if (adminOnlyRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    '/login',
    '/dashboard/:path*',
    '/iot/:path*',
    '/scan/:path*',
    '/report/:path*',
    '/leaderboard/:path*',
    '/admin/:path*',
    '/rules/:path*',
    '/stations/:path*',
    '/upload/:path*',
    '/data/:path*',
    '/imports/:path*',
    '/analytics/:path*',
    '/settings/:path*',
    '/streams/:path*',
    '/ai/:path*',
  ],
};
